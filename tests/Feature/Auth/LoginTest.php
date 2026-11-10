<?php
use App\Models\User;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

dataset('user_roles', [
    ['admin', 'dashboards/Index'],
    ['judge', 'dashboards/Index'],
    ['committee', 'dashboards/Index'],
    ['official_team', 'dashboards/Index'],
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