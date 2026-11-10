<?php

use App\Models\AssessmentCriteria;
use App\Models\ChampionCategory;
use App\Models\Champion;
use App\Models\Event;
use App\Models\EventChampionCategory;
use App\Models\EventDocument;
use App\Models\EventLevel;
use App\Models\EventPenalty;
use App\Models\Level;
use App\Models\MasterAssessmentCriteria;
use App\Models\MasterPenalty;
use App\Models\MasterScoringCategory;
use App\Models\Participation;
use App\Models\ParticipationDocument;
use App\Models\ScoringCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use function Pest\Laravel\actingAs;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Helper Functions - Iterasi 2
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
            'name' => 'Official Tim',
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

if (!function_exists('createEventForTechnicalTest')) {
    function createEventForTechnicalTest(User $creator): Event {
        return Event::create([
            'public_id' => (string) Str::uuid(),
            'event_name' => 'LPBB Pantera III 2026',
            'description' => 'Kompetisi Paskibra dan Marching Drill',
            'location' => 'GOR Tennis Indoor BJBJ',
            'status' => 'draft',
            'registration_start_time' => now(),
            'registration_end_time' => now()->addDays(10),
            'start_time' => now()->addDays(15),
            'end_time' => now()->addDays(17),
            'created_by' => $creator->user_id,
        ]);
    }
}

if (!function_exists('createCommitteeUserForEvent')) {
    function createCommitteeUserForEvent(int $eventId, string $position = 'administration'): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'name' => 'Panitia Teknis',
            'email' => 'committee.tech.' . Str::random(5) . '@simbaris.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'role' => 'committee',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $committeeId = DB::table('committees')->insertGetId([
            'user_id' => $userId,
            'department' => 'Seksi Acara & Administrasi',
        ]);

        DB::table('event_committees')->insert([
            'event_id' => $eventId,
            'committee_id' => $committeeId,
            'position' => $position,
        ]);

        return User::find($userId);
    }
}

/*
|--------------------------------------------------------------------------
| 1. Pengelolaan Dokumen Event (EventDocumentController)
|--------------------------------------------------------------------------
*/

test('panitia dapat mengunggah dokumen juknis', function () {
    Storage::fake('public');

    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');

    $pdfFile = UploadedFile::fake()->create('juknis_pelaksanaan.pdf', 1024, 'application/pdf');

    $response = actingAs($committee)->postJson(route('committee.documents.store', $event->public_id), [
        'file' => $pdfFile,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'success',
            'message' => 'Dokumen juknis berhasil diunggah.',
        ]);

    $this->assertDatabaseHas('event_documents', [
        'event_id' => $event->event_id,
        'document_name' => 'juknis_pelaksanaan.pdf',
    ]);

    $document = EventDocument::where('event_id', $event->event_id)->first();
    Storage::disk('public')->assertExists($document->document_path);
});

/*
|--------------------------------------------------------------------------
| 2. Konfigurasi Jenjang, Biaya & Kuota (EventLevelController)
|--------------------------------------------------------------------------
*/

test('panitia dapat mengelola jenjang, biaya, dan kuota event', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');

    $levelSmp = Level::create(['level_name' => 'SMP / Sederajat']);
    $levelSma = Level::create(['level_name' => 'SMA / Sederajat']);

    $payload = [
        'levels' => [
            [
                'level_id' => $levelSmp->level_id,
                'registration_fees' => 150000,
                'quota' => 20,
            ],
            [
                'level_id' => $levelSma->level_id,
                'registration_fees' => 200000,
                'quota' => 30,
            ],
        ],
    ];

    $response = actingAs($committee)->post(route('committee.levels.store', $event->public_id), $payload);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Konfigurasi jenjang berhasil disimpan!');

    $this->assertDatabaseHas('event_levels', [
        'event_id' => $event->event_id,
        'level_id' => $levelSmp->level_id,
        'registration_fees' => 150000,
        'quota' => 20,
    ]);

    $this->assertDatabaseHas('event_levels', [
        'event_id' => $event->event_id,
        'level_id' => $levelSma->level_id,
        'registration_fees' => 200000,
        'quota' => 30,
    ]);
});

/*
|--------------------------------------------------------------------------
| 4. Alur Pendaftaran Tim & Bukti Pembayaran (ParticipationController)
|--------------------------------------------------------------------------
*/

test('official team dapat mendaftarkan tim', function () {
    Storage::fake('public');
    Storage::fake('local');

    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Utama']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 20,
    ]);

    $tempPaymentPath = 'temp/bukti_bayar.png';
    Storage::disk('public')->put($tempPaymentPath, 'isi bukti transfer');

    $payload = [
        'teams' => [
            [
                'event_level_id' => $eventLevel->event_level_id,
                'team_name' => 'PASKASSPANDLAS A',
                'pic_name' => 'Aisha Hamida',
                'pic_phone_number' => '081234567890',
            ]
        ],
        'temp_payment_proof_path' => $tempPaymentPath,
    ];

    $response = actingAs($officialUser)->post(route('official_team.participations.store', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('official_team.participations.myParticipations'));
    $response->assertSessionHas('success', 'Pendaftaran 1 tim berhasil!');

    $this->assertDatabaseHas('participations', [
        'event_id' => $event->event_id,
        'team_name' => 'PASKASSPANDLAS A',
        'pic_name' => 'Aisha Hamida',
        'status' => 'pending',
    ]);

    Storage::disk('public')->assertMissing($tempPaymentPath);
});

/*
|--------------------------------------------------------------------------
| 5. Mengelola Data Anggota Tim (TeamMemberController)
|--------------------------------------------------------------------------
*/

test('official team dapat menyimpan data anggota tim beserta posisi dan foto', function () {
    Storage::fake('local');

    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Reguler']);
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
        'team_name' => 'PASKASSPANDLAS Utama',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'status' => 'pending',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $jpeg1x1 = base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');
    $memberPhoto = UploadedFile::fake()->createWithContent('danton.jpg', $jpeg1x1);

    $payload = [
        'members' => [
            [
                'member_name' => 'Danton Utama',
                'member_role' => 'commander',
                'member_position' => 'Komandan Peleton',
                'photo' => $memberPhoto,
            ],
            [
                'member_name' => 'Anggota Barisan 1',
                'member_role' => 'member',
                'member_position' => 'Shaf Depan Kanan',
            ]
        ]
    ];

    $response = actingAs($officialUser)->post(route('official_team.participations.members.sync', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('official_team.participations.members.index', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]));

    $this->assertDatabaseHas('team_members', [
        'participation_id' => $participation->participation_id,
        'member_name' => 'Danton Utama',
        'member_role' => 'commander',
    ]);

    $this->assertDatabaseHas('team_members', [
        'participation_id' => $participation->participation_id,
        'member_name' => 'Anggota Barisan 1',
        'member_role' => 'member',
    ]);
});

/*
|--------------------------------------------------------------------------
| 6. Upload & Hapus Dokumen Persyaratan Pendaftaran (ParticipationController)
|--------------------------------------------------------------------------
*/

test('official team dapat mengelola dokumen perndaftaran', function () {
    Storage::fake('local');

    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Reguler 2']);
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
        'team_name' => 'PASKASSPANDLAS B',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'status' => 'pending',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof.jpg',
    ]);

    $pdfDocument = UploadedFile::fake()->create('formulir_pendaftaran.pdf', 2048, 'application/pdf');

    // 1. Upload Dokumen
    $uploadResponse = actingAs($officialUser)->postJson(route('official_team.participations.documents.store', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]), [
        'file' => $pdfDocument,
    ]);

    $uploadResponse->assertStatus(200)
        ->assertJson([
            'status' => 'success',
            'message' => 'Dokumen berhasil diunggah',
        ]);

    $this->assertDatabaseHas('participation_documents', [
        'participation_id' => $participation->participation_id,
        'document_name' => 'formulir_pendaftaran.pdf',
    ]);

    $document = ParticipationDocument::where('participation_id', $participation->participation_id)->first();
    Storage::disk('local')->assertExists($document->document_path);

    // 2. Hapus Dokumen
    $deleteResponse = actingAs($officialUser)->delete(route('official_team.participations.documents.delete', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
        'participation_document' => $document->document_id,
    ]));

    $deleteResponse->assertRedirect();
    $deleteResponse->assertSessionHas('success', 'Dokumen berhasil dihapus.');

    $this->assertDatabaseMissing('participation_documents', [
        'document_id' => $document->document_id,
    ]);
});

/*
|--------------------------------------------------------------------------
| 7. Verifikasi Berkas, Feedback Revisi & Perbaikan Data Data Tim
|--------------------------------------------------------------------------
*/

test('panitia menolak dan tim memperbaiki pendaftaran', function () {
    Storage::fake('public');
    Storage::fake('local');

    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Verifikasi']);
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
        'team_name' => 'Nama Tim Salah',
        'pic_name' => 'Aisha',
        'pic_phone_number' => '081234567890',
        'status' => 'pending',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/proof_lama.jpg',
    ]);

    // 1. Panitia menolak berkas dengan feedback revisi (Ganti ->put menjadi ->patch)
    $rejectResponse = actingAs($committee)->patch(route('committee.participations.status.update', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]), [
        'status' => 'rejected',
        'status_message' => 'Bukti pembayaran kurang jelas, silakan upload ulang.',
    ]);

    $rejectResponse->assertRedirect();
    $rejectResponse->assertSessionHas('success', 'Status pendaftaran berhasil diperbarui.');

    $participation->refresh();
    expect($participation->status)->toBe('rejected');
    expect($participation->status_message)->toBe('Bukti pembayaran kurang jelas, silakan upload ulang.');

    // 2. Official Tim melakukan perbaikan data & mengunggah bukti bayar baru (Ganti ->put menjadi ->patch)
    $newTempPayment = 'temp/bukti_bayar_perbaikan.png';
    Storage::disk('public')->put($newTempPayment, 'isi bukti perbaikan');

    $updateResponse = actingAs($officialUser)->put(route('official_team.participation.registration.update', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]), [
        'team_name' => 'Nama Tim Perbaikan PASKASSPANDLAS',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'temp_payment_proof_path' => $newTempPayment,
    ]);

    $updateResponse->assertRedirect();
    $updateResponse->assertSessionHas('success', 'Data pendaftaran berhasil diperbarui.');

    // Status otomatis kembali menjadi 'pending' dan feedback dibersihkan
    $participation->refresh();
    expect($participation->team_name)->toBe('Nama Tim Perbaikan PASKASSPANDLAS');
    expect($participation->status)->toBe('pending');
    expect($participation->status_message)->toBeNull();
});

test('panitia dapat menyetujui pendaftaran tim yang berkasnya valid', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Acc']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota'=> '10',
    ]);

    $participation = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'PASKASSPANDLAS Ready',
        'pic_name' => 'Aisha Hamida',
        'pic_phone_number' => '081234567890',
        'status' => 'pending',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/valid_proof.jpg',
    ]);

    $response = actingAs($committee)->patch(route('committee.participations.status.update', [
        'event' => $event->public_id,
        'participation' => $participation->public_id,
    ]), [
        'status' => 'approved',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Status pendaftaran berhasil diperbarui.');

    $participation->refresh();
    expect($participation->status)->toBe('approved');
});

/*
|--------------------------------------------------------------------------
| 8. Pengaturan Urutan Tampil Tim (ParticipationOrderController)
|--------------------------------------------------------------------------
*/

test('panitia dapat mengelola urutan tampil peserta', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');
    $officialUser = createOfficialUser();

    $level = Level::create(['level_name' => 'SMP Urutan Tampil']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $team1 = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Alpha',
        'pic_name' => 'PIC Alpha',
        'pic_phone_number' => '081234567891',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/p1.jpg',
    ]);

    $team2 = Participation::create([
        'public_id' => (string) Str::uuid(),
        'event_id' => $event->event_id,
        'official_team_id' => $officialUser->officialTeam->official_team_id,
        'event_level_id' => $eventLevel->event_level_id,
        'team_name' => 'Tim Beta',
        'pic_name' => 'PIC Beta',
        'pic_phone_number' => '081234567892',
        'status' => 'approved',
        'billed_amount' => 150000,
        'payment_proof_path' => 'payment_proofs/p2.jpg',
    ]);

    // 1. Simpan nomor urut tampil
    $payload = [
        'orders' => [
            [
                'participation_id' => $team1->participation_id,
                'appearance_order' => 2,
            ],
            [
                'participation_id' => $team2->participation_id,
                'appearance_order' => 1,
            ],
        ],
    ];

    $updateOrderResponse = actingAs($committee)->put(route('committee.events.participations.orders.update', [
        'public_id' => $event->public_id,
        'event_level_id' => $eventLevel->event_level_id,
    ]), $payload);

    $updateOrderResponse->assertSessionHasNoErrors();
    $updateOrderResponse->assertRedirect();
    $updateOrderResponse->assertSessionHas('success', 'Nomor urut tampil berhasil diperbarui!');

    $team1->refresh();
    $team2->refresh();
    expect($team1->appearance_order)->toBe(2);
    expect($team2->appearance_order)->toBe(1);

    // 2. Reset nomor urut tampil menjadi kosong (null)
    $resetResponse = actingAs($committee)->delete(route('committee.events.participations.orders.destroy', [
        'public_id' => $event->public_id,
        'event_level_id' => $eventLevel->event_level_id,
    ]));

    $resetResponse->assertRedirect();
    $resetResponse->assertSessionHas('success', 'Nomor urut tampil berhasil di-reset menjadi kosong.');

    $team1->refresh();
    $team2->refresh();
    expect($team1->appearance_order)->toBeNull();
    expect($team2->appearance_order)->toBeNull();
});

test('panitia dapat membuat form penilaian', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');

    $level = Level::create(['level_name' => 'SMP Penilaian']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $masterCategory = MasterScoringCategory::create(['category_name' => 'PBB Utama']);
    $masterCriteria = MasterAssessmentCriteria::create([
        'master_category_id' => $masterCategory->master_category_id,
        'criteria_name' => 'Gerakan Ditempat',
    ]);

    $payload = [
        'master_category_id' => $masterCategory->master_category_id,
        'event_level_ids' => [$eventLevel->event_level_id],
        'criteria' => [
            [
                'master_criteria_id' => $masterCriteria->master_criteria_id,
                'order_index' => 1,
                'rubrics' => [
                    [
                        'category_label' => 'Kerapihan Sikap Sempurna',
                        'category_order' => 1,
                        'scores' => [
                            ['score_value' => 85.5, 'display_order' => 1],
                            ['score_value' => 90.0, 'display_order' => 2],
                        ]
                    ]
                ]
            ]
        ]
    ];

    $response = actingAs($committee)->post(route('committee.events.scoring-categories.store', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('committee.events.scoring-categories.index', ['public_id' => $event->public_id]));
    $response->assertSessionHas('success', 'Form kategori penilaian berhasil dibuat untuk jenjang yang dipilih!');

    $this->assertDatabaseHas('scoring_categories', [
        'event_level_id' => $eventLevel->event_level_id,
        'master_category_id' => $masterCategory->master_category_id,
    ]);

    $scoringCategory = ScoringCategory::where('event_level_id', $eventLevel->event_level_id)->first();

    $this->assertDatabaseHas('assessment_criteria', [
        'scoring_category_id' => $scoringCategory->scoring_category_id,
        'master_criteria_id' => $masterCriteria->master_criteria_id,
    ]);

    $criterion = AssessmentCriteria::where('scoring_category_id', $scoringCategory->scoring_category_id)->first();

    $this->assertDatabaseHas('rubric_categories', [
        'criteria_id' => $criterion->criteria_id,
        'category_label' => 'Kerapihan Sikap Sempurna',
    ]);
});

test('panitia dapat membuat aturan penalti baru', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');

    $masterPenalty = MasterPenalty::create([
        'penalty_name' => 'Kelebihan Waktu Unjuk Tangkas',
    ]);

    $championCategory = ChampionCategory::create([
        'champion_category_name' => 'Juara Umum Utama',
    ]);

    $eventChampionCategory = EventChampionCategory::create([
        'event_id' => $event->event_id,
        'champion_category_id' => $championCategory->champion_category_id,
    ]);

    $payload = [
        'master_penalty_id' => $masterPenalty->master_penalty_id,
        'description' => 'Pengurangan poin tiap detik kelebihan waktu penampilan',
        'penalty_action' => 'deduction',
        'penalty_value' => 5.0,
        'calculation_type' => 'per_second',
        'is_active' => true,
        'event_champion_category_ids' => [$eventChampionCategory->event_champion_category_id],
    ];

    $response = actingAs($committee)->post(route('committee.penalties.store', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Aturan penalti berhasil ditambahkan.');

    $this->assertDatabaseHas('event_penalties', [
        'event_id' => $event->event_id,
        'master_penalty_id' => $masterPenalty->master_penalty_id,
        'penalty_action' => 'deduction',
        'penalty_value' => 5.0,
        'calculation_type' => 'per_second',
    ]);

    $penalty = EventPenalty::where('event_id', $event->event_id)->first();

    $this->assertDatabaseHas('event_penalty_champion_categories', [
        'event_penalty_id' => $penalty->event_penalty_id,
        'event_champion_category_id' => $eventChampionCategory->event_champion_category_id,
    ]);
});

test('panitia dapat menyusun kategori dan daftar penghargaan juara', function () {
    $admin = createAdminUser();
    $event = createEventForTechnicalTest($admin);
    $committee = createCommitteeUserForEvent($event->event_id, 'administration');

    $level = Level::create(['level_name' => 'SMP Juara']);
    $eventLevel = EventLevel::create([
        'event_id' => $event->event_id,
        'level_id' => $level->level_id,
        'registration_fees' => 150000,
        'quota' => 10,
    ]);

    $championCategory = ChampionCategory::create([
        'champion_category_name' => 'Juara PBB Utama',
    ]);

    $champion1 = Champion::create([
        'champion_category_id' => $championCategory->champion_category_id,
        'champion_name' => 'Juara 1 PBB Utama',
    ]);

    $payload = [
        'champion_category_id' => $championCategory->champion_category_id,
        'event_level_ids' => [$eventLevel->event_level_id],
        'champions' => [
            [
                'champion_id' => $champion1->champion_id,
                'rank_position' => 1,
                'prize_money' => 1000000,
                'certificate' => true,
                'prize_descriptions' => 'Trophy + Sertifikat + Uang Pembinaan',
            ]
        ]
    ];

    $response = actingAs($committee)->post(route('committee.champions.store', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Daftar penghargaan berhasil disusun!');

    $this->assertDatabaseHas('event_champion_categories', [
        'event_id' => $event->event_id,
        'champion_category_id' => $championCategory->champion_category_id,
    ]);

    $this->assertDatabaseHas('event_champions', [
        'event_level_id' => $eventLevel->event_level_id,
        'champion_id' => $champion1->champion_id,
        'rank_position' => 1,
        'prize_money' => 1000000,
    ]);
});