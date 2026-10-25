<?php

namespace App\Http\Controllers\Champions;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventLevel;
use App\Models\ChampionCategory;
use App\Models\EventChampionCategory;
use App\Models\Champion;
use App\Models\EventChampion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventChampionController extends Controller
{
    /**
     * 1. INDEX: Menampilkan daftar piala yang dikelompokkan berdasarkan Jenjang lalu Kategori.
     */
    public function index($public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $activeCategories = EventChampionCategory::where('event_id', $event->event_id)
            ->with('championCategory:champion_category_id,champion_category_name')
            ->get();

        $eventLevels = EventLevel::with([
            'level:level_id,level_name',
            'eventChampions.champion'
        ])
        ->where('event_id', $event->event_id)
        ->get();

        $groupedChampions = $eventLevels->map(function ($eventLevel) use ($activeCategories) {
            $championsByCategory = $eventLevel->eventChampions->groupBy('champion.champion_category_id');

            $categories = $activeCategories->map(function ($activeCat) use ($championsByCategory) {
                $catId = $activeCat->champion_category_id;
                if (!isset($championsByCategory[$catId]) || $championsByCategory[$catId]->isEmpty()) {
                    return null;
                }
                
                return [
                    'champion_category_id' => $catId,
                    'category_name' => $activeCat->championCategory->champion_category_name,
                    'champions' => isset($championsByCategory[$catId]) 
                        ? $championsByCategory[$catId]->sortBy('rank_position')->values() // Sort by rank di event_champions
                        : [] 
                ];
            })->filter()->values();;

            return [
                'event_level_id' => $eventLevel->event_level_id,
                'level_name' => $eventLevel->level->level_name ?? 'Jenjang Lainnya',
                'categories' => $categories,
            ];
        });

        return inertia('events/champions/committee/Index', [
            'event' => $event,
            'groupedChampions' => $groupedChampions,
            'activeCategories' => $activeCategories,
        ]);
    }

    /**
     * 2. CREATE: Halaman Form Builder untuk menyusun daftar piala baru.
     */
    public function create($public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $eventLevels = EventLevel::with([
            'level:level_id,level_name',
            'eventChampions.champion'
        ])
        ->where('event_id', $event->event_id)
        ->get();

        // Mengirimkan master kategori beserta daftar master pialanya
        // agar frontend bisa menampilkan dropdown pilihan piala yang valid
        $masterChampionCategories = ChampionCategory::with(['champions' => function($q) {
                $q->orderBy('champion_id', 'asc');
            }])
            ->orderBy('champion_category_id', 'asc')
            ->get();

        return inertia('events/champions/committee/Create', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'masterChampionCategories' => $masterChampionCategories,
        ]);
    }

    /**
     * 3. STORE: Menyimpan form builder (Banyak Piala -> Banyak Jenjang).
     */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $validated = $this->validateChampionBuilder($request, false);

        DB::transaction(function () use ($validated, $event) {
            
            // 1. Pastikan Kategori Juara ini aktif di Event tersebut
            EventChampionCategory::firstOrCreate([
                'event_id' => $event->event_id,
                'champion_category_id' => $validated['champion_category_id'],
            ]);

            // 2. Looping ke setiap jenjang yang dicentang panitia
            foreach ($validated['event_level_ids'] as $levelId) {
                $eventLevel = EventLevel::with('level')->where('event_level_id', $levelId)->where('event_id', $event->event_id)->first();
                
                if (!$eventLevel) continue;

                $isCategoryAlreadySet = EventChampion::where('event_level_id', $levelId)
                    ->whereHas('champion', function($q) use ($validated) {
                        $q->where('champion_category_id', $validated['champion_category_id']);
                    })->exists();

                if ($isCategoryAlreadySet) {
                    $levelName = $eventLevel->level->level_name ?? 'yang dipilih';
                    throw ValidationException::withMessages([
                        'champion_category_id' => "Kategori juara ini sudah diatur pada jenjang {$levelName}. Silakan gunakan tombol Edit untuk mengubah datanya"
                    ]);
                }
                $this->syncChampions($levelId, $validated['champion_category_id'], $validated['champions'], false);
            }
        });

        return redirect()->route('committee.events.champions.index', [
            'public_id' => $public_id,
            'level_id' => $validated['event_level_ids'][0] 
        ])->with('success', 'Daftar penghargaan berhasil disusun!');
    }

    /**
     * 4. EDIT: Halaman Form Builder untuk mengedit piala pada suatu jenjang & kategori tertentu.
     */
    public function edit($public_id, $event_level_id, $champion_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $eventLevel = EventLevel::with('level:level_id,level_name')
            ->where('event_level_id', $event_level_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $championCategory = ChampionCategory::with(['champions' => function($q) {
                $q->orderBy('champion_id', 'asc');
            }])
            ->findOrFail($champion_category_id);

        // Ambil data piala yang sudah ada untuk jenjang dan kategori ini
        $existingChampions = EventChampion::where('event_level_id', $eventLevel->event_level_id)
            ->whereHas('champion', function($q) use ($champion_category_id) {
                $q->where('champion_category_id', $champion_category_id);
            })
            ->with('champion')
            ->get()
            ->sortBy('rank_position') // Sort berdasarkan rank di event_champions
            ->values();

        return inertia('events/champions/committee/Edit', [
            'event' => $event,
            'eventLevel' => $eventLevel,
            'championCategory' => $championCategory,
            'existingChampions' => $existingChampions, 
        ]);
    }

    /**
     * 5. UPDATE: Sinkronisasi pembaruan piala untuk satu jenjang & kategori.
     */
    public function update(Request $request, $public_id, $event_level_id, $champion_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $eventLevel = EventLevel::where('event_level_id', $event_level_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $validated = $this->validateChampionBuilder($request, true);

        DB::transaction(function () use ($validated, $eventLevel, $champion_category_id) {
            $this->syncChampions($eventLevel->event_level_id, $champion_category_id, $validated['champions'], true);
        });

        return redirect()->route('committee.events.champions.index', [
            'public_id' => $public_id,
            'level_id' => $eventLevel->event_level_id
        ])->with('success', 'Daftar penghargaan berhasil diperbarui!');
    }

    /**
     * 6. DESTROY: Menghapus seluruh piala dalam satu kategori di suatu jenjang.
     */
    public function destroy($public_id, $event_level_id, $champion_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        // Hapus piala yang berelasi dengan event_level dan champion_category ini
        EventChampion::where('event_level_id', $event_level_id)
            ->whereHas('champion', function($q) use ($champion_category_id) {
                $q->where('champion_category_id', $champion_category_id);
            })->delete();

        // Cek apakah kategori ini masih punya piala di jenjang lain pada event ini
        $isCategoryStillUsed = EventChampion::whereHas('eventLevel', function($q) use ($event) {
                $q->where('event_id', $event->event_id);
            })
            ->whereHas('champion', function($q) use ($champion_category_id) {
                $q->where('champion_category_id', $champion_category_id);
            })->exists();

        // Jika sudah kosong melompong, hapus dari tabel pivot event_champion_categories
        if (!$isCategoryStillUsed) {
            EventChampionCategory::where('event_id', $event->event_id)
                ->where('champion_category_id', $champion_category_id)
                ->delete();
        }

        return redirect()->back()->with('success', 'Kategori penghargaan berhasil dikosongkan dari jenjang ini.');
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    private function validateChampionBuilder(Request $request, $isUpdate = false)
    {
        $data = $request->all();
        if (!isset($data['champions']) || !is_array($data['champions'])) {
            $request->merge(['champions' => []]);
        }

        $rules = [
            'champions' => 'present|array',
            'champions.*.champion_id' => 'required|exists:champions,champion_id', // Ambil dari pilihan Master
            'champions.*.rank_position' => 'required|integer|min:1', // Peringkat spesifik event
            'champions.*.prize_money' => 'nullable|integer|min:0',
            'champions.*.certificate' => 'boolean',
            'champions.*.prize_descriptions' => 'nullable|string',
        ];

        // Saat store, butuh memilih Kategori dan array Checkbox Level
        if (!$isUpdate) {
            $rules['champion_category_id'] = 'required|exists:champion_categories,champion_category_id';
            $rules['event_level_ids'] = 'required|array|min:1';
            $rules['event_level_ids.*'] = 'required|exists:event_levels,event_level_id';
        }

        $validated = $request->validate($rules);

        // Validasi unik rank_position agar tidak ada Juara Utama 1 ganda dalam satu form
        $rankPositions = [];
        foreach ($validated['champions'] as $index => $champion) {
            if (in_array($champion['rank_position'], $rankPositions)) {
                throw ValidationException::withMessages(["champions.{$index}.rank_position" => 'Peringkat tidak boleh ada yang sama dalam satu kategori.']);
            }
            $rankPositions[] = $champion['rank_position'];
        }

        return $validated;
    }

    private function syncChampions($eventLevelId, $championCategoryId, $championsData, $isSync = false)
    {
        $submittedChampionIds = [];

        foreach ($championsData as $data) {
            
            // Simpan / Update ke tabel event_champions dengan data referensi dari Master
            EventChampion::updateOrCreate(
                [
                    'event_level_id' => $eventLevelId,
                    'champion_id' => $data['champion_id'],
                ],
                [
                    'rank_position' => $data['rank_position'],
                    'prize_money' => $data['prize_money'] ?? null,
                    'certificate' => $data['certificate'] ?? false,
                    'prize_descriptions' => $data['prize_descriptions'] ?? null,
                ]
            );

            $submittedChampionIds[] = $data['champion_id'];
        }

        // Jika dipanggil dari Update (Edit Form Builder), hapus piala yang dibuang panitia
        if ($isSync) {
            EventChampion::where('event_level_id', $eventLevelId)
                ->whereHas('champion', function($q) use ($championCategoryId) {
                    $q->where('champion_category_id', $championCategoryId);
                })
                ->whereNotIn('champion_id', $submittedChampionIds)
                ->delete();
        }
    }
}