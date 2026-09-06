<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertGuest;


uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('pengguna dapat melihat halaman profil', function () {
    $user = User::factory()->create();

    $response = actingAs($user)->get(route('profile.edit'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('settings/profile'));
});

test('pengguna dapat memperbarui informasi dasar tanpa mengubah email dan foto', function () {
    $user = User::factory()->create([
        'name' => 'Nama Lama',
    ]);

    $response = actingAs($user)->patch(route('profile.update'), [
        'name' => 'Nama Baru',
        'email' => $user->email,
    ]);

    $response->assertRedirect(route('profile.edit'));

    $response->assertSessionHas(
        'status',
        'Profile updated successfully.'
    );

    $this->assertDatabaseHas('users', [
        'user_id' => $user->user_id,
        'name' => 'Nama Baru',
    ]);
});

test('pengguna dapat mengunggah foto profil baru dan file lama terhapus', function () {
    // 1. Arrange: Siapkan Storage tiruan
    Storage::fake('public');
    
    // Simulasikan user yang sudah punya foto profil
    $user = User::factory()->create([
        'profile_picture_path' => 'profile-photos/foto-lama.jpg'
    ]);
    
    // Buat file lama di storage tiruan agar bisa diuji penghapusannya
    Storage::disk('public')->put('profile-photos/foto-lama.jpg', 'isi file lama');

    // Buat file foto baru palsu
    $newPhoto = UploadedFile::fake()->create(
        'foto-baru.jpg',
        100,
        'image/jpeg'
    );

    // 2. Act: Kirim request update beserta file foto
    $response = actingAs($user)->patchJson(route('profile.update'), [
        'name' => $user->name,
        'email' => $user->email,
        'photo' => $newPhoto,
    ]);

    $response->assertRedirect(route('profile.edit'));

    // 3. Assert: Pastikan foto lama terhapus dari storage
    Storage::disk('public')->assertMissing('profile-photos/foto-lama.jpg');
    
    // 4. Assert: Pastikan foto baru ada di storage
    // Ambil path baru dari database karena namanya di-generate otomatis oleh Laravel
    $user->refresh();
    Storage::disk('public')->assertExists($user->profile_picture_path);
});

test('status verifikasi di-reset jika pengguna mengganti email', function () {
    $user = User::factory()->create([
        'email' => 'lama@example.com',
        'email_verified_at' => now(),
    ]);

    $response = actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => 'baru@example.com',
    ]);

    // Berdasarkan kode Anda, jika email berubah, redirect ke dashboard
    $response->assertRedirect(route('dashboard'));

    // Pastikan email berubah dan status ter-reset
    $this->assertDatabaseHas('users', [
        'user_id' => $user->user_id,
        'email' => 'baru@example.com',
        'email_verified_at' => null, // Ini yang paling penting
    ]);
});

test('pengguna dapat menghapus akunnya sendiri dan foto profilnya ikut terhapus', function () {
    Storage::fake('public');
    
    $user = User::factory()->create([
        'profile_picture_path' => 'profile-photos/foto-untuk-dihapus.jpg'
    ]);
    Storage::disk('public')->put($user->profile_picture_path, 'isi file');

    // Asumsi: ProfileDeleteRequest membutuhkan password untuk keamanan
    $response = actingAs($user)->delete(route('profile.destroy'), [
        'password' => 'password', // Sesuaikan jika validasi request Anda meminta password
    ]);

    $response->assertRedirect('/');
    
    // Pastikan user logout
    assertGuest();

    // Pastikan data hilang dari database
    $this->assertDatabaseMissing('users', [
        'user_id' => $user->user_id,
    ]);

    // Pastikan foto juga terhapus dari disk
    Storage::disk('public')->assertMissing('profile-photos/foto-untuk-dihapus.jpg');
});