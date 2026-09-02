<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventCommittee;
use App\Models\Committee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ParticipationController extends Controller
{
    /**
     * Display a listing of all events.
     */
    public function index($public_id)
    {
        $event = Event::where('public_id', $public_id)
                ->with('participations.officialTeam.user')
                ->firstOrFail();


        $role = auth()->user()?->role;
        $view = match ($role) {
            'committee' => 'committee/HostedEvents/Participations/Index',
            'official_team' => 'official_team/MyEvents/Participations/Index',
            default => abort(403, 'Unauthorized access'),
        };

        // TAMBAHKAN existingCommittees KE DALAM ARRAY PENGIRIMAN
        return inertia($view, [
            'event' => $event,
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
            'committee' => 'committee/HostedEvents/Index',
            'official_team' => 'official_team/MyEvents/Index',
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
        return inertia('admin/EventManagement/Create', [
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

        DB::transaction(function () use ($validated, $request) {

            $event = Event::create([
                'public_id' => Str::uuid(),
                'event_name' => $validated['event_name'],
                'description' => $validated['description'],
                'location' => $validated['location'],
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

        return redirect()
            ->route('events.index')
            ->with('status', 'Event created successfully!');
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
            
            'committee' => $query->with(['eventCommittees.committee.user', 'eventJudges.judge.user'])
                                ->withCount('participations', 'eventCommittees','eventJudges')
                                ->firstOrFail(),
                                
            'judge' => $query->with(['eventJudges' => function($q) {
                $q->where('judge_id', auth()->user()->judge->judge_id);
            }])->firstOrFail(),
            
            'official_team' => $query->with(['participations' => function($q) {
                $q->where('official_team_id', auth()->user()->officialTeam->official_team_id);
            }])->firstOrFail(),
            
            default => abort(403),
        };

        // Tentukan path view React berdasarkan role
        $view = match ($role) {
            'admin' => 'admin/EventManagement/Show',
            'committee' => 'committee/HostedEvents/Show',
            'judge' => 'judge/EventManagement/Show',
            'official_team' => 'official_team/EventManagement/Show',
            default => abort(403),
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
        $event = Event::where('public_id', $id)
            ->with(['eventCommittees.committee.user'])
            ->firstOrFail();

        $role = auth()->user()?->role;
        $view = match ($role) {
            'admin' => 'admin/EventManagement/Edit',
            'committee' => 'committee/HostedEvents/Edit',
            default => abort(403, 'Unauthorized access'),
        };
        
        return inertia($view, [
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
            'registration_start_time' => 'required|date',
            'registration_end_time' => 'required|date|after_or_equal:registration_start_time',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
        ]);

        $event->update($validated);

        return redirect()->route('events.index')
            ->with('message', 'Event updated successfully.');
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy($id)
    {
        $event = Event::where('public_id', $id)->firstOrFail();
        DB::transaction(function () use ($event) {
            EventCommittee::where('event_id', $event->event_id)->delete();
            $event->delete();
        });

        return redirect()->route('events.index')
            ->with('message', 'Event deleted successfully.');
    }
}
