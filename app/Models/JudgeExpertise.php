<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JudgeExpertise extends Model
{
    protected $primaryKey = 'judge_expertise_id';

    protected $fillable = [
        'event_judge_id',
        'scoring_category_id',
    ];

    public function eventJudge(): BelongsTo
    {
        return $this->belongsTo(EventJudge::class, 'event_judge_id', 'event_judge_id');
    }

    public function scoringCategory(): BelongsTo
    {
        return $this->belongsTo(ScoringCategory::class, 'scoring_category_id', 'scoring_category_id');
    }
}