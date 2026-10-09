<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JudgeExpertise extends Model
{
    protected $table = 'judge_expertises';

    protected $primaryKey = 'judge_expertise_id';

    protected $fillable = [
        'event_judge_id',
        'expertise_id',
    ];

    public function eventJudge(): BelongsTo
    {
        return $this->belongsTo(
            EventJudge::class,
            'event_judge_id',
            'event_judge_id'
        );
    }

    public function expertise(): BelongsTo
    {
        return $this->belongsTo(
            Expertise::class,
            'expertise_id',
            'expertise_id'
        );
    }
}
