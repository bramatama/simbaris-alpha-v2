<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventPenalty extends Model
{
    protected $primaryKey = 'event_penalty_id';

    protected $fillable = [
        'event_id',
        'master_penalty_id',
        'description',
        'penalty_value',
        'calculation_type',
        'calculation_action',
        'penalty_action',
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

    public function championCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            EventChampionCategory::class,
            'event_penalty_champion_categories',
            'event_penalty_id',
            'event_champion_category_id'
        );
    }

    public function eventChampionCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            EventChampionCategory::class,
            'event_penalty_champion_categories',
            'event_penalty_id',
            'event_champion_category_id',
            'event_penalty_id',
            'event_champion_category_id'
        )->withTimestamps();
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