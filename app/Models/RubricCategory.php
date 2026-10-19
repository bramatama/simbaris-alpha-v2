<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RubricCategory extends Model
{
    protected $primaryKey = 'rubric_category_id';

    protected $fillable = [
        'criteria_id',
        'category_label',
        'category_order',
    ];

    protected function casts(): array
    {
        return [
            'category_order' => 'integer',
        ];
    }

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(
            AssessmentCriteria::class,
            'criteria_id',
            'criteria_id'
        );
    }

    public function rubricScores(): HasMany
    {
        return $this->hasMany(
            RubricScore::class,
            'rubric_category_id',
            'rubric_category_id'
        );
    }
}