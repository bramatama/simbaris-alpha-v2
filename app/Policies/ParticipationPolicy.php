<?php

namespace App\Policies;

use App\Models\Participation;
use App\Models\User;

class ParticipationPolicy
{
    public function view(User $user, Participation $participation): bool
    {
        if (in_array($user->role, ['admin', 'committee'])) {
            return true;
        }

        if ($user->role === 'official_team') {
            return $user->officialTeam?->official_team_id === $participation->official_team_id;
        }

        return false;
    }
}
