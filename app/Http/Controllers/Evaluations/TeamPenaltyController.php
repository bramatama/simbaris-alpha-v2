<?php

namespace App\Http\Controllers\Evaluations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Participation;
use App\Models\EventPenalty;
use App\Models\TeamPenalty;
use App\Services\ScoreRecapService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Concerns\HasEventAccess;

class TeamPenaltyController extends Controller
{
    use HasEventAccess;

    /**
     * Menampilkan aturan penalti dan riwayat penalti tim.
     */
    public function index(Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $availablePenalties = EventPenalty::with('masterPenalty:master_penalty_id,penalty_name')
            ->where('event_id', $event->event_id)
            ->where('is_active', true)
            ->get();

        $teamPenalties = TeamPenalty::with([
                'eventPenalty.masterPenalty:master_penalty_id,penalty_name',
                'committee.user:user_id,name'
            ])
            ->where('participation_id', $participation->participation_id)
            ->latest()
            ->get();

        return inertia('events/evaluations/committee/TeamPenalty', [
            'event' => $event,
            'participation' => $participation,
            'availablePenalties' => $availablePenalties,
            'teamPenalties' => $teamPenalties,
        ]);
    }

    /**
     * Mencatat penalti yang diberikan kepada tim.
     */
    public function store(Request $request, Event $event, Participation $participation, ScoreRecapService $recapService)
    {
        // Validasi Akses & Ambil Data Committee (Auditor)
        $committee = $this->validateEventAccess($event, ['auditor'], ['committee']);

        $messages = [
            'event_penalty_id.required' => 'Jenis pelanggaran wajib dipilih.',
            'event_penalty_id.exists'   => 'Jenis pelanggaran tidak valid atau tidak aktif pada event ini.',
            'event_penalty_id.unique'   => 'Jenis pelanggaran ini telah dijatuhkan. Hapus data sebelumnya untuk mengubah jumlah kejadian.',
            'occurrence_count.required' => 'Jumlah kejadian wajib diisi.',
            'occurrence_count.integer'  => 'Jumlah kejadian harus berupa bilangan bulat.',
            'occurrence_count.min'      => 'Jumlah kejadian minimal 1.',
            'reason.max'                => 'Catatan/alasan maksimal 1000 karakter.',
        ];

        $validated = $request->validate([
            'event_penalty_id' => [
                'required',
                Rule::exists('event_penalties', 'event_penalty_id')->where(function ($query) use ($event) {
                    return $query->where('event_id', $event->event_id)
                                 ->where('is_active', true);
                }),
                Rule::unique('team_penalties', 'event_penalty_id')->where(function ($query) use ($participation) {
                    return $query->where('participation_id', $participation->participation_id);
                }),
            ],
            'occurrence_count' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:1000',
        ], $messages);

        // Ambil aturan penalti saat ini untuk di-snapshot
        $eventPenalty = EventPenalty::where('event_id', $event->event_id)
            ->where('event_penalty_id', $validated['event_penalty_id'])
            ->firstOrFail();

        // Buat record penalti ke tim (Merekam Snapshot)
        TeamPenalty::create([
            'participation_id' => $participation->participation_id,
            'event_penalty_id' => $eventPenalty->event_penalty_id,
            'committee_id'     => is_object($committee) ? $committee->committee_id : null,
            
            // Kolom Snapshot dari event_penalties
            'penalty_value'    => $eventPenalty->penalty_value,
            'calculation_type' => $eventPenalty->calculation_type,
            'penalty_action'   => $eventPenalty->penalty_action,
            
            // Data Inputan Auditor
            'occurrence_count' => $validated['occurrence_count'],
            'reason'           => $validated['reason'],
        ]);

        $recapService->calculateForParticipation($participation);

        return redirect()->back()->with('success', 'Penalti berhasil dijatuhkan ke tim.');
    }

    /**
     * Menghapus catatan penalti dari tim.
     */
    public function destroy(Event $event, Participation $participation, TeamPenalty $teamPenalty, ScoreRecapService $recapService)
    {
        if ($teamPenalty->participation_id !== $participation->participation_id) {
            abort(403, 'Data penalti tidak sesuai dengan tim ini.');
        }

        // Validasi Akses Auditor
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $teamPenalty->delete();
        
        $recapService->calculateForParticipation($participation);

        return redirect()->back()->with('success', 'Penalti berhasil dihapus/dibatalkan.');
    }
}