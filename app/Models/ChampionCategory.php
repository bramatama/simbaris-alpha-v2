<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChampionCategory extends Model
{
    protected $table = 'champion_categories';

    protected $primaryKey = 'champion_category_id';

    protected $fillable = [
        'champion_category_name',
    ];

    
    public function champions(): HasMany
    {
        return $this->hasMany(
            Champion::class,
            'champion_category_id',
            'champion_category_id'
        );
    }

    public function eventChampionCategories(): HasMany
    {
        return $this->hasMany(
            EventChampionCategory::class,
            'champion_category_id',
            'champion_category_id'
        );
    }
}
