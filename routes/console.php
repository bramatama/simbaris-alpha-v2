<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $now = now();

    // 1. Update to 'registration_open' if within registration period
    Event::whereNotIn('status', ['draft', 'registration_open'])
        ->where('registration_start_time', '<=', $now)
        ->where('registration_end_time', '>=', $now)
        ->update([
            'status' => 'registration_open',
        ]);

    // 2. Update to 'registration_closed' if beyond registration period
    Event::whereNotIn('status', ['draft', 'registration_closed'])
        ->where('registration_end_time', '<', $now)
        ->update([
            'status' => 'registration_closed'
        ]);

    // 3. Update to 'ongoing' if within event period
    Event::whereNotIn('status', ['draft', 'ongoing'])
        ->where('start_time', '<=', $now)
        ->where('end_time', '>=', $now)
        ->update(['status' => 'ongoing']);

    // 4. Update to 'finished' if beyond event period
    Event::where('end_time', '<', $now)
        ->where('status', '!=', 'finished')
        ->update(['status' => 'finished']);
        
})->everyMinute()->name('update-event-statuses')->withoutOverlapping();
