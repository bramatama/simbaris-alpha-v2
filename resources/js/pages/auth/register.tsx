import { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
    const [level, setLevel] = useState('');
    return (
        <AuthLayout
            title="Buat Akun"
            description="Masukkan informasi anda untuk membuat akun"
            className="max-w-4xl"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Satuan</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama Satuan"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="institution">Institusi</Label>
                                <Input
                                    id="institution"
                                    type="text"
                                    required
                                    tabIndex={3}
                                    name="institution"
                                    placeholder="Nama Institusi"
                                />
                                <InputError message={errors.institution} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_info">Kontak (Opsional)</Label>
                                <Input
                                    id="contact_info"
                                    type="text"
                                    tabIndex={3}
                                    name="contact_info"
                                    placeholder="Kontak"
                                />
                                <InputError message={errors.contact_info} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="province">Provinsi</Label>
                                <Input
                                    id="province"
                                    type="text"
                                    required
                                    tabIndex={5}
                                    name="province"
                                    placeholder="Provinsi"
                                />
                                <InputError message={errors.province} />
                            </div>
                            <div className="grid gap-2">
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        required
                                        tabIndex={6}
                                        name="city"
                                        placeholder="Kota"
                                    />
                                    <InputError message={errors.city} />
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4 md:col-span-2">
                                <Separator></Separator>
                                <div className="md:w-1/2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={7}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="md:w-1/2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={8}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Konfirmasi password"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 w-full md:col-span-2"
                                tabIndex={9}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Buat Akun
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={10}>
                                Log in
                            </TextLink>
                        </div>
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
        </AuthLayout>
    );
}
