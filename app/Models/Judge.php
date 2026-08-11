<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Judge extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'judges';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'judge_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function eventJudges(): HasMany
    {
        return $this->hasMany(EventJudge::class, 'judge_id');
    }

    // public function teamScores(): HasMany
    // {
    //     return $this->hasMany(TeamScore::class, 'judge_id');
    // }
}