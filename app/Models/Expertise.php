<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Expertise extends Model
{
    protected $table = 'expertises';

    protected $primaryKey = 'expertise_id';

    protected $fillable = [
        'expertise_name',
    ];

    public function judgeExpertises(): HasMany
    {
        return $this->hasMany(
            JudgeExpertise::class,
            'expertise_id',
            'expertise_id'
        );
    }
}
