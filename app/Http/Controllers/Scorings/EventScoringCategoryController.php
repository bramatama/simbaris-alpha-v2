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
use App\Models\EventJudge;
use App\Concerns\HasEventAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class EventScoringCategoryController extends Controller
{   
    use HasEventAccess;

    /** Menampilkan kategori penilaian pada jenjang event. */
    public function index(Request $request, $public_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();
        
        $this->validateEventAccess($event, ['administration'], ['committee']);

        $eventLevels = EventLevel::with('level:level_id,level_name')
            ->where('event_id', $event->event_id)
            ->get();

        $activeLevelId = $request->query('level_id');
        $activeLevel = $activeLevelId 
            ? $eventLevels->where('event_level_id', $activeLevelId)->first() 
            : $eventLevels->first();

        $scoringCategories = $activeLevel?ScoringCategory::where('event_level_id', $activeLevel->event_level_id)
            ->with('masterCategory:master_category_id,category_name')
            ->withCount('assessmentCriteria') 
            ->get():collect();

        return inertia('events/scorings/Index', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'activeLevel' => $activeLevel,
            'scoringCategories' => $scoringCategories,
        ]);
    }

    /** Menampilkan formulir pembuatan kategori penilaian event. */
    public function create($public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);
        
        if ($redirect = $this->checkIfEventEditable($event)) {
            return $redirect;
        }

        $eventLevels = EventLevel::with(['level:level_id,level_name', 'scoringCategories:event_level_id,master_category_id'])
            ->where('event_id', $event->event_id)
            ->get();

        $masterCategories = MasterScoringCategory::with(['masterAssessmentCriteria' => function($q) {
            $q->orderBy('criteria_name', 'asc');
        }])->get();

        return inertia('events/scorings/committee/Create', [
            'event' => $event,
            'eventLevels' => $eventLevels, 
            'masterCategories' => $masterCategories,
        ]);
    }

    /** Membuat kategori penilaian untuk jenjang event yang dipilih. */
    public function store(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

        // Proteksi jika event sedang berjalan
        if ($redirect = $this->checkIfEventEditable($event)) {
            return $redirect;
        }

        $validated = $this->validateScoringForm($request);

        DB::transaction(function () use ($validated, $event) {
            foreach ($validated['event_level_ids'] as $levelId) {
                
                $isValidLevel = EventLevel::where('event_level_id', $levelId)->where('event_id', $event->event_id)->exists();
                if (!$isValidLevel) continue;

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

    /** Menampilkan detail kriteria dan rubrik suatu kategori penilaian. */
    public function show($public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

        $scoringCategory = $this->getFullyLoadedCategory($event->event_id, $scoring_category_id);

        return inertia('events/scorings/Show', [
            'event' => $event,
            'eventLevel' => $scoringCategory->eventLevel,
            'scoringCategory' => $scoringCategory,
        ]);
    }

    /** Menampilkan pratinjau seluruh kategori penilaian pada suatu jenjang. */
    public function previewLevel($public_id, $event_level_id)
    {
        $event = Event::select('event_id', 'public_id', 'event_name', 'status')
            ->where('public_id', $public_id)
            ->firstOrFail();
        
        $this->validateEventAccess($event, [], ['committee', 'official_team'] );

        $eventLevel = EventLevel::with('level:level_id,level_name')
            ->where('event_level_id', $event_level_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $scoringCategories = ScoringCategory::where('event_level_id', $eventLevel->event_level_id)
            ->with([
                'masterCategory',
                'assessmentCriteria' => fn($q) => $q->orderBy('order_index', 'asc'),
                'assessmentCriteria.masterCriteria',
                'assessmentCriteria.rubricCategories' => fn($q) => $q->orderBy('category_order', 'asc'),
                'assessmentCriteria.rubricCategories.rubricScores' => fn($q) => $q->orderBy('display_order', 'asc'),
            ])
            ->get();

        return inertia('events/scorings/PreviewLevel', [
            'event' => $event,
            'eventLevel' => $eventLevel,
            'scoringCategories' => $scoringCategories,
        ]);
    }

    public function judgePreview(Request $request, $public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event,[], ['judge']);

        $user = Auth::user();
        $judgeId = $user->judge?->judge_id;

        $assignedLevelIds = EventLevel::where('event_id', $event->event_id)
            ->whereHas('scoringCategories', function ($query) use ($judgeId, $event) {
                $query->whereHas('judgeExpertises', function ($q2) use ($judgeId, $event) {
                     $q2->whereHas('eventJudge', function ($q3) use ($judgeId, $event) {
                         $q3->where('judge_id', $judgeId)
                            ->where('event_id', $event->event_id);
                     });
                });
            })
            ->pluck('event_level_id')
            ->toArray();

        $assignedLevels = EventLevel::where('event_id', $event->event_id)
            ->whereIn('event_level_id', $assignedLevelIds)
            ->with('level')
            ->get();

        $activeLevelId = $request->query('level_id', $assignedLevels->first()?->event_level_id);

        $activeEventLevel = null;
        $scoringCategories = [];

        if ($activeLevelId && in_array($activeLevelId, $assignedLevelIds)) {
            $activeEventLevel = EventLevel::with('level')->find($activeLevelId);
            
            $scoringCategories = ScoringCategory::with([
                'masterCategory',
                'assessmentCriteria' => function($q) {
                    $q->orderBy('order_index')
                      ->with(['masterCriteria', 'rubricCategories' => function($q2) {
                          $q2->orderBy('category_order') // Sesuai kolom di db: category_order
                             ->with(['rubricScores' => function($q3) {
                                 $q3->orderBy('display_order'); // Sesuai kolom di db: display_order
                             }]);
                      }]);
                }
            ])
            ->where('event_level_id', $activeLevelId)
            // Filter tambahan: hanya tampilkan kategori yang memang ditugaskan ke juri ini
            ->whereHas('judgeExpertises', function ($q) use ($judgeId, $event) {
                 $q->whereHas('eventJudge', function ($q2) use ($judgeId, $event) {
                     $q2->where('judge_id', $judgeId)
                        ->where('event_id', $event->event_id);
                 });
            })
            ->get();
        }

        return inertia('events/scorings/judge/JudgePreview', [
            'event' => $event,
            'assignedLevels' => $assignedLevels,
            'activeEventLevel' => $activeEventLevel,
            'scoringCategories' => $scoringCategories,
        ]);
    }

    /** Menampilkan formulir perubahan kategori penilaian. */
    public function edit($public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);

        $this->checkIfEditable($scoring_category_id);

        $scoringCategory = $this->getFullyLoadedCategory($event->event_id, $scoring_category_id);
        
        $masterCategories = MasterScoringCategory::with(['masterAssessmentCriteria' => function($q) {
            $q->orderBy('criteria_name', 'asc');
        }])->get();

        return inertia('events/scorings/committee/Edit', [
            'event' => $event,
            'eventLevel' => $scoringCategory->eventLevel,
            'scoringCategory' => $scoringCategory,
            'masterCategories' => $masterCategories,
        ]);
    }

    /** Memperbarui kriteria dan rubrik pada kategori penilaian. */
    public function update(Request $request, $public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);
        
        if ($redirect = $this->checkIfEventEditable($event)) {
            return $redirect;
        }

        $scoringCategory = ScoringCategory::where('scoring_category_id', $scoring_category_id)
            ->whereHas('eventLevel', function($query) use ($event) {
                $query->where('event_id', $event->event_id);
            })->firstOrFail();

        $this->checkIfEditable($scoringCategory->scoring_category_id);

        $validated = $this->validateScoringForm($request, true);

        DB::transaction(function () use ($validated, $scoringCategory) {
            $this->syncCriteria($scoringCategory->scoring_category_id, $validated['criteria'] ?? []);
        });

        return redirect()->route('committee.events.scoring-categories.index', [
            'public_id' => $public_id,
            'level_id' => $scoringCategory->event_level_id
        ])->with('success', 'Form kategori penilaian berhasil diperbarui!');
    }

    /** Menghapus kategori penilaian yang belum digunakan juri. */
    public function destroy($public_id, $scoring_category_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();

        $this->validateEventAccess($event, ['administration'], ['committee']);
        
        if ($redirect = $this->checkIfEventEditable($event)) {
            return $redirect;
        }

        $scoringCategory = ScoringCategory::where('scoring_category_id', $scoring_category_id)
            ->whereHas('eventLevel', function($query) use ($event) {
                $query->where('event_id', $event->event_id);
            })->firstOrFail();

        if ($this->hasScoresInputted($scoringCategory->scoring_category_id)) {
            return redirect()->back()->with(
                'error',
                'Kategori penilaian tidak dapat dihapus karena juri sudah mulai memasukkan nilai.'
            );
        }
        
        if ($scoringCategory->judgeExpertises()->exists()) {
            return redirect()->back()->with(
                'error',
                'Kategori penilaian tidak dapat dihapus karena masih digunakan oleh penugasan juri. Hapus penugasan juri terlebih dahulu.'
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

    private function hasScoresInputted($scoringCategoryId)
    {
        return TeamScoreDetail::whereHas('criterion', function($q) use ($scoringCategoryId) {
            $q->where('scoring_category_id', $scoringCategoryId);
        })->exists();
    }

    /**
     * Memastikan konfigurasi penilaian masih dapat diubah.
     */
    private function checkIfEventEditable($event)
    {
        if ($event->status === 'ongoing') {
            return redirect()->route('committee.events.scoring-categories.index', ['public_id' => $event->public_id])
                ->with('error', 'Form penilaian sudah dikunci dan tidak dapat diubah karena event sedang berlangsung.');
        }

        return null;
    }

    /** Mengambil kategori penilaian beserta kriteria dan rubriknya. */
    private function getFullyLoadedCategory($eventId, $scoringCategoryId)
    {
        return ScoringCategory::where('scoring_category_id', $scoringCategoryId)
            ->whereHas('eventLevel', function($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->with([
                'masterCategory',
                'eventLevel.level', 
                'assessmentCriteria' => fn($q) => $q->orderBy('order_index', 'asc'),
                'assessmentCriteria.masterCriteria',
                'assessmentCriteria.rubricCategories' => fn($q) => $q->orderBy('category_order', 'asc'),
                'assessmentCriteria.rubricCategories.rubricScores' => fn($q) => $q->orderBy('display_order', 'asc'),
            ])->firstOrFail();
    }

    /** Memvalidasi data kategori, kriteria, dan rubrik dari formulir. */
    private function validateScoringForm(Request $request, $isUpdate = false)
    {
        $data = $request->all();
        if (!isset($data['criteria']) || !is_array($data['criteria'])) {
            $request->merge(['criteria' => []]);
        }

        $rules = [
            'criteria' => 'present|array',
            'criteria.*.criteria_id' => 'nullable|exists:assessment_criteria,criteria_id',
            'criteria.*.master_criteria_id' => 'required|exists:master_assessment_criteria,master_criteria_id', 
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
            $rules['event_level_ids'] = 'required|array|min:1'; 
            $rules['event_level_ids.*'] = 'required|exists:event_levels,event_level_id';
        }

        $validated = $request->validate($rules);

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

    /** Menyelaraskan kriteria dan rubrik dengan konfigurasi kategori. */
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
                    'master_criteria_id' => $criteriaData['master_criteria_id'],
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

    /** Memastikan kategori belum memiliki nilai yang mulai diinput juri. */
    private function checkIfEditable($scoringCategoryId)
    {
        $hasScores = TeamScoreDetail::whereHas('criterion', function($q) use ($scoringCategoryId) {
            $q->where('scoring_category_id', $scoringCategoryId);
        })->exists();

        if ($hasScores) {
            return back()->with('error', 'Kategori ini tidak dapat diubah atau dihapus karena juri sudah mulai memasukkan nilai.')->send();
            // exit;
        }
    }
}