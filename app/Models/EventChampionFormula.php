<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventChampionFormula extends Model
{
    // Menggunakan custom primary key sesuai migration
    protected $primaryKey = 'formula_id';

    protected $fillable = [
        'event_id',
        'champion_category_id',
        'scoring_category_id',
        'weight_multiplier',
    ];

    // Cast weight_multiplier menjadi float untuk keperluan perhitungan nilai (agar tidak menjadi string)
    protected $casts = [
        'weight_multiplier' => 'float',
    ];

    /**
     * Relasi ke master Event
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }

    /**
     * Relasi ke master Kategori Juara (Misal: Juara Utama)
     */
    public function championCategory(): BelongsTo
    {
        return $this->belongsTo(ChampionCategory::class, 'champion_category_id', 'champion_category_id');
    }

    /**
     * Relasi ke Kategori Penilaian yang akan dijumlahkan (Misal: PBB, Danton, Vafor)
     */
    public function scoringCategory(): BelongsTo
    {
        return $this->belongsTo(ScoringCategory::class, 'scoring_category_id', 'scoring_category_id');
    }
}