import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { FileUploader } from '@/components/ui/file-uploader';
import { PageProps } from '@inertiajs/core';

import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ChevronRight,
    Banknote,
    Users,
    CreditCard,
    QrCode,
    Building2,
    Wallet,
    AlertCircle,
    Info,
    ShieldCheck,
    ZoomIn,
    Copy,
    Check,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamForm {
    event_level_id: string;
    team_name: string;
    pic_name: string;
    pic_phone_number: string;
}

export default function OfficialTeamParticipationCreate({
    event,
    eventLevels,
    paymentMethods = [],
}: {
    event: any;
    eventLevels: any[];
    paymentMethods: any[];
}) {
    const { auth, errors: pageErrors } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;

    const [step, setStep] = useState<1 | 2>(1);
    const [isValidating, setIsValidating] = useState(false);

    const formTopRef = useRef<HTMLDivElement>(null);

    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const [forceLeave, setForceLeave] = useState(false);

    // State untuk Pop-up Zoom QRIS & Feedback Copy Rekening
    const [selectedQris, setSelectedQris] = useState<{
        url: string;
        title: string;
    } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        setError,
        isDirty,
    } = useForm({
        teams: [
            {
                event_level_id: '',
                team_name: '',
                pic_name: '',
                pic_phone_number: '',
            },
        ] as TeamForm[],
        temp_payment_proof_path: null as string | null,
    });

    // ==========================================
    // LOGIKA SCROLL TO ERROR (Metode 3)
    // ==========================================
    useEffect(() => {
        if (Object.keys(errors).length > 0 || pageErrors?.error) {
            const errorBanner = document.querySelector('.is-error-banner');
            if (errorBanner) {
                errorBanner.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            } else {
                scrollToError();
            }
        }
    }, [errors, pageErrors]);

    // ==========================================
    // CALCULATIONS & FILTERS
    // ==========================================

    const totalFee = data.teams.reduce((total, team) => {
        const level = eventLevels.find(
            (l) => l.event_level_id.toString() === team.event_level_id,
        );

        return total + (level ? Number(level.registration_fees) : 0);
    }, 0);

    const isValidPhone = (phone: string): boolean => {
        return /^[0-9]{12,15}$/.test(phone);
    };

    const canGoToStep2 = data.teams.every(
        (team) =>
            team.event_level_id &&
            team.team_name.trim() &&
            team.pic_name.trim() &&
            isValidPhone(team.pic_phone_number),
    );

    // Pemisahan Metode Pembayaran (QRIS & Bank Transfer)
    const bankMethods = paymentMethods.filter(
        (method: any) => method.type === 'bank_transfer',
    );

    const qrisMethods = paymentMethods.filter(
        (method: any) => method.type === 'qris',
    );

    // ==========================================
    // HELPERS
    // ==========================================

    const formatCurrency = (value: number) => {
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const scrollToError = () => {
        setTimeout(() => {
            formTopRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 100);
    };

    const handleCopyAccount = (accountNumber: string, index: number) => {
        navigator.clipboard.writeText(accountNumber);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
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

    // ==========================================
    // TEAM FORM
    // ==========================================

    const addTeam = () => {
        setData('teams', [
            ...data.teams,
            {
                event_level_id: '',
                team_name: '',
                pic_name: '',
                pic_phone_number: '',
            },
        ]);
    };

    const removeTeam = (index: number) => {
        const newTeams = data.teams.filter((_, i) => i !== index);
        setData('teams', newTeams);
    };

    const updateTeam = (
        index: number,
        field: keyof TeamForm,
        value: string,
    ) => {
        const newTeams = [...data.teams];

        newTeams[index] = {
            ...newTeams[index],
            [field]: value,
        };

        setData('teams', newTeams);

        clearErrors(`teams.${index}.${field}` as any);
        clearErrors('teams' as any);
    };

    // ==========================================
    // STEP VALIDATION
    // ==========================================

    const handleNextStep = async () => {
        if (!canGoToStep2 || isValidating) return;

        setIsValidating(true);
        clearErrors('teams' as any);

        try {
            await axios.post(
                `/official_team/events/${event.public_id}/check-quota`,
                {
                    teams: data.teams.map((team) => ({
                        event_level_id: team.event_level_id,
                    })),
                },
            );

            setStep(2);

            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        } catch (error: any) {
            if (error.response?.status === 422) {
                setError(
                    'teams' as any,
                    error.response.data.message ||
                        'Sisa kuota tidak mencukupi.',
                );
            } else {
                setError(
                    'teams' as any,
                    'Terjadi kesalahan saat mengecek kuota. Silakan coba lagi.',
                );
            }

            scrollToError();
        } finally {
            setIsValidating(false);
        }
    };

    // ==========================================
    // SUBMISSION
    // ==========================================

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/${userRole}/events/${event.public_id}/participations`, {
            preserveScroll: true,
            onError: () => {
                scrollToError();
            },
        });
    };

    // ==========================================
    // LEAVE PAGE PROTECTION
    // ==========================================

    const confirmLeave = () => {
        setForceLeave(true);
        setShowLeaveDialog(false);

        if (pendingUrl) {
            setTimeout(() => {
                router.visit(pendingUrl);
            }, 0);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        const unsubscribe = router.on('before', (event) => {
            if (event.detail.visit.method.toLowerCase() !== 'get') {
                return;
            }

            if (isDirty && !forceLeave) {
                event.preventDefault();

                const destinationUrl =
                    typeof event.detail.visit.url === 'string'
                        ? event.detail.visit.url
                        : event.detail.visit.url.href;

                setPendingUrl(destinationUrl);
                setShowLeaveDialog(true);
            }
        });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            unsubscribe();
        };
    }, [isDirty, forceLeave]);

    return (
        <AppLayout>
            <Head title={`Daftar Event - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* PAGE HEADER */}
                <div className="space-y-4">
                    <Link
                        href={`/${userRole}/events/${event.public_id}/information`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Informasi Event
                    </Link>

                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Pendaftaran Tim
                        </h1>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Lengkapi informasi tim dan lakukan pembayaran untuk
                            mengikuti{' '}
                            <span className="font-semibold text-foreground">
                                {event.event_name}
                            </span>
                            .
                        </p>
                    </div>
                </div>

                <div ref={formTopRef} className="scroll-mt-24" />

                {/* ERROR BANNER ATAS (Metode 3) */}
                {(Object.keys(errors).length > 0 || pageErrors?.error) && (
                    <div className="is-error-banner flex animate-in items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm duration-300 fade-in slide-in-from-top-2">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-sm font-bold">
                                Pendaftaran Belum Dapat Diproses / Terjadi
                                Kesalahan:
                            </h4>
                            <ul className="list-disc space-y-1 pl-4 text-xs text-destructive/90">
                                {pageErrors?.error && (
                                    <li className="leading-relaxed">
                                        {pageErrors.error as string}
                                    </li>
                                )}
                                {Object.entries(errors).map(
                                    ([key, err], idx) => (
                                        <li
                                            key={idx}
                                            className="leading-relaxed"
                                        >
                                            {err as string}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* STEPPER */}
                <div className="rounded-xl border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                                    step >= 1
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                1
                            </div>

                            <div className="min-w-0">
                                <p
                                    className={`truncate text-sm font-semibold ${
                                        step === 1
                                            ? 'text-primary'
                                            : 'text-foreground'
                                    }`}
                                >
                                    Data Tim
                                </p>
                                <p className="hidden text-xs text-muted-foreground sm:block">
                                    Informasi peserta
                                </p>
                            </div>
                        </div>

                        <div
                            className={`h-0.5 flex-1 rounded-full transition-colors ${
                                step === 2 ? 'bg-primary' : 'bg-border'
                            }`}
                        />

                        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                            <div className="min-w-0 text-right">
                                <p
                                    className={`truncate text-sm font-semibold ${
                                        step === 2
                                            ? 'text-primary'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    Pembayaran
                                </p>
                                <p className="hidden text-xs text-muted-foreground sm:block">
                                    Transfer dan bukti pembayaran
                                </p>
                            </div>

                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                                    step === 2
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                2
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    {/* STEP 1 - TEAM INFORMATION */}
                    {step === 1 && (
                        <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-left-4">
                            <div className="space-y-4">
                                {data.teams.map((team, index) => {
                                    const levelErr = (errors as any)[
                                        `teams.${index}.event_level_id`
                                    ];
                                    const nameErr = (errors as any)[
                                        `teams.${index}.team_name`
                                    ];
                                    const picNameErr = (errors as any)[
                                        `teams.${index}.pic_name`
                                    ];
                                    const picPhoneErr = (errors as any)[
                                        `teams.${index}.pic_phone_number`
                                    ];

                                    return (
                                        <Card
                                            key={index}
                                            className="overflow-hidden border-border/70 shadow-sm"
                                        >
                                            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-muted/20 px-4 py-4 sm:px-6">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Users className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0 space-y-0.5">
                                                        <CardTitle className="text-base">
                                                            Tim {index + 1}
                                                        </CardTitle>

                                                        <CardDescription className="text-xs">
                                                            Informasi tim dan
                                                            penanggung jawab
                                                        </CardDescription>
                                                    </div>
                                                </div>

                                                {index > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            removeTeam(index)
                                                        }
                                                        title="Hapus Tim"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </CardHeader>

                                            <CardContent className="space-y-5 p-4 sm:p-6">
                                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                    {/* JENJANG LOMBA */}
                                                    <div className="space-y-2 md:col-span-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label
                                                                htmlFor={`level-${index}`}
                                                                requirement="required"
                                                            >
                                                                Kategori /
                                                                Jenjang Lomba
                                                            </Label>
                                                            {renderErrorBadge(
                                                                levelErr,
                                                            )}
                                                        </div>

                                                        <Select
                                                            value={
                                                                team.event_level_id
                                                            }
                                                            onValueChange={(
                                                                val,
                                                            ) =>
                                                                updateTeam(
                                                                    index,
                                                                    'event_level_id',
                                                                    val,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                id={`level-${index}`}
                                                                className={`w-full bg-background ${
                                                                    levelErr
                                                                        ? 'border-destructive bg-destructive/5 focus:ring-destructive'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <SelectValue placeholder="Pilih jenjang lomba" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {eventLevels.map(
                                                                    (level) => (
                                                                        <SelectItem
                                                                            key={
                                                                                level.event_level_id
                                                                            }
                                                                            value={level.event_level_id.toString()}
                                                                        >
                                                                            {
                                                                                level
                                                                                    .level
                                                                                    .level_name
                                                                            }{' '}
                                                                            —{' '}
                                                                            {formatCurrency(
                                                                                Number(
                                                                                    level.registration_fees,
                                                                                ),
                                                                            )}{' '}
                                                                            (
                                                                            {level.quota
                                                                                ? `${level.quota} kuota`
                                                                                : 'Tanpa batas kuota'}
                                                                            )
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* NAMA TIM */}
                                                    <div className="space-y-2 md:col-span-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label
                                                                htmlFor={`team_name-${index}`}
                                                                requirement="required"
                                                            >
                                                                Nama Tim /
                                                                Pangkalan
                                                            </Label>
                                                            {renderErrorBadge(
                                                                nameErr,
                                                            )}
                                                        </div>

                                                        <Input
                                                            id={`team_name-${index}`}
                                                            value={
                                                                team.team_name
                                                            }
                                                            onChange={(e) =>
                                                                updateTeam(
                                                                    index,
                                                                    'team_name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Contoh: Pasukan Garuda Muda"
                                                            className={
                                                                nameErr
                                                                    ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                                    : ''
                                                            }
                                                        />
                                                    </div>

                                                    {/* NAMA PIC */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label
                                                                htmlFor={`pic_name-${index}`}
                                                                requirement="required"
                                                            >
                                                                Nama PIC
                                                            </Label>
                                                            {renderErrorBadge(
                                                                picNameErr,
                                                            )}
                                                        </div>

                                                        <Input
                                                            id={`pic_name-${index}`}
                                                            value={
                                                                team.pic_name
                                                            }
                                                            onChange={(e) =>
                                                                updateTeam(
                                                                    index,
                                                                    'pic_name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Nama penanggung jawab"
                                                            className={
                                                                picNameErr
                                                                    ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                                    : ''
                                                            }
                                                        />
                                                    </div>

                                                    {/* NOMOR HP PIC */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label
                                                                htmlFor={`pic_phone-${index}`}
                                                                requirement="required"
                                                            >
                                                                Nomor HP /
                                                                WhatsApp
                                                            </Label>
                                                            {renderErrorBadge(
                                                                picPhoneErr,
                                                            )}
                                                        </div>

                                                        <Input
                                                            id={`pic_phone-${index}`}
                                                            type="tel"
                                                            inputMode="numeric"
                                                            maxLength={15}
                                                            value={
                                                                team.pic_phone_number
                                                            }
                                                            onChange={(e) =>
                                                                updateTeam(
                                                                    index,
                                                                    'pic_phone_number',
                                                                    e.target.value
                                                                        .replace(
                                                                            /\D/g,
                                                                            '',
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            15,
                                                                        ),
                                                                )
                                                            }
                                                            placeholder="081234567890"
                                                            className={
                                                                picPhoneErr
                                                                    ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                                    : ''
                                                            }
                                                        />

                                                        {team.pic_phone_number &&
                                                            !isValidPhone(
                                                                team.pic_phone_number,
                                                            ) && (
                                                                <p className="text-xs text-destructive">
                                                                    Nomor HP
                                                                    harus
                                                                    terdiri dari
                                                                    12–15 digit.
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 gap-2 border-dashed"
                                    onClick={addTeam}
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Tim
                                </Button>

                                <Button
                                    type="button"
                                    className="h-10 gap-2"
                                    onClick={handleNextStep}
                                    disabled={!canGoToStep2 || isValidating}
                                >
                                    {isValidating ? (
                                        <>
                                            <Spinner className="h-4 w-4" />
                                            Memeriksa Kuota...
                                        </>
                                    ) : (
                                        <>
                                            Lanjut Pembayaran
                                            <ChevronRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 - PAYMENT */}
                    {step === 2 && (
                        <div className="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4">
                            {/* Payment Summary */}
                            <Card className="overflow-hidden border-primary/20 shadow-sm">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Banknote className="h-6 w-6" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Total Pembayaran
                                                </p>

                                                <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                                                    {formatCurrency(totalFee)}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {data.teams.length} tim
                                                    terdaftar
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground sm:max-w-xs">
                                            Pastikan pembayaran dilakukan sesuai
                                            nominal total untuk memproses
                                            seluruh pendaftaran tim secara
                                            bersamaan.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Methods Section (Split 2 Columns) */}
                            <Card className="overflow-hidden border-border/70 shadow-sm">
                                <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Wallet className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 space-y-0.5">
                                            <CardTitle className="text-base">
                                                Tujuan Pembayaran
                                            </CardTitle>

                                            <CardDescription>
                                                Pilih scan QRIS atau transfer ke
                                                salah satu rekening resmi
                                                panitia.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6">
                                    {paymentMethods.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                            {/* KOLOM KIRI: QRIS PEMBAYARAN */}
                                            <div className="space-y-4 rounded-xl border bg-muted/10 p-4 sm:p-5">
                                                <div className="flex items-center justify-between border-b pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                                            <QrCode className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-foreground sm:text-base">
                                                            QRIS Pembayaran
                                                        </span>
                                                    </div>
                                                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                                        SCAN ME
                                                    </span>
                                                </div>

                                                {qrisMethods.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        {qrisMethods.map(
                                                            (
                                                                qris: any,
                                                                idx: number,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        qris.payment_method_id ||
                                                                        idx
                                                                    }
                                                                    className="flex flex-col items-center gap-2"
                                                                >
                                                                    <div
                                                                        className="group relative flex aspect-square w-full max-w-50 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-card p-3 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md"
                                                                        onClick={() =>
                                                                            setSelectedQris(
                                                                                {
                                                                                    url: `/storage/${qris.qris_image_path}`,
                                                                                    title: `QRIS Pembayaran #${idx + 1}`,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        {qris.qris_image_path ? (
                                                                            <>
                                                                                <img
                                                                                    src={`/storage/${qris.qris_image_path}`}
                                                                                    alt="QRIS Pembayaran"
                                                                                    className="h-full w-full object-contain"
                                                                                />
                                                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                                                                    <ZoomIn className="h-6 w-6 text-white" />
                                                                                    <span className="mt-1 text-[11px] font-medium text-white">
                                                                                        Klik
                                                                                        Perbesar
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="text-center text-xs text-muted-foreground">
                                                                                Gambar
                                                                                tidak
                                                                                tersedia
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-center text-[11px] text-muted-foreground">
                                                                        Klik
                                                                        gambar
                                                                        untuk
                                                                        perbesar
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                                                        Metode QRIS belum
                                                        tersedia untuk event
                                                        ini.
                                                    </div>
                                                )}
                                            </div>

                                            {/* KOLOM KANAN: LIST REKENING BANK */}
                                            <div className="space-y-4 rounded-xl border bg-muted/10 p-4 sm:p-5">
                                                <div className="flex items-center justify-between border-b pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <Building2 className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-foreground sm:text-base">
                                                            Transfer Bank
                                                        </span>
                                                    </div>
                                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                        {bankMethods.length}{' '}
                                                        Bank
                                                    </span>
                                                </div>

                                                {bankMethods.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {bankMethods.map(
                                                            (
                                                                bank: any,
                                                                idx: number,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        bank.payment_method_id ||
                                                                        idx
                                                                    }
                                                                    className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
                                                                >
                                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <CreditCard className="h-4 w-4 text-primary" />
                                                                            <span className="text-sm font-bold text-foreground">
                                                                                {
                                                                                    bank.bank_name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-7 gap-1 text-xs text-muted-foreground hover:text-primary"
                                                                            onClick={() =>
                                                                                handleCopyAccount(
                                                                                    bank.account_number,
                                                                                    idx,
                                                                                )
                                                                            }
                                                                        >
                                                                            {copiedIndex ===
                                                                            idx ? (
                                                                                <>
                                                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                                                    <span className="font-semibold text-emerald-600">
                                                                                        Tersalin
                                                                                    </span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Copy className="h-3.5 w-3.5" />
                                                                                    <span>
                                                                                        Salin
                                                                                        No.
                                                                                        Rek
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <p className="font-mono text-lg font-bold tracking-wider text-foreground">
                                                                            {
                                                                                bank.account_number
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            A.N:{' '}
                                                                            <strong className="font-medium text-foreground">
                                                                                {
                                                                                    bank.account_holder
                                                                                }
                                                                            </strong>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                                                        Rekening bank transfer
                                                        belum tersedia.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-5 py-10 text-center">
                                            <Wallet className="mb-3 h-9 w-9 text-muted-foreground/50" />

                                            <p className="font-medium">
                                                Belum Ada Metode Pembayaran
                                            </p>

                                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                                Panitia belum mengonfigurasi
                                                rekening atau QRIS pembayaran.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Upload Payment Proof */}
                            <Card className="overflow-hidden border-border/70 shadow-sm">
                                <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Save className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 space-y-0.5">
                                            <CardTitle className="text-base">
                                                Bukti Pembayaran
                                            </CardTitle>

                                            <CardDescription>
                                                Unggah struk transfer atau
                                                tangkapan layar pembayaran.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="min-w-0 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label requirement="required">
                                                    Unggah Bukti Transfer
                                                </Label>
                                                {renderErrorBadge(
                                                    errors.temp_payment_proof_path,
                                                )}
                                            </div>

                                            <FileUploader
                                                variant="image"
                                                endpoint="/upload-temp-file"
                                                maxSizeMB={2}
                                                multiple={false}
                                                onUploadSuccess={(
                                                    _fileId,
                                                    path,
                                                ) => {
                                                    setData(
                                                        'temp_payment_proof_path',
                                                        path,
                                                    );

                                                    clearErrors(
                                                        'temp_payment_proof_path',
                                                    );
                                                }}
                                                onRemove={() => {
                                                    setData(
                                                        'temp_payment_proof_path',
                                                        null,
                                                    );
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-xl border bg-muted/20 p-4">
                                                <div className="mb-3 flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-primary" />

                                                    <h4 className="text-sm font-semibold">
                                                        Panduan Unggah
                                                    </h4>
                                                </div>

                                                <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                        Pastikan nama pengirim
                                                        dan nominal terlihat
                                                        jelas.
                                                    </li>

                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                        Tunggu hingga proses
                                                        unggah selesai.
                                                    </li>

                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                        Format file berupa
                                                        gambar dengan ukuran
                                                        maksimal 2 MB.
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold">
                                                        Pastikan Bukti Valid
                                                    </p>

                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                        Gunakan bukti pembayaran
                                                        yang asli dan dapat
                                                        diverifikasi oleh
                                                        panitia.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col-reverse gap-3 border-t bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full gap-2 sm:w-auto"
                                        onClick={() => {
                                            setStep(1);
                                            window.scrollTo({
                                                top: 0,
                                                behavior: 'smooth',
                                            });
                                        }}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={
                                            !data.temp_payment_proof_path ||
                                            processing
                                        }
                                        className="w-full gap-2 sm:w-auto"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner className="h-4 w-4" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Selesaikan Pendaftaran
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </form>
            </div>

            {/* POP-UP ZOOM QRIS DIALOG */}
            <Dialog
                open={!!selectedQris}
                onOpenChange={(open) => !open && setSelectedQris(null)}
            >
                <DialogContent className="max-w-md sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <QrCode className="h-5 w-5" />
                            {selectedQris?.title || 'Scan QRIS Pembayaran'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-4">
                        {selectedQris && (
                            <img
                                src={selectedQris.url}
                                alt="QRIS Large"
                                className="max-h-[65vh] w-auto rounded-lg border object-contain shadow-md"
                            />
                        )}
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Pindai kode QRIS di atas menggunakan aplikasi
                            e-wallet atau mobile banking Anda.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* LEAVE CONFIRMATION DIALOG */}
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                        </div>

                        <DialogTitle>Tinggalkan Halaman?</DialogTitle>

                        <DialogDescription className="leading-relaxed">
                            Anda memiliki data pendaftaran tim atau bukti
                            pembayaran yang belum disimpan. Jika meninggalkan
                            halaman ini, perubahan tersebut dapat hilang.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLeaveDialog(false)}
                        >
                            Tetap di Halaman
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmLeave}
                        >
                            Ya, Tinggalkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
