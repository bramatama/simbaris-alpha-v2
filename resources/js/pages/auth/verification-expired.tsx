import { Form, Head } from '@inertiajs/react';
import { ClockAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login, logout } from '@/routes';
import { send } from '@/routes/verification';

interface VerificationExpiredProps {
    isAuthenticated: boolean;
    userEmail?: string | null;
    status?: string;
}

export default function VerificationExpired({
    isAuthenticated,
    userEmail,
    status,
}: VerificationExpiredProps) {
    // Mulai dari 0 agar pengguna bisa langsung meminta link baru saat pertama kali membuka halaman expired
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <AuthLayout
            title="Tautan Verifikasi Kedaluwarsa"
            description={
                isAuthenticated && userEmail
                    ? `Tautan verifikasi untuk ${userEmail} sudah tidak berlaku karena melewati batas waktu 60 menit.`
                    : 'Tautan verifikasi email ini sudah tidak berlaku karena telah melewati batas waktu 60 menit atau sudah digunakan sebelumnya.'
            }
            className="max-w-md"
        >
            <Head title="Tautan Verifikasi Kedaluwarsa" />

            <div className="space-y-6 text-center">
                <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <ClockAlert className="h-5 w-5" />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Demi keamanan akun Anda, setiap tautan verifikasi hanya
                        berlaku selama{' '}
                        <strong className="font-semibold text-foreground">
                            60 menit
                        </strong>
                        . Silakan minta tautan baru di bawah ini.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="text-center text-sm font-medium text-blue-500">
                        Link verifikasi baru telah dikirim
                    </div>
                )}

                {isAuthenticated ? (
                    <Form
                        {...send.form()}
                        onSuccess={() => setCountdown(15)}
                        className="space-y-6 text-center"
                    >
                        {({ processing }) => (
                            <>
                                <Button
                                    type="submit"
                                    disabled={processing || countdown > 0}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    {processing && <Spinner />}
                                    {processing
                                        ? 'Mengirim ulang...'
                                        : countdown > 0
                                          ? `Kirim ulang link verifikasi (${countdown}s)`
                                          : 'Kirim ulang link verifikasi'}
                                </Button>

                                <TextLink
                                    href={logout()}
                                    className="mx-auto block text-sm"
                                >
                                    Log out
                                </TextLink>
                            </>
                        )}
                    </Form>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Sesi login Anda tidak ditemukan di peramban ini.
                            Silakan masuk kembali untuk meminta tautan
                            verifikasi baru.
                        </p>

                        <Button asChild variant="secondary" className="w-full">
                            <a href={login().url}>Masuk ke Akun</a>
                        </Button>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
