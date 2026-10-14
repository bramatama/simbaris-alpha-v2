<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamScoreDetail extends Model
{
    protected $primaryKey = 'score_detail_id';

    protected $fillable = [
        'participation_id',
        'judge_id',
        'criteria_id',
        'rubric_score_id',
        'score_value',
    ];

    protected $casts = [
        'score_value' => 'float',
    ];

    public function participation(): BelongsTo
    {
        return $this->belongsTo(Participation::class, 'participation_id', 'participation_id');
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(Judge::class, 'judge_id', 'judge_id');
    }

    public function criteria(): BelongsTo
    {
        return $this->belongsTo(AssessmentCriteria::class, 'criteria_id', 'criteria_id');
    }

    public function rubricScore(): BelongsTo
    {
        return $this->belongsTo(RubricScore::class, 'rubric_score_id', 'rubric_score_id');
    }
}