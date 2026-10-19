<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamScore extends Model
{
    protected $primaryKey = 'score_id';

    protected $fillable = [
        'participation_id',
        'scoring_category_id',
        'judge_id',
        'total_score',
    ];

    protected function casts(): array
    {
        return [
            'total_score' => 'decimal:2',
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

    public function scoringCategory(): BelongsTo
    {
        return $this->belongsTo(
            ScoringCategory::class,
            'scoring_category_id',
            'scoring_category_id'
        );
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(Judge::class, 'judge_id', 'judge_id');
    }
}