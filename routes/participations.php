<?php

use App\Http\Controllers\Events\ParticipationController;
use Dom\Document;

Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function () {
    Route::get('/participations/{participation:public_id}/information', [ParticipationController::class, 'show'])->name('participation.information.show');
    Route::get('/participations/{participation:public_id}/edit', [ParticipationController::class, 'edit'])->name('participation.edit');
    Route::patch('/participations/{participation:public_id}/status', [ParticipationController::class, 'updateStatus'])->name('participations.status.update');
});

Route::middleware(['auth', 'verified', 'role:official_team'])->prefix('official_team')->name('official_team.')->group(function () {
    Route::get('/my-participations', [ParticipationController::class, 'myParticipations'])->name('participations.myParticipations');

    Route::get('/participations/{participation:public_id}/information', [ParticipationController::class, 'show'])->name('participations.information.show');
    Route::get('/participations/{participation:public_id}/edit', [ParticipationController::class, 'edit'])->name('participations.edit');
    Route::put('/participations/{participation:public_id}/registration', [ParticipationController::class, 'updateRegistration'])->name('participation.registration.update');
    Route::get('/participations/{participation:public_id}/documents', [ParticipationController::class, 'documentIndex'])->name('participations.documents.index');
    Route::post('/participations/{participation:public_id}/documents', [ParticipationController::class, 'uploadParticipationDocuments'])->name('participations.documents.store');
    Route::delete('/participations/{participation:public_id}/documents/{participation_document:document_id}',[ParticipationController::class, 'destroyDocument'])->name('participations.documents.delete');
});