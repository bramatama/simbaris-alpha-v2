<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScoreRecap extends Model
{
    protected $primaryKey = 'recap_id';

    protected $fillable = [
        'participation_id',
        'champion_category_id',
        'final_score',
    ];

    protected function casts(): array
    {
        return [
            'final_score' => 'decimal:2',
        ];
    }

    public function participation(): BelongsTo
    {
        return $this->belongsTo(
            Participation::class,
            'participation_id',
            'participation_id'
        );
    }

    public function championCategory(): BelongsTo
    {
        return $this->belongsTo(
            ChampionCategory::class,
            'champion_category_id',
            'champion_category_id'
        );
    }
}