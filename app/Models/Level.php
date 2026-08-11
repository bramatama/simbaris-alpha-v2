<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Level extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'levels';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'level_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['level_name'];

    public function eventLevels(): HasMany
    {
        return $this->hasMany(EventLevel::class, 'level_id');
    }
}