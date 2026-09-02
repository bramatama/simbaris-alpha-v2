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
            'admin' => inertia('admin/dashboard'),
            'judge' => inertia('judge/dashboard'),
            'committee' => inertia('committee/dashboard'),
            'official_team' => inertia('official_team/dashboard'),
            default => abort(403, 'Unauthorized access'),
        };
    })->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/events.php';
require __DIR__.'/users.php';