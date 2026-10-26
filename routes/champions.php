<?php
use App\Http\Controllers\Champions\EventChampionController;
use App\Http\Controllers\Champions\MasterChampionCategoryController;
use App\Http\Controllers\Champions\MasterChampionController;
use App\Http\Controllers\Champions\EventChampionFormulaController;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Rute untuk mengelola referensi baku Master Kategori Juara
    Route::get('/master-champion-categories', [MasterChampionCategoryController::class, 'index'])
        ->name('master-champion-categories.index');
        
    Route::post('/master-champion-categories', [MasterChampionCategoryController::class, 'store'])
        ->name('master-champion-categories.store');
        
    Route::put('/master-champion-categories/{champion_category_id}', [MasterChampionCategoryController::class, 'update'])
        ->name('master-champion-categories.update');
        
    Route::delete('/master-champion-categories/{champion_category_id}', [MasterChampionCategoryController::class, 'destroy'])
        ->name('master-champion-categories.destroy');
    
    Route::post('/master-champions', [MasterChampionController::class, 'store'])
        ->name('master-champions.store');
        
    Route::delete('/master-champions/{champion_id}', [MasterChampionController::class, 'destroy'])
        ->name('master-champions.destroy');
});

Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function () {
    
    Route::resource('/events/{public_id}/champions',EventChampionController::class)->only(['index', 'create', 'store']);

    Route::get('/events/{public_id}/levels/{event_level_id}/champions/categories/{champion_category_id}/edit', [EventChampionController::class, 'edit'])
        ->name('events.champions.edit');
    Route::put('/events/{public_id}/levels/{event_level_id}/champions/categories/{champion_category_id}', [EventChampionController::class, 'update'])
        ->name('events.champions.update');

    Route::delete('/events/{public_id}/levels/{event_level_id}/champions/categories/{champion_category_id}', [EventChampionController::class, 'destroy'])
        ->name('events.champions.destroy');

    Route::resource('/events/{public_id}/formulas', EventChampionFormulaController::class)->only('index','store');
});