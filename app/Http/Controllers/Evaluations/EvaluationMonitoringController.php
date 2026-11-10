<?php

namespace App\Http\Controllers\Evaluations;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Participation;
use App\Models\EvaluationSession;
use App\Models\AuditTrail;
use App\Concerns\HasEventAccess;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EvaluationMonitoringController extends Controller
{
    use HasEventAccess;

    /**
     * Menampilkan pemantauan sesi penampilan peserta.
     */
    public function show(Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $session = EvaluationSession::firstOrCreate(
            ['participation_id' => $participation->participation_id],
            ['status' => 'waiting']
        );

        $participation->load('eventLevel.level');

        return inertia('events/monitorings/committee/Show', [
            'event' => $event,
            'participation' => $participation,
            'session' => $session
        ]);
    }

    /**
     * Menampilkan riwayat audit penilaian dan waktu penampilan.
     */
    public function showAuditTrail($public_id, $participation_public_id)
    {
        $event = Event::where('public_id', $public_id)->firstOrFail();
        $participation = Participation::where('public_id', $participation_public_id)
            ->where('event_id', $event->event_id)
            ->firstOrFail();

        $this->validateEventAccess($event, [], ['official_team'], $participation);

        $participation->load('eventLevel.level');

        $session = EvaluationSession::where('participation_id', $participation->participation_id)->first();

        $auditTrails = AuditTrail::with([
            'judge.user:user_id,name',
            'criterion.masterCriteria:master_criteria_id,criteria_name',
            'rubricScore'
        ])
        ->where('participation_id', $participation->participation_id)
        ->orderBy('clicked_at', 'desc')
        ->get();

        return inertia('events/participations/audit_trails/Index', [
            'event' => $event,
            'participation' => $participation,
            'session' => $session,
            'auditTrails' => $auditTrails,
        ]);
    }

    /**
     * Memulai sesi penampilan peserta.
     */
    public function start(Request $request, Event $event, Participation $participation)
    {
        $committee = $this->validateEventAccess($event, ['auditor'], ['committee']);

        $session = EvaluationSession::firstOrCreate(['participation_id' => $participation->participation_id]);

        if ($session->status !== 'waiting') {
            return redirect()->back()->with('error', 'Sesi sudah dimulai.');
        }

        $session->update([
            'status' => 'ongoing',
            'start_time' => now(),
            'end_time' => null,
            'recorded_by' => is_object($committee) ? $committee->event_committee_id : null,
        ]);

        return redirect()->back();
    }

    /**
     * Menjeda pencatatan waktu sesi penampilan.
     */
    public function pause(Request $request, Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $session = EvaluationSession::where('participation_id', $participation->participation_id)->firstOrFail();

        if ($session->status === 'ongoing' && is_null($session->end_time)) {
            $session->update(['end_time' => now()]);
        }

        return redirect()->back();
    }

    /**
     * Melanjutkan pencatatan waktu sesi penampilan.
     */
    public function resume(Request $request, Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $session = EvaluationSession::where('participation_id', $participation->participation_id)->firstOrFail();

        if ($session->status === 'ongoing' && !is_null($session->end_time)) {
            $diffInSeconds = $session->end_time->diffInSeconds(now());
            
            $session->update([
                'start_time' => Carbon::parse($session->start_time)->addSeconds($diffInSeconds),
                'end_time' => null
            ]);
        }

        return redirect()->back();
    }

    /**
     * Mengakhiri sesi penampilan peserta secara langsung saat tombol diklik.
     */
    public function finish(Request $request, Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $session = EvaluationSession::where('participation_id', $participation->participation_id)->firstOrFail();

        if ($session->status !== 'ongoing') {
            return redirect()->back()->with('error', 'Sesi belum dimulai atau sudah diakhiri.');
        }

        $endTime = $session->end_time ?? now();


        $session->update([
            'status' => 'finished',
            'end_time' => $endTime,
        ]);

        return redirect()->back()->with('success', 'Sesi penampilan berhasil diakhiri.');
    }

    /**
     * Memperbarui status atau waktu sesi secara manual.
     */
    public function manualUpdate(
    Request $request,
    Event $event,
    Participation $participation
) {
    $this->validateEventAccess(
        $event,
        ['auditor'],
        ['committee']
    );

    $session = EvaluationSession::where(
        'participation_id',
        $participation->participation_id
    )->firstOrFail();

    $validated = $request->validate([
        'status' => 'required|in:waiting,ongoing,finished',
        'start_time' => 'nullable|date',
        'end_time' => 'nullable|date',
    ]);

    $timezone = 'Asia/Makassar';

    $session->update([
        'status' => $validated['status'],

        'start_time' => !empty($validated['start_time'])
            ? Carbon::parse($validated['start_time'], $timezone)
            : null,

        'end_time' => !empty($validated['end_time'])
            ? Carbon::parse($validated['end_time'], $timezone)
            : null,
    ]);

    return redirect()->back()->with(
        'success',
        'Data sesi berhasil diperbarui secara manual.'
    );
}

    /**
     * Mengambil riwayat audit penilaian dalam format JSON.
     */
    public function getAuditTrails(Event $event, Participation $participation)
    {
        $this->validateEventAccess($event, ['auditor'], ['committee']);

        $auditTrails = AuditTrail::with([
            'judge.user:user_id,name',
            'criterion.masterCriteria:master_criteria_id,criteria_name',
            'rubricScore'
        ])
        ->where('participation_id', $participation->participation_id)
        ->orderBy('clicked_at', 'desc')
        ->get();

        return response()->json(['data' => $auditTrails]);
    }
}