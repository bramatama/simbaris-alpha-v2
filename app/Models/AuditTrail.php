<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditTrail extends Model
{
    protected $primaryKey = 'audit_id';

    protected $fillable = [
        'participation_id',
        'judge_id',
        'criteria_id',
        'rubric_score_id',
        'score_value',
        'ip_address',
        'user_agent',
        'clicked_at'
    ];

    protected function casts(): array
    {
        return [
            'score_value' => 'decimal:2',
            'clicked_at' => 'datetime:Y-m-d H:i:s',
        ];
    }

    protected function clickedAt(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => $value
                ? Carbon::parse($value)->setTimezone(config('app.timezone'))
                : null,
        );
    }

    protected function clickedAtHuman(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                if (empty($attributes['clicked_at'])) {
                    return null;
                }

                return Carbon::parse($attributes['clicked_at'])
                    ->translatedFormat('l, d M Y - H:i:s');
            }
        );
    }

    public function participation(): BelongsTo
    {
        return $this->belongsTo(
            Participation::class,
            'participation_id',
            'participation_id'
        );
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(Judge::class, 'judge_id', 'judge_id');
    }

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(
            AssessmentCriteria::class,
            'criteria_id',
            'criteria_id'
        );
    }

    public function rubricScore(): BelongsTo
    {
        return $this->belongsTo(
            RubricScore::class,
            'rubric_score_id',
            'rubric_score_id'
        );
    }
}