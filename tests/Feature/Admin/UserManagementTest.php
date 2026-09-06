<?php

use App\Models\User;
use Laravel\Mcp\Enums\Role;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\delete;
use function Pest\Laravel\get;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('admin dapat melihat daftar user dan data sendiri tidak muncul', function () {
    // 1. Arrange: Buat admin yang sedang login dan beberapa user lain
    $admin = User::factory()->create(['role' => 'admin', 'user_id' => 1]);
    $otherUser1 = User::factory()->create(['role' => 'judge', 'user_id' => 2, 'name' => 'Juri Satu', 'created_at' => now()->subMinutes(10)]);
    $otherUser2 = User::factory()->create(['role' => 'official_team', 'user_id' => 3, 'name' => 'Peserta Satu','created_at' => now()]);

    // 2. Act: Akses halaman index sebagai admin
    $response = actingAs($admin)->get(route('admin.users.index'));

    // 3. Assert: Berhasil dan data admin (user yang login) tidak ada dalam daftar
    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/UserManagement/Index')
        ->has('users.data', 2) // Harusnya hanya 2 user lain, admin tidak masuk
        ->where('users.data.0.user_id', $otherUser2->user_id) // Urutan descending berdasarkan created_at
    );
});

dataset('roles',['admin', 'judge', 'official_team', 'committee']);

test('admin dapat memfilter daftar user berdasarkan role', function (string $role) {
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->create(['role' => $role]);

    $response = actingAs($admin)->get(route('admin.users.index', ['role' => $role]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->has('users.data', 1)
        ->where('users.data.0.role', $role)
    );
})->with('roles');

test('admin dapat menghapus satu user tetapi tidak bisa menghapus akun sendiri', function () {
    $admin = User::factory()->create(['role' => 'admin', 'user_id' => 10]);
    $targetUser = User::factory()->create(['role' => 'judge', 'user_id' => 20]);

    // 1. Kasus Gagal: Admin mencoba menghapus akunnya sendiri
    $responseSelf = actingAs($admin)->delete(route('admin.users.destroy', $admin->user_id));
    $responseSelf->assertRedirect();
    $responseSelf->assertSessionHas('error', 'You cannot delete your own account.');

    // 2. Kasus Sukses: Admin menghapus user lain
    $responseSuccess = actingAs($admin)->delete(route('admin.users.destroy', $targetUser->user_id));
    $responseSuccess->assertRedirect(route('admin.users.index'));
    $responseSuccess->assertSessionHas('message', 'User deleted successfully.');

    // Pastikan data benar-benar hilang dari database
    assertDatabaseMissing('users', ['user_id' => $targetUser->user_id]);
});

test('admin dapat menghapus banyak user sekaligus (batch delete) dan gagal jika menyertakan id sendiri', function () {
    $admin = User::factory()->create(['role' => 'admin', 'user_id' => 10]);
    $user1 = User::factory()->create(['user_id' => 11]);
    $user2 = User::factory()->create(['user_id' => 12]);

    // 1. Kasus Gagal (Gunakan deleteJson)
    $responseBatchFail = actingAs($admin)->deleteJson(route('admin.users.destroyMany'), [
        'user_ids' => [$user1->user_id, $admin->user_id]
    ]);
    
    // Middleware error Inertia / web akan merespons dengan JSON atau Redirect
    $responseBatchFail->assertRedirect();
    $responseBatchFail->assertSessionHas('error', 'You cannot delete your own account.');

    // 2. Kasus Sukses (Gunakan deleteJson)
    $responseBatchSuccess = actingAs($admin)->deleteJson(route('admin.users.destroyMany'), [
        'user_ids' => [$user1->user_id, $user2->user_id]
    ]);
    
    $responseBatchSuccess->assertRedirect(route('admin.users.index'));
    $responseBatchSuccess->assertSessionHas('message', 'Selected users deleted successfully.');

    assertDatabaseMissing('users', ['user_id' => $user1->user_id]);
    assertDatabaseMissing('users', ['user_id' => $user2->user_id]);
});