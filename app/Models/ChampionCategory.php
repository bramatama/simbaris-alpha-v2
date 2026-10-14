<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class ChampionCategory extends Model
{
    // Menggunakan custom primary key
    protected $primaryKey = 'champion_category_id';
    
    // Menonaktifkan timestamps karena tidak ada di tabel
    public $timestamps = false; 

    protected $fillable = [
        'champion_category_name',
    ];

    /**
     * Relasi ke tabel champions
     */
    public function champions(): HasMany
    {
        return $this->hasMany(Champion::class, 'champion_category_id', 'champion_category_id');
    }

    /**
     * Relasi ke tabel formula
     */
    public function eventFormulas(): HasMany
    {
        return $this->hasMany(EventChampionFormula::class, 'champion_category_id', 'champion_category_id');
    }
}
