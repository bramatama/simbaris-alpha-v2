<?php

use App\Models\AssessmentCriteria;
use App\Models\Event;
use App\Models\EventJudge;
use App\Models\JudgeExpertise;
use App\Models\MasterScoringCategory;
use App\Models\MasterAssessmentCriteria;
use App\Models\Participation;
use App\Models\ScoringCategory;
use App\Models\TeamScoreDetail;
use App\Services\ScoreMatrixService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

uses(TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

function createBaseEventDependencies(): array {
    // 1. Buat User Admin
    $adminUserId = DB::table('users')->insertGetId([
        'public_id' => (string) Str::uuid(),
        'name' => 'Admin Test',
        'email' => 'admin@test.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $adminId = DB::table('admins')->insertGetId([
        'user_id' => $adminUserId,
    ]);

    // 2. Buat Data Level
    $levelSmpId = DB::table('levels')->insertGetId([
        'level_name' => 'SMP',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $levelSmaId = DB::table('levels')->insertGetId([
        'level_name' => 'SMA',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // 3. Buat Event
    $event = Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Lomba PBB SIMBARIS',
        'registration_start_time' => now(),
        'registration_end_time' => now()->addDays(7),
        'start_time' => now()->addDays(10),
        'end_time' => now()->addDays(12),
        'created_by' => $adminId,
    ]);

    $eventLevelSmpId = DB::table('event_levels')->insertGetId([
        'event_id' => $event->event_id,
        'level_id' => $levelSmpId,
        'registration_fees' => 150000,
        'quota' => 15,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $eventLevelSmaId = DB::table('event_levels')->insertGetId([
        'event_id' => $event->event_id,
        'level_id' => $levelSmaId,
        'registration_fees' => 200000,
        'quota' => 15,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // 4. Buat User Official Team
    $officialUserId = DB::table('users')->insertGetId([
        'public_id' => (string) Str::uuid(),
        'name' => 'Official Tim',
        'email' => 'official@test.com',
        'password' => bcrypt('password'),
        'role' => 'official_team',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $officialTeamId = DB::table('official_teams')->insertGetId([
        'user_id' => $officialUserId,
        'province' => 'Kalimantan Timur',
        'city' => 'Balikpapan',
        'institution' => 'SMAN 5 Bandung',
    ]);

    return [
        'event' => $event,
        'event_level_smp_id' => $eventLevelSmpId,
        'event_level_sma_id' => $eventLevelSmaId,
        'official_team_id' => $officialTeamId,
    ];
}

test('getAvailableCategories mengembalikan kategori yang sesuai dengan event_level_id', function () {
    $service = new ScoreMatrixService();
    $deps = createBaseEventDependencies();

    $masterCat = MasterScoringCategory::create(['category_name' => 'PBB Murni']);
    
    $catLevel1 = ScoringCategory::create([
        'event_level_id' => $deps['event_level_smp_id'],
        'master_category_id' => $masterCat->master_category_id,
    ]);

    ScoringCategory::create([
        'event_level_id' => $deps['event_level_sma_id'],
        'master_category_id' => $masterCat->master_category_id,
    ]);

    $result = $service->getAvailableCategories($deps['event_level_smp_id']);

    expect($result)->toHaveCount(1);
    expect($result->first()->scoring_category_id)->toBe($catLevel1->scoring_category_id);
    expect($result->first()->masterCategory->category_name)->toBe('PBB Murni');
});

test('generateMatrix menghitung matriks nilai, total juri, dan grand total dengan benar', function () {
    $service = new ScoreMatrixService();
    $deps = createBaseEventDependencies();

    $event = $deps['event'];

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $deps['official_team_id'],
        'event_level_id' => $deps['event_level_smp_id'],
        'pic_name' => 'Budi',
        'pic_phone_number' => '08123456789',
        'billed_amount' => 150000,
    ]);

    $masterCat = MasterScoringCategory::create(['category_name' => 'PBB Murni']);

    $category = ScoringCategory::create([
        'event_level_id' => $participation->event_level_id,
        'master_category_id' => $masterCat->master_category_id,
    ]);

    $masterCrit1 = MasterAssessmentCriteria::create([
        'master_category_id' => $masterCat->master_category_id,
        'criteria_name' => 'Kerapihan Barisan',
    ]);

    $crit1 = AssessmentCriteria::create([
        'scoring_category_id' => $category->scoring_category_id,
        'master_criteria_id' => $masterCrit1->master_criteria_id,
        'order_index' => 1,
    ]);

    // 1. Buat User & Record Juri 1
    $judgeUser1 = DB::table('users')->insertGetId([
        'public_id' => (string) Str::uuid(),
        'name' => 'Juri Satu',
        'email' => 'juri1@test.com',
        'password' => bcrypt('password'),
        'role' => 'judge',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $judgeId1 = DB::table('judges')->insertGetId(['user_id' => $judgeUser1]);

    // 2. Buat User & Record Juri 2
    $judgeUser2 = DB::table('users')->insertGetId([
        'public_id' => (string) Str::uuid(),
        'name' => 'Juri Dua',
        'email' => 'juri2@test.com',
        'password' => bcrypt('password'),
        'role' => 'judge',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $judgeId2 = DB::table('judges')->insertGetId(['user_id' => $judgeUser2]);

    $eventJudge1 = EventJudge::create([
        'event_id' => $event->event_id,
        'judge_id' => $judgeId1,
    ]);
    JudgeExpertise::create([
        'event_judge_id' => $eventJudge1->event_judge_id,
        'scoring_category_id' => $category->scoring_category_id,
    ]);

    $eventJudge2 = EventJudge::create([
        'event_id' => $event->event_id,
        'judge_id' => $judgeId2,
    ]);
    JudgeExpertise::create([
        'event_judge_id' => $eventJudge2->event_judge_id,
        'scoring_category_id' => $category->scoring_category_id,
    ]);

    TeamScoreDetail::create([
        'participation_id' => $participation->participation_id,
        'criteria_id' => $crit1->criteria_id,
        'judge_id' => $judgeId1,
        'score_value' => 80,
    ]);

    TeamScoreDetail::create([
        'participation_id' => $participation->participation_id,
        'criteria_id' => $crit1->criteria_id,
        'judge_id' => $judgeId2,
        'score_value' => 90,
    ]);

    $result = $service->generateMatrix($event, $participation, $category);

    expect($result)->toHaveKeys(['judgeHeaders', 'scoresMatrix', 'judgeTotals', 'grandTotal']);
    expect($result['judgeHeaders'])->toHaveCount(2);
    expect($result['judgeTotals'][$judgeId1])->toEqual(80);
    expect($result['judgeTotals'][$judgeId2])->toEqual(90);
    expect($result['grandTotal'])->toEqual(170);
    expect($result['scoresMatrix'][0]['scores'][$judgeId1])->toEqual(80);
});