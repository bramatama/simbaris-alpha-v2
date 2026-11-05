import { Head, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { Trash2, Key, ArrowLeftRightIcon, AlertCircle } from 'lucide-react';
import { FormDialog } from '@/components/dialogs/form-dialog';
import { FileUploader } from '@/components/ui/file-uploader';

interface User {
    user_id: number;
    public_id: string;
    name: string;
    email: string;
    role: 'admin' | 'official_team' | 'judge' | 'committee';
    contact_info?: string;
    profile_picture_path?: string;
}

type ProfilePageProps = {
    user: User;
    status?: string;
};

export default function ProfileEdit({ user }: ProfilePageProps) {
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);

    const profileBannerRef = useRef<HTMLDivElement>(null);

    const getTranslatedRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'official_team':
                return 'Tim Official';
            case 'judge':
                return 'Juri';
            case 'committee':
                return 'Panitia';
            default:
                return role;
        }
    };

    const profileForm = useForm({
        name: user.name,
        contact_info: user.contact_info || '',
        email: user.email,
        temp_photo_path: null as string | null,
    });

    const transferForm = useForm({
        email: user.email,
        name: user.name,
        contact_info: user.contact_info || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({
        password: '',
    });

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setTempPhotoUrl(null);
                profileForm.setData('temp_photo_path', null);
                profileForm.clearErrors();
            },
            onError: (errors) => {
                setTimeout(() => {
                    profileBannerRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 100);

                if (errors.name) {
                    document.getElementById('name')?.focus();
                } else if (errors.contact_info) {
                    document.getElementById('contact_info')?.focus();
                }
            },
        });
    };

    const submitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        transferForm.patch('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setIsTransferOpen(false);
                transferForm.clearErrors();
                if (localStorage.getItem('last_login_email')) {
                    localStorage.setItem(
                        'last_login_email',
                        transferForm.data.email,
                    );
                }
            },
            onError: () => {
                document.getElementById('transfer_email')?.focus();
            },
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => {
                setIsPasswordOpen(false);
                passwordForm.reset();
                passwordForm.clearErrors();
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    document.getElementById('password_new')?.focus();
                }
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    document.getElementById('current_password')?.focus();
                }
            },
        });
    };

    const submitDelete = (e: React.FormEvent) => {
        e.preventDefault();
        deleteForm.delete('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                deleteForm.reset();
                deleteForm.clearErrors();
            },
            onError: () => {
                deleteForm.reset('password');
                document.getElementById('password')?.focus();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Profil" />

            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Pengaturan Profil
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Kelola informasi akun dan pengaturan kepemilikan Anda.
                    </p>
                </div>

                <div className="w-full space-y-8 pb-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>
                                Perbarui foto profil, nama tampilan, dan rincian
                                kontak akun Anda.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-8 lg:flex-row">
                            {/* BAGIAN KIRI: Foto Profil */}
                            <div className="flex w-full flex-col items-center gap-6 sm:pt-2 lg:w-80">
                                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary/10 shadow-sm lg:h-56 lg:w-56">
                                    {tempPhotoUrl ? (
                                        <img
                                            src={tempPhotoUrl}
                                            className="h-full w-full object-cover"
                                            alt="Pratinjau Foto"
                                        />
                                    ) : user.profile_picture_path ? (
                                        <img
                                            src={`/storage/${user.profile_picture_path}`}
                                            className="h-full w-full object-cover"
                                            alt={user.name}
                                        />
                                    ) : (
                                        <span className="text-5xl font-semibold text-primary">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="w-full">
                                    <FileUploader
                                        variant="image"
                                        multiple={false}
                                        maxSizeMB={2}
                                        endpoint="/upload-temp-file"
                                        onUploadSuccess={(
                                            fileId,
                                            responsePath,
                                        ) => {
                                            profileForm.setData(
                                                'temp_photo_path',
                                                responsePath,
                                            );
                                            setTempPhotoUrl(
                                                `/storage/${responsePath}`,
                                            );
                                            profileForm.clearErrors(
                                                'temp_photo_path',
                                            );
                                        }}
                                        onRemove={() => {
                                            profileForm.setData(
                                                'temp_photo_path',
                                                null,
                                            );
                                            setTempPhotoUrl(null);
                                        }}
                                    />
                                    <InputError
                                        message={
                                            profileForm.errors.temp_photo_path
                                        }
                                        className="mt-2 text-center"
                                    />
                                </div>
                            </div>

                            {/* BAGIAN KANAN: Form Input */}
                            <div className="flex-1 space-y-4">
                                {profileForm.hasErrors && (
                                    <div
                                        ref={profileBannerRef}
                                        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive"
                                    >
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                        <div className="space-y-1 text-sm">
                                            <p className="font-semibold">
                                                Gagal memperbarui profil!
                                            </p>
                                            <p className="text-destructive/90">
                                                Mohon periksa kembali formulir
                                                di bawah ini dan perbaiki bidang
                                                yang bermasalah.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form
                                    onSubmit={submitProfile}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2 lg:max-w-md">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                requirement="required"
                                                htmlFor="name"
                                            >
                                                Nama Lengkap
                                            </Label>
                                            {profileForm.errors.name && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {profileForm.errors.name}
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="name"
                                            value={profileForm.data.name}
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            autoComplete="name"
                                            className={
                                                profileForm.errors.name
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2 lg:max-w-md">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                requirement="optional"
                                                htmlFor="contact_info"
                                            >
                                                Informasi Kontak / No. HP
                                            </Label>
                                            {profileForm.errors
                                                .contact_info && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {
                                                        profileForm.errors
                                                            .contact_info
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="contact_info"
                                            type="number"
                                            value={
                                                profileForm.data.contact_info
                                            }
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    'contact_info',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="+62 812 3456 7890"
                                            className={
                                                profileForm.errors.contact_info
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }
                                        />
                                        <InputError
                                            message={
                                                profileForm.errors.contact_info
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">
                                            Email Aktif
                                        </Label>
                                        <div className="w-fit rounded-md bg-muted p-3 px-4 text-sm font-medium">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">
                                            Peran Akun
                                        </Label>
                                        <div className="w-fit rounded-md bg-muted p-3 px-4 text-sm font-medium capitalize">
                                            {getTranslatedRoleLabel(user.role)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 border-t pt-6">
                                        <Button
                                            type="submit"
                                            disabled={profileForm.processing}
                                        >
                                            {profileForm.processing && (
                                                <Spinner className="mr-2 h-4 w-4" />
                                            )}
                                            Simpan Profil
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KARTU 2: AREA BAHAYA (DANGER ZONE) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-500">
                            Area Berbahaya
                        </h3>
                        <div className="divide-y divide-red-100 overflow-hidden rounded-lg border border-red-200 dark:divide-red-900/50 dark:border-red-900/50">
                            {/* Ganti Password */}
                            <div className="flex flex-col justify-between gap-4 bg-white p-4 sm:flex-row sm:items-center dark:bg-transparent">
                                <div>
                                    <h4 className="text-sm font-semibold">
                                        Ubah Kata Sandi
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Perbarui kata sandi Anda agar akun tetap
                                        aman.
                                    </p>
                                </div>
                                <FormDialog
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="border-red-200 whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/80 dark:text-red-500 dark:hover:bg-red-950/50"
                                        >
                                            <Key className="h-4 w-4" />
                                            Ubah Kata Sandi
                                        </Button>
                                    }
                                    open={isPasswordOpen}
                                    onOpenChange={(open) => {
                                        setIsPasswordOpen(open);
                                        if (!open) passwordForm.reset();
                                        passwordForm.clearErrors();
                                    }}
                                    onSubmit={submitPassword}
                                    title="Perbarui Kata Sandi"
                                    description="Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman."
                                    submitText="Simpan Kata Sandi"
                                    isProcessing={passwordForm.processing}
                                >
                                    {/* METODE 3 DI DIALOG: BANNER ATAS */}
                                    {passwordForm.hasErrors && (
                                        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            Gagal memperbarui kata sandi.
                                            Periksa kembali bidang di bawah ini.
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="current_password">
                                                Kata Sandi Saat Ini
                                            </Label>
                                            {/* METODE 1: INLINE BADGE */}
                                            {passwordForm.errors
                                                .current_password && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {
                                                        passwordForm.errors
                                                            .current_password
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="current_password"
                                            type="password"
                                            value={
                                                passwordForm.data
                                                    .current_password
                                            }
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'current_password',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className={
                                                passwordForm.errors
                                                    .current_password
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }
                                        />
                                        <InputError
                                            message={
                                                passwordForm.errors
                                                    .current_password
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password_new">
                                                Kata Sandi Baru
                                            </Label>
                                            {/* METODE 1: INLINE BADGE */}
                                            {passwordForm.errors.password && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {
                                                        passwordForm.errors
                                                            .password
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="password_new"
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className={
                                                passwordForm.errors.password
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }
                                        />
                                        <InputError
                                            message={
                                                passwordForm.errors.password
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Konfirmasi Kata Sandi Baru
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={
                                                passwordForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                passwordForm.setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={
                                                passwordForm.errors
                                                    .password_confirmation
                                            }
                                        />
                                    </div>
                                </FormDialog>
                            </div>

                            {/* Transfer Akun */}
                            <div className="flex flex-col justify-between gap-4 bg-white p-4 sm:flex-row sm:items-center dark:bg-transparent">
                                <div>
                                    <h4 className="text-sm font-semibold">
                                        Transfer Kepemilikan Akun
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Alihkan akun ini ke pengguna lain. Anda
                                        tidak akan bisa mengaksesnya hingga
                                        mereka melakukan verifikasi.
                                    </p>
                                </div>
                                <FormDialog
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="border-red-200 whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/80 dark:text-red-500 dark:hover:bg-red-950/50"
                                        >
                                            <ArrowLeftRightIcon className="h-4 w-4" />
                                            Transfer Akun
                                        </Button>
                                    }
                                    open={isTransferOpen}
                                    onOpenChange={(open) => {
                                        setIsTransferOpen(open);
                                        if (!open) transferForm.reset();
                                        transferForm.clearErrors();
                                    }}
                                    onSubmit={submitTransfer}
                                    title="Transfer Kepemilikan Akun"
                                    description="Masukkan alamat email pemilik baru. Mereka akan menerima tautan verifikasi."
                                    submitText="Konfirmasi Transfer"
                                    submitVariant="destructive"
                                    isProcessing={transferForm.processing}
                                    isDisabled={
                                        transferForm.data.email === user.email
                                    }
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="transfer_email">
                                                Email Pemilik Baru
                                            </Label>
                                            {/* METODE 1: INLINE BADGE */}
                                            {transferForm.errors.email && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {transferForm.errors.email}
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="transfer_email"
                                            type="email"
                                            value={transferForm.data.email}
                                            onChange={(e) =>
                                                transferForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="pemilik.baru@example.com"
                                            required
                                            className={
                                                transferForm.errors.email
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }
                                        />
                                        <InputError
                                            message={transferForm.errors.email}
                                        />
                                    </div>
                                </FormDialog>
                            </div>

                            {/* Hapus Akun */}
                            <div className="flex flex-col justify-between gap-4 bg-white p-4 sm:flex-row sm:items-center dark:bg-transparent">
                                <div>
                                    <h4 className="text-sm font-semibold">
                                        Hapus Akun Ini
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Setelah menghapus akun, tindakan ini
                                        tidak dapat dibatalkan. Mohon pastikan
                                        kembali.
                                    </p>
                                </div>
                                <FormDialog
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-red-200 whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/80 dark:text-red-500 dark:hover:bg-red-950/50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus Akun
                                        </Button>
                                    }
                                    open={isDeleteOpen}
                                    onOpenChange={(open) => {
                                        setIsDeleteOpen(open);
                                        if (!open) deleteForm.reset();
                                        deleteForm.clearErrors();
                                    }}
                                    onSubmit={submitDelete}
                                    title="Apakah Anda benar-benar yakin?"
                                    titleClass="text-red-600"
                                    description="Tindakan ini tidak dapat dibatalkan. Akun Anda beserta seluruh datanya akan dihapus secara permanen dari server kami."
                                    submitText="Hapus Akun"
                                    submitVariant="destructive"
                                    isProcessing={deleteForm.processing}
                                    isDisabled={!deleteForm.data.password}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">
                                                Konfirmasi Kata Sandi
                                            </Label>
                                            {/* METODE 1: INLINE BADGE */}
                                            {deleteForm.errors.password && (
                                                <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {deleteForm.errors.password}
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={deleteForm.data.password}
                                            onChange={(e) =>
                                                deleteForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Masukkan kata sandi Anda"
                                            required
                                            className={
                                                deleteForm.errors.password
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }
                                        />
                                        <InputError
                                            message={deleteForm.errors.password}
                                        />
                                    </div>
                                </FormDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
