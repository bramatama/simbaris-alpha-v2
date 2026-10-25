<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterPenalty extends Model
{
    protected $primaryKey = 'master_penalty_id';

    protected $fillable = [
        'penalty_name',
    ];

    public function eventPenalties(): HasMany
    {
        return $this->hasMany(
            EventPenalty::class,
            'master_penalty_id',
            'master_penalty_id'
        );
    }
}