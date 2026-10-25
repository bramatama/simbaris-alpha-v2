<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentCriteria extends Model
{
    protected $table = 'assessment_criteria';
    protected $primaryKey = 'criteria_id';

    protected $fillable = [
        'scoring_category_id',
        'master_criteria_id',
        'order_index',
    ];

    protected function casts(): array
    {
        return [
            'order_index' => 'integer',
        ];
    }

    public function scoringCategory(): BelongsTo
    {
        return $this->belongsTo(
            ScoringCategory::class,
            'scoring_category_id',
            'scoring_category_id'
        );
    }

    public function rubricCategories(): HasMany
    {
        return $this->hasMany(
            RubricCategory::class,
            'criteria_id',
            'criteria_id'
        );
    }

    public function masterCriteria(): BelongsTo
    {
        return $this->belongsTo(MasterAssessmentCriteria::class, 'master_criteria_id', 'master_criteria_id');
    }

    public function teamScoreDetails(): HasMany
    {
        return $this->hasMany(
            TeamScoreDetail::class,
            'criteria_id',
            'criteria_id'
        );
    }

    public function auditTrails(): HasMany
    {
        return $this->hasMany(
            AuditTrail::class,
            'criteria_id',
            'criteria_id'
        );
    }
}