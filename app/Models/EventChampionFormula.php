<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventChampionFormula extends Model
{
    protected $primaryKey = 'formula_id';

    protected $fillable = [
        'event_level_id',
        'event_champion_category_id',
        'component_type',
        'scoring_category_id',
        'weight_multiplier',
        'calculation_method'
    ];

    protected function casts(): array
    {
        return [
            'weight_multiplier' => 'decimal:4',
        ];
    }

    public function eventLevel(): BelongsTo
    {
        return $this->belongsTo(
            EventLevel::class,
            'event_level_id',
            'event_level_id'
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

    public function scoringCategory(): BelongsTo
    {
        return $this->belongsTo(
            ScoringCategory::class,
            'scoring_category_id',
            'scoring_category_id'
        );
    }
}