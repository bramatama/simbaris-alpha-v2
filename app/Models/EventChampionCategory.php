<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventChampionCategory extends Model
{
    protected $primaryKey = 'event_champion_category_id';

    protected $fillable = [
        'event_id',
        'champion_category_id',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(
            Event::class,
            'event_id',
            'event_id'
        );
    }

    public function championCategory(): BelongsTo
    {
        return $this->belongsTo(
            ChampionCategory::class,
            'champion_category_id',
            'champion_category_id'
        );
    }

    public function eventPenalties(): BelongsToMany
    {
        return $this->belongsToMany(
            EventPenalty::class,
            'event_penalty_champion_categories',
            'event_champion_category_id',
            'event_penalty_id',
            'event_champion_category_id',
            'event_penalty_id'
        )->withTimestamps();
    }

    public function eventChampionFormulas(): HasMany
    {
        return $this->hasMany(EventChampionFormula::class, 'event_champion_category_id', 'event_champion_category_id');
    }
}
