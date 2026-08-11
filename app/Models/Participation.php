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
        'event_id',
        'official_team_id',
        'level',
        'team_name',
        'status',
        'status_message',
        'payment_proof_path',
        'billed_amount',
        'participation_files',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function officialTeam(): BelongsTo
    {
        return $this->belongsTo(OfficialTeam::class, 'official_team_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class, 'level');
    }

    // public function teamMembers(): HasMany
    // {
    //     return $this->hasMany(TeamMember::class, 'participation_id');
    // }
}