<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventLevel extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'event_levels';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'event_level_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['event_id', 'level_id', 'registration_fees', 'quota'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class, 'level_id');
    }

    public function participations(): HasMany
    {
        return $this->hasMany(Participation::class, 'event_level_id', 'event_level_id');
    }

    public function eventChampions(): HasMany
    {
        return $this->hasMany(EventChampion::class, 'event_level_id');
    }

    public function eventChampionFormulas(): HasMany
    {
        return $this->hasMany(EventChampionFormula::class, 'event_level_id', 'event_level_id');
    }
}