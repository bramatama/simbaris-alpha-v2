<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject(Lang::get('Verifikasi Email Anda'))
                ->greeting(Lang::get('Akun Anda Hampir Siap!'))
                ->line(Lang::get('Tekan tombol di bawah untuk verifikasi alamat email anda'))
                ->action(Lang::get('Verifikasi Email'), $url)
                ->line(Lang::get('Abaikan jika anda tidak melakukan registrasi di layanan kami'));
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));
            
            return (new MailMessage)
                ->subject(Lang::get('Reset Password Akun'))
                ->greeting('Halo ' . $notifiable->name . '!')
                ->line(Lang::get('Tekan tombol di bawah untuk reset password anda'))
                ->action(Lang::get('Reset Password'), $url)
                ->line('Tautan reset password ini akan kedaluwarsa dalam 60 menit.')
                ->line(Lang::get('Abaikan jika anda tidak melakukan permintaan reset password di layanan kami'));
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
