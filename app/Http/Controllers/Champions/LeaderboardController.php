<?php

namespace App\Http\Controllers\Champions;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventChampionCategory;
use App\Models\EventChampion;
use App\Models\ScoringCategory;
use App\Models\ScoreRecap;
use App\Models\Participation;
use App\Models\EventLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Concerns\HasEventAccess;

class LeaderboardController extends Controller
{
    use HasEventAccess;
    /**
     * Menampilkan peringkat event berdasarkan kategori penghargaan atau penilaian.
     */
    public function index(Request $request, Event $event)
    {
        $this->validateEventAccess($event, ['administration','auditor'],['committee','official_team']);
        $user = Auth::user();
        $role = $user->role; 
        $myOfficialTeamId = $role === 'official_team' ? $user->officialTeam?->official_team_id : null;

        $isVisible = in_array($role, ['committee', 'admin']) || (bool) $event->is_leaderboard_visible;

        $eventLevels = EventLevel::where('event_id', $event->event_id)->with('level')->get();
        $eventLevelId = $request->query('level_id', $eventLevels->first()?->event_level_id);
        
        $championCategories = $this->getChampionCategories($event->event_id, $eventLevelId);
        $scoringCategories = $this->getScoringCategories($eventLevelId);

        $filterType = $request->query('filter_type', 'champion');
        $filterId = $request->query('filter_id');
        $sortBy = $request->query('sort_by', 'rank');

        $filterId = $this->validateFilterId($filterType, $filterId, $championCategories, $scoringCategories);

        $activeCategoryData = null;
        $leaderboardData = [];
        $activeEventChampions = [];

        if ($isVisible) {
            if ($filterType === 'champion' && $filterId) {
                $activeCategoryData = $championCategories->firstWhere('event_champion_category_id', $filterId);
                $leaderboardData = $this->buildChampionLeaderboard($event->event_id, $eventLevelId, $filterId, $sortBy);

            if ($activeCategoryData) {
                    $activeEventChampions = EventChampion::where('event_level_id', $eventLevelId)
                        ->whereHas('champion', function ($q) use ($activeCategoryData) {
                            $q->where('champion_category_id', $activeCategoryData->champion_category_id);
                        })
                        ->with('champion')
                        ->get();
                }
            } 
            elseif ($filterType === 'scoring' && $filterId) {
                $activeCategoryData = $scoringCategories->firstWhere('scoring_category_id', $filterId);
                $leaderboardData = $this->buildScoringLeaderboard($event->event_id, $eventLevelId, $filterId, $sortBy);
            }
        }

        // Return Inertia: Sisipkan props `isVisible` untuk diolah Frontend
        return inertia('events/leaderboards/Leaderboard', [
            'event' => $event,
            'role' => $role,
            'myOfficialTeamId' => $myOfficialTeamId,
            'eventLevels' => $eventLevels,
            'championCategories' => $championCategories,
            'scoringCategories' => $scoringCategories,
            'activeCategoryData' => $activeCategoryData,
            'leaderboardData' => $leaderboardData,
            'activeEventChampions' => $activeEventChampions,
            'isVisible' => $isVisible,
            'filters' => [
                'type' => $filterType,
                'id' => $filterId,
                'level' => $eventLevelId,
                'sort' => $sortBy
            ]
        ]);
    }

    /**
     * Menampilkan rekap hasil penilaian dan peringkat tim.
     */
    public function myRecap(Event $event, Participation $participation)
    {
        $this->validateEventAccess($event,[],['official_team'], $participation);
        $user = Auth::user();

        $isVisible = in_array($user->role, ['committee', 'admin']) || (bool) $event->is_recap_visible;

        $myRecapData = [];

        if ($isVisible) {
            $levelId = $participation->event_level_id;
            $myRecapData = ScoreRecap::with([
                'eventChampionCategory.championCategory', 
                'eventChampionCategory.formulas' => function($query) use ($levelId) {
                    $query->where('event_level_id', $levelId)
                          ->with('scoringCategory.masterCategory');
                }, 
                'eventChampionCategory.eventPenalties.masterPenalty', 
                'participation.teamScores', 
                'participation.teamPenalties.eventPenalty.masterPenalty'
            ])
            ->where('participation_id', $participation->participation_id)
            ->get();

            foreach ($myRecapData as $recap) {
                $allCategoryRecaps = ScoreRecap::where('event_champion_category_id', $recap->event_champion_category_id)
                    ->orderByRaw('CASE WHEN rank_override IS NOT NULL THEN rank_override ELSE 9999 END ASC')
                    ->orderBy('final_score', 'DESC')
                    ->pluck('recap_id'); 
                
                $rankIndex = $allCategoryRecaps->search($recap->recap_id);
                $finalRank = $rankIndex !== false ? $rankIndex + 1 : null;
                $recap->setAttribute('calculated_rank', $finalRank ?? '-');
                
                $championTitle = null;
                if ($finalRank && $recap->eventChampionCategory) {
                    $eventChampion = EventChampion::where('event_level_id', $levelId)
                        ->where('rank_position', $finalRank)
                        ->whereHas('champion', function ($q) use ($recap) {
                            $q->where('champion_category_id', $recap->eventChampionCategory->champion_category_id);
                        })
                        ->with('champion')
                        ->first();
                    
                    if ($eventChampion && $eventChampion->champion) {
                        $championTitle = $eventChampion->champion->champion_name;
                    }
                }
                $recap->setAttribute('champion_title', $championTitle);
            }
        }

        return inertia('events/recaps/MyRecap', [
            'event' => $event,
            'participation' => $participation,
            'myRecapData' => $myRecapData,
            'isVisible' => $isVisible
        ]);
    }

    /**
     * Menyimpan penyesuaian peringkat untuk hasil yang seri.
     */
    public function bulkRankOverride(Request $request, Event $event)
    {
        $this->validateEventAccess($event, ['administration','auditor'],['committee']);
        $validated = $request->validate([
            'overrides' => 'required|array',
            'overrides.*.recap_id' => 'required|exists:score_recaps,recap_id',
            'overrides.*.rank_override' => 'nullable|integer|min:1'
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['overrides'] as $override) {
                ScoreRecap::where('recap_id', $override['recap_id'])
                    ->update(['rank_override' => $override['rank_override']]);
            }
        });

        return redirect()->back()->with('success', 'Peringkat tiebreaker berhasil disesuaikan.');
    }

    /** Mengambil kategori penghargaan yang memiliki formula pada jenjang event. */
    private function getChampionCategories($eventId, $eventLevelId) {
        return EventChampionCategory::where('event_id', $eventId)
            ->whereHas('formulas', fn($q) => $q->where('event_level_id', $eventLevelId))
            ->with(['formulas' => fn($q) => $q->where('event_level_id', $eventLevelId)->with('scoringCategory.masterCategory'), 'eventPenalties', 'championCategory'])->get();
    }
    /** Mengambil kategori penilaian pada jenjang event. */
    private function getScoringCategories($eventLevelId) {
        return ScoringCategory::with('masterCategory')->where('event_level_id', $eventLevelId)->get();
    }
    /** Memastikan filter leaderboard merujuk ke kategori yang tersedia. */
    private function validateFilterId($filterType, $filterId, $championCategories, $scoringCategories) {
        if ($filterType === 'champion' && !$championCategories->contains('event_champion_category_id', $filterId)) { return $championCategories->first()?->event_champion_category_id; } 
        if ($filterType === 'scoring' && !$scoringCategories->contains('scoring_category_id', $filterId)) { return $scoringCategories->first()?->scoring_category_id; }
        return $filterId;
    }
    /** Menyusun peringkat tim berdasarkan hasil kategori penghargaan. */
    private function buildChampionLeaderboard($eventId, $eventLevelId, $filterId, $sortBy) {
        $query = Participation::select('participations.*', 'score_recaps.final_score', 'score_recaps.recap_id', 'score_recaps.rank_override')
            ->leftJoin('score_recaps', function($join) use ($filterId) { $join->on('participations.participation_id', '=', 'score_recaps.participation_id')->where('score_recaps.event_champion_category_id', '=', $filterId); })
            ->where('participations.event_id', $eventId)
            ->when($eventLevelId, fn($q) => $q->where('participations.event_level_id', $eventLevelId))
            ->with(['teamScores', 'teamPenalties.eventPenalty.masterPenalty']);

        if ($sortBy === 'rank') {
            $query->orderByRaw('CASE WHEN score_recaps.rank_override IS NOT NULL THEN score_recaps.rank_override ELSE 9999 END ASC')->orderByRaw('COALESCE(score_recaps.final_score, 0) DESC')->orderBy('participations.team_name', 'asc');
        } elseif ($sortBy === 'appearance_order') {
            $query->orderBy('participations.appearance_order', 'asc');
        } else {
            $query->orderBy('participations.team_name', 'asc');
        }
        $paginator = $query->paginate(15)->withQueryString();
        $paginator->getCollection()->transform(fn($part) => [ 'recap_id' => $part->recap_id, 'final_score' => (float) ($part->final_score ?? 0), 'rank_override' => $part->rank_override, 'participation' => $part ]);
        return $paginator;
    }
    /** Menyusun peringkat tim berdasarkan total kategori penilaian. */
    private function buildScoringLeaderboard($eventId, $eventLevelId, $filterId, $sortBy) {
        $query = Participation::where('event_id', $eventId)
            ->when($eventLevelId, fn($q) => $q->where('event_level_id', $eventLevelId))
            ->withSum(['teamScores' => fn($q) => $q->where('scoring_category_id', $filterId)], 'total_score');

        if ($sortBy === 'rank') { $query->orderByRaw('COALESCE(team_scores_sum_total_score, 0) DESC')->orderBy('team_name', 'asc'); } 
        elseif ($sortBy === 'appearance_order') { $query->orderBy('appearance_order', 'asc'); } 
        else { $query->orderBy('team_name', 'asc'); }

        $paginator = $query->paginate(15)->withQueryString();
        $paginator->getCollection()->transform(fn($part) => [ 'score_id' => 'aggr_' . $part->participation_id, 'total_score' => (float) ($part->team_scores_sum_total_score ?? 0), 'participation' => $part ]);
        return $paginator;
    }
}