<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentCriteria extends Model
{
    protected $primaryKey = 'criteria_id';

    protected $fillable = [
        'scoring_category_id',
        'criteria_name',
        'order_index',
    ];

    public function scoringCategory(): BelongsTo
    {
        return $this->belongsTo(ScoringCategory::class, 'scoring_category_id', 'scoring_category_id');
    }

    public function rubricCategories(): HasMany
    {
        return $this->hasMany(RubricCategory::class, 'criteria_id', 'criteria_id');
    }
}