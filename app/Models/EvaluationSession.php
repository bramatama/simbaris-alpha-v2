<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationSession extends Model
{
    protected $primaryKey = 'session_id';

    protected $fillable = [
        'participation_id',
        'status',
        'start_time',
        'end_time',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    // Relasi ke Participation
    public function participation(): BelongsTo
    {
        return $this->belongsTo(
            Participation::class,
            'participation_id',
            'participation_id'
        );
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(
            EventCommittee::class,
            'recorded_by',
            'event_committee_id'
        );
    }
}