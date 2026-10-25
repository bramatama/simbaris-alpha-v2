<?php

namespace App\Policies;

use App\Models\Participation;
use App\Models\User;

class ParticipationPolicy
{
    public function view(User $user, Participation $participation):bool{
        if (in_array($user->role, ['committee', 'admin'])) {
            return true;
        }

        return $user->user_id === $participation->officialTeam->user->user_id;
    }
}
