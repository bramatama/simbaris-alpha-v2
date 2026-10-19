<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventPenalty extends Model
{
    protected $primaryKey = 'event_penalty_id';

    protected $fillable = [
        'event_id',
        'master_penalty_id',
        'scoring_category_id',
        'penalty_value',
        'calculation_type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'penalty_value' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    public function masterPenalty(): BelongsTo
    {
        return $this->belongsTo(
            MasterPenalty::class,
            'master_penalty_id',
            'master_penalty_id'
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

    public function teamPenalties(): HasMany
    {
        return $this->hasMany(
            TeamPenalty::class,
            'event_penalty_id',
            'event_penalty_id'
        );
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}