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
use App\Concerns\HasEventAccess;
use Illuminate\Auth\Events\Registered;
class EventController extends Controller
{
    use HasEventAccess;
    
    /** Menampilkan daftar event yang dapat diakses pengguna. */
    public function index()
    {
        $role = auth()->user()?->role;

        $events = Event::query()
            ->when($role !== 'admin', function ($query) {
                $query->where('status', '!=', 'draft');
            })
            ->when($role === 'admin', function ($query) {
                $query->withCount('participations');
            })
            ->latest()
            ->get();

        $view = match ($role) {
                    'admin' => 'events/event_lists/admin/Index',
                    'official_team', null => 'events/event_lists/Index', 
                    default => abort(403, 'Unauthorized Access'),
                };
        return inertia($view, [
            'events' => $events,
        ]);
    }

    /** Menampilkan event yang ditugaskan kepada panitia atau juri. */
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


        return redirect()->route('home');
    }

    /** Menampilkan formulir pembuatan event untuk administrator. */
    public function create()
    {
        abort_if(auth()->user()?->role !== 'admin', 403, 'Hanya Admin yang dapat membuat event baru.');
        $existingCommittees = Committee::with('user:user_id,name,email')->get();

        return inertia('events/event_create/Create', [
            'existingCommittees' => $existingCommittees
        ]);
    }

    /** Membuat event baru beserta panitia yang ditugaskan. */
    public function store(Request $request)
    {
        abort_if(auth()->user()?->role !== 'admin', 403, 'Hanya Admin yang dapat membuat event baru.');
        
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'poster_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'status' => 'required|in:draft,registration_open,active,finished',
            'registration_start_time' => 'required|date',
            'registration_end_time' => 'required|date|after_or_equal:registration_start_time',
            'start_time' => 'required|date|after_or_equal:registration_end_time',
            'end_time' => 'required|date|after_or_equal:start_time',
            'committees' => 'required|array|min:1',
            'committees.*.name' => 'required|string|max:255',
            'committees.*.email' => 'required|email',
            'committees.*.department' => 'required|string|max:255',
            'committees.*.position' => 'required|string|max:255',

            'force_create' => 'sometimes|boolean',
        ], [
            'registration_end_time.after_or_equal' => 'Batas pendaftaran harus sama atau setelah waktu mulai.',
            'start_time.after_or_equal' => 'Waktu mulai harus sama atau setelah pendaftaran ditutup.',
            'end_time.after_or_equal' => 'Waktu selesai harus sama atau setelah waktu mulai event.',
            'registration_start_time.required' => 'Waktu mulai pendaftaran wajib diisi.',
            'registration_end_time.required' => 'Batas akhir pendaftaran wajib diisi.',
            'start_time.required' => 'Waktu pelaksanaan wajib diisi.',
            'end_time.required' => 'Waktu selesai pelaksanaan wajib diisi.',
        ]);

        $existingCommittees = [];
        $validationErrors = [];

        foreach ($validated['committees'] as $index => $committeeData) {
            $user = User::where('email', $committeeData['email'])->first();

            if ($user) {
                if ($user->role !== 'committee') {
                    $validationErrors["committees.$index.email"] = "Email sudah terdaftar di akun dengan peran lain";
                } else {
                    $committee = Committee::where('user_id', $user->user_id)->first();
                    $existingCommittees[] = $user->name . ' (' . $committee->department . ')';
                }
            }
        }

        if ($validationErrors) {
            throw ValidationException::withMessages($validationErrors);
        }

        if ($existingCommittees && !$request->boolean('force_create')) {
            throw ValidationException::withMessages([
                'confirmation' => 'Akun Panitia ditemukan: '
                    . implode(', ', $existingCommittees)
                    . '. Lanjutkan?',
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
                    $user = User::where('email', $committeeData['email'])->first();
                    $isNewUser = false;

                    if (!$user) {
                        $user = User::create([
                            'public_id' => Str::uuid(),
                            'name' => $committeeData['name'],
                            'email' => $committeeData['email'],
                            'role' => 'committee',
                            'password' => Hash::make('password123'), // Generate password acak yang aman
                        ]);
                        $isNewUser = true;
                    }

                    $committee = Committee::firstOrCreate(
                        ['user_id' => $user->user_id],
                        ['department' => $committeeData['department']]
                    );

                    EventCommittee::create([
                        'event_id' => $event->event_id,
                        'committee_id' => $committee->committee_id,
                        'position' => $committeeData['position'],
                    ]);

                    if ($isNewUser) {
                        event(new Registered($user));
                    }
                }
            });
        } catch (\Exception $e){
            if ($posterPath && Storage::disk('public')->exists($posterPath)) {
            Storage::disk('public')->delete($posterPath);
            }
            throw $e;
        }

        return redirect()->route('events.index')->with('success', 'Event berhasil dibuat!');
    }

    /** Menampilkan detail event dan status kesiapan pengelolaannya. */
    public function show($id)
    {
        $user = auth()->user();
        $role = $user?->role ?? 'guest';
        
        $query = Event::where('public_id', $id);

        $event = $query->with([
                'eventCommittees.committee.user' => function ($q) {
                    $q->select(
                        'user_id',
                        'name',
                        'contact_info'
                    )->first();
                },
                'eventJudges:event_id,event_judge_id,judge_id',
                'eventJudges.judge.user:user_id,name',
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
                    $q->with('level:level_id,level_name')
                    ->withCount('participations', 'scoringCategories');
                },
                'participations:event_id,participation_id,event_level_id,team_name,official_team_id,appearance_order',
                'eventDocuments:event_id,document_id,document_name,document_path',
                'eventPenalties:event_penalty_id,event_id',
                'eventChampionCategories.formulas:formula_id,event_champion_category_id'
            ])
            ->withCount('participations', 'eventJudges', 'eventDocuments', 'eventPenalties', 'eventChampionCategories')
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

        $eventLevels = $event->eventLevels;

        $readinessChecks = [
            'has_documents' => ($event->event_documents_count ?? 0) > 0,
            'has_levels' => $eventLevels->isNotEmpty() && $eventLevels->every(fn($l) => $l->registration_fees !== null),
            'has_scoring_categories' => $eventLevels->isNotEmpty() && $eventLevels->every(fn($l) => ($l->scoring_categories_count ?? 0) > 0),
            'has_judges' => ($event->event_judges_count ?? 0) > 0,
            'has_champion_categories' => ($event->event_champion_categories_count ?? 0) > 0,
            'has_penalties' => ($event->event_penalties_count ?? 0) > 0,
            'has_champion_formulas' => ($event->eventChampionCategories ?? collect())->pluck('formulas')->flatten()->isNotEmpty(),
            'has_appearance_orders' => ($event->participations ?? collect())->whereNotNull('appearance_order')->isNotEmpty(),
        ];

        $myOfficialTeamId = $user?->officialTeam?->official_team_id ?? null;

        return inertia('events/event_details/Show', [
            'event' => $event,
            'myOfficialTeamId' => $myOfficialTeamId,
            'readinessChecks' => $readinessChecks,
        ]);
    }

    /** Menampilkan formulir perubahan detail event. */
    public function edit($id)
    {
        $role = auth()->user()->role;

        $event = Event::where('public_id', $id)
            ->with(['eventCommittees.committee.user'])
            ->firstOrFail();
        
        $this->validateEventAccess($event, ['administration'],['committee']);

        return inertia('events/event_edit/Edit', [
            'event' => $event
        ]);
    }

    /** Memperbarui informasi dan pengaturan visibilitas hasil event. */
    public function update(Request $request, $id)
    {
        $event = Event::where('public_id', $id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'status' => 'required|in:draft,registration_open,active,finished',
            'temp_poster_path' => 'nullable|string',
            'registration_start_time' => 'required|date',
            'registration_end_time' => 'required|date|after_or_equal:registration_start_time',
            'start_time' => 'required|date|after_or_equal:registration_end_time',
            'end_time' => 'required|date|after_or_equal:start_time',
            'is_result_visible' => 'nullable|boolean',
            'is_recap_visible' => 'nullable|boolean',
            'is_leaderboard_visible' => 'nullable|boolean',
        ], [
            'event_name.required' => 'Nama event wajib diisi.',
            'event_name.max' => 'Nama event tidak boleh lebih dari 255 karakter.',
            'location.required' => 'Lokasi event wajib diisi.',
            'location.max' => 'Lokasi tidak boleh lebih dari 255 karakter.',
            
            'status.required' => 'Status event wajib dipilih.',
            'status.in' => 'Pilihan status event tidak valid.',

            'registration_start_time.required' => 'Waktu mulai pendaftaran wajib diisi.',
            'registration_start_time.date' => 'Format waktu mulai pendaftaran tidak valid.',
            'registration_end_time.required' => 'Waktu penutupan pendaftaran wajib diisi.',
            'registration_end_time.date' => 'Format waktu penutupan pendaftaran tidak valid.',
            'registration_end_time.after_or_equal' => 'Batas penutupan pendaftaran harus sama atau setelah waktu mulai.',

            'start_time.required' => 'Waktu mulai pelaksanaan event wajib diisi.',
            'start_time.date' => 'Format waktu mulai pelaksanaan tidak valid.',
            'start_time.after_or_equal' => 'Waktu mulai harus sama atau setelah pendaftaran ditutup',
            'end_time.required' => 'Waktu berakhir pelaksanaan event wajib diisi.',
            'end_time.date' => 'Format waktu berakhir pelaksanaan tidak valid.',
            'end_time.after_or_equal' => 'Waktu berakhir harus sama atau setelah waktu mulai pelaksanaan.',

            'temp_poster_path.string' => 'Berkas poster tidak valid.',
            'is_result_visible.boolean' => 'Format visibilitas hasil tidak valid.',
            'is_recap_visible.boolean' => 'Format visibilitas rekap tidak valid.',
            'is_leaderboard_visible.boolean' => 'Format visibilitas papan peringkat tidak valid.',
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

        // Menyimpan status visibilitas (menggunakan input boolean untuk keamanan format dari React/Inertia)
        $event->is_result_visible = $request->boolean('is_result_visible');
        $event->is_recap_visible = $request->boolean('is_recap_visible');
        $event->is_leaderboard_visible = $request->boolean('is_leaderboard_visible');
        
        $event->update([
            'event_name' => $validated['event_name'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'status' => $validated['status'],
            'registration_start_time' => $validated['registration_start_time'],
            'registration_end_time' => $validated['registration_end_time'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);

        return redirect()->back()->with('success', 'Detail Event berhasil diperbarui');
    }

    /** Menghapus event beserta berkas poster terkait. */
    public function destroy($id)
    {
        $event = Event::where('public_id', $id)->firstOrFail();
        
        $this->validateEventAccess($event, ['administration'], ['committee']);

        $poster_path = $event->poster_path;
        DB::transaction(function () use ($event) {
            EventCommittee::where('event_id', $event->event_id)->delete();
            $event->delete();
        });

        if ($poster_path && Storage::disk('public')->exists($poster_path)){
            Storage::disk('public')->delete($poster_path);
        }

        return redirect()->route('events.index')
            ->with('message', 'Event Berhasil Dihapus.');
    }
}