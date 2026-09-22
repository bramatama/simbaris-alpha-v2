<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth','verified'])
    ->get('/dashboard', function ()  {
        $role = Auth::user()->role;

        return match ($role){
            'admin' => inertia('dashboards/admin'),
            'judge' => inertia('dashboards/judge'),
            'committee' => inertia('dashboards/committee'),
            'official_team' => inertia('dashboards/official_team'),
            default => abort(403, 'Unauthorized access'),
        };
    })->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/events.php';
require __DIR__.'/users.php';