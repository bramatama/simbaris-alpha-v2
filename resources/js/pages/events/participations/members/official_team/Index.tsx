import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { ParticipationLockState } from '@/components/states/participation-lock-state';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Camera,
    ShieldAlert,
    Users,
    UserCheck,
    AlertCircle,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface MemberForm {
    team_member_id: number | null;
    member_name: string;
    member_role: 'commander' | 'member' | 'reserve';
    member_position: string;
    photo: File | null;
    preview_url: string | null;
}

export default function OfficialTeamParticipationMembers({
    event,
    participation,
}: {
    event: any;
    participation: any;
}) {
    const { auth, errors: pageErrors } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;

    const isApproved = participation.status === 'approved';

    let initialMembers: MemberForm[] =
        participation.team_members?.length > 0
            ? participation.team_members.map((m: any) => ({
                  team_member_id: m.team_member_id,
                  member_name: m.member_name,
                  member_role: m.member_role,
                  member_position: m.member_position || '',
                  photo: null,
                  preview_url:
                      m.member_photo_path && m.team_member_id
                          ? route('participation-member-photo.file', {
                                teamMember: m.team_member_id,
                            })
                          : null,
              }))
            : [];

    if (initialMembers.length === 0) {
        initialMembers.push({
            team_member_id: null,
            member_name: '',
            member_role: 'commander',
            member_position: 'Komandan',
            photo: null,
            preview_url: null,
        });
        for (let i = 0; i < 3; i++) {
            initialMembers.push({
                team_member_id: null,
                member_name: '',
                member_role: 'member',
                member_position: '',
                photo: null,
                preview_url: null,
            });
        }
    }

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'post',
        members: initialMembers,
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0 || pageErrors?.error) {
            const errorBanner = document.querySelector('.is-error-banner');
            if (errorBanner) {
                errorBanner.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            } else {
                const firstErrorKey = Object.keys(errors)[0];
                const targetElement =
                    document.getElementById(firstErrorKey) ||
                    document.querySelector(`[name="${firstErrorKey}"]`);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    targetElement.focus?.();
                }
            }
        }
    }, [errors, pageErrors]);

    const commanderCount = data.members.filter(
        (m) => m.member_role === 'commander',
    ).length;

    const addMember = (role: 'commander' | 'member' | 'reserve') => {
        setData('members', [
            ...data.members,
            {
                team_member_id: null,
                member_name: '',
                member_role: role,
                member_position:
                    role === 'commander'
                        ? 'Komandan'
                        : role === 'reserve'
                          ? 'Cadangan'
                          : '',
                photo: null,
                preview_url: null,
            },
        ]);
    };

    const removeMember = (absoluteIndex: number) => {
        const newMembers = [...data.members];
        if (
            newMembers[absoluteIndex].photo &&
            newMembers[absoluteIndex].preview_url
        )
            URL.revokeObjectURL(newMembers[absoluteIndex].preview_url!);
        newMembers.splice(absoluteIndex, 1);
        setData('members', newMembers);
    };

    const updateField = (
        absoluteIndex: number,
        field: keyof MemberForm,
        value: string,
    ) => {
        const newMembers = [...data.members];
        (newMembers[absoluteIndex] as any)[field] = value;
        setData('members', newMembers);
        clearErrors(`members.${absoluteIndex}.${field}` as any);
    };

    const handlePhotoChange = (
        absoluteIndex: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const newMembers = [...data.members];
            if (
                newMembers[absoluteIndex].photo &&
                newMembers[absoluteIndex].preview_url
            )
                URL.revokeObjectURL(newMembers[absoluteIndex].preview_url!);
            newMembers[absoluteIndex].photo = file;
            newMembers[absoluteIndex].preview_url = URL.createObjectURL(file);
            setData('members', newMembers);
            clearErrors(`members.${absoluteIndex}.photo` as any);
        }
    };

    const renderErrorBadge = (errorMsg?: string) => {
        if (!errorMsg) return null;
        return (
            <span
                className="flex animate-in cursor-help items-center gap-1 text-xs font-medium text-destructive duration-200 fade-in"
                title={errorMsg}
            >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Periksa Kolom</span>
            </span>
        );
    };

    const renderMemberCard = (
        member: MemberForm,
        absoluteIndex: number,
        section: string,
    ) => {
        const nameErr = (errors as any)[`members.${absoluteIndex}.member_name`];
        const photoErr = (errors as any)[`members.${absoluteIndex}.photo`];

        return (
            <div
                key={absoluteIndex}
                className={`relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-primary/30 ${
                    nameErr || photoErr
                        ? 'border-destructive/60 bg-destructive/5'
                        : 'border-border/50'
                }`}
            >
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full opacity-70 shadow-sm hover:opacity-100"
                    onClick={() => removeMember(absoluteIndex)}
                    title="Hapus"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col items-center gap-1.5">
                        <input
                            type="file"
                            id={`photo-${absoluteIndex}`}
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                                handlePhotoChange(absoluteIndex, e)
                            }
                        />
                        <Label
                            htmlFor={`photo-${absoluteIndex}`}
                            className={`group relative flex aspect-3/4 w-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                                photoErr
                                    ? 'border-destructive bg-destructive/10'
                                    : 'border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
                            }`}
                        >
                            {member.preview_url ? (
                                <>
                                    <img
                                        src={member.preview_url}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="p-2 text-center">
                                    <Camera className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                                    <span className="block text-[10px] leading-tight font-medium text-muted-foreground">
                                        Upload
                                        <br />
                                        Pasfoto
                                    </span>
                                </div>
                            )}
                        </Label>
                    </div>
                    <div className="w-full min-w-0 space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor={`name-${absoluteIndex}`}
                                    className="text-xs"
                                    requirement="required"
                                >
                                    Nama Lengkap
                                </Label>
                                {renderErrorBadge(nameErr)}
                            </div>
                            <Input
                                id={`name-${absoluteIndex}`}
                                className={`h-9 w-full min-w-0 text-sm ${
                                    nameErr
                                        ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                        : ''
                                }`}
                                placeholder="Masukkan nama lengkap..."
                                value={member.member_name}
                                onChange={(e) =>
                                    updateField(
                                        absoluteIndex,
                                        'member_name',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        {section === 'reserve' ? (
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    Jabatan / Posisi
                                </Label>
                                <Select
                                    value={member.member_position}
                                    onValueChange={(val) =>
                                        updateField(
                                            absoluteIndex,
                                            'member_position',
                                            val,
                                        )
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full min-w-0 text-sm">
                                        <SelectValue placeholder="Pilih jabatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pelatih">
                                            Pelatih (Coach)
                                        </SelectItem>
                                        <SelectItem value="Official">
                                            Official Tim
                                        </SelectItem>
                                        <SelectItem value="Cadangan">
                                            Anggota Cadangan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor={`pos-${absoluteIndex}`}
                                    className="text-xs"
                                >
                                    Keterangan Posisi
                                </Label>
                                <Input
                                    id={`pos-${absoluteIndex}`}
                                    className="h-9 w-full min-w-0 text-sm"
                                    placeholder={
                                        section === 'commander'
                                            ? 'Cth: Danton'
                                            : 'Cth: Banjar 1 Saf 1 (Opsional)'
                                    }
                                    disabled={
                                        member.member_role === 'commander'
                                    }
                                    value={member.member_position}
                                    onChange={(e) =>
                                        updateField(
                                            absoluteIndex,
                                            'member_position',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/members`,
            { preserveScroll: true },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getParticipationInnerNav(
                participation.public_id,
                event.public_id,
            )}
        >
            <Head title={`Manajemen Anggota - ${participation.team_name}`} />
            {!isApproved ? (
                <ParticipationLockState
                    status={participation.status}
                    statusMessage={participation.status_message}
                    eventPublicId={event.public_id}
                    participationPublicId={participation.public_id}
                    userRole={userRole}
                    featureName="Fitur Manajemen Anggota Tim"
                />
            ) : (
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Link
                                href={`/${userRole}/events/${event.public_id}/participations/${participation.public_id}/information`}
                                className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
                                ke Detail
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Manajemen Anggota Tim
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Kelola data Komandan, Pasukan Inti, dan Official
                                untuk <strong>{participation.team_name}</strong>
                                .
                            </p>
                        </div>
                    </div>

                    {/* ERROR BANNER ATAS (Metode 3 - Unique Errors) */}
                    {(Object.keys(errors).length > 0 || pageErrors?.error) && (
                        <div className="is-error-banner flex animate-in items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm duration-300 fade-in slide-in-from-top-2">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <h4 className="text-sm font-bold">
                                    Penyimpanan Data Anggota Gagal:
                                </h4>
                                <ul className="list-disc space-y-1 pl-4 text-xs text-destructive/90">
                                    {pageErrors?.error && (
                                        <li className="leading-relaxed">
                                            {pageErrors.error as string}
                                        </li>
                                    )}

                                    {/* DEDUPLIKASI ERROR MENGGUNAKAN SET */}
                                    {Array.from(
                                        new Set(
                                            Object.values(errors).map(
                                                (err) => err as string,
                                            ),
                                        ),
                                    ).map((errMessage, idx) => (
                                        <li
                                            key={idx}
                                            className="leading-relaxed"
                                        >
                                            {errMessage}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">
                        {/* CARD KOMANDAN PASUKAN */}
                        <Card className="border-t-4 border-border/50 border-t-emerald-500 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-600">
                                            <ShieldAlert className="h-5 w-5" />{' '}
                                            Komandan Pasukan
                                        </CardTitle>
                                        <CardDescription>
                                            Pemimpin utama regu saat berada di
                                            arena lomba.
                                        </CardDescription>
                                    </div>
                                    {commanderCount === 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                addMember('commander')
                                            }
                                            className="gap-1.5"
                                        >
                                            <Plus className="h-3.5 w-3.5" />{' '}
                                            Tambah Komandan
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {data.members.map(
                                        (member, i) =>
                                            member.member_role ===
                                                'commander' &&
                                            renderMemberCard(
                                                member,
                                                i,
                                                'commander',
                                            ),
                                    )}
                                </div>
                                {commanderCount === 0 && (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Belum ada komandan yang ditambahkan.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CARD PASUKAN INTI */}
                        <Card className="border-t-4 border-border/50 border-t-primary shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg text-primary">
                                            <Users className="h-5 w-5" />{' '}
                                            Pasukan Inti
                                        </CardTitle>
                                        <CardDescription>
                                            Anggota pasukan yang akan
                                            bertanding.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        onClick={() => addMember('member')}
                                        className="gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Tambah
                                        Pasukan
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="bg-muted/5 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {data.members.map(
                                        (member, i) =>
                                            member.member_role === 'member' &&
                                            renderMemberCard(
                                                member,
                                                i,
                                                'member',
                                            ),
                                    )}
                                </div>
                                {data.members.filter(
                                    (m) => m.member_role === 'member',
                                ).length === 0 && (
                                    <div className="mt-2 rounded-xl border-2 border-dashed border-border/50 py-12 text-center text-sm text-muted-foreground">
                                        Belum ada data pasukan.
                                        <br />
                                        Klik tombol "Tambah Pasukan" di atas
                                        untuk memulai formasi.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CARD PELATIH & OFFICIAL */}
                        <Card className="border-t-4 border-border/50 border-t-orange-500 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg text-orange-600">
                                            <UserCheck className="h-5 w-5" />{' '}
                                            Pelatih & Official
                                        </CardTitle>
                                        <CardDescription>
                                            Tim pendamping di luar arena dan
                                            pasukan cadangan.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addMember('reserve')}
                                        className="gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Tambah
                                        Official
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {data.members.map(
                                        (member, i) =>
                                            member.member_role === 'reserve' &&
                                            renderMemberCard(
                                                member,
                                                i,
                                                'reserve',
                                            ),
                                    )}
                                </div>
                                {data.members.filter(
                                    (m) => m.member_role === 'reserve',
                                ).length === 0 && (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Belum ada pelatih atau cadangan yang
                                        ditambahkan.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* BARIS TOMBOL STICKY */}
                        <div className="sticky bottom-6 z-20 flex justify-end rounded-xl border border-border/50 bg-background/80 p-4 shadow-lg backdrop-blur-md">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="w-full gap-2 px-8 sm:w-auto"
                            >
                                {processing ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {processing
                                    ? 'Menyimpan Data...'
                                    : 'Simpan Semua Anggota'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </InnerAppLayout>
    );
}
