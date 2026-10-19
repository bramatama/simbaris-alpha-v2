<?php

namespace App\Http\Controllers\Scorings;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventLevel; 
use App\Models\MasterScoringCategory;
use App\Models\ScoringCategory;
use App\Models\AssessmentCriteria;
use App\Models\RubricCategory;
use App\Models\RubricScore;
use App\Models\TeamScoreDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventScoringCategoryController extends Controller
{   
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

        // Tambahkan fallback jika event belum punya level sama sekali
        if (!$activeLevel) {
            abort(404, 'Event ini belum memiliki jenjang perlombaan.');
        }

        $scoringCategories = ScoringCategory::where('event_level_id', $activeLevel->event_level_id)
            ->with('masterCategory:master_category_id,category_name')
            ->withCount('assessmentCriteria') 
            ->get();

        return inertia('events/scorings/Index', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'activeLevel' => $activeLevel,
            'scoringCategories' => $scoringCategories,
        ]);
    }

    public function create($public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        // Ambil semua level di event ini beserta data master_category yang sudah mereka gunakan.
        // Ini berguna agar frontend bisa menonaktifkan checkbox level jika level tersebut sudah memiliki form PBB misalnya.
        $eventLevels = EventLevel::with(['level:level_id,level_name', 'scoringCategories:event_level_id,master_category_id'])
            ->where('event_id', $event->event_id)
            ->get();

        $masterCategories = MasterScoringCategory::all();

        return inertia('events/scorings/committee/Create', [
            'event' => $event,
            'eventLevels' => $eventLevels, // Kirim semua level untuk dirender sebagai Checkbox
            'masterCategories' => $masterCategories,
        ]);
    }

    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $validated = $this->validateScoringForm($request);

        DB::transaction(function () use ($validated, $event) {
            // LOOPING BATCH CREATE: Buat form untuk setiap level yang dicentang
            foreach ($validated['event_level_ids'] as $levelId) {
                
                // Pastikan level tersebut benar-benar milik event ini (keamanan)
                $isValidLevel = EventLevel::where('event_level_id', $levelId)->where('event_id', $event->event_id)->exists();
                if (!$isValidLevel) continue;

                // Cek apakah level ini sudah memiliki master kategori yang sama
                $exists = ScoringCategory::where('event_level_id', $levelId)
                    ->where('master_category_id', $validated['master_category_id'])
                    ->exists();

                if (!$exists) {
                    $scoringCategory = ScoringCategory::create([
                        'event_level_id' => $levelId,
                        'master_category_id' => $validated['master_category_id'],
                    ]);

                    $this->syncCriteria($scoringCategory->scoring_category_id, $validated['criteria'] ?? []);
                }
            }
        });

        return redirect()->route('committee.events.scoring-categories.index', ['public_id' => $public_id])
            ->with('success', 'Form kategori penilaian berhasil dibuat untuk jenjang yang dipilih!');
    }

    public function show($public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        $scoringCategory = $this->getFullyLoadedCategory($event->event_id, $scoring_category_id);

        return inertia('events/scorings/Show', [
            'event' => $event,
            'eventLevel' => $scoringCategory->eventLevel,
            'scoringCategory' => $scoringCategory,
        ]);
    }

    public function edit($public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $this->checkIfEditable($scoring_category_id);

        $scoringCategory = $this->getFullyLoadedCategory($event->event_id, $scoring_category_id);
        
        return inertia('events/scorings/committee/Edit', [
            'event' => $event,
            'eventLevel' => $scoringCategory->eventLevel, // Data level diambil dari relasi
            'scoringCategory' => $scoringCategory,
        ]);
    }

    public function update(Request $request, $public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        // Pengecekan keamanan ganda melalui whereHas
        $scoringCategory = ScoringCategory::where('scoring_category_id', $scoring_category_id)
            ->whereHas('eventLevel', function($query) use ($event) {
                $query->where('event_id', $event->event_id);
            })->firstOrFail();

        $this->checkIfEditable($scoringCategory->scoring_category_id);

        $validated = $this->validateScoringForm($request, true);

        DB::transaction(function () use ($validated, $scoringCategory) {
            $this->syncCriteria($scoringCategory->scoring_category_id, $validated['criteria'] ?? []);
        });

        // Redirect kembali ke index dengan parameter query string level_id agar panitia tidak tersasar
        return redirect()->route('committee.events.scoring-categories.index', [
            'public_id' => $public_id,
            'level_id' => $scoringCategory->event_level_id
        ])->with('success', 'Form kategori penilaian berhasil diperbarui!');
    }

    public function destroy($public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        
        $scoringCategory = ScoringCategory::where('scoring_category_id', $scoring_category_id)
            ->whereHas('eventLevel', function($query) use ($event) {
                $query->where('event_id', $event->event_id);
            })->firstOrFail();

        $this->checkIfEditable($scoringCategory->scoring_category_id);
        
        if ($scoringCategory->judgeExpertises()->exists()) {
            return redirect()->back()->with(
                'error',
                'Kategori penilaian tidak dapat dihapus karena masih digunakan oleh satu atau lebih juri. Hapus atau ubah keterlibatan juri terlebih dahulu.'
            );
        }
        $levelIdToRedirect = $scoringCategory->event_level_id;
        $scoringCategory->delete();

        return redirect()->route('committee.events.scoring-categories.index', [
            'public_id' => $public_id,
            'level_id' => $levelIdToRedirect
        ])->with('success', 'Kategori penilaian berhasil dihapus.');
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

   private function getFullyLoadedCategory($eventId, $scoringCategoryId)
    {
        // Mencari kategori penilaian dengan memastikan ia milik event yang dituju melalui eventLevel
        return ScoringCategory::where('scoring_category_id', $scoringCategoryId)
            ->whereHas('eventLevel', function($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->with([
                'masterCategory',
                'eventLevel.level', // Mengambil data level sekaligus
                'assessmentCriteria' => fn($q) => $q->orderBy('order_index', 'asc'),
                'assessmentCriteria.rubricCategories' => fn($q) => $q->orderBy('category_order', 'asc'),
                'assessmentCriteria.rubricCategories.rubricScores' => fn($q) => $q->orderBy('display_order', 'asc'),
            ])->firstOrFail();
    }

    private function validateScoringForm(Request $request, $isUpdate = false)
    {
        $data = $request->all();
        if (!isset($data['criteria']) || !is_array($data['criteria'])) {
            $request->merge(['criteria' => []]);
        }

        $rules = [
            'criteria' => 'present|array',
            'criteria.*.criteria_id' => 'nullable|exists:assessment_criteria,criteria_id',
            'criteria.*.criteria_name' => 'required|string|max:255',
            'criteria.*.order_index' => 'required|integer',

            'criteria.*.rubrics' => 'present|array',
            'criteria.*.rubrics.*.rubric_category_id' => 'nullable|exists:rubric_categories,rubric_category_id',
            'criteria.*.rubrics.*.category_label' => 'required|string|max:255',
            'criteria.*.rubrics.*.category_order' => 'required|integer',

            'criteria.*.rubrics.*.scores' => 'present|array',
            'criteria.*.rubrics.*.scores.*.rubric_score_id' => 'nullable|exists:rubric_scores,rubric_score_id',
            'criteria.*.rubrics.*.scores.*.score_value' => 'required|numeric',
            'criteria.*.rubrics.*.scores.*.display_order' => 'required|integer',
        ];

        if (!$isUpdate) {
            $rules['master_category_id'] = 'required|exists:master_scoring_categories,master_category_id';
            $rules['event_level_ids'] = 'required|array|min:1'; // Array checkbox jenjang
            $rules['event_level_ids.*'] = 'required|exists:event_levels,event_level_id';
        }

        $validated = $request->validate($rules);

        // ... (Validasi mitigasi distinct untuk order_index, category_order, display_order tetap sama seperti sebelumnya) ...
        $criteriaOrders = [];
        foreach ($validated['criteria'] as $cIndex => $criteria) {
            if (in_array($criteria['order_index'], $criteriaOrders)) {
                throw ValidationException::withMessages(["criteria.{$cIndex}.order_index" => 'Urutan kriteria tidak boleh ada yang sama.']);
            }
            $criteriaOrders[] = $criteria['order_index'];

            $rubricOrders = [];
            foreach ($criteria['rubrics'] ?? [] as $rIndex => $rubric) {
                if (in_array($rubric['category_order'], $rubricOrders)) {
                    throw ValidationException::withMessages(["criteria.{$cIndex}.rubrics.{$rIndex}.category_order" => 'Urutan kategori rubrik tidak boleh ada yang sama dalam satu kriteria.']);
                }
                $rubricOrders[] = $rubric['category_order'];

                $scoreOrders = [];
                foreach ($rubric['scores'] ?? [] as $sIndex => $score) {
                    if (in_array($score['display_order'], $scoreOrders)) {
                        throw ValidationException::withMessages(["criteria.{$cIndex}.rubrics.{$rIndex}.scores.{$sIndex}.display_order" => 'Urutan tombol nilai tidak boleh ada yang sama.']);
                    }
                    $scoreOrders[] = $score['display_order'];
                }
            }
        }

        return $validated;
    }

    private function syncCriteria($scoringCategoryId, $criteriaDataArray)
    {
        $criteriaDataArray = $criteriaDataArray ?? [];

        $submittedCriteriaIds = collect($criteriaDataArray)->pluck('criteria_id')->filter()->toArray();
                
        AssessmentCriteria::where('scoring_category_id', $scoringCategoryId)
            ->whereNotIn('criteria_id', $submittedCriteriaIds)
            ->delete();

        foreach ($criteriaDataArray as $criteriaData) {
            $criteria = AssessmentCriteria::updateOrCreate(
                ['criteria_id' => $criteriaData['criteria_id'] ?? null],
                [
                    'scoring_category_id' => $scoringCategoryId,
                    'criteria_name' => $criteriaData['criteria_name'],
                    'order_index' => $criteriaData['order_index'],
                ]
            );

            $rubricsDataArray = $criteriaData['rubrics'] ?? [];
            $submittedRubricCatIds = collect($rubricsDataArray)->pluck('rubric_category_id')->filter()->toArray();
            
            RubricCategory::where('criteria_id', $criteria->criteria_id)
                ->whereNotIn('rubric_category_id', $submittedRubricCatIds)
                ->delete();

            foreach ($rubricsDataArray as $rubricData) {
                $rubricCategory = RubricCategory::updateOrCreate(
                    ['rubric_category_id' => $rubricData['rubric_category_id'] ?? null],
                    [
                        'criteria_id' => $criteria->criteria_id,
                        'category_label' => $rubricData['category_label'],
                        'category_order' => $rubricData['category_order'],
                    ]
                );

                $scoresDataArray = $rubricData['scores'] ?? [];
                $submittedScoreIds = collect($scoresDataArray)->pluck('rubric_score_id')->filter()->toArray();
                
                RubricScore::where('rubric_category_id', $rubricCategory->rubric_category_id)
                    ->whereNotIn('rubric_score_id', $submittedScoreIds)
                    ->delete();

                foreach ($scoresDataArray as $scoreData) {
                    $roundedScore = round((float) $scoreData['score_value'], 2);

                    RubricScore::updateOrCreate(
                        ['rubric_score_id' => $scoreData['rubric_score_id'] ?? null],
                        [
                            'rubric_category_id' => $rubricCategory->rubric_category_id,
                            'score_value' => $roundedScore,
                            'display_order' => $scoreData['display_order'],
                        ]
                    );
                }
            }
        }
    }

    private function checkIfEditable($scoringCategoryId)
    {
        $hasScores = TeamScoreDetail::whereHas('criterion', function($q) use ($scoringCategoryId) {
            $q->where('scoring_category_id', $scoringCategoryId);
        })->exists();

        if ($hasScores) {
            throw ValidationException::withMessages([
                'error' => 'Kategori ini tidak dapat diubah atau dihapus karena juri sudah mulai memasukkan nilai.'
            ]);
        }
    }
}