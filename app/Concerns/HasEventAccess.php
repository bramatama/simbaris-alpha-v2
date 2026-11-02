<?php

namespace App\Concerns;

use App\Models\Event;
use App\Models\EventCommittee;
use App\Models\EventJudge;
use App\Models\Participation;
use Illuminate\Support\Facades\Auth;

trait HasEventAccess
{
    /**
     * Memvalidasi akses event secara fleksibel untuk Panitia, Juri, maupun Official Team.
     *
     * @param Event $event
     * @param array $allowedCommitteePositions Posisi panitia yang diizinkan (opsional)
     * @param Participation|null $participation Data partisipasi/peserta (opsional untuk verifikasi official_team)
     * @return mixed
     */
    public function validateEventAccess(
        Event $event, 
        array $allowedCommitteePositions = [], 
        array $allowedRoles = ['committee', 'official_team', 'judge'],
        ?Participation $participation = null
        )
    {
        $user = Auth::user();

        if (!$user){
            return redirect()->route('login');
        }

        if ($user->role === 'admin') {
            return true;
        }
        
        abort_if(
            !in_array($user->role, $allowedRoles), 
            403, 
            'Akses ditolak: Role Anda tidak diizinkan untuk mengakses fitur ini.'
        );

        if ($user->role === 'official_team') {
            $officialTeamId = $user->officialTeam?->official_team_id;

            abort_if(!$officialTeamId, 403, 'Akses ditolak: Data tim resmi Anda tidak ditemukan.');

            // Jika ada parameter $participation, pastikan partisipasi ini benar-benar milik timnya
            if ($participation) {
                abort_if(
                    $participation->official_team_id !== $officialTeamId || $participation->event_id !== $event->event_id,
                    403,
                    'Akses ditolak: Anda hanya dapat mengakses data milik tim Anda sendiri.'
                );
            }

            return true;
        }

        // 3. Jika Juri (Judge)
        if ($user->role === 'judge') {
            $judgeId = $user->judge?->judge_id;

            abort_if(!$judgeId, 403, 'Akses ditolak: Profil juri Anda tidak ditemukan.');

            // Cek apakah juri ini bertugas di event terkait
            $isAssigned = EventJudge::where('event_id', $event->event_id)
                ->where('judge_id', $judgeId)
                ->exists();

            abort_if(!$isAssigned, 403, 'Akses ditolak: Anda tidak ditugaskan sebagai juri pada event ini.');

            return true;
        }

        // 4. Jika Panitia (Committee)
        if ($user->role === 'committee') {
            $committee = EventCommittee::where('event_id', $event->event_id)
                ->whereHas('committee', function ($q) use ($user) {
                    $q->where('user_id', $user->user_id);
                })
                ->first();

            abort_if(!$committee, 403, 'Akses ditolak: Anda tidak terdaftar sebagai panitia di event ini.');

            // Cek pembatasan posisi panitia (jika ditentukan)
            if (!empty($allowedCommitteePositions)) {
                $userPosition = strtolower($committee->position ?? '');
                $normalizedAllowed = array_map('strtolower', $allowedCommitteePositions);

                abort_if(
                    !in_array($userPosition, $normalizedAllowed),
                    403,
                    'Akses ditolak: Posisi Anda (' . ($committee->position ?? 'Panitia') . ') tidak berwenang untuk fitur ini.'
                );
            }

            return $committee;
        }

        abort(403, 'Akses ditolak: Hak akses Anda tidak dikenali.');
    }
}