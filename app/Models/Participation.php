<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Participation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'participations';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'participation_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'public_id',
        'event_id',
        'official_team_id',
        'event_level_id',
        'team_name',
        'team_logo_path',
        'pic_name',
        'pic_phone_number',
        'status',
        'status_message',
        'payment_proof_path',
        'billed_amount',
        'appearance_order',
        'performance_duration_seconds'
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function officialTeam(): BelongsTo
    {
        return $this->belongsTo(OfficialTeam::class, 'official_team_id');
    }

    public function eventLevel(): BelongsTo
    {
        return $this->belongsTo(EventLevel::class, 'event_level_id');
    }

    public function participationDocuments(): HasMany
    {
        return $this->hasMany(ParticipationDocument::class, 'participation_id');
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(TeamMember::class, 'participation_id');
    }
}