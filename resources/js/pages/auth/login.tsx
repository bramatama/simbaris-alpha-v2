import { Form, Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store as registerStore } from '@/routes/register';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { ArrowLeft } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    remember: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
    remember,
}: Props) {
    const [email, setEmail] = useState('');
    const [isRemembered, setIsRemembered] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('last_login_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    const handleSaveEmailToLocal = () => {
        if (isRemembered) {
            localStorage.setItem('last_login_email', email);
        } else {
            localStorage.removeItem('last_login_email');
        }
    };

    return (
        <AuthLayout
            title="Masuk ke Akun Anda"
            description="Masukkan email dan password untuk masuk ke akun Anda"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <InputError
                                    className="flex  justify-center"
                                    message={errors.email}
                                />
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Lupa Password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    value="true"
                                    checked={isRemembered}
                                    onCheckedChange={(checked) =>
                                        setIsRemembered(checked === true)
                                    }
                                />
                                <Label htmlFor="remember">Ingat saya!</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                onClick={handleSaveEmailToLocal}
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Belum terdaftar?{' '}
                                <TextLink
                                    href={registerStore.url()}
                                    tabIndex={5}
                                >
                                    Daftar disini
                                </TextLink>
                            </div>
                        )}
                        <div className="mt-2 flex justify-center">
                            <Link
                                href="/"
                                className="group flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
