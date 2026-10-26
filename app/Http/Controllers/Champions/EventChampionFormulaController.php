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
    public function index(Request $request, $public_id)
    {
        $event = Event::select(
            'event_id',
            'public_id',
            'event_name',
            'status'
        )
            ->where('public_id', $public_id)
            ->firstOrFail();

        $eventLevels = EventLevel::with('level:level_id,level_name')
            ->where('event_id', $event->event_id)
            ->get();

        $activeLevelId = $request->query('level_id');

        $activeLevel = $activeLevelId
            ? $eventLevels->first(
                fn ($level) =>
                    (int) $level->event_level_id === (int) $activeLevelId
            )
            : $eventLevels->first();

        if (!$activeLevel) {
            abort(404, 'Event ini belum memiliki jenjang perlombaan.');
        }

        $championCategories = EventChampionCategory::where(
            'event_id',
            $event->event_id
        )
            ->with(
                'championCategory:champion_category_id,champion_category_name'
            )
            ->get();

        $scoringCategories = ScoringCategory::where(
            'event_level_id',
            $activeLevel->event_level_id
        )
            ->with('masterCategory:master_category_id,category_name')
            ->get();

        $existingFormulas = EventChampionFormula::where(
            'event_level_id',
            $activeLevel->event_level_id
        )
            ->get()
            ->map(function ($formula) use ($scoringCategories) {
                $scoringCategory = $scoringCategories->firstWhere(
                    'scoring_category_id',
                    $formula->scoring_category_id
                );

                $formula->master_category_id =
                    $scoringCategory?->master_category_id;

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

    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)
            ->firstOrFail();

        $validated = $request->validate([
            'event_level_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'event_level_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('event_levels', 'event_level_id')
                    ->where(
                        fn ($query) =>
                            $query->where('event_id', $event->event_id)
                    ),
            ],

            'formulas' => [
                'present',
                'array',
            ],

            'formulas.*.event_champion_category_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists(
                    'event_champion_categories',
                    'event_champion_category_id'
                )->where(
                    fn ($query) =>
                        $query->where('event_id', $event->event_id)
                ),
            ],

            'formulas.*.calculation_method' => [
                'required',
                Rule::in(['percentage', 'accumulation']),
            ],

            'formulas.*.components' => [
                'present',
                'array',
            ],

            'formulas.*.components.*.master_category_id' => [
                'required',
                'integer',
                'exists:master_scoring_categories,master_category_id',
            ],

            'formulas.*.components.*.weight_multiplier' => [
                'required',
                'numeric',
                'gt:0',
                'decimal:0,4',
            ],
        ]);

        foreach ($validated['formulas'] as $formulaIndex => $formulaData) {
            $components = $formulaData['components'];

            $masterCategoryIds = array_map(
                fn ($component) => (int) $component['master_category_id'],
                $components
            );

            if (count($masterCategoryIds) !== count(array_unique($masterCategoryIds))) {
                throw ValidationException::withMessages([
                    "formulas.$formulaIndex.components" =>
                        'Kategori penilaian yang sama tidak boleh dipilih lebih dari satu kali.',
                ]);
            }

            if (
                $formulaData['calculation_method'] === 'percentage'
                && count($components) > 0
            ) {
                $totalMultiplier = array_sum(
                    array_map(
                        fn ($component) =>
                            (float) $component['weight_multiplier'],
                        $components
                    )
                );

                if (abs($totalMultiplier - 1) > 0.0001) {
                    throw ValidationException::withMessages([
                        "formulas.$formulaIndex.components" =>
                            'Total bobot persentase harus tepat 100%.',
                    ]);
                }
            }

            foreach ($validated['event_level_ids'] as $levelId) {
                $selectedMasterIds = array_map(
                    fn ($component) => (int) $component['master_category_id'],
                    $components
                );

                $availableMasterIds = ScoringCategory::where(
                    'event_level_id',
                    $levelId
                )
                    ->whereIn('master_category_id', $selectedMasterIds)
                    ->pluck('master_category_id')
                    ->map(fn ($id) => (int) $id)
                    ->all();

                if (
                    count($selectedMasterIds) !== count($availableMasterIds)
                ) {
                    throw ValidationException::withMessages([
                        "formulas.$formulaIndex.components" =>
                            'Satu atau lebih kategori penilaian tidak tersedia pada jenjang yang dipilih.',
                    ]);
                }
            }
        }

        DB::transaction(function () use ($validated, $event) {
            foreach ($validated['formulas'] as $formulaData) {
                EventChampionCategory::where(
                    'event_id',
                    $event->event_id
                )
                    ->where(
                        'event_champion_category_id',
                        $formulaData['event_champion_category_id']
                    )
                    ->update([
                        'calculation_method' =>
                            $formulaData['calculation_method'],
                    ]);
            }

            foreach ($validated['event_level_ids'] as $levelId) {
                foreach ($validated['formulas'] as $formulaData) {
                    $championCategoryId =
                        $formulaData['event_champion_category_id'];

                    $components = $formulaData['components'];

                    if (count($components) === 0) {
                        EventChampionFormula::where(
                            'event_level_id',
                            $levelId
                        )
                            ->where(
                                'event_champion_category_id',
                                $championCategoryId
                            )
                            ->delete();

                        continue;
                    }

                    $validScoringCategoryIds = [];

                    foreach ($components as $component) {
                        $scoringCategory = ScoringCategory::where(
                            'event_level_id',
                            $levelId
                        )
                            ->where(
                                'master_category_id',
                                $component['master_category_id']
                            )
                            ->firstOrFail();

                        $scoringCategoryId =
                            $scoringCategory->scoring_category_id;

                        $validScoringCategoryIds[] = $scoringCategoryId;

                        EventChampionFormula::updateOrCreate(
                            [
                                'event_level_id' => $levelId,
                                'event_champion_category_id' =>
                                    $championCategoryId,
                                'scoring_category_id' =>
                                    $scoringCategoryId,
                            ],
                            [
                                'weight_multiplier' => round(
                                    (float) $component['weight_multiplier'],
                                    4
                                ),
                            ]
                        );
                    }

                    EventChampionFormula::where(
                        'event_level_id',
                        $levelId
                    )
                        ->where(
                            'event_champion_category_id',
                            $championCategoryId
                        )
                        ->whereNotIn(
                            'scoring_category_id',
                            $validScoringCategoryIds
                        )
                        ->delete();
                }
            }
        });

        return redirect()->route(
            'committee.formulas.index',
            [
                'public_id' => $public_id,
                'level_id' => $validated['event_level_ids'][0],
            ]
        )->with(
            'success',
            'Formula perhitungan nilai berhasil disimpan untuk jenjang yang dipilih!'
        );
    }
}