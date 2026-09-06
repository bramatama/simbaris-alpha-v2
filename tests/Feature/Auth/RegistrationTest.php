<?php

use Laravel\Fortify\Features;
use Illuminate\Auth\Events\Registered;
use function Pest\Laravel\get;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertAuthenticated;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    Event::fake();

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
    $response->assertRedirect(route('dashboard', absolute:false));

    Event::assertDispatched(Registered::class);

    assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'email_verified_at' => null,
    ]);
});

test('pengguna baru otomatis mendapatkan role default setelah registrasi', function () {
    Event::fake();

    $response = post(route('register.store'), [
        'name' => 'Official Tim SMP 001',
        'email' => 'tim.smp001@example.com',
        'province' => 'Kaltim',
        'city' => 'Balikpapan',
        'institution' => 'SMP 001',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    // 1. Pastikan proses registrasi sukses
    $response->assertRedirect(route('dashboard', absolute:false));
    assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'email' => 'tim.smp001@example.com',
        'role' => 'official_team', 
    ]);
});