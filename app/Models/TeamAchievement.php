<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamAchievement extends Model
{
    protected $primaryKey = 'achievement_id';

    protected $fillable = [
        'participation_id',
        'event_champion_id',
        'certificate_path',
    ];

    /**
     * Relasi ke model Participation (Asumsi Anda sudah punya model ini)
     */
    public function participation(): BelongsTo
    {
        return $this->belongsTo(Participation::class, 'participation_id', 'participation_id');
    }

    /**
     * Relasi balik ke event_champions
     */
    public function eventChampion(): BelongsTo
    {
        return $this->belongsTo(EventChampion::class, 'event_champion_id', 'event_champion_id');
    }
}