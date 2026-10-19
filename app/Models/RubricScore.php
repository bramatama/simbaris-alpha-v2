<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RubricScore extends Model
{
    protected $primaryKey = 'rubric_score_id';

    protected $fillable = [
        'rubric_category_id',
        'score_value',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'score_value' => 'decimal:2',
            'display_order' => 'integer',
        ];
    }

    public function rubricCategory(): BelongsTo
    {
        return $this->belongsTo(
            RubricCategory::class,
            'rubric_category_id',
            'rubric_category_id'
        );
    }

    public function teamScoreDetails(): HasMany
    {
        return $this->hasMany(
            TeamScoreDetail::class,
            'rubric_score_id',
            'rubric_score_id'
        );
    }

    public function auditTrails(): HasMany
    {
        return $this->hasMany(
            AuditTrail::class,
            'rubric_score_id',
            'rubric_score_id'
        );
    }
}