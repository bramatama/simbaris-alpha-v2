<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterScoringCategory extends Model
{
    protected $primaryKey = 'master_category_id';

    protected $fillable = [
        'category_name',
    ];

    /**
     * Relasi ke tabel scoring_categories (yang sudah masuk ke event)
     */
    public function ScoringCategories(): HasMany
    {
        return $this->hasMany(ScoringCategory::class, 'master_category_id', 'master_category_id');
    }

    public function masterAssessmentCriteria(): HasMany
    {
        return $this->hasMany(MasterAssessmentCriteria::class, 'master_category_id', 'master_category_id');
    }
}