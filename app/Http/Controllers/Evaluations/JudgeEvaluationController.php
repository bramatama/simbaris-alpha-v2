<?php

namespace App\Http\Controllers\Evaluations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Participation;
use App\Models\Judge;
use App\Models\EventJudge;
use App\Models\EventLevel;
use App\Models\TeamScoreDetail;
use App\Models\AuditTrail;
use App\Models\TeamScore;
use App\Models\ScoringCategory;
use App\Models\AssessmentCriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;


class JudgeEvaluationController extends Controller
{
    /**
     * Menampilkan daftar antrean peserta beserta status penilaiannya.
     */
    public function participants(Request $request, Event $event)
    {
        $user = auth()->user();

        $judge = Judge::where('user_id', $user->user_id)->firstOrFail();

        $eventJudge = EventJudge::where('event_id', $event->event_id)
            ->where('judge_id', $judge->judge_id)
            ->with(['judgeExpertises.scoringCategory.eventLevel'])
            ->firstOrFail();

        $assignedLevelIds = $eventJudge->judgeExpertises
            ->pluck('scoringCategory.event_level_id')
            ->unique()
            ->values()
            ->toArray();

        if (empty($assignedLevelIds)) {
            abort(403, 'Anda belum memiliki penugasan kategori penilaian di acara ini.');
        }

        // PERBAIKAN: Kelompokkan tugas kategori spesifik ke masing-masing Jenjang
        $assignedCategoriesByLevel = [];
        foreach ($eventJudge->judgeExpertises as $expertise) {
            $levelId = $expertise->scoringCategory->event_level_id;
            $assignedCategoriesByLevel[$levelId][] = $expertise->scoring_category_id;
        }

        $eventLevels = EventLevel::with('level:level_id,level_name')
            ->whereIn('event_level_id', $assignedLevelIds)
            ->get();

        $participations = Participation::select(
                'participations.public_id',
                'participations.participation_id', 
                'participations.event_level_id', 
                'participations.team_name', 
                'participations.pic_name', 
                'participations.appearance_order'
            )
            ->where('participations.event_id', $event->event_id)
            ->whereIn('participations.event_level_id', $assignedLevelIds)
            ->where('participations.status', 'approved')
            ->orderByRaw('ISNULL(appearance_order), appearance_order ASC')
            ->get()
            ->map(function ($participation) use ($judge, $assignedCategoriesByLevel) {
                
                // Ambil daftar kategori HANYA untuk jenjang tim yang sedang diloop
                $levelCategoryIds = $assignedCategoriesByLevel[$participation->event_level_id] ?? [];
                $totalAssignedCategories = count($levelCategoryIds);

                $scores = TeamScore::where('participation_id', $participation->participation_id)
                    ->where('judge_id', $judge->judge_id)
                    ->whereIn('scoring_category_id', $levelCategoryIds)
                    ->get();
                
                $statuses = $scores->pluck('evaluation_status')->unique()->toArray();

                $hasUnsubmittedDraft = TeamScoreDetail::where('participation_id', $participation->participation_id)
                    ->where('judge_id', $judge->judge_id)
                    ->exists();

                $lockedCount = $scores->where('evaluation_status', 'locked')->count();

                // Logika Validasi yang sudah presisi per jenjang
                if (in_array('needs_review', $statuses)) {
                    $evalStatus = 'needs_review';
                } elseif ($totalAssignedCategories > 0 && $lockedCount === $totalAssignedCategories) {
                    $evalStatus = 'locked';
                } elseif (in_array('draft', $statuses) || in_array('locked', $statuses) || $hasUnsubmittedDraft) {
                    $evalStatus = 'draft';
                } else {
                    $evalStatus = 'ready';
                }
                
                $pData = $participation->toArray();
                $pData['evaluation_status'] = $evalStatus;

                return $pData;
            })
            ->groupBy('event_level_id');

        return inertia('events/evaluations/judge/ParticipantList', [
            'event' => $event,
            'eventLevels' => $eventLevels,
            'participations' => $participations,
        ]);
    }

    /**
     * HALAMAN 1: Pratinjau (Team Preview Induk)
     */
    public function show(Event $event, Participation $participation)
    {
        $data = $this->getEvaluationData($event, $participation);
        return inertia('events/evaluations/judge/TeamPreview', $data);
    }

    /**
     * HALAMAN 2: Form Penilaian (Spesifik 1 Kategori)
     */
    public function evaluate(Event $event, Participation $participation, ScoringCategory $scoringCategory)
    {
        $data = $this->getEvaluationData($event, $participation);

        // Pastikan kategori yang diakses wewenang juri
        $categoryExists = $data['scoringCategories']->where('scoring_category_id', $scoringCategory->scoring_category_id)->first();
        
        if (!$categoryExists) {
            abort(403, 'Kategori ini bukan wewenang Anda.');
        }

        // Jika sudah dilock atau butuh review, cegah masuk ke mode edit
        if (in_array($categoryExists->category_status, ['locked', 'needs_review'])) {
            return redirect()->route('events.participants.show', [
                'event' => $event->public_id,
                'participation' => $participation->public_id
            ])->with('error', 'Kategori ini telah dikunci dan tidak dapat diubah.');
        }

        // Fokuskan data ke 1 kategori saja untuk props frontend
        $data['activeCategory'] = $categoryExists;
        unset($data['scoringCategories']); 

        return inertia('events/evaluations/judge/ScoringForm', $data);
    }

    /**
     * API: Autosave senyap di latar belakang
     */
    public function autosave(Request $request, Event $event, Participation $participation)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:scoring_categories,scoring_category_id',
            'scores' => 'present|array',
            'scores.*.criteria_id' => 'required|exists:assessment_criteria,criteria_id',
            'scores.*.rubric_score_id' => 'required|exists:rubric_scores,rubric_score_id',
            'scores.*.score_value' => 'required|numeric',
            'scores.*.clicked_at' => 'required|date',
        ]);

        $judgeId = auth()->user()->judge->judge_id;

        DB::transaction(function () use ($validated, $participation, $judgeId, $request) {
            
            $incomingCriteriaIds = collect($validated['scores'])->pluck('criteria_id')->toArray();

            $categoryCriteriaIds = \App\Models\AssessmentCriteria::where('scoring_category_id', $validated['category_id'])
                ->pluck('criteria_id')
                ->toArray();

            TeamScoreDetail::where('participation_id', $participation->participation_id)
                ->where('judge_id', $judgeId)
                ->whereIn('criteria_id', $categoryCriteriaIds) 
                ->whereNotIn('criteria_id', $incomingCriteriaIds)
                ->delete();

            foreach ($validated['scores'] as $score) {
                TeamScoreDetail::updateOrCreate(
                    [
                        'participation_id' => $participation->participation_id,
                        'judge_id' => $judgeId,
                        'criteria_id' => $score['criteria_id'],
                    ],
                    [
                        'rubric_score_id' => $score['rubric_score_id'],
                        'score_value' => $score['score_value'],
                    ]
                );

                AuditTrail::create([
                    'participation_id' => $participation->participation_id,
                    'judge_id' => $judgeId,
                    'criteria_id' => $score['criteria_id'],
                    'rubric_score_id' => $score['rubric_score_id'],
                    'score_value' => $score['score_value'],
                    'clicked_at' => Carbon::parse($score['clicked_at'])->setTimezone('Asia/Makassar'), // Sesuaikan dengan zona waktu lokal
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
        });

        return response()->json(['status' => 'success']);
    }

    /**
     * Submit nilai dari 1 Kategori dan pindah ke Kategori 'Ready' selanjutnya
     */
    public function submitCategory(Request $request, Event $event, Participation $participation, ScoringCategory $scoringCategory)
    {
        $validated = $request->validate([
            'scores' => 'present|array',
            'scores.*.criteria_id' => 'required|exists:assessment_criteria,criteria_id',
            'scores.*.rubric_score_id' => 'required|exists:rubric_scores,rubric_score_id',
            'scores.*.score_value' => 'required|numeric',
        ]);

        $judgeId = auth()->user()->judge->judge_id;

        DB::transaction(function () use ($validated, $participation, $scoringCategory, $judgeId, $request) {
            
            // 1. Ambil semua kriteria dasar yang ada di kategori ini
            $categoryCriteriaIds = AssessmentCriteria::where('scoring_category_id', $scoringCategory->scoring_category_id)
                ->pluck('criteria_id')
                ->toArray();

            $incomingCriteriaIds = collect($validated['scores'])->pluck('criteria_id')->toArray();

            TeamScoreDetail::where('participation_id', $participation->participation_id)
                ->where('judge_id', $judgeId)
                ->whereIn('criteria_id', $categoryCriteriaIds)
                ->whereNotIn('criteria_id', $incomingCriteriaIds)
                ->delete();

            $totalScore = 0;
            foreach ($validated['scores'] as $score) {
                TeamScoreDetail::updateOrCreate(
                    ['participation_id' => $participation->participation_id, 'judge_id' => $judgeId, 'criteria_id' => $score['criteria_id']],
                    ['rubric_score_id' => $score['rubric_score_id'], 'score_value' => $score['score_value']]
                );
                $totalScore += $score['score_value'];
            }

            // Simpan total kalkulasi ke team_scores dengan status 'draft'
            TeamScore::updateOrCreate(
                ['participation_id' => $participation->participation_id, 'scoring_category_id' => $scoringCategory->scoring_category_id, 'judge_id' => $judgeId],
                ['total_score' => $totalScore, 'evaluation_status' => 'draft']
            );
        });

        $allData = $this->getEvaluationData($event, $participation);
        $nextReadyCategory = null;

        foreach ($allData['scoringCategories'] as $cat) {
            if ($cat->category_status === 'ready') {
                $nextReadyCategory = $cat;
                break; 
            }
        }

        if ($nextReadyCategory) {
            return redirect()->route('judge.events.participants.evaluate', [
                'event' => $event->public_id,
                'participation' => $participation->public_id,
                'scoringCategory' => $nextReadyCategory->scoring_category_id
            ])->with('success', 'Kategori disimpan! Melanjutkan ke kategori berikutnya.');
        }

        return redirect()->route('judge.events.participants.show', [
            'event' => $event->public_id,
            'participation' => $participation->public_id
        ])->with('success', 'Semua kategori telah dinilai! Silakan Kunci Penilaian.');
    }

    public function lockCategory(Request $request, Event $event, Participation $participation, ScoringCategory $scoringCategory)
    {
        $judgeId = auth()->user()->judge->judge_id;

        $totalScore = TeamScoreDetail::where('participation_id', $participation->participation_id)
            ->where('judge_id', $judgeId)
            ->whereIn('criteria_id', function ($query) use ($scoringCategory) {
                $query->select('criteria_id')
                    ->from('assessment_criteria')
                    ->where('scoring_category_id', $scoringCategory->scoring_category_id);
            })
            ->sum('score_value');

        TeamScore::updateOrCreate(
            [
                'participation_id' => $participation->participation_id,
                'scoring_category_id' => $scoringCategory->scoring_category_id,
                'judge_id' => $judgeId,
            ],
            [
                'total_score' => $totalScore,
                'evaluation_status' => 'locked'
            ]
        );

        return redirect()->back()->with('success', 'Kategori dikunci! Kriteria kosong otomatis bernilai 0.');
    }

    // =========================================================================
    // PRIVATE HELPER METHOD
    // =========================================================================

    /**
     * Menarik seluruh data relasi (Tim, Kriteria, Rubrik, dan Nilai) 
     * sekaligus menghitung 4 status secara presisi.
     */
    private function getEvaluationData(Event $event, Participation $participation)
    {
        $user = auth()->user();
        $judge = Judge::where('user_id', $user->user_id)->firstOrFail();

        $eventJudge = EventJudge::where('event_id', $event->event_id)->where('judge_id', $judge->judge_id)->firstOrFail();

        if ($participation->event_id !== $event->event_id) abort(404);
        
        $participation->load('eventLevel.level');

        $assignedCategoryIds = DB::table('judge_expertises')
            ->join('scoring_categories', 'judge_expertises.scoring_category_id', '=', 'scoring_categories.scoring_category_id')
            ->where('judge_expertises.event_judge_id', $eventJudge->event_judge_id)
            ->where('scoring_categories.event_level_id', $participation->event_level_id)
            ->pluck('scoring_categories.scoring_category_id');

        if ($assignedCategoryIds->isEmpty()) abort(403, 'Anda tidak memiliki wewenang penilaian untuk jenjang peserta ini.');

        $scoringCategories = ScoringCategory::with([
            'masterCategory:master_category_id,category_name',
            'assessmentCriteria' => fn($q) => $q->orderBy('order_index'),
            'assessmentCriteria.masterCriteria:master_criteria_id,criteria_name',
            'assessmentCriteria.rubricCategories' => fn($q) => $q->orderBy('category_order'),
            'assessmentCriteria.rubricCategories.rubricScores' => fn($q) => $q->orderBy('display_order')
        ])->whereIn('scoring_category_id', $assignedCategoryIds)->get();

        $existingScoreDetails = TeamScoreDetail::where('participation_id', $participation->participation_id)
            ->where('judge_id', $judge->judge_id)
            ->get();

        // -------------------------------------------------------------
        // LOGIKA STATUS PER KATEGORI & KESELURUHAN TIM
        // -------------------------------------------------------------
        $isAnyNeedsReview = false;
        $allLocked = true; 
        $isAnyDrafting = false; 

        foreach ($scoringCategories as $category) {
            $catId = $category->scoring_category_id;
            
            $scoreHeader = TeamScore::where('participation_id', $participation->participation_id)
                ->where('judge_id', $judge->judge_id)
                ->where('scoring_category_id', $catId)
                ->first();

            $hasDetails = $existingScoreDetails->whereIn('criteria_id', $category->assessmentCriteria->pluck('criteria_id'))->isNotEmpty();

            if ($scoreHeader) {
                $category->category_status = $scoreHeader->evaluation_status; 
                
                if ($scoreHeader->evaluation_status === 'needs_review') $isAnyNeedsReview = true;
                if ($scoreHeader->evaluation_status !== 'locked') $allLocked = false;
                if ($scoreHeader->evaluation_status === 'draft') $isAnyDrafting = true;
            } else {
                $category->category_status = $hasDetails ? 'draft' : 'ready';
                $allLocked = false;
                if ($hasDetails) $isAnyDrafting = true;
            }
        }

        // Status keseluruhan tim (Disuntikkan ke object participation)
        if ($isAnyNeedsReview) {
            $participation->evaluation_status = 'needs_review';
        } elseif ($allLocked && $scoringCategories->isNotEmpty()) {
            $participation->evaluation_status = 'locked';
        } elseif ($isAnyDrafting) {
            $participation->evaluation_status = 'draft';
        } else {
            $participation->evaluation_status = 'ready';
        }

        return [
            'event' => $event,
            'participation' => $participation,
            'scoringCategories' => $scoringCategories,
            'existingScores' => $existingScoreDetails,
        ];
    }
}