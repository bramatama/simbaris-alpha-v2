<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'events';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'event_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'public_id',
        'event_name',
        'description',
        'location',
        'poster_path',
        'status',
        'registration_start_time',
        'registration_end_time',
        'start_time',
        'end_time',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'registration_start_time' => 'datetime',
        'registration_end_time' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function participations(): HasMany
    {
        return $this->hasMany(Participation::class, 'event_id');
    }

    public function eventJudges(): HasMany
    {
        return $this->hasMany(EventJudge::class, 'event_id');
    }

    public function eventCommittees(): HasMany
    {
        return $this->hasMany(EventCommittee::class, 'event_id');
    }

    public function eventDocuments(): HasMany
    {
        return $this->hasMany(EventDocument::class, 'event_id');
    }

    public function eventLevels(): HasMany
    {
        return $this->hasMany(EventLevel::class, 'event_id');
    }

    public function scoringCategories(): HasMany
    {
        return $this->hasMany(ScoringCategory::class, 'event_id');
    }
}