<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScoreRecap extends Model
{
    protected $primaryKey = 'recap_id';

    protected $fillable = [
        'participation_id',
        'event_champion_category_id',
        'final_score',
        'is_disqualified',
        'raw_score',
        'total_penalty_deduction'
    ];

    protected function casts(): array
    {
        return [
            'final_score' => 'decimal:2',
            'raw_score' => 'decimal:2',
            'total_penalty_deduction' => 'decimal:2'
        ];
    }

    public function participation(): BelongsTo
    {
        return $this->belongsTo(
            Participation::class,
            'participation_id',
            'participation_id'
        );
    }

    public function eventChampionCategory(): BelongsTo
    {
        return $this->belongsTo(
            EventChampionCategory::class,
            'champion_category_id',
            'champion_category_id'
        );
    }
}