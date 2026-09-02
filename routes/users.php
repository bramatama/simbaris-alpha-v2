<?php

use App\Http\Controllers\UserController;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // User management routes
    Route::resource('users', UserController::class)->only(['index', 'show', 'update', 'destroy']);
});