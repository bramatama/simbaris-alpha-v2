<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamMember extends Model
{
    protected $primaryKey = 'team_member_id';

    protected $fillable = [
        'participation_id',
        'member_name',
        'member_role',
        'member_position',
        'member_photo_path',
    ];

    protected function casts(): array
    {
        return [
            'member_role' => 'string',
        ];
    }

    public function participation(): BelongsTo
    {
        return $this->belongsTo(
            Participation::class,
            'participation_id',
            'participation_id'
        );
    }
}
