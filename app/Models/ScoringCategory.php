<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScoringCategory extends Model
{
    protected $primaryKey = 'scoring_category_id';

    protected $fillable = [
        'event_level_id',
        'master_category_id',
    ];

    public function eventLevel(): BelongsTo
    {
        return $this->belongsTo(EventLevel::class, 'event_level_id', 'event_level_id');
    }

    public function masterCategory(): BelongsTo
    {
        return $this->belongsTo(
            MasterScoringCategory::class,
            'master_category_id',
            'master_category_id'
        );
    }

    public function eventPenalties(): HasMany
    {
        return $this->hasMany(
            EventPenalty::class,
            'scoring_category_id',
            'scoring_category_id'
        );
    }

    public function formulas(): HasMany
    {
        return $this->hasMany(
            EventChampionFormula::class,
            'scoring_category_id',
            'scoring_category_id'
        );
    }

    public function judgeExpertises(): HasMany
    {
        return $this->hasMany(JudgeExpertise::class, 'scoring_category_id', 'scoring_category_id');
    }

    public function assessmentCriteria(): HasMany
    {
        return $this->hasMany(AssessmentCriteria::class, 'scoring_category_id', 'scoring_category_id');
    }

    public function teamScores(): HasMany
    {
        return $this->hasMany(TeamScore::class, 'scoring_category_id', 'scoring_category_id');
    }
}