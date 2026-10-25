<?php

use App\Http\Controllers\Files\ViewDocumentController;
use App\Http\Controllers\Participations\ParticipationController;
use App\Http\Controllers\Participations\TeamMemberController;

Route::middleware(['auth', 'verified'])->group(function (){
    Route::get('/participations/{participation}/payment-proof',[ViewDocumentController::class,'showPaymentProof'])->name('participation-payment-proof.file');
    Route::get('/participations/{document}/file',[ViewDocumentController::class,'showRegistrationDocs'])->name('participation-document.file');
    Route::get('/participations/{member}/member-photo', [ViewDocumentController::class, 'showMemberPhoto'])->name('participation-member-photo.file');
});

Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function () {
    Route::get('/participations/{participation:public_id}/information', [ParticipationController::class, 'show'])->name('participation.information.show');
    Route::get('/participations/{participation:public_id}/edit', [ParticipationController::class, 'edit'])->name('participation.edit');
    Route::patch('/participations/{participation:public_id}/status', [ParticipationController::class, 'updateStatus'])->name('participations.status.update');

    Route::get('/participations/{public_id}/members', [TeamMemberController::class, 'index'])->name('participations.members.index');
});

Route::middleware(['auth', 'verified', 'role:official_team'])->prefix('official_team')->name('official_team.')->group(function () {
    Route::get('/my-participations', [ParticipationController::class, 'myParticipations'])->name('participations.myParticipations');

    Route::get('/participations/{participation:public_id}/information', [ParticipationController::class, 'show'])->name('participations.information.show');
    Route::get('/participations/{participation:public_id}/edit', [ParticipationController::class, 'edit'])->name('participations.edit');
    Route::put('/participations/{participation:public_id}/registration', [ParticipationController::class, 'updateRegistration'])->name('participation.registration.update');
    Route::get('/participations/{participation:public_id}/documents', [ParticipationController::class, 'documentIndex'])->name('participations.documents.index');
    Route::post('/participations/{participation:public_id}/documents', [ParticipationController::class, 'uploadParticipationDocuments'])->name('participations.documents.store');
    Route::delete('/participations/{participation:public_id}/documents/{participation_document:document_id}',[ParticipationController::class, 'destroyDocument'])->name('participations.documents.delete');

    Route::get('/participations/{public_id}/members', [TeamMemberController::class, 'index'])->name('participations.members.index');
    Route::post('/participations/{public_id}/members', [TeamMemberController::class, 'sync'])->name('participations.members.sync');
});