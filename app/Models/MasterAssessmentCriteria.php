<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterAssessmentCriteria extends Model
{
    protected $table = 'master_assessment_criteria';
    protected $primaryKey = 'master_criteria_id';
    
    protected $guarded = ['master_criteria_id'];

    /**
     * Master Kriteria ini berinduk pada Master Kategori Penilaian tertentu.
     */
    public function masterScoringCategory(): BelongsTo
    {
        return $this->belongsTo(MasterScoringCategory::class, 'master_category_id', 'master_category_id');
    }

    /**
     * Kriteria ini mungkin digunakan di banyak form penilaian event.
     */
    public function assessmentCriteria(): HasMany
    {
        return $this->hasMany(AssessmentCriteria::class, 'master_criteria_id', 'master_criteria_id');
    }
}