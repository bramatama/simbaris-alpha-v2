<?php

use App\Http\Controllers\Scorings\EventScoringCategoryController;

Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function () {
    // Menampilkan daftar kategori
    Route::get('/events/{public_id}/scoring-categories', [EventScoringCategoryController::class, 'index'])->name('events.scoring-categories.index');
    
    // Form tambah kategori baru
    Route::get('/events/{public_id}/scoring-categories/create', [EventScoringCategoryController::class, 'create'])->name('events.scoring-categories.create');
    Route::post('/events/{public_id}/scoring-categories', [EventScoringCategoryController::class, 'store'])->name('events.scoring-categories.store');
    
    // Preview satu kategori
    Route::get('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'show'])->name('events.scoring-categories.show');
    
    // Form edit kategori
    Route::get('/events/{public_id}/scoring-categories/{scoring_category_id}/edit', [EventScoringCategoryController::class, 'edit'])->name('events.scoring-categories.edit');
    Route::put('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'update'])->name('events.scoring-categories.update');
    
    // Hapus kategori
    Route::delete('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'destroy'])->name('events.scoring-categories.destroy');
});

Route::middleware(['auth', 'verified', 'role:official_team'])->prefix('official_team')->name('official_team.')->group(function () {
    // Menampilkan daftar kategori
    Route::get('/events/{public_id}/scoring-categories', [EventScoringCategoryController::class, 'index'])->name('events.scoring-categories.index');
    
    // Preview satu kategori
    Route::get('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'show'])->name('events.scoring-categories.show');
});