<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamPenalty extends Model
{
    protected $table = 'team_penalties';
    protected $primaryKey = 'team_penalty_id';

    protected $fillable = [
        'participation_id',
        'event_penalty_id',
        'judge_id',
        'penalty_value',
        'calculation_type',
        'penalty_action',
        'occurrence_count',
        'reason',
    ];

    protected $casts = [
        'penalty_value' => 'decimal:2',
        'occurrence_count' => 'integer',
    ];

    public function participation(): BelongsTo
    {
        return $this->belongsTo(
            Participation::class,
            'participation_id',
            'participation_id'
        );
    }
    public function eventPenalty(): BelongsTo
    {
        return $this->belongsTo(
            EventPenalty::class,
            'event_penalty_id',
            'event_penalty_id'
        );
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(Judge::class, 'judge_id', 'judge_id');
    }

    public function getTotalPenaltyAttribute(): float
    {
        $value = (float) $this->penalty_value;

        if ($this->eventPenalty?->calculation_type === 'per_occurrence') {
            return $value * $this->occurrence_count;
        }

        return $value;
    }
}
