<?php

namespace App\Http\Controllers\Evaluations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Participation;
use App\Models\ScoringCategory;
use App\Models\TeamScore;
use App\Services\ScoreMatrixService;
use App\Concerns\HasEventAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvaluationResultController extends Controller
{
    protected $matrixService;
    use HasEventAccess;

    /** Menyediakan layanan pembentuk matriks hasil penilaian. */
    public function __construct(ScoreMatrixService $matrixService)
    {
        $this->matrixService = $matrixService;
    }

    /** Menampilkan hasil penilaian kepada panitia event. */
    public function showResult(Request $request, Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['administration','auditor'], ['committee']);

        return $this->processAndRender($request, $event, $participation);
    }

    /** Menampilkan hasil penilaian kepada tim peserta. */
    public function showMyResult(Request $request,Event $event, Participation $participation)
    {
        $participation->load('event');

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        return $this->processAndRender($request, $event, $participation);
    }

    /** Membuka kembali kategori penilaian untuk ditinjau auditor. */
    public function requestUnlock(Request $request, Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $validated = $request->validate([
            'scoring_category_id' => 'required|exists:scoring_categories,scoring_category_id'
        ]);

        TeamScore::where('participation_id', $participation->participation_id)
            ->where('scoring_category_id', $validated['scoring_category_id'])
            ->where('evaluation_status', 'locked')
            ->update(['evaluation_status' => 'needs_review']);

        return redirect()->back()->with('success', 'Status penilaian berhasil diubah menjadi Needs Review. Form juri telah terbuka kembali.');
    }

    /** Menyiapkan matriks dan status hasil untuk halaman rekap penilaian. */
    private function processAndRender(Request $request, Event $event, Participation $participation)
    {
        $user = Auth::user();
        $isVisible = in_array($user->role, ['committee', 'admin']) || (bool) $event->is_result_visible;

        if (!$isVisible) {
            return inertia('events/evaluation_results/EvaluationResult', [
                'event' => $event,
                'participation' => $participation,
                'availableCategories' => collect([]), // Kirim kosong agar map tidak error
                'activeCategory' => null,
                'judgeHeaders' => [],
                'scoresMatrix' => [],
                'judgeTotals'  => [],
                'grandTotal'   => 0,
                'judgeStatuses'=> [],
                'isLocked'     => false,
                'isVisible'    => false, // Flag ke React
            ]);
        }

        // EKSEKUSI NORMAL: Jika panitia, atau jika sudah visible
        $availableCategories = $this->matrixService->getAvailableCategories($participation->event_level_id);

        if ($availableCategories->isEmpty()) {
            abort(404, 'Belum ada kategori penilaian untuk jenjang ini.');
        }

        $activeCategoryId = $request->query('category', $availableCategories->first()->scoring_category_id);
        $activeCategory = $availableCategories->firstWhere('scoring_category_id', $activeCategoryId);

        if (!$activeCategory) {
            abort(404, 'Kategori tidak valid.');
        }

        $activeCategory = ScoringCategory::findOrFail($activeCategory->scoring_category_id);
        $matrixData = $this->matrixService->generateMatrix($event, $participation, $activeCategory);

        $teamScores = TeamScore::where('participation_id', $participation->participation_id)
            ->where('scoring_category_id', $activeCategory->scoring_category_id)
            ->get()
            ->keyBy('judge_id');

        $judgeStatuses = $teamScores->map->evaluation_status->toArray();
        $isLocked = $teamScores->contains('evaluation_status', 'locked');

        return inertia('events/evaluation_results/EvaluationResult', [
            'event' => $event,
            'participation' => $participation,
            'availableCategories' => $availableCategories,
            'activeCategory' => $activeCategory,
            'judgeHeaders' => $matrixData['judgeHeaders'],
            'scoresMatrix' => $matrixData['scoresMatrix'],
            'judgeTotals'  => $matrixData['judgeTotals'],
            'grandTotal'   => $matrixData['grandTotal'],
            'judgeStatuses'=> $judgeStatuses,
            'isLocked'     => $isLocked,
            'isVisible'    => true,
        ]);
    }
}