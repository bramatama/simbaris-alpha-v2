
<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('halaman konfirmasi kata sandi dapat ditampilkan', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.confirm'));

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/confirm-password'),
    );
});

test('konfirmasi kata sandi memerlukan autentikasi', function () {
    $response = $this->get(route('password.confirm'));

    $response->assertRedirect(route('login'));
});
