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
        $role = auth()->user()?->role;
        $events = match ($role) {
            'committee' => Event::whereHas('eventCommittees.committee', function ($query) {
                $query->where('user_id', auth()->id());
            })->latest()->get(),
            'official_team' => Event::whereHas('participations.officialTeam', function ($query) {
                $query->where('user_id', auth()->id());
            })->latest()->get(),
            default => collect([]),
        };

        $view = match ($role) {
            'committee' => 'events/event_lists/committee/HostedEvents',
            'official_team' => 'events/event_lists/official_team/MyEvents',
            default => abort(403, 'Unauthorized access'),
        };

        return inertia($view, [
            'events' => $events,
        ]);
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
        $event = match ($role) {
            'admin' => $query->withCount(['participations', 'eventCommittees', 'eventJudges'])->firstOrFail(),
            
            'committee' => $query->with([
                                    'eventJudges:event_id,event_judge_id,judge_id',
                                    'eventJudges.judge.user:user_id,name',
                                    'eventJudges.judgeExpertises.scoringCategory.masterCategory:master_category_id,category_name',
                                    'eventLevels' => function ($q) {
                                        $q->select(
                                            'event_level_id',
                                            'event_id',
                                            'level_id',
                                            'registration_fees'
                                        )->with('level:level_id,level_name')->withCount('participations');
                                    },
                                    'participations:event_id,participation_id,event_level_id,team_name',
                                    'eventDocuments:event_id,document_id,document_name,document_path'
                                ])
                                ->withCount('participations', 'eventJudges')
                                ->firstOrFail(),
                                
            'judge' => $query->with(['eventJudges' => function($q) {
                $q->where('judge_id', auth()->user()->judge->judge_id);
            }])->firstOrFail(),
            
            'official_team' => $query->with(['participations' => function($q) {
                $q->where('official_team_id', auth()->user()->officialTeam->official_team_id);
            }])->firstOrFail(),
            
            default => abort(403),
        };

        $event->eventJudges->transform(function ($eventJudge) {
            $eventJudge->expertises = $eventJudge->judgeExpertises->map(function ($expertise) {
                return $expertise->scoringCategory->masterCategory->category_name ?? null;
            })->filter()->values()->toArray(); 
            unset($eventJudge->judgeExpertises);

            return $eventJudge;
        });

        $view = match ($role) {
            'committee' => 'events/event_details/committee/Show',
            'admin' => 'events/event_details/Show',
            'official_team' => 'events/event_details/official_team/Show',
            default => abort(403, 'Unauthorized access'),
        };

        return inertia($view, [
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
            'poster_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'registration_start_time' => 'required|date',
            'registration_end_time' => 'required|date|after_or_equal:registration_start_time',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
        ]);

        if ($request-> hasFile('poster_path')){
            if ($event->poster_path && Storage::disk('public')->exists($event->poster_path)) {
                Storage::disk('public')->delete($event->poster_path);
            }

            $path = $request->file('poster_path')->store('event_posters', 'public');
            $validated['poster_path'] = $path;
        }else{
            unset($validated['poster_path']);
        }

        $event->update($validated);

        return redirect()->back()->with('success', 'Event updated successfully.');
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
