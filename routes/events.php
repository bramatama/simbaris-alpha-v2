<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\EventCommitteeController;
use App\Http\Controllers\EventJudgeController;
use App\Http\Controllers\ParticipationController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/my-events', [EventController::class, 'my_events'])->name('events.my_events');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // User management routes
    Route::resource('events', EventController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
    
    Route::get('events/{event:public_id}/information', [EventController::class, 'show'])->name('events.show');

    Route::delete('events/{event:public_id}/committees/{event_committee:event_committee_id}', [EventCommitteeController::class, 'destroy'])->name('events.committees.destroy');
    Route::resource('events/{event:public_id}/committees', EventCommitteeController::class)->only(['index', 'store']);

    Route::delete('events/{event:public_id}/judges/{event_judge:event_judge_id}', [EventJudgeController::class, 'destroy'])->name('events.judges.destroy');
    Route::resource('events/{event:public_id}/judges', EventJudgeController::class)->only(['index', 'store']);
});


Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function () {
    Route::resource('events', EventController::class)->only(['edit', 'update']);

    Route::get('events/{event:public_id}/information', [EventController::class, 'show'])->name('events.show');

    Route::delete('events/{event:public_id}/committees/{event_committee:event_committee_id}', [EventCommitteeController::class, 'destroy'])->name('events.committees.destroy');
    Route::resource('events/{event:public_id}/committees', EventCommitteeController::class)->only(['index', 'store']);

    Route::delete('events/{event:public_id}/judges/{event_judge:event_judge_id}', [EventJudgeController::class, 'destroy'])->name('events.judges.destroy');
    Route::resource('events/{event:public_id}/judges', EventJudgeController::class)->only(['index', 'store']);
});

Route::middleware(['auth', 'verified', 'role:official_team'])->prefix('official_team')->name('official_team.')->group(function () {
    Route::get('events/{event:public_id}/enroll', [ParticipationController::class, 'create'])->name('events.official_team.create');
});