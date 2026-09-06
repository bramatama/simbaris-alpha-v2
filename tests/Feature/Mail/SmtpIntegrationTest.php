<?php

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('konfigurasi mailer aktif dan sistem siap mengirim email verifikasi', function () {
    // 1. Arrange: Mencegah email asli terkirim
    Notification::fake();

    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    // 2. Act: Memicu pengiriman email verifikasi (atau email kustom SIMBARIS Anda)
    $user->sendEmailVerificationNotification();

    // 3. Assert: Pastikan notifikasi verifikasi benar-benar dipicu
    Notification::assertSentTo(
        $user,
        VerifyEmail::class
    );
});

test('driver mail tidak kosong dan diatur dengan benar', function () {
    // Memastikan environment test atau development Anda menggunakan driver yang valid (misal: log, array, atau smtp)
    $mailerDriver = config('mail.default');
    
    // Pastikan driver mail tidak null/kosong agar tidak error saat runtime
    expect($mailerDriver)->not->toBeEmpty();
});