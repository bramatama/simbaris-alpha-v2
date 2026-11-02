<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Participation;
use App\Models\ScoringCategory;
use App\Models\AssessmentCriteria;
use App\Models\EventJudge;
use App\Models\TeamScoreDetail;
use Illuminate\Support\Collection;

class ScoreMatrixService
{
    /**
     * Mengambil daftar kategori yang tersedia untuk jenjang tertentu
     */
    public function getAvailableCategories(int $eventLevelId): Collection
    {
        return ScoringCategory::with('masterCategory:master_category_id,category_name')
            ->where('event_level_id', $eventLevelId)
            ->get();
    }

    /**
     * Menghasilkan data matriks lengkap (pivot kriteria vs juri beserta total)
     */
    public function generateMatrix(Event $event, Participation $participation, ScoringCategory $activeCategory): array
    {
        // 1. Tarik Data Dasar
        $criteriaList = $this->getCriteriaList($activeCategory->scoring_category_id);
        $assignedJudges = $this->getAssignedJudges($event->event_id, $activeCategory->scoring_category_id);
        $details = $this->getScoreDetails($participation->participation_id, $criteriaList->pluck('criteria_id')->toArray());

        // 2. Kalkulasi Pivot
        return $this->buildMatrix($criteriaList, $assignedJudges, $details);
    }

    // =======================================================================
    // PRIVATE HELPER METHODS (Fungsi Pecahan Kecil)
    // =======================================================================

    private function getCriteriaList(int $scoringCategoryId): Collection
    {
        return AssessmentCriteria::where('scoring_category_id', $scoringCategoryId)
            ->with('masterCriteria:master_criteria_id,criteria_name')
            ->orderBy('order_index')
            ->get();
    }

    private function getAssignedJudges(int $eventId, int $scoringCategoryId): Collection
    {
        return EventJudge::where('event_id', $eventId)
            ->whereHas('judgeExpertises', function($q) use ($scoringCategoryId) {
                $q->where('scoring_category_id', $scoringCategoryId);
            })
            ->with('judge.user')
            ->get();
    }

    private function getScoreDetails(int $participationId, array $criteriaIds): Collection
    {
        return TeamScoreDetail::where('participation_id', $participationId)
            ->whereIn('criteria_id', $criteriaIds)
            ->get();
    }

    private function buildMatrix(Collection $criteriaList, Collection $assignedJudges, Collection $details): array
    {
        $scoresMatrix = [];
        $judgeTotals = [];
        $grandTotal = 0;

        // Inisialisasi awal total per juri = 0
        foreach ($assignedJudges as $ej) {
            $judgeTotals[$ej->judge_id] = 0;
        }

        // Looping per baris kriteria
        foreach ($criteriaList as $crit) {
            $criteriaName = $crit->masterCriteria->criteria_name ?? 'Kriteria #'.$crit->criteria_id;
            
            $row = [
                'criteria_id' => $crit->criteria_id,
                'criteria_name' => $criteriaName,
                'scores' => [] 
            ];

            // Looping per kolom juri
            foreach ($assignedJudges as $ej) {
                $scoreRecord = $details->where('criteria_id', $crit->criteria_id)
                                       ->where('judge_id', $ej->judge_id)
                                       ->first();
                
                $val = $scoreRecord ? $scoreRecord->score_value : null;
                $row['scores'][$ej->judge_id] = $val;

                if ($val !== null) {
                    $judgeTotals[$ej->judge_id] += $val;
                    $grandTotal += $val;
                }
            }
            $scoresMatrix[] = $row;
        }

        // Pembuatan Header Juri
        $judgeHeaders = $assignedJudges->map(function($ej, $index) {
            return [
                'judge_id' => $ej->judge_id,
                'label' => 'JURI ' . ($index + 1),
                'name' => $ej->judge->user->name ?? 'Juri'
            ];
        });

        return [
            'judgeHeaders' => $judgeHeaders,
            'scoresMatrix' => $scoresMatrix,
            'judgeTotals'  => $judgeTotals,
            'grandTotal'   => $grandTotal,
        ];
    }
}