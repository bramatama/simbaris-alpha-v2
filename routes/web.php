<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Files\TempFileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth','verified'])->group(function(){
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/upload-temp-file', [TempFileController::class, 'storeTemp'])->name('uploadTempFile');
});

Route::get('/test-error/403', function(){abort(403);});
Route::get('/test-error/404', function(){abort(404);});
Route::get('/test-error/500', function(){abort(500);});


require __DIR__.'/users.php';
require __DIR__.'/settings.php';
require __DIR__.'/events.php';
require __DIR__.'/participations.php';
require __DIR__.'/scorings.php';
require __DIR__.'/champions.php';
require __DIR__.'/evaluations.php';