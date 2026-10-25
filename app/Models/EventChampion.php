<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventChampion extends Model
{
    protected $primaryKey = 'event_champion_id';

    protected $fillable = [
        'event_level_id',
        'champion_id',
        'rank_position',
        'prize_money',
        'certificate',
        'prize_descriptions',
    ];

    // Konversi tipe data otomatis
    protected $casts = [
        'certificate' => 'boolean',
    ];

    /**
     * Relasi ke model EventLevel (Asumsi Anda sudah punya model ini)
     */
    public function eventLevel(): BelongsTo
    {
        return $this->belongsTo(EventLevel::class, 'event_level_id', 'event_level_id');
    }

    /**
     * Relasi balik ke champions
     */
    public function champion(): BelongsTo
    {
        return $this->belongsTo(Champion::class, 'champion_id', 'champion_id');
    }

    /**
     * Relasi ke tabel team_achievements
     */
    public function teamAchievements(): HasMany
    {
        return $this->hasMany(TeamAchievement::class, 'event_champion_id', 'event_champion_id');
    }
}