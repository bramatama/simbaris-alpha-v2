<?php

use App\Http\Controllers\Scorings\EventPenaltyController;
use App\Http\Controllers\Scorings\EventScoringCategoryController;
use App\Http\Controllers\Scorings\MasterPenaltyController;
use App\Http\Controllers\Scorings\MasterAssessmentCriteriaController;
use App\Http\Controllers\Scorings\MasterScoringCategoryController;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('/master-penalties', MasterPenaltyController::class)->only('index','store','update','destroy')->parameters(['master_penalties' => 'master_penalty_id']);
    
    // Rute Master Kategori Penilaian
    Route::resource('/master-scorings', MasterScoringCategoryController::class)->only('index','store','update','destroy')->parameters(['master_scoring_categories'=>'master_category_id']);

    // Rute Master Kriteria Penilaian (Tanpa Index)
    Route::resource('/master-assessment-criteria', MasterAssessmentCriteriaController::class)->only('store','update','destroy')->parameters(['master_assessment_criteria'=>'master_criteria_id']);
});


Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function () {
    Route::get('/events/{public_id}/scoring-categories', [EventScoringCategoryController::class, 'index'])->name('events.scoring-categories.index');
    
    Route::get('/events/{public_id}/scoring-categories/create', [EventScoringCategoryController::class, 'create'])->name('events.scoring-categories.create');
    Route::post('/events/{public_id}/scoring-categories', [EventScoringCategoryController::class, 'store'])->name('events.scoring-categories.store');
    
    Route::get('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'show'])->name('events.scoring-categories.show');
    Route::get('/events/{public_id}/scoring-categories/levels/{event_level_id}/preview', [EventScoringCategoryController::class, 'previewLevel'])->name('events.scoring-categories.preview-level');
    
    Route::get('/events/{public_id}/scoring-categories/{scoring_category_id}/edit', [EventScoringCategoryController::class, 'edit'])->name('events.scoring-categories.edit');
    Route::put('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'update'])->name('events.scoring-categories.update');
    
    Route::delete('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'destroy'])->name('events.scoring-categories.destroy');

    Route::resource('/events/{public_id}/penalties', EventPenaltyController::class)->only('index','store','update','destroy')->parameters(['penalties' => 'event_penalty_id']);

    Route::patch('/events/{public_id}/penalties/{event_penalty_id}/toggle', [EventPenaltyController::class, 'toggleStatus'])->name('events.penalties.toggle');
});

Route::middleware(['auth', 'verified', 'role:official_team'])->prefix('official_team')->name('official_team.')->group(function () {
    Route::get('/events/{public_id}/scoring-categories', [EventScoringCategoryController::class, 'index'])->name('events.scoring-categories.index');
    
    Route::get('/events/{public_id}/scoring-categories/{scoring_category_id}', [EventScoringCategoryController::class, 'show'])->name('events.scoring-categories.show');
    Route::get('/events/{public_id}/scoring-categories/levels/{event_level_id}/preview', [EventScoringCategoryController::class, 'previewLevel'])->name('events.scoring-categories.preview-level');
});