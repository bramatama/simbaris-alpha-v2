<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RubricScore extends Model
{
    protected $primaryKey = 'rubric_score_id';

    protected $fillable = [
        'rubric_category_id',
        'score_value',
        'display_order',
    ];

    protected $casts = [
        'score_value' => 'float', // Casting nilai decimal agar tidak menjadi string saat dimanipulasi
    ];

    public function rubricCategory(): BelongsTo
    {
        return $this->belongsTo(RubricCategory::class, 'rubric_category_id', 'rubric_category_id');
    }
}