<?php

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Fortify\Features;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertAuthenticated;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\post;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

if (!function_exists('createAdminUser')) {
    function createAdminUser(): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'email_verified_at' => now(),
            'name' => 'Admin Utama',
            'email' => 'admin.event.' . Str::random(5) . '@simbaris.com',
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

if (!function_exists('createCommitteeUser')) {
    function createCommitteeUser(int $eventId, string $position = 'administration'): User {
        $userId = DB::table('users')->insertGetId([
            'public_id' => (string) Str::uuid(),
            'name' => 'Panitia Acara',
            'email' => 'committee.' . Str::random(5) . '@simbaris.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'role' => 'committee',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $committeeId = DB::table('committees')->insertGetId([
            'user_id' => $userId,
            'department' => 'Seksi Acara',
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
| Autentikasi & Dashboard
|--------------------------------------------------------------------------
*/

test('melakukan autentikasi melalui halaman login', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('semua role dapat mengakses dashboard', function (string $role) {
    $user = User::factory()->create([
        'role' => $role,
    ]);

    $response = actingAs($user)->get('/dashboard');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboards/Index'));
})->with([
    'admin',
    'judge',
    'committee',
    'official_team',
]);

/*
|--------------------------------------------------------------------------
| Pengaturan Ulang Kata Sandi
|--------------------------------------------------------------------------
*/

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('tautan pengaturan ulang kata sandi dapat diminta', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('halaman pengaturan ulang kata sandi dapat ditampilkan', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get(route('password.reset', $notification->token));

        $response->assertOk();

        return true;
    });
});

test('kata sandi dapat diatur ulang menggunakan token yang valid', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post(route('password.update'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

/*
|--------------------------------------------------------------------------
| Profil Pengguna
|--------------------------------------------------------------------------
*/

test('pengguna dapat memperbarui informasi dasar', function () {
    $user = User::factory()->create([
        'name' => 'Nama Lama',
    ]);

    $response = actingAs($user)->patch(route('profile.update'), [
        'name' => 'Nama Baru',
        'email' => $user->email,
    ]);

    $response->assertRedirect(route('profile.edit'));

    $response->assertSessionHas(
        'success',
        'Profile updated successfully.'
    );

    $this->assertDatabaseHas('users', [
        'user_id' => $user->user_id,
        'name' => 'Nama Baru',
    ]);
});

test('pengguna dapat mengunggah foto profil baru', function () {
    Storage::fake('public');
    
    $user = User::factory()->create([
        'profile_picture_path' => 'profile_photos/foto-lama.jpg'
    ]);
    Storage::disk('public')->put('profile_photos/foto-lama.jpg', 'isi foto lama');

    $tempPath = 'temp/foto-baru.jpg';
    Storage::disk('public')->put($tempPath, 'isi foto baru dari temp');

    $response = actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $user->email,
        'temp_photo_path' => $tempPath,
    ]);

    $response->assertRedirect(route('profile.edit'));

    Storage::disk('public')->assertMissing('profile_photos/foto-lama.jpg');
    
    $user->refresh();
    Storage::disk('public')->assertExists($user->profile_picture_path);
    Storage::disk('public')->assertMissing($tempPath);
});

/*
|--------------------------------------------------------------------------
| Registrasi Pengguna
|--------------------------------------------------------------------------
*/

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('pengguna baru dapat melakukan registrasi', function () {
    Illuminate\Support\Facades\Event::fake();

    $response = post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'province' => 'Kaltim',
        'city' => 'Balikpapan',
        'institution' => 'SMP 001',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    Illuminate\Support\Facades\Event::assertDispatched(Registered::class);

    assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'email_verified_at' => null,
    ]);
});

test('pengguna baru secara otomatis mendapatkan role default setelah registrasi', function () {
    Illuminate\Support\Facades\Event::fake();

    $response = post(route('register.store'), [
        'name' => 'Official Tim SMP 001',
        'email' => 'tim.smp001@example.com',
        'province' => 'Kaltim',
        'city' => 'Balikpapan',
        'institution' => 'SMP 001',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'email' => 'tim.smp001@example.com',
        'role' => 'official_team',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin User Management
|--------------------------------------------------------------------------
*/

test('admin dapat melihat daftar user', function () {
    $admin = User::factory()->create(['role' => 'admin', 'user_id' => 1]);
    $otherUser1 = User::factory()->create(['role' => 'judge', 'user_id' => 2, 'name' => 'Juri Satu', 'created_at' => now()->subMinutes(10)]);
    $otherUser2 = User::factory()->create(['role' => 'official_team', 'user_id' => 3, 'name' => 'Peserta Satu','created_at' => now()]);

    $response = actingAs($admin)->get(route('admin.users.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('users/Index')
        ->has('users.data', 2)
        ->where('users.data.0.user_id', $otherUser2->user_id)
    );
});

test('admin dapat menghapus satu user', function () {
    $admin = User::factory()->create(['role' => 'admin', 'user_id' => 10]);
    $targetUser = User::factory()->create(['role' => 'judge', 'user_id' => 20]);

    $responseSelf = actingAs($admin)->delete(route('admin.users.destroy', $admin->user_id));
    $responseSelf->assertRedirect();
    $responseSelf->assertSessionHas('error', 'Anda tidak bisa menghapus akun anda sendiri');

    $responseSuccess = actingAs($admin)->delete(route('admin.users.destroy', $targetUser->user_id));
    $responseSuccess->assertRedirect(route('admin.users.index'));
    $responseSuccess->assertSessionHas('success', 'Pengguna berhasil dihapus');

    assertDatabaseMissing('users', ['user_id' => $targetUser->user_id]);
});

test('admin dapat menghapus banyak user sekaligus (batch delete)', function () {
    $admin = User::factory()->create(['role' => 'admin', 'user_id' => 10]);
    $user1 = User::factory()->create(['user_id' => 11]);
    $user2 = User::factory()->create(['user_id' => 12]);

    $responseBatchFail = actingAs($admin)->deleteJson(route('admin.users.destroyMany'), [
        'user_ids' => [$user1->user_id, $admin->user_id]
    ]);
    
    $responseBatchFail->assertRedirect();
    $responseBatchFail->assertSessionHas('error', 'Anda tidak bisa menghapus akun anda sendiri');

    $responseBatchSuccess = actingAs($admin)->deleteJson(route('admin.users.destroyMany'), [
        'user_ids' => [$user1->user_id, $user2->user_id]
    ]);
    
    $responseBatchSuccess->assertRedirect(route('admin.users.index'));
    $responseBatchSuccess->assertSessionHas('success', 'Pengguna terpilih berhasil dihapus');

    assertDatabaseMissing('users', ['user_id' => $user1->user_id]);
    assertDatabaseMissing('users', ['user_id' => $user2->user_id]);
});

/*
|--------------------------------------------------------------------------
| Verifikasi Email
|--------------------------------------------------------------------------
*/

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::emailVerification());
});

test('notifikasi verifikasi email dikirimkan kepada pengguna', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('home'));

    Notification::assertSentTo($user, VerifyEmail::class);
});

/*
|--------------------------------------------------------------------------
| Event Management (Katalog, Filter, Create, Update, & Destroy)
|--------------------------------------------------------------------------
*/

test('admin dapat melihat seluruh katalog event termasuk status draft', function () {
    $admin = createAdminUser();

    Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Event Draft Lomba',
        'location' => 'Balikpapan',
        'status' => 'draft',
        'registration_start_time' => now(),
        'registration_end_time' => now()->addDays(5),
        'start_time' => now()->addDays(7),
        'end_time' => now()->addDays(8),
        'created_by' => $admin->user_id,
    ]);

    $response = actingAs($admin)->get(route('events.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/event_lists/admin/Index')
        ->has('events', 1)
    );
});

test('official team hanya dapat melihat katalog event yang bukan draft', function () {
    $admin = createAdminUser();
    $official = createOfficialUser();

    Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Event Draft Tersembunyi',
        'location' => 'Balikpapan',
        'status' => 'draft',
        'registration_start_time' => now(),
        'registration_end_time' => now()->addDays(5),
        'start_time' => now()->addDays(7),
        'end_time' => now()->addDays(8),
        'created_by' => $admin->user_id,
    ]);

    Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Event Terbuka Publik',
        'location' => 'Balikpapan',
        'status' => 'registration_open',
        'registration_start_time' => now(),
        'registration_end_time' => now()->addDays(5),
        'start_time' => now()->addDays(7),
        'end_time' => now()->addDays(8),
        'created_by' => $admin->user_id,
    ]);

    $response = actingAs($official)->get(route('events.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('events/event_lists/Index')
        ->has('events', 1)
        ->where('events.0.event_name', 'Event Terbuka Publik')
    );
});

test('admin dapat membuat event baru beserta akun panitia terkait', function () {
    Storage::fake('public');
    $admin = createAdminUser();

    $jpeg1x1 = base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');
    $poster = UploadedFile::fake()->createWithContent('poster.jpg', $jpeg1x1);

    $payload = [
        'event_name' => 'LPBB Gajendra 2026',
        'description' => 'Lomba Peraturan Baris Berbaris Tingkat Regional',
        'location' => 'Indoor Tennis BJBJ Balikpapan',
        'poster_path' => $poster,
        'status' => 'registration_open',
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
        'committees' => [
            [
                'name' => 'Panitia Baru A',
                'email' => 'panitia.a@simbaris.com',
                'department' => 'Seksi Acara',
                'position' => 'administration',
            ]
        ],
    ];

    $response = actingAs($admin)->post(route('admin.events.store'), $payload);

    $response->assertRedirect(route('events.index'));
    $response->assertSessionHas('success', 'Event berhasil dibuat!');

    $this->assertDatabaseHas('events', [
        'event_name' => 'LPBB Gajendra 2026',
        'location' => 'Indoor Tennis BJBJ Balikpapan',
        'status' => 'registration_open',
        'created_by' => $admin->user_id,
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'panitia.a@simbaris.com',
        'role' => 'committee',
    ]);
});

test('admin dapat memperbarui informasi dasar event', function () {
    Storage::fake('public');
    $admin = createAdminUser();

    $event = Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Nama Event Lama',
        'description' => 'Deskripsi Lama',
        'location' => 'Lokasi Lama',
        'status' => 'draft',
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
        'created_by' => $admin->user_id,
    ]);

    $tempPosterPath = 'temp/poster-update.jpg';
    Storage::disk('public')->put($tempPosterPath, 'isi poster temporary');

    $payload = [
        'event_name' => 'Nama Event Perbaruan',
        'description' => 'Deskripsi Perbaruan',
        'location' => 'Lapangan Tennis BJBJ',
        'status' => 'registration_open',
        'temp_poster_path' => $tempPosterPath,
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
    ];

    $response = actingAs($admin)->patch(route('admin.events.update', $event->public_id), $payload);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Detail Event berhasil diperbarui');

    $event->refresh();

    expect($event->event_name)->toBe('Nama Event Perbaruan');
    expect($event->location)->toBe('Lapangan Tennis BJBJ');

    Storage::disk('public')->assertExists($event->poster_path);
    Storage::disk('public')->assertMissing($tempPosterPath);
});

test('panitia dengan posisi administration dapat memperbarui informasi dasar event', function () {
    Storage::fake('public');
    $admin = createAdminUser();

    $event = Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Nama Event Lama',
        'description' => 'Deskripsi Lama',
        'location' => 'Lokasi Lama',
        'status' => 'draft',
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
        'created_by' => $admin->user_id,
    ]);

    $committee = createCommitteeUser($event->event_id, 'administration');

    $payload = [
        'event_name' => 'Nama Event Diubah Panitia',
        'description' => 'Deskripsi Update Panitia',
        'location' => 'Lapangan Tennis BJBJ',
        'status' => 'registration_open',
        'registration_start_time' => '2026-12-01 08:00:00',
        'registration_end_time' => '2026-12-10 23:59:59',
        'start_time' => '2026-12-15 08:00:00',
        'end_time' => '2026-12-17 17:00:00',
    ];

    $response = actingAs($committee)->patch(route('committee.events.update', $event->public_id), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Detail Event berhasil diperbarui');

    $event->refresh();

    expect($event->event_name)->toBe('Nama Event Diubah Panitia');
    expect($event->description)->toBe('Deskripsi Update Panitia');
});

test('admin dapat menghapus event', function () {
    Storage::fake('public');
    $admin = createAdminUser();

    $posterPath = 'event_posters/poster-event-dihapus.jpg';
    Storage::disk('public')->put($posterPath, 'isi poster event');

    $event = Event::create([
        'public_id' => (string) Str::uuid(),
        'event_name' => 'Event Yang Akan Dihapus',
        'location' => 'Balikpapan',
        'poster_path' => $posterPath,
        'status' => 'draft',
        'registration_start_time' => now(),
        'registration_end_time' => now()->addDays(5),
        'start_time' => now()->addDays(7),
        'end_time' => now()->addDays(8),
        'created_by' => $admin->user_id,
    ]);

    $response = actingAs($admin)->delete(route('admin.events.destroy', $event->public_id));

    $response->assertRedirect(route('events.index'));
    $response->assertSessionHas('message', 'Event Berhasil Dihapus.');

    $this->assertDatabaseMissing('events', [
        'event_id' => $event->event_id,
    ]);

    Storage::disk('public')->assertMissing($posterPath);
});