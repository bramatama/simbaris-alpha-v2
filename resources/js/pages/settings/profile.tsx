import { Head, useForm, usePage } from '@inertiajs/react';
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
import Alerts from '@/components/alerts';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { Trash2, Camera, Key, ArrowLeftRightIcon } from 'lucide-react'; // Tambahkan icon Camera
import { FormDialog } from '@/components/form-dialog';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Profile Settings', href: '#' },
];

export default function ProfileEdit({ user, status }: ProfilePageProps) {

    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [showAlert, setShowAlert] = useState(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profileForm = useForm({
        name: user.name,
        contact_info: user.contact_info || '',
        email: user.email,
        photo: null as File | null,
        _method: 'PATCH',
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('photo', file);
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
            }
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowAlert(true);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setPhotoPreview(null);
            },
        });
    };

    const submitTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        transferForm.patch('/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setIsTransferOpen(false);
                if (localStorage.getItem('last_login_email')) {
                    localStorage.setItem(
                        'last_login_email',
                        transferForm.data.email,
                    );
                }
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
                setShowAlert(true);
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
            },
            onError: () => {
                document.getElementById('password')?.focus();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />

            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Profile Settings
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage your account information and ownership settings.
                    </p>
                </div>

                <div className="w-full space-y-8 pb-10">
                    {showAlert && status && (
                        <Alerts
                            variant="success"
                            title={status}
                            onClose={() => setShowAlert(false)}
                            className="fixed top-4 right-4 z-50 max-w-sm pr-12 shadow-lg md:max-w-md"
                        ></Alerts>
                    )}

                    {/* KARTU 1: PROFIL DASAR */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Update your account's profile picture, display
                                name, and contact details.
                            </CardDescription>
                        </CardHeader>

                        {/* PERUBAHAN ADA DI SINI: Flexbox untuk memisahkan kiri dan kanan */}
                        <CardContent className="flex flex-col gap-8 lg:flex-row">
                            {/* BAGIAN KIRI: Foto Profil */}
                            <div className="flex flex-col items-center gap-4 sm:pt-2">
                                {/* Lingkaran Foto */}
                                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary/10 shadow-sm lg:h-80 lg:w-80">
                                    {photoPreview ? (
                                        // 1. Tampilkan preview jika user baru memilih foto
                                        <img
                                            src={photoPreview}
                                            className="h-full w-full object-cover"
                                            alt="Preview"
                                        />
                                    ) : user.profile_picture_path ? (
                                        // 2. Tampilkan foto dari database (Storage) jika ada
                                        <img
                                            src={`/storage/${user.profile_picture_path}`}
                                            className="h-full w-full object-cover"
                                            alt={user.name}
                                        />
                                    ) : (
                                        // 3. Fallback: Huruf inisial nama
                                        <span className="text-5xl font-semibold text-primary">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    accept="image/*"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Camera className="h-4 w-4" />
                                    {photoPreview
                                        ? 'Photo Selected'
                                        : 'Change Photo'}
                                </Button>
                                <InputError
                                    message={profileForm.errors.photo}
                                />
                            </div>

                            {/* BAGIAN KANAN: Form Input */}
                            <div className="flex-1">
                                <form
                                    onSubmit={submitProfile}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2 lg:max-w-md">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={profileForm.data.name}
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="name"
                                        />
                                        <InputError
                                            message={profileForm.errors.name}
                                        />
                                    </div>

                                    <div className="space-y-2 lg:max-w-md">
                                        <Label htmlFor="contact_info">
                                            Contact Information
                                        </Label>
                                        <Input
                                            id="contact_info"
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
                                        />
                                        <InputError
                                            message={
                                                profileForm.errors.contact_info
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">
                                            Active Email
                                        </Label>
                                        <div className="w-fit rounded-md bg-muted p-3 px-4 text-sm font-medium">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">
                                            Account Role
                                        </Label>
                                        <div className="w-fit rounded-md bg-muted p-3 px-4 text-sm font-medium capitalize">
                                            {user.role.replace(/_/g, ' ')}
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
                                            Save Profile
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KARTU 2: DANGER ZONE */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-500">
                            Danger Zone
                        </h3>
                        <div className="divide-y divide-red-100 overflow-hidden rounded-lg border border-red-200 dark:divide-red-900/50 dark:border-red-900/50">
                            {/* Ganti Password */}
                            <div className="flex flex-col justify-between gap-4 bg-white p-4 sm:flex-row sm:items-center dark:bg-transparent">
                                <div>
                                    <h4 className="text-sm font-semibold">
                                        Change password
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Update your password to keep your
                                        account secure.
                                    </p>
                                </div>
                                <FormDialog
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="border-red-200 whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/80 dark:text-red-500 dark:hover:bg-red-950/50"
                                        >
                                            <Key className="h-4 w-4" />
                                            Change password
                                        </Button>
                                    }
                                    open={isPasswordOpen}
                                    onOpenChange={(open) => {
                                        setIsPasswordOpen(open);
                                        if (!open) passwordForm.reset();
                                        passwordForm.clearErrors();
                                    }}
                                    onSubmit={submitPassword}
                                    title="Update Password"
                                    description="Ensure your account is using a long, random password to stay secure."
                                    submitText="Save Password"
                                    isProcessing={passwordForm.processing}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">
                                            Current Password
                                        </Label>
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
                                        />
                                        <InputError
                                            message={
                                                passwordForm.errors
                                                    .current_password
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_new">
                                            New Password
                                        </Label>
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
                                        />
                                        <InputError
                                            message={
                                                passwordForm.errors.password
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm New Password
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
                                        Transfer ownership
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Transfer this account to another user.
                                        You will be locked out until they
                                        verify.
                                    </p>
                                </div>
                                <FormDialog
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="border-red-200 whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/80 dark:text-red-500 dark:hover:bg-red-950/50"
                                        >
                                            <ArrowLeftRightIcon className="h-4 w-4" />
                                            Transfer account
                                        </Button>
                                    }
                                    open={isTransferOpen}
                                    onOpenChange={setIsTransferOpen}
                                    onSubmit={submitTransfer}
                                    title="Transfer Account Ownership"
                                    description="Enter the email address of the new owner. They will receive a verification link."
                                    submitText="Confirm Transfer"
                                    submitVariant="destructive"
                                    isProcessing={transferForm.processing}
                                    isDisabled={
                                        transferForm.data.email === user.email
                                    }
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="transfer_email">
                                            New Owner's Email
                                        </Label>
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
                                            placeholder="new.owner@example.com"
                                            required
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
                                        Delete this account
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Once you delete an account, there is no
                                        going back. Please be certain.
                                    </p>
                                </div>
                                <FormDialog
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-red-200 whitespace-nowrap text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/80 dark:text-red-500 dark:hover:bg-red-950/50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete account
                                        </Button>
                                    }
                                    open={isDeleteOpen}
                                    onOpenChange={(open) => {
                                        setIsDeleteOpen(open);
                                        if (!open) deleteForm.reset();
                                    }}
                                    onSubmit={submitDelete}
                                    title="Are you absolutely sure?"
                                    titleClass="text-red-600"
                                    description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
                                    submitText="Delete Account"
                                    submitVariant="destructive"
                                    isProcessing={deleteForm.processing}
                                    isDisabled={!deleteForm.data.password}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Confirm Password
                                        </Label>
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
                                            placeholder="Enter your password"
                                            required
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
