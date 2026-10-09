<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventJudge extends Model
{
    use HasFactory;

    protected $table = 'event_judges';

    protected $primaryKey = 'event_judge_id';

    protected $fillable = [
        'event_id',
        'judge_id',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(
            Event::class,
            'event_id',
            'event_id'
        );
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(
            Judge::class,
            'judge_id',
            'judge_id'
        );
    }

    public function judgeExpertises(): HasMany
    {
        return $this->hasMany(
            JudgeExpertise::class,
            'event_judge_id',
            'event_judge_id'
        );
    }
}
