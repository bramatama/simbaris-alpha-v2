<?php
namespace App\Providers;
use Illuminate\Support\Facades\URL;

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
        if (env('APP_ENV') !== 'local' || request()->header('x-forwarded-proto') === 'https') {
            URL::forceScheme('https');
        }
        
        $this->configureDefaults();

        // 1. VERIFIKASI EMAIL
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('[SIMBARIS] Konfirmasi Verifikasi Alamat Email')
                ->greeting('Halo, ' . ($notifiable->name ?? 'Pengguna SIMBARIS') . '!')
                ->line('Terima kasih telah mendaftar di SIMBARIS (Sistem Informasi Manajemen Lomba Baris-Berbaris).')
                ->line('Silakan klik tombol di bawah ini untuk memverifikasi alamat email akun Anda dan mengaktifkan akses penuh:')
                ->action('Verifikasi Email Sekarang', $url)
                ->line('Jika Anda merasa tidak pernah melakukan pendaftaran akun di SIMBARIS, silakan abaikan pesan email ini.')
                ->salutation("Salam hangat,\nTim Pengembang SIMBARIS");
        });

        // 2. RESET PASSWORD
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));
            
            $expireInMinutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

            return (new MailMessage)
                ->subject('[SIMBARIS] Permintaan Reset Kata Sandi Akun')
                ->greeting('Halo, ' . ($notifiable->name ?? 'Pengguna SIMBARIS') . '!')
                ->line('Kami menerima permintaan untuk melakukan reset kata sandi akun SIMBARIS Anda.')
                ->line('Silakan klik tombol di bawah ini untuk membuat kata sandi baru:')
                ->action('Reset Kata Sandi', $url)
                ->line('Tautan reset kata sandi ini akan kedaluwarsa secara otomatis dalam ' . $expireInMinutes . ' menit.')
                ->line('Jika Anda tidak merasa mengajukan permintaan reset kata sandi, abaikan email ini dan kata sandi Anda akan tetap aman.')
                ->salutation("Salam hormat,\nTim Pengembang SIMBARIS");
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
