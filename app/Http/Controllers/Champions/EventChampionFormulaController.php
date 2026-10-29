<?php

namespace App\Http\Controllers\Champions;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventLevel;
use App\Models\EventChampionCategory;
use App\Models\ScoringCategory;
use App\Models\EventChampionFormula;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EventChampionFormulaController extends Controller
{
    /**
     * INDEX (Halaman Manajemen Formula Terpadu per Jenjang)
     */
    public function index(Request $request, $public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $eventLevels = EventLevel::with('level:level_id,level_name')
            ->where('event_id', $event->event_id)
            ->get();

        $activeLevelId = $request->query('level_id');
        $activeLevel = $activeLevelId 
            ? $eventLevels->where('event_level_id', $activeLevelId)->first() 
            : $eventLevels->first();

        if (!$activeLevel) abort(404, 'Event ini belum memiliki jenjang perlombaan.');

        // AMBIL SEMUA kategori juara di event ini (termasuk yang baru ditambahkan)
        $championCategories = EventChampionCategory::where('event_id', $event->event_id)
            ->with('championCategory:champion_category_id,champion_category_name')
            ->get();

        // Ambil kategori penilaian khusus jenjang ini
        $scoringCategories = ScoringCategory::where('event_level_id', $activeLevel->event_level_id)
            ->with('masterCategory:master_category_id,category_name')
            ->get();

        // Ambil formula yang sudah ada di jenjang ini untuk inisialisasi state awal di Frontend
        $existingFormulas = EventChampionFormula::where('event_level_id', $activeLevel->event_level_id)
            ->get()
            ->map(function ($formula) use ($scoringCategories) {
                $scoringCategory = $scoringCategories->firstWhere('scoring_category_id', $formula->scoring_category_id);
                $formula->master_category_id = $scoringCategory?->master_category_id;
                return $formula;
            })
            ->groupBy('event_champion_category_id');

        return inertia('events/champion_formulas/committee/Index', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'activeLevel' => $activeLevel,
            'championCategories' => $championCategories,
            'scoringCategories' => $scoringCategories,
            'existingFormulas' => $existingFormulas,
        ]);
    }

    /**
     * STORE / UPDATE (Menyimpan seluruh perubahan di jenjang tersebut)
     */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $validated = $request->validate([
            'event_level_id' => [
                'required', 
                'integer', 
                Rule::exists('event_levels', 'event_level_id')->where('event_id', $event->event_id)
            ],
            'formulas' => ['present', 'array'],
            'formulas.*.event_champion_category_id' => [
                'required', 
                'integer', 
                Rule::exists('event_champion_categories', 'event_champion_category_id')->where('event_id', $event->event_id)
            ],
            'formulas.*.components' => ['present', 'array'],
            'formulas.*.components.*.master_category_id' => ['required', 'integer', 'exists:master_scoring_categories,master_category_id'],
            'formulas.*.components.*.weight_multiplier' => ['required', 'numeric', 'gt:0', 'decimal:0,4'],
        ]);

        // Validasi Duplikasi Kustom per Piala
        foreach ($validated['formulas'] as $index => $formulaData) {
            $components = $formulaData['components'] ?? [];
            $masterCategoryIds = array_map(fn ($comp) => (int) $comp['master_category_id'], $components);

            if (count($masterCategoryIds) !== count(array_unique($masterCategoryIds))) {
                throw ValidationException::withMessages([
                    "formulas.$index.components" => 'Kategori penilaian yang sama tidak boleh dipilih lebih dari satu kali pada piala ini.'
                ]);
            }
        }

        DB::transaction(function () use ($validated) {
            $levelId = $validated['event_level_id'];

            foreach ($validated['formulas'] as $formulaData) {
                // Sync akan memperbarui yang berubah, dan membiarkan yang tidak berubah
                $this->syncFormulaComponents($levelId, $formulaData['event_champion_category_id'], $formulaData['components'] ?? []);
            }
        });

        return redirect()->route('committee.formulas.index', [
            'public_id' => $public_id,
            'level_id' => $validated['event_level_id'],
        ])->with('success', 'Perumusan bobot juara berhasil disimpan!');
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    private function syncFormulaComponents($levelId, $championCategoryId, $components)
    {
        // Jika panitia menghapus semua komponen dari piala ini, hapus dari database
        if (count($components) === 0) {
            EventChampionFormula::where('event_level_id', $levelId)
                ->where('event_champion_category_id', $championCategoryId)
                ->delete();
            return;
        }

        $validScoringCategoryIds = [];

        foreach ($components as $component) {
            $scoringCategory = ScoringCategory::where('event_level_id', $levelId)
                ->where('master_category_id', $component['master_category_id'])
                ->first();

            if (!$scoringCategory) continue;

            $validScoringCategoryIds[] = $scoringCategory->scoring_category_id;

            EventChampionFormula::updateOrCreate(
                [
                    'event_level_id' => $levelId,
                    'event_champion_category_id' => $championCategoryId,
                    'scoring_category_id' => $scoringCategory->scoring_category_id,
                ],
                [
                    'weight_multiplier' => round((float) $component['weight_multiplier'], 4),
                ]
            );
        }

        // Hapus komponen yang tidak lagi ada di form untuk piala ini
        EventChampionFormula::where('event_level_id', $levelId)
            ->where('event_champion_category_id', $championCategoryId)
            ->whereNotIn('scoring_category_id', $validScoringCategoryIds)
            ->delete();
    }
}