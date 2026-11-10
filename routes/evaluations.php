<?php
use App\Http\Controllers\Evaluations\JudgeEvaluationController;
use App\Http\Controllers\Evaluations\EvaluationResultController;
use App\Http\Controllers\Evaluations\TeamPenaltyController;
use App\Http\Controllers\Evaluations\EvaluationMonitoringController;

Route::middleware(['auth', 'verified', 'role:judge'])->prefix('judge')->name('judge.')->group(function (){
    Route::get('events/{event:public_id}/participants/{participation:public_id}/evaluate/{scoringCategory}', [JudgeEvaluationController::class, 'evaluate'])->name('events.participants.evaluate');
    Route::post('events/{event:public_id}/participants/{participation:public_id}/evaluate/{scoringCategory}/submit', [JudgeEvaluationController::class, 'submitCategory'])->name('events.participants.submit_category');
    Route::post('events/{event:public_id}/participants/{participation:public_id}/lock/{scoringCategory}', [JudgeEvaluationController::class, 'lockCategory'])->name('events.participants.lock_category');
});

Route::middleware(['auth', 'verified', 'role:committee'])->prefix('committee')->name('committee.')->group(function (){
    Route::get('/events/{event:public_id}/participations/{participation:public_id}/evaluation_result', [EvaluationResultController::class, 'showResult'])
    ->name('events.participations.result');
    Route::post('/events/{event:public_id}/participations/{participation:public_id}/evaluation_result/unlock', [EvaluationResultController::class, 'requestUnlock'])
    ->name('events.evaluation_result.unlock');

    Route::get('/events/{event:public_id}/participations/{participation:public_id}/penalties', [TeamPenaltyController::class, 'index'])
    ->name('events.participations.penalties');
    
    Route::post('/events/{event:public_id}/participations/{participation:public_id}/penalties', [TeamPenaltyController::class, 'store'])
        ->name('events.participations.penalties.store');
        
    Route::delete('/events/{event:public_id}/participations/{participation:public_id}/penalties/{teamPenalty}', [TeamPenaltyController::class, 'destroy'])
        ->name('events.participations.penalties.destroy');

    Route::get('/events/{event:public_id}/participations/{participation:public_id}/monitoring', [EvaluationMonitoringController::class, 'show'])->name('events.monitoring.show');
    Route::post('/events/{event:public_id}/participations/{participation:public_id}/monitoring/start', [EvaluationMonitoringController::class, 'start'])->name('events.monitoring.start');
    Route::post('/events/{event:public_id}/participations/{participation:public_id}/monitoring/pause', [EvaluationMonitoringController::class, 'pause'])->name('events.monitoring.pause');
    Route::post('/events/{event:public_id}/participations/{participation:public_id}/monitoring/resume', [EvaluationMonitoringController::class, 'resume'])->name('events.monitoring.resume');
    Route::post('/events/{event:public_id}/participations/{participation:public_id}/monitoring/finish', [EvaluationMonitoringController::class, 'finish'])->name('events.monitoring.finish');
    Route::put('/events/{event:public_id}/participations/{participation:public_id}/monitoring/manual-update', [EvaluationMonitoringController::class, 'manualUpdate'])->name('events.monitoring.manual-update');
    Route::get('/events/{event:public_id}/participations/{participation:public_id}/monitoring/audit-trails', [EvaluationMonitoringController::class, 'getAuditTrails'])->name('events.monitoring.audit-trails');
});

Route::middleware(['auth', 'verified', 'role:official_team'])->prefix('official_team')->name('official_team.')->group(function (){
    Route::get('/events/{event:public_id}/participations/{participation:public_id}/evaluation-result', [EvaluationResultController::class, 'showMyResult'])
    ->name('participations.Myresult');

    Route::get('events/{public_id}/participations/{participation_public_id}/audit-logs',[EvaluationMonitoringController::class, 'showAuditTrail'])->name('participations.audit-logs');
});


