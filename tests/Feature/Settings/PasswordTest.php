<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\put;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('pengguna dapat memperbarui password-nya dengan benar', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    // Act
    $response = actingAs($user)
        ->from(route('profile.edit'))
        ->put(route('user-password.update'), [
        'current_password' => 'password123',
        'password' => 'passwordBaru!45',
        'password_confirmation' => 'passwordBaru!45',
    ]);

    // Assert: Sukses, redirect ke profile.edit, dan ada pesan status
    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('profile.edit'));
    
    // Ini menyesuaikan dengan baris ->with('status', 'Password updated successfully.')
    $response->assertSessionHas('status', 'Password updated successfully.'); 

    // Assert: Password di database benar-benar berubah
    $user->refresh();
    expect(Hash::check('passwordBaru!45', $user->password))->toBeTrue();
});

test('pembaruan gagal jika password saat ini salah', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = actingAs($user)->from(route('profile.edit'))->put(route('user-password.update'), [
        'current_password' => 'passwordSalah',
        'password' => 'passwordBaru!45',
        'password_confirmation' => 'passwordBaru!45',
    ]);

    $response->assertSessionHasErrors('current_password');
});

test('pembaruan gagal jika konfirmasi password baru tidak cocok', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = actingAs($user)->from(route('profile.edit'))->put(route('user-password.update'), [
        'current_password' => 'password123',
        'password' => 'passwordBaru!45',
        'password_confirmation' => 'salahKetik',
    ]);

    $response->assertSessionHasErrors('password');
});