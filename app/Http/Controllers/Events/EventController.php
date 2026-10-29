<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCommittee;
use App\Models\Committee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * Display a listing of all events.
     */
    public function index()
    {
        $role = auth()->user()?->role;

        $events = $role !== 'admin'
        ? Event::latest()->get()->where('status', '!=', 'draft')
        : Event::withCount('participations')->latest()->get();
    
        $view = match ($role) {
            'admin' => 'events/event_lists/admin/Index',
            'official_team' => 'events/event_lists/Index',
            default => abort(403, 'Unauthorized Access')
        };

        return inertia( $view, [
            'events' => $events,
        ]);
    }

    /**
     * Display the events for the authenticated user.
     */
    public function my_events()
    {
        $user = auth()->user();
        $role = $user?->role;

        if ($role === 'committee') {
            $events = Event::whereHas('eventCommittees.committee', function ($query) use ($user) {
                $query->where('user_id', $user->user_id); 
            })->latest()->get();

            return inertia('events/event_lists/committee/HostedEvents', [
                'events' => $events,
            ]);
        }

        if ($role === 'judge') {
            $events = Event::whereHas('eventJudges.judge', function ($query) use ($user) {
                $query->where('user_id', $user->user_id);
            })->latest()->get();

            return inertia('events/event_lists/judge/AssignedEvents', [
                'events' => $events,
            ]);
        }

        // 3. Blokir selain panitia dan juri
        abort(403, 'Unauthorized access');
    }

    /**
     * Show the form for creating a new event.
     */
    public function create()
    {
        $existingCommittees = Committee::with('user:user_id,name,email')->get();

        // 2. Kirimkan ke frontend
        return inertia('events/event_create/Create', [
            'existingCommittees' => $existingCommittees
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'poster_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|in:draft,registration_open,active,finished',
            'registration_start_time' => 'required|date',
            'registration_end_time' => 'required|date|after_or_equal:registration_start_time',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',

            'committees' => 'required|array|min:1',
            'committees.*.name' => 'required|string|max:255',
            'committees.*.email' => 'required|email',
            'committees.*.department' => 'required|string|max:255',
            'committees.*.position' => 'required|string|max:255',

            'force_create' => 'nullable|boolean',
        ]);

        $existingCommittees = [];
        $validationErrors = [];

        foreach ($validated['committees'] as $index => $committeeData) {

            $user = User::where('email', $committeeData['email'])->first();

            if ($user) {

                if ($user->role !== 'committee') {
                    $validationErrors["committees.$index.email"] =
                        "Email already used by another account.";
                } else {
                    $committee = Committee::where('user_id', $user->user_id)->first();
                    $existingCommittees[] =
                        $user->name . ' (' . $committee->department . ')';
                }
            }
        }

        if ($validationErrors) {
            throw ValidationException::withMessages($validationErrors);
        }

        if ($existingCommittees && empty($validated['force_create'])) {
            throw ValidationException::withMessages([
                'confirmation' =>
                    'Existing committee found: ' .
                    implode(', ', $existingCommittees) .
                    '. Continue?',
            ]);
        }
        
        $posterPath = null;
        if ($request->hasFile('poster_path')) {
            $posterPath = $request->file('poster_path')->store('posters', 'public');
        }
        try{
            DB::transaction(function () use ($validated, $request, $posterPath) {

                $event = Event::create([
                    'public_id' => Str::uuid(),
                    'event_name' => $validated['event_name'],
                    'description' => $validated['description'],
                    'location' => $validated['location'],
                    'poster_path'=> $posterPath,
                    'status' => $validated['status'],
                    'registration_start_time' => $validated['registration_start_time'],
                    'registration_end_time' => $validated['registration_end_time'],
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'created_by' => $request->user()->user_id,
                ]);

                foreach ($validated['committees'] as $committeeData) {

                    $user = User::firstOrCreate(
                        ['email' => $committeeData['email']],
                        [
                            'public_id' => Str::uuid(),
                            'name' => $committeeData['name'],
                            'role' => 'committee',
                            'password' => Hash::make('password123'),
                        ]
                    );

                    $committee = Committee::firstOrCreate(
                        ['user_id' => $user->user_id],
                        ['department' => $committeeData['department']]
                    );

                    EventCommittee::create([
                        'event_id' => $event->event_id,
                        'committee_id' => $committee->committee_id,
                        'position' => $committeeData['position'],
                    ]);
                }
            });
        } catch (\Exception $e){
            if ($posterPath && Storage::disk('public')->exists($posterPath)) {
            Storage::disk('public')->delete($posterPath);
            }
            throw $e;
        }

        return redirect()
            ->route('events.index')
            ->with('success', 'Event created successfully!');
    }

    /**
     * Display the specified event.
     */
    public function show($id)
    {
        $role = auth()->user()->role;
        
        // Query dasar untuk mengambil event berdasarkan public_id
        $query = Event::where('public_id', $id);

        // Eager loading data tambahan berdasarkan role agar dashboard informatif
        $event =  $query->with([
                                'eventJudges.judge.user:user_id,name',
                                'eventJudges:event_id,event_judge_id,judge_id',
                                'eventJudges.judgeExpertises.scoringCategory' => function ($q) {
                                    $q->select(
                                        'scoring_category_id',
                                        'event_level_id',
                                        'master_category_id'
                                    )->with([
                                        'masterCategory:master_category_id,category_name',
                                        'eventLevel:event_level_id,event_id,level_id',
                                        'eventLevel.level:level_id,level_name',
                                    ]);
                                },                                
                                'eventLevels' => function ($q) {
                                    $q->select(
                                        'event_level_id',
                                        'event_id',
                                        'level_id',
                                        'registration_fees',
                                        'quota'
                                    )->with('level:level_id,level_name')->withCount('participations');
                                },
                                'participations:event_id,participation_id,event_level_id,team_name',
                                'eventDocuments:event_id,document_id,document_name,document_path'
                            ])
                            ->withCount('participations', 'eventJudges')
                            ->firstOrFail();    

        $event->eventJudges->transform(function ($eventJudge) {
            $eventJudge->expertises = $eventJudge->judgeExpertises
                ->map(function ($expertise) {
                    $category = $expertise->scoringCategory;

                    if (!$category || !$category->masterCategory) {
                        return null;
                    }

                    return [
                        'scoring_category_id' => $category->scoring_category_id,
                        'event_level_id' => $category->event_level_id,
                        'level_name' => $category->eventLevel->level->level_name ?? null,
                        'category_name' => $category->masterCategory->category_name,
                    ];
                })
                ->filter()
                ->values()
                ->toArray();

            unset($eventJudge->judgeExpertises);

            return $eventJudge;
        });

        return inertia('events/event_details/Show', [
            'event' => $event,
        ]);
    }

    /**
     * Show the form for editing the specified event.
     */
    public function edit($id)
    {
        $role = auth()->user()->role;

        if (!in_array($role, ['committee', 'admin'])) {
            abort(403, 'Hanya admin dan panitia yang dapat mengubah event.');
        }

        $event = Event::where('public_id', $id)
            ->with(['eventCommittees.committee.user'])
            ->firstOrFail();
        
        return inertia('events/event_edit/Edit', [
            'event' => $event
        ]);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, $id)
    {
        $event = Event::where('public_id', $id)->firstOrFail();
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'status' => 'required|in:draft,registration_open,active,finished',
            'temp_poster_path' => 'nullable|string',
            'registration_start_time' => 'required|date',
            'registration_end_time' => 'required|date|after_or_equal:registration_start_time',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
        ]);

        if ($request->filled('temp_poster_path')) {
            $tempPath = $request->input('temp_poster_path');

            if (Storage::disk('public')->exists($tempPath)) {
                if ($event->poster_path && Storage::disk('public')->exists($event->poster_path)) {
                    Storage::disk('public')->delete($event->poster_path);
                }

                $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
                $newPath = 'event_posters/' . Str::random(20) . '.' . $extension;
                Storage::disk('public')->move($tempPath, $newPath);

                $event->poster_path = $newPath;
            }
        }

        $event->save();

        return redirect()->back()->with('success', 'Detail Event berhasil diperbarui');
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy($id)
    {
        $event = Event::where('public_id', $id)->firstOrFail();
        $poster_path = $event->poster_path;
        DB::transaction(function () use ($event) {
            EventCommittee::where('event_id', $event->event_id)->delete();
            $event->delete();
        });

        if ($poster_path && Storage::disk('public')->exists($poster_path)){
            Storage::disk('public')->delete($poster_path);
        }

        return redirect()->back()
            ->with('message', 'Event deleted successfully.');
    }
}
