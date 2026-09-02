// Components
import { useEffect, useState } from 'react';
import { Form, Head, usePage } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage().props;

    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <AuthLayout
            title="Verifikasi Email Anda"
            description={`Verifikasi email anda dengan menekan link yang kami kirim ke ${auth?.user?.email}`}
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <>
                    <div className="pb-4 text-center text-sm font-medium text-blue-500">
                        Link verifikasi baru telah dikirim
                    </div>
                </>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            disabled={processing || countdown > 0}
                            variant="secondary"
                            onClick={() => {
                                if (countdown === 0) {
                                    // Gunakan setTimeout agar form sempat melakukan submit (event terpicu)
                                    // sebelum tombol di-disable oleh perubahan state countdown
                                    setTimeout(() => setCountdown(30), 500);
                                }
                            }}
                        >
                            {processing && <Spinner />}
                            {countdown > 0
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
        </AuthLayout>
    );
}
