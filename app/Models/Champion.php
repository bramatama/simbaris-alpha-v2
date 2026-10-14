<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Champion extends Model
{
    protected $primaryKey = 'champion_id';

    protected $fillable = [
        'champion_category_id',
        'champion_name',
        'rank_position',
    ];

    /**
     * Relasi balik ke champion_categories
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ChampionCategory::class, 'champion_category_id', 'champion_category_id');
    }

    /**
     * Relasi ke tabel event_champions
     */
    public function eventChampions(): HasMany
    {
        return $this->hasMany(EventChampion::class, 'champion_id', 'champion_id');
    }
}
