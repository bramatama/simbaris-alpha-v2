<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventPaymentMethod extends Model
{
    use HasFactory;

    protected $primaryKey = 'payment_method_id';

    protected $fillable = [
        'event_id',
        'type',
        'bank_name',
        'account_number',
        'account_holder',
        'qris_image_path',
        'is_active',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }
}