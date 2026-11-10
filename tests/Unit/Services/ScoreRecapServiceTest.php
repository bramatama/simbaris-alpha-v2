<?php

use App\Models\Event;
use App\Models\EventChampionCategory;
use App\Models\EventPenalty;
use App\Models\EventChampionFormula;
use App\Models\MasterScoringCategory;
use App\Models\Participation;
use App\Models\ScoreRecap;
use App\Models\ScoringCategory;
use App\Models\TeamPenalty;
use App\Models\TeamScore;
use App\Services\ScoreRecapService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

uses(TestCase::class, \Illuminate\Foundation\Testing\RefreshDatabase::class);

function setupRecapDependencies(): array {
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

    $levelId = DB::table('levels')->insertGetId([
        'level_name' => 'SMP',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $event = Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Lomba PBB SIMBARIS',
        'registration_start_time' => now(),
        'registration_end_time' => now()->addDays(7),
        'start_time' => now()->addDays(10),
        'end_time' => now()->addDays(12),
        'created_by' => $adminId,
    ]);

    $eventLevelId = DB::table('event_levels')->insertGetId([
        'event_id' => $event->event_id,
        'level_id' => $levelId,
        'registration_fees' => 150000,
        'quota' => 15,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

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
        'institution' => 'SMPN 18 Balikpapan',
    ]);

    $championCategoryId = DB::table('champion_categories')->insertGetId([
        'champion_category_name' => 'Juara Utama',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $masterCategory = MasterScoringCategory::create(['category_name' => 'PBB Murni']);

    $scoringCategory = ScoringCategory::create([
        'event_level_id' => $eventLevelId,
        'master_category_id' => $masterCategory->master_category_id,
    ]);

    $masterPenaltyId = DB::table('master_penalties')->insertGetId([
        'penalty_name' => 'Terlambat Masuk Lapangan',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return [
        'event' => $event,
        'event_level_id' => $eventLevelId,
        'official_team_id' => $officialTeamId,
        'champion_category_id' => $championCategoryId,
        'scoring_category' => $scoringCategory,
        'master_penalty_id' => $masterPenaltyId,
    ];
}

test('calculateForParticipation menghitung raw score, pengurangan penalti, dan menyimpan recap dengan benar', function () {
    $deps = setupRecapDependencies();

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $deps['event']->event_id,
        'official_team_id' => $deps['official_team_id'],
        'event_level_id' => $deps['event_level_id'],
        'pic_name' => 'Budi',
        'pic_phone_number' => '08123456789',
        'billed_amount' => 150000,
    ]);

    $champCategory = EventChampionCategory::create([
        'event_id' => $deps['event']->event_id,
        'champion_category_id' => $deps['champion_category_id'],
    ]);

    EventChampionFormula::create([
        'event_champion_category_id' => $champCategory->event_champion_category_id,
        'event_level_id' => $deps['event_level_id'],
        'scoring_category_id' => $deps['scoring_category']->scoring_category_id,
        'weight_multiplier' => 1.5,
    ]);

    $penaltyRule = EventPenalty::create([
        'event_id' => $deps['event']->event_id,
        'master_penalty_id' => $deps['master_penalty_id'],
        'penalty_action' => 'deduction',
        'penalty_value' => 5,
    ]);
    $champCategory->eventPenalties()->attach($penaltyRule->event_penalty_id);

    TeamScore::create([
        'participation_id' => $participation->participation_id,
        'scoring_category_id' => $deps['scoring_category']->scoring_category_id,
        'total_score' => 100,
    ]);

    TeamPenalty::create([
        'participation_id' => $participation->participation_id,
        'event_penalty_id' => $penaltyRule->event_penalty_id,
        'penalty_action' => 'deduction',
        'penalty_value' => 5,
        'occurrence_count' => 2,
    ]);

    (new ScoreRecapService())->calculateForParticipation($participation);

    $this->assertDatabaseHas('score_recaps', [
        'participation_id' => $participation->participation_id,
        'event_champion_category_id' => $champCategory->event_champion_category_id,
        'raw_score' => 150,
        'total_penalty_deduction' => 10,
        'final_score' => 140,
        'is_disqualified' => false,
    ]);
});

test('calculateForParticipation mengubah final_score menjadi 0 jika tim terkena diskualifikasi', function () {
    $deps = setupRecapDependencies();

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $deps['event']->event_id,
        'official_team_id' => $deps['official_team_id'],
        'event_level_id' => $deps['event_level_id'],
        'pic_name' => 'Budi',
        'pic_phone_number' => '08123456789',
        'billed_amount' => 150000,
    ]);

    $champCategory = EventChampionCategory::create([
        'event_id' => $deps['event']->event_id,
        'champion_category_id' => $deps['champion_category_id'],
    ]);

    EventChampionFormula::create([
        'event_champion_category_id' => $champCategory->event_champion_category_id,
        'event_level_id' => $deps['event_level_id'],
        'scoring_category_id' => $deps['scoring_category']->scoring_category_id,
        'weight_multiplier' => 1.0,
    ]);

    $disqualifyRule = EventPenalty::create([
        'event_id' => $deps['event']->event_id,
        'master_penalty_id' => $deps['master_penalty_id'],
        'penalty_action' => 'disqualification',
    ]);
    $champCategory->eventPenalties()->attach($disqualifyRule->event_penalty_id);

    TeamScore::create([
        'participation_id' => $participation->participation_id,
        'scoring_category_id' => $deps['scoring_category']->scoring_category_id,
        'total_score' => 200,
    ]);

    TeamPenalty::create([
        'participation_id' => $participation->participation_id,
        'event_penalty_id' => $disqualifyRule->event_penalty_id,
        'penalty_action' => 'disqualification',
        'penalty_value' => 0,
        'occurrence_count' => 1,
    ]);

    (new ScoreRecapService())->calculateForParticipation($participation);

    $this->assertDatabaseHas('score_recaps', [
        'participation_id' => $participation->participation_id,
        'event_champion_category_id' => $champCategory->event_champion_category_id,
        'raw_score' => 200,
        'final_score' => 0,
        'is_disqualified' => true,
    ]);
});