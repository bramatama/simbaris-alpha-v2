<?php

use App\Models\User;
use function Pest\Laravel\get;
use function Pest\Laravel\actingAs;

dataset('user_roles', [
    ['admin', 'dashboards/admin'],
    ['judge', 'dashboards/judge'],
    ['committee', 'dashboards/committee'],
    ['official_team', 'dashboards/official_team'],
]);

test('pengguna melihat halaman dashboard yang sesuai dengan rolenya', function (string $role, string $expectedComponent) {
    // 1. Arrange: Buat user dengan role tertentu
    $user = User::factory()->create([
        'role' => $role,
    ]);

    // 2. Act: Akses halaman /dashboard sebagai user tersebut (menggunakan actingAs)
    $response = actingAs($user)->get('/dashboard');

    // 3. Assert: Pastikan status sukses dan komponen Inertia yang dirender benar
    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component($expectedComponent));
})->with('user_roles');

test('pengguna dengan role tidak dikenal mendapat akses ditolak', function () {
    $user = User::factory()->create([
        'role' => 'admin',
    ]);

    $user->role = 'unknown_role';

    $response = actingAs($user)->get('/dashboard');

    $response->assertStatus(403);
});

test('guest dialihkan ke halaman login', function() {
    $response = get('/dashboard');
    $response->assertRedirect('/login');
});