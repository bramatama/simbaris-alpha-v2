<?php

namespace App\Services;

use App\Models\Participation;
use App\Models\EventChampionCategory;
use App\Models\TeamScore;
use App\Models\TeamPenalty;
use App\Models\ScoreRecap;
use Illuminate\Support\Facades\DB;

class ScoreRecapService
{
    /**
     * Hitung ulang seluruh rekap untuk satu tim
     */
    public function calculateForParticipation(Participation $participation)
    {
        // Pastikan Anda sudah mendefinisikan relasi 'formulas' (HasMany) 
        // dan 'eventPenalties' (BelongsToMany) di model EventChampionCategory
        // Cari Kategori Juara yang memiliki formula untuk jenjang tim ini
        $championCategories = EventChampionCategory::whereHas('formulas', function ($query) use ($participation) {
                $query->where('event_level_id', $participation->event_level_id);
            })
            ->with(['formulas' => function ($query) use ($participation) {
                $query->where('event_level_id', $participation->event_level_id);
            }, 'eventPenalties']) 
            ->get();

        foreach ($championCategories as $champCat) {
            $rawScore = 0;
            
            // 1. HITUNG RAW SCORE BERDASARKAN FORMULA BOBOT
            foreach ($champCat->formulas as $formula) {
                $totalScoreSum = TeamScore::where('participation_id', $participation->participation_id)
                    ->where('scoring_category_id', $formula->scoring_category_id)
                    ->sum('total_score');
                
                $rawScore += ($totalScoreSum * $formula->weight_multiplier);
            }

            // 2. HITUNG PENALTI UNTUK KATEGORI JUARA INI
            // Mengambil ID aturan penalti langsung dari collection relasi BelongsToMany
            $penaltyRuleIds = $champCat->eventPenalties->pluck('event_penalty_id');

            // Cari apakah tim ini melakukan pelanggaran pada aturan-aturan tersebut
            $teamPenalties = TeamPenalty::where('participation_id', $participation->participation_id)
                ->whereIn('event_penalty_id', $penaltyRuleIds)
                ->get();

            $totalDeduction = 0;
            $isDisqualified = false;

            foreach ($teamPenalties as $tp) {
                if ($tp->penalty_action === 'disqualification') {
                    $isDisqualified = true;
                } else {
                    $totalDeduction += ($tp->penalty_value * $tp->occurrence_count);
                }
            }

            // 3. KALKULASI FINAL SCORE
            $finalScore = $isDisqualified ? 0 : ($rawScore - $totalDeduction);

            // 4. SIMPAN KE SCORE_RECAPS
            ScoreRecap::updateOrCreate(
                [
                    'participation_id' => $participation->participation_id,
                    'event_champion_category_id' => $champCat->event_champion_category_id
                ],
                [
                    'raw_score' => $rawScore,
                    'total_penalty_deduction' => $totalDeduction,
                    'final_score' => $finalScore,
                    'is_disqualified' => $isDisqualified,
                ]
            );
        }
    }
}