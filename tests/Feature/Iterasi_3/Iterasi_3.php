<?php

use App\Models\AssessmentCriteria;
use App\Models\AuditTrail;
use App\Models\ChampionCategory;
use App\Models\EvaluationSession;
use App\Models\Event;
use App\Models\EventChampionCategory;
use App\Models\EventLevel;
use App\Models\EventPenalty;
use App\Models\Judge;
use App\Models\Level;
use App\Models\MasterAssessmentCriteria;
use App\Models\MasterPenalty;
use App\Models\MasterScoringCategory;
use App\Models\Participation;
use App\Models\RubricCategory;
use App\Models\RubricScore;
use App\Models\ScoringCategory;
use App\Models\TeamScore;
use App\Models\TeamScoreDetail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use function Pest\Laravel\actingAs;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Helper Functions - Iterasi 3
|--------------------------------------------------------------------------
*/

if (!function_exists('createAdminUser')) {
    function createAdminUser(): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'name' => 'Admin Utama',
            'email' => 'admin.event.' . Str::random(5) . '@simbaris.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('admins')->insert([
            'admin_id' => $userId,
            'user_id' => $userId,
        ]);

        return User::find($userId);
    }
}

if (!function_exists('createOfficialUser')) {
    function createOfficialUser(): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'name' => 'Official Tim SMPN 18',
            'email' => 'official.team.' . Str::random(5) . '@simbaris.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'role' => 'official_team',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('official_teams')->insert([
            'user_id' => $userId,
            'province' => 'Kalimantan Timur',
            'city' => 'Balikpapan',
            'institution' => 'SMPN 18 Balikpapan',
        ]);

        return User::find($userId);
    }
}

if (!function_exists('createCommitteeUserForEvent')) {
    function createCommitteeUserForEvent(int $eventId, string $position = 'auditor'): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'name' => 'Panitia Auditor',
            'email' => 'committee.auditor.' . Str::random(5) . '@simbaris.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'role' => 'committee',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $committeeId = DB::table('committees')->insertGetId([
            'user_id' => $userId,
            'department' => 'Seksi Penilaian & Audit',
        ]);

        DB::table('event_committees')->insert([
            'event_id' => $eventId,
            'committee_id' => $committeeId,
            'position' => $position,
        ]);

        return User::find($userId);
    }
}

if (!function_exists('createJudgeUserForEvent')) {
    function createJudgeUserForEvent(int $eventId, int $scoringCategoryId): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'name' => 'Juri PBB Utama',
            'email' => 'judge.' . Str::random(5) . '@simbaris.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'role' => 'judge',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $judgeId = DB::table('judges')->insertGetId([
            'user_id' => $userId,
        ]);

        $eventJudgeId = DB::table('event_judges')->insertGetId([
            'event_id' => $eventId,
            'judge_id' => $judgeId,
        ]);

        DB::table('judge_expertises')->insert([
            'event_judge_id' => $eventJudgeId,
            'scoring_category_id' => $scoringCategoryId,
        ]);

        return User::find($userId);
    }
}

if (!function_exists('createEventForTechnicalTest')) {
    function createEventForTechnicalTest(User $creator): Event {
        return Event::create([
            'public_id' => (string) Str::uuid(),
            'event_name' => 'LPBB Pantera III 2026',
            'description' => 'Kompetisi Paskibra dan Marching Drill',
            'location' => 'GOR Tennis Indoor BJBJ',
            'status' => 'ongoing',
            'registration_start_time' => now(),
            'registration_end_time' => now()->addDays(10),
            'start_time' => now()->addDays(15),
            'end_time' => now()->addDays(17),
            'created_by' => $creator->user_id,
        ]);
    }
}

/*
|--------------------------------------------------------------------------
| 1. Visibilitas & Pengaturan Event (Panitia & Auditor)
|--------------------------------------------------------------------------
*/

test('panitia dapat mengatur visibilitas hasil lomba', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAdministration = createCommitteeUserForEvent($event->event_id, 'administration');

    $payload = [
        'event_name' => $event->event_name,
        'description' => $event->description,
        'location' => $event->location,
        'status' => 'ongoing',
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
        'is_result_visible' => true,
        'is_recap_visible' => true,
        'is_leaderboard_visible' => true,
    ];

    $response = actingAs($committeeAdministration)->patch(route('committee.events.update', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Detail Event berhasil diperbarui');

    $event->refresh();
    expect((bool) $event->is_result_visible)->toBeTrue();
    expect((bool) $event->is_recap_visible)->toBeTrue();
    expect((bool) $event->is_leaderboard_visible)->toBeTrue();
});

test('auditor dapat mengatur visibilitas hasil penjurian', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAdministration = createCommitteeUserForEvent($event->event_id, 'administration');

    $payload = [
        'event_name' => $event->event_name,
        'description' => $event->description,
        'location' => $event->location,
        'status' => 'ongoing',
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
        'is_result_visible' => false,
        'is_recap_visible' => true,
        'is_leaderboard_visible' => false,
    ];

    $response = actingAs($committeeAdministration)->patch(route('committee.events.update', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $event->refresh();
    expect((bool) $event->is_recap_visible)->toBeTrue();
    expect((bool) $event->is_result_visible)->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| 2. Penilaian Juri (Dewan Juri)
|--------------------------------------------------------------------------
*/

test('juri dapat melihat formulir penilaian digital', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);

    $level = Level::create(['level_name' => 'SMP Digital Form']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $masterCategory = MasterScoringCategory::create(['category_name' => 'PBB Digital']);
    $scoringCategory = ScoringCategory::create([
        'event_level_id' => $eventLevel->event_level_id,
        'master_category_id' => $masterCategory->master_category_id,
    ]);

    $judgeUser = createJudgeUserForEvent($event->event_id, $scoringCategory->scoring_category_id);
    $officialUser = createOfficialUser();

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'PASKASSPANDLAS Digital',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
        'appearance_order' => 1,
    ]);

    $response = actingAs($judgeUser)->get(route('judge.events.participants.evaluate', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
        'scoringCategory' => $scoringCategory->scoring_category_id,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/evaluations/judge/ScoringForm')
        ->has('activeCategory')
    );
});

test('juri dapat memberikan nilai pada penampilan tim', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);

    $level = Level::create(['level_name' => 'SMP Input Nilai']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $masterCategory = MasterScoringCategory::create(['category_name' => 'PBB Input']);
    $scoringCategory = ScoringCategory::create([
        'event_level_id' => $eventLevel->event_level_id,
        'master_category_id' => $masterCategory->master_category_id,
    ]);

    $masterCriteria = MasterAssessmentCriteria::create([
        'master_category_id' => $masterCategory->master_category_id,
        'criteria_name' => 'Kekompakan',
    ]);

    $criterion = AssessmentCriteria::create([
        'scoring_category_id' => $scoringCategory->scoring_category_id,
        'master_criteria_id' => $masterCriteria->master_criteria_id,
        'order_index' => 1,
    ]);

    $rubricCat = RubricCategory::create([
        'criteria_id' => $criterion->criteria_id,
        'category_label' => 'Kesamaan Langkah',
        'category_order' => 1,
    ]);

    $rubricScore = RubricScore::create([
        'rubric_category_id' => $rubricCat->rubric_category_id,
        'score_value' => 90.0,
        'display_order' => 1,
    ]);

    $judgeUser = createJudgeUserForEvent($event->event_id, $scoringCategory->scoring_category_id);
    $officialUser = createOfficialUser();

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Input Nilai',
        'pic_name' => 'PIC Input',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $payload = [
        'category_id' => $scoringCategory->scoring_category_id,
        'scores' => [
            [
                'criteria_id' => $criterion->criteria_id,
                'rubric_score_id' => $rubricScore->rubric_score_id,
                'score_value' => 90.0,
                'clicked_at' => now()->toDateTimeString(),
            ]
        ]
    ];

    $response = actingAs($judgeUser)->postJson(route('api.judge.autosave', $participation->public_id), $payload);

    $response->assertStatus(200)
        ->assertJson(['status' => 'success']);

    $this->assertDatabaseHas('team_score_details', [
        'participation_id' => $participation->participation_id,
        'criteria_id' => $criterion->criteria_id,
        'score_value' => 90.0,
    ]);
});

test('juri dapat melakukan finalisasi nilai', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);

    $level = Level::create(['level_name' => 'SMP Finalisasi']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $masterCategory = MasterScoringCategory::create(['category_name' => 'PBB Finalisasi']);
    $scoringCategory = ScoringCategory::create([
        'event_level_id' => $eventLevel->event_level_id,
        'master_category_id' => $masterCategory->master_category_id,
    ]);

    $judgeUser = createJudgeUserForEvent($event->event_id, $scoringCategory->scoring_category_id);
    $officialUser = createOfficialUser();

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Lock Nilai',
        'pic_name' => 'PIC Lock',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $response = actingAs($judgeUser)->post(route('judge.events.participants.lock_category', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
        'scoringCategory' => $scoringCategory->scoring_category_id,
    ]));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Kategori dikunci! Kriteria kosong otomatis bernilai 0.');

    $judgeId = Judge::where('user_id', $judgeUser->user_id)->value('judge_id');

    $this->assertDatabaseHas('team_scores', [
        'participation_id' => $participation->participation_id,
        'scoring_category_id' => $scoringCategory->scoring_category_id,
        'judge_id' => $judgeId,
        'evaluation_status' => 'locked',
    ]);
});

/*
|--------------------------------------------------------------------------
| 3. Fitur Auditor (Pengawasan, Penalti, & Rekapitulasi)
|--------------------------------------------------------------------------
*/

test('auditor dapat mengelola penalti tim', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAuditor = createCommitteeUserForEvent($event->event_id, 'auditor');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Penalti Auditor']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Penalti Auditor',
        'pic_name' => 'PIC Penalti',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $masterPenalty = MasterPenalty::create(['penalty_name' => 'Terlambat Masuk Lapangan']);

    // 1. Daftarkan aturan penalti ke event
    $eventPenalty = EventPenalty::create([
        'event_id' => $event->event_id,
        'master_penalty_id' => $masterPenalty->master_penalty_id,
        'description' => 'Potongan poin dari auditor karena terlambat',
        'penalty_action' => 'deduction',
        'penalty_value' => 10.0,
        'calculation_type' => 'fixed',
        'is_active' => true,
    ]);

    // 2. Payload penginputan penalti ke tim peserta (sertakan 'reason')
    $payload = [
        'event_penalty_id' => $eventPenalty->event_penalty_id,
        'occurrence_count' => 1,
        'reason' => 'Terlambat memasuki arena sesuai jadwal tampil', // Tambahkan field ini
    ];

    $response = actingAs($committeeAuditor)->post(route('committee.events.participations.penalties.store', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
});

test('auditor dapat melihat pengurangan poin otomatis', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAuditor = createCommitteeUserForEvent($event->event_id, 'auditor');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Otomatis Penalti']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Penalti Waktu',
        'pic_name' => 'PIC Waktu',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    EvaluationSession::create([
        'participation_id' => $participation->participation_id,
        'status' => 'finished',
        'start_time' => now()->subMinutes(10),
        'end_time' => now(),
    ]);

    $response = actingAs($committeeAuditor)->get(route('committee.events.monitoring.show', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/monitorings/committee/Show')
        ->has('session')
    );
});

test('auditor dapat memantau akuntabilitas data penilaian', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAuditor = createCommitteeUserForEvent($event->event_id, 'auditor');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Akuntabilitas']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $masterCategory = MasterScoringCategory::create(['category_name' => 'PBB Audit Trail']);
    $scoringCategory = ScoringCategory::create([
        'event_level_id' => $eventLevel->event_level_id,
        'master_category_id' => $masterCategory->master_category_id,
    ]);

    $masterCriteria = MasterAssessmentCriteria::create([
        'master_category_id' => $masterCategory->master_category_id,
        'criteria_name' => 'Kerapihan Pakaian',
    ]);

    $criterion = AssessmentCriteria::create([
        'scoring_category_id' => $scoringCategory->scoring_category_id,
        'master_criteria_id' => $masterCriteria->master_criteria_id,
        'order_index' => 1,
    ]);

    $judgeUser = createJudgeUserForEvent($event->event_id, $scoringCategory->scoring_category_id);
    $judgeId = Judge::where('user_id', $judgeUser->user_id)->value('judge_id');

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Audit Log',
        'pic_name' => 'PIC Log',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    // Sertakan criteria_id
    AuditTrail::create([
        'participation_id' => $participation->participation_id,
        'judge_id' => $judgeId,
        'criteria_id' => $criterion->criteria_id,
        'score_value' => 85.0,
        'clicked_at' => now(),
        'ip_address' => '127.0.0.1',
    ]);

    $response = actingAs($committeeAuditor)->getJson(route('committee.events.monitoring.audit-trails', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]));

    $response->assertStatus(200);
    $response->assertJsonStructure(['data']);
});

test('auditor dapat melihat total nilai gabungan', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAuditor = createCommitteeUserForEvent($event->event_id, 'auditor');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Total Nilai']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Total Skor',
        'pic_name' => 'PIC Total',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $response = actingAs($committeeAuditor)->get(route('committee.events.monitoring.show', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/monitorings/committee/Show')
        ->has('participation')
    );
});

test('auditor dapat memperoleh rekapitulasi nilai otomatis', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committeeAuditor = createCommitteeUserForEvent($event->event_id, 'auditor');

    $level = Level::create(['level_name' => 'SMP Rekap']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $response = actingAs($committeeAuditor)->get(route('committee.events.participations.orders.index', [
        'public_id' => $event->public_id,
        'level_id' => $eventLevel->event_level_id,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/participations/orders/committee/Index')
    );
});

/*
|--------------------------------------------------------------------------
| 4. Fitur Official Tim & Seluruh Pengguna
|--------------------------------------------------------------------------
*/

test('official team dapat melihat detail hasil penjurian', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Detail Penjuri']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'PASKASSPANDLAS Skor Detail',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $response = actingAs($officialUser)->get(route('official_team.participations.Myresult', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/evaluation_results/EvaluationResult')
        ->has('participation')
    );
});

test('official team dapat melihat riwayat perubahan nilai timnya', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Audit Official']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'PASKASSPANDLAS Riwayat Nilai',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $response = actingAs($officialUser)->get(route('official_team.participations.audit-logs', [
        'public_id' => $event->public_id,
        'participation_public_id' => $participation->public_id,
    ]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/participations/audit_trails/Index')
        ->has('auditTrails')
    );
});

test('seluruh pengguna dapat melihat klasemen akhir', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Klasemen Akhir']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $response = actingAs($officialUser)->get(route('events.show', $event->public_id));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/event_details/Show')
        ->has('event')
    );
});

test('official team dapat melihat riwayat perlombaan', function () {
    $officialUser = createOfficialUser();

    $response = actingAs($officialUser)->get(route('official_team.participations.myParticipations'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/participations/participation_lists/official_team/MyParticipations')
        ->has('participations')
    );
});