<?php

use App\Http\Controllers\UserController;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // User management routes
    Route::delete('/users/bulk-delete', [UserController::class, 'destroyMany'])->name('users.destroyMany');
    Route::resource('users', UserController::class)->only(['index', 'show', 'update', 'destroy']);
});