import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import LandingPageLayout from '@/layouts/landing-page-layout';
import {
    getEventInnerNav,
    getMasterDataInnerNav,
} from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    MapPin,
    ArrowLeft,
    Edit3,
    Banknote,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Gavel,
    GraduationCap,
    ImagePlus,
    FileText,
    Eye,
    Clock,
    Users,
    ArrowRight,
    ClipboardList,
    Trophy,
    LogIn,
    Info,
    Phone,
    ImageOff,
} from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { formatDate } from '@/config/date_datetime';
import { PdfViewerDialog } from '@/components/dialogs/pdf-viewer-dialog';

export default function EventShow({
    event,
    myOfficialTeamId,
    readinessChecks = {},
}: {
    event: any;
    myOfficialTeamId?: number;
    readinessChecks?: Record<string, boolean>;
}) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const userRole = user?.role ?? 'guest';
    const committeePosition = user?.committee_position;

    const isGuest = !user;
    const isAuthorized = userRole === 'committee' || userRole === 'admin';

    const hasMyParticipation =
        !isAuthorized &&
        !isGuest &&
        myOfficialTeamId &&
        event.participations?.some(
            (p: any) => p.official_team_id === myOfficialTeamId,
        );

    const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

    const [viewDocument, setViewDocument] = useState<{
        name: string;
        url: string;
    } | null>(null);

    const filteredParticipations =
        selectedLevel === 'all'
            ? event.participations
            : event.participations?.filter(
                  (p: any) => p.event_level_id === selectedLevel,
              );

    const eventLevels = event.event_levels ?? [];

    const hasUnlimitedLevel = eventLevels.some(
        (level: any) => level.quota === null || level.quota === 0,
    );

    const totalQuota = eventLevels.reduce(
        (total: number, level: any) => total + (Number(level.quota) || 0),
        0,
    );

    const registeredCount = event.participations_count || 0;
    const remainingQuota = totalQuota - registeredCount;

    const isQuotaFull = !hasUnlimitedLevel && remainingQuota <= 0;

    const totalEventLevels = event.event_levels?.length || 0;

    const readinessChecklist = [
        {
            label: '1. Dokumen Lomba',
            isOk: !!readinessChecks.has_documents,
            text: readinessChecks.has_documents
                ? 'Dokumen juknis diunggah'
                : 'Belum ada dokumen juknis',
            link: `/${userRole}/events/${event.public_id}/documents`,
        },
        {
            label: '2. Manajemen Jenjang',
            isOk: !!readinessChecks.has_levels,
            text: readinessChecks.has_levels
                ? 'Kuota & biaya jenjang telah diatur'
                : 'Atur kuota dan biaya tiap jenjang',
            link: `/${userRole}/events/${event.public_id}/levels`,
        },
        {
            label: '3. Formulir Penilaian',
            isOk: !!readinessChecks.has_scoring_categories,
            text: readinessChecks.has_scoring_categories
                ? 'Rubrik & kriteria telah disusun'
                : 'Formulir penilaian belum lengkap',
            link: `/${userRole}/events/${event.public_id}/scoring-categories`,
        },
        {
            label: '4. Dewan Juri',
            isOk: !!readinessChecks.has_judges,
            text: readinessChecks.has_judges
                ? 'Dewan juri telah ditugaskan'
                : 'Tugaskan dewan juri & keahliannya',
            link: `/${userRole}/events/${event.public_id}/judges`,
        },
        {
            label: '5. Kategori Juara',
            isOk: !!readinessChecks.has_champion_categories,
            text: readinessChecks.has_champion_categories
                ? 'Daftar juara & piala tersedia'
                : 'Belum membuat kategori juara',
            link: `/${userRole}/events/${event.public_id}/champions`,
        },
        {
            label: '6. Penetapan Penalti',
            isOk: !!readinessChecks.has_penalties,
            text: readinessChecks.has_penalties
                ? 'Jenis & pengurangan penalti diatur'
                : 'Aturan penalti belum dibuat',
            link: `/${userRole}/events/${event.public_id}/penalties`,
        },
        {
            label: '7. Ketentuan Juara',
            isOk: !!readinessChecks.has_champion_formulas,
            text: readinessChecks.has_champion_formulas
                ? 'Formula bobot juara dikonfigurasi'
                : 'Formula perhitungan juara belum diisi',
            link: `/${userRole}/events/${event.public_id}/formulas`,
        },
        {
            label: '8. Urutan Tampil',
            isOk: !!readinessChecks.has_appearance_orders,
            text: readinessChecks.has_appearance_orders
                ? 'Nomor urut peserta disusun'
                : 'Belum menyusun urutan tampil',
            link: `/${userRole}/events/${event.public_id}/participation-orders`,
        },
    ];

    const completedCount = readinessChecklist.filter(
        (item) => item.isOk,
    ).length;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'registration_open':
                return {
                    color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Pendaftaran Dibuka',
                };

            case 'active':
            case 'ongoing':
                return {
                    color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Aktif / Berlangsung',
                };

            case 'finished':
                return {
                    color: 'bg-muted text-muted-foreground border border-border',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Selesai',
                };

            default:
                return {
                    color: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
                    icon: <Clock className="h-4 w-4" />,
                    text: 'Draft / Menunggu Verifikasi',
                };
        }
    };

    const statusConfig = getStatusConfig(event.status);

    const primaryContact = event.event_committees?.find(
        (ec: any) => ec.committee?.user?.contact_info,
    )?.committee?.user;

    const contactName =
        primaryContact?.name || event.created_by_user?.name || '-';
    const contactInfo = primaryContact?.contact_info || '-';

    const pageContent = (
        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
            <div className="mb-2 flex flex-row items-center justify-between gap-4">
                <Link
                    href={isAuthorized ? `/${userRole}/my-events` : '/events'}
                    className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Semua Event
                </Link>
            </div>

            <div
                className={
                    isAuthorized
                        ? 'grid grid-cols-1 gap-6 lg:grid-cols-12'
                        : 'flex flex-col gap-6'
                }
            >
                <div
                    className={
                        isAuthorized
                            ? 'space-y-6 lg:col-span-8'
                            : 'w-full space-y-6'
                    }
                >
                    {/* INFORMASI UTAMA EVENT */}
                    <Card className="overflow-hidden border-border/50 p-4 md:p-6 lg:p-8">
                        <div
                            className={`grid grid-cols-1 gap-6 ${
                                isAuthorized
                                    ? 'sm:grid-cols-[180px_minmax(0,1fr)]'
                                    : 'md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8'
                            }`}
                        >
                            <div className="mx-auto w-full max-w-64 md:mx-0 md:max-w-none">
                                <div className="aspect-3/4 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                    {event.poster_path ? (
                                        <img
                                            src={`/storage/${event.poster_path}`}
                                            alt={`Poster ${event.event_name || 'event'}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-800 via-slate-900 to-black p-4 text-center">
                                                <div className="pointer-events-none absolute inset-0 opacity-10">
                                                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full border-20 border-white" />
                                                    <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full border-20 border-white" />
                                                    <div className="absolute top-1/2 left-0 h-px w-full bg-white/50" />
                                                </div>

                                                <div className="relative z-10 flex flex-col items-center gap-3">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-lg">
                                                        <ImageOff className="h-6 w-6" />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <span className="block text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">
                                                            Poster Event
                                                        </span>
                                                        <span className="block text-[9px] font-medium text-white/40">
                                                            Belum Tersedia
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid min-w-0 grid-cols-1 content-start gap-6">
                                <div className="space-y-3">
                                    <div
                                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}
                                    >
                                        {statusConfig.icon}
                                        {statusConfig.text}
                                    </div>

                                    <h1 className="text-2xl leading-tight font-bold tracking-tight wrap-break-word md:text-3xl lg:text-4xl">
                                        {event.event_name || 'Event'}
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-border/60 pt-5 sm:grid-cols-2">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Periode Pendaftaran
                                            </p>
                                            <p className="text-sm leading-relaxed font-semibold">
                                                {formatDate(
                                                    event.registration_start_time,
                                                    event.registration_end_time,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Calendar className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Periode Pelaksanaan
                                            </p>
                                            <p className="text-sm leading-relaxed font-semibold">
                                                {formatDate(
                                                    event.start_time,
                                                    event.end_time,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <MapPin className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Lokasi
                                            </p>
                                            <p className="text-sm leading-relaxed font-semibold wrap-break-word">
                                                {event.location || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Banknote className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Biaya Pendaftaran
                                            </p>

                                            <p className="text-sm leading-relaxed font-semibold">
                                                {(() => {
                                                    const levels =
                                                        event.event_levels ||
                                                        [];

                                                    if (levels.length === 0)
                                                        return 'Gratis';

                                                    const fees = levels.map(
                                                        (level: any) =>
                                                            level.registration_fees ??
                                                            0,
                                                    );

                                                    const minFee = Math.min(
                                                        ...fees,
                                                    );

                                                    const maxFee = Math.max(
                                                        ...fees,
                                                    );

                                                    if (maxFee === 0)
                                                        return 'Gratis';

                                                    if (minFee === maxFee)
                                                        return `Rp ${minFee.toLocaleString('id-ID')}`;

                                                    return `${
                                                        minFee === 0
                                                            ? 'Gratis'
                                                            : `Rp ${minFee.toLocaleString('id-ID')}`
                                                    } - Rp ${maxFee.toLocaleString('id-ID')}`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {!isAuthorized && (
                                    <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
                                        {/* GRID 2 KOLOM: Sisa Kuota & Narahubung */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                                    <Phone className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Narahubung / Panitia
                                                    </p>

                                                    <p
                                                        className="line-clamp-1 text-sm font-semibold text-foreground"
                                                        title={`${contactName} (${contactInfo})`}
                                                    >
                                                        {contactName}{' '}
                                                        {contactInfo !==
                                                            '-' && (
                                                            <span className="font-normal text-muted-foreground">
                                                                ({contactInfo})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Users className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Sisa Kuota Pendaftaran
                                                    </p>

                                                    <p className="text-sm font-semibold text-foreground">
                                                        {hasUnlimitedLevel ? (
                                                            <span>
                                                                Tanpa Batas
                                                                Kuota
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {Math.max(
                                                                    0,
                                                                    remainingQuota,
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}{' '}
                                                                /{' '}
                                                                {totalQuota.toLocaleString(
                                                                    'id-ID',
                                                                )}{' '}
                                                                Tim
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tombol Aksi / Pendaftaran */}
                                        <div className="flex w-full flex-col gap-2 sm:flex-row">
                                            {hasMyParticipation && (
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    className="w-full flex-1 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                                                >
                                                    <Link
                                                        href={`/${userRole}/my-participations`}
                                                    >
                                                        <ClipboardList className="mr-2 h-4 w-4" />
                                                        Partisipasi Saya
                                                    </Link>
                                                </Button>
                                            )}

                                            {isGuest ? (
                                                <Button
                                                    asChild
                                                    className="w-full flex-1"
                                                >
                                                    <Link href="/login">
                                                        <LogIn className="mr-2 h-4 w-4" />
                                                        Masuk untuk Mendaftar
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button
                                                    asChild={
                                                        !isQuotaFull &&
                                                        event.status ===
                                                            'registration_open'
                                                    }
                                                    className="w-full flex-1"
                                                    disabled={
                                                        isQuotaFull ||
                                                        event.status !==
                                                            'registration_open'
                                                    }
                                                >
                                                    {isQuotaFull ? (
                                                        <span>Kuota Penuh</span>
                                                    ) : event.status !==
                                                      'registration_open' ? (
                                                        <span>
                                                            Pendaftaran Ditutup
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            href={`/${userRole}/events/${event.public_id}/enroll`}
                                                        >
                                                            Daftar Sekarang
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* DESKRIPSI EVENT */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50 px-4 py-2.5">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                Deskripsi Event
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-5">
                            {event.description ? (
                                <p className="text-xs leading-relaxed whitespace-pre-line text-foreground/90 sm:text-sm">
                                    {event.description}
                                </p>
                            ) : (
                                <div className="rounded-md border border-dashed border-border/60 bg-muted/20 py-6 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        Panitia belum menambahkan deskripsi
                                        untuk event ini.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* DOKUMEN JUKNIS & DEWAN JURI */}
                    <div
                        className={
                            isGuest
                                ? 'grid grid-cols-1 gap-5 lg:grid-cols-2'
                                : 'grid grid-cols-1 gap-5'
                        }
                    >
                        {/* 1. DOKUMEN JUKNIS */}
                        <Card className="flex h-full flex-col border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Dokumen Juknis
                                    </CardTitle>

                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                        {event.event_documents?.length || 0}{' '}
                                        berkas
                                    </span>
                                </div>

                                {isAuthorized && (
                                    <Link
                                        href={`/${userRole}/events/${event.public_id}/documents`}
                                        className="flex items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-600"
                                    >
                                        Kelola dokumen
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                )}
                            </CardHeader>

                            <CardContent className="flex-1 p-4">
                                {event.event_documents &&
                                event.event_documents.length > 0 ? (
                                    <div
                                        className={
                                            isGuest
                                                ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
                                                : 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                                        }
                                    >
                                        {event.event_documents.map(
                                            (doc: any) => (
                                                <div
                                                    key={doc.document_id}
                                                    className="group relative flex flex-col items-center justify-start rounded-xl border border-border/60 bg-card p-3.5 shadow-sm transition-all hover:border-primary/40 hover:bg-muted/20"
                                                >
                                                    <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-500/20">
                                                        <FileText className="h-6 w-6" />
                                                    </div>

                                                    <span
                                                        className="line-clamp-2 w-full text-center text-xs leading-relaxed font-medium text-foreground"
                                                        title={
                                                            doc.document_name
                                                        }
                                                    >
                                                        {doc.document_name}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewDocument({
                                                                name: doc.document_name,
                                                                url: `/storage/${doc.document_path}`,
                                                            })
                                                        }
                                                        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-xl bg-background/80 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
                                                    >
                                                        <div className="flex flex-col items-center gap-1 text-primary">
                                                            <div className="rounded-full bg-primary/10 p-1.5 shadow-sm">
                                                                <Eye className="h-4 w-4" />
                                                            </div>

                                                            <span className="text-[9px] font-bold tracking-wider uppercase">
                                                                PDF
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30 p-4 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Belum ada dokumen yang diunggah.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. DEWAN JURI */}
                        <Card className="flex h-full flex-col border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Gavel className="h-4 w-4 text-muted-foreground" />
                                        Dewan Juri
                                    </CardTitle>

                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                        {event.event_judges_count ||
                                            event.event_judges?.length ||
                                            0}{' '}
                                        orang
                                    </span>
                                </div>

                                {isAuthorized && (
                                    <Link
                                        href={`/${userRole}/events/${event.public_id}/judges`}
                                        className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive-foreground"
                                    >
                                        Kelola juri
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                )}
                            </CardHeader>

                            <CardContent className="flex-1 p-4">
                                {event.event_judges &&
                                event.event_judges.length > 0 ? (
                                    <div
                                        className={
                                            isGuest
                                                ? 'flex flex-col gap-2'
                                                : 'grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2'
                                        }
                                    >
                                        {event.event_judges.map((ej: any) => {
                                            const judgeAssignedMap = (
                                                ej.expertises || []
                                            ).reduce(
                                                (acc: any, exp: any) => {
                                                    const catName =
                                                        exp.category_name ||
                                                        'Kategori Lainnya';

                                                    const levelName =
                                                        exp.level_name ||
                                                        'Jenjang Lainnya';

                                                    if (!acc[catName]) {
                                                        acc[catName] = [];
                                                    }

                                                    acc[catName].push(
                                                        levelName,
                                                    );

                                                    return acc;
                                                },
                                                {} as Record<string, string[]>,
                                            );

                                            return (
                                                <div
                                                    key={ej.event_judge_id}
                                                    className="flex flex-col rounded-md border border-border/60 bg-card px-3 py-2.5 shadow-sm"
                                                >
                                                    <span className="mb-2 line-clamp-1 text-xs font-bold text-foreground">
                                                        {ej.judge?.user?.name ||
                                                            'Unknown'}
                                                    </span>

                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Object.keys(
                                                            judgeAssignedMap,
                                                        ).length > 0 ? (
                                                            Object.entries(
                                                                judgeAssignedMap,
                                                            ).map(
                                                                ([
                                                                    catName,
                                                                    levels,
                                                                ]: any) => {
                                                                    const isSemuaJenjang =
                                                                        levels.length ===
                                                                            totalEventLevels &&
                                                                        totalEventLevels >
                                                                            0;

                                                                    const levelText =
                                                                        isSemuaJenjang
                                                                            ? 'Semua Jenjang'
                                                                            : levels.join(
                                                                                  ', ',
                                                                              );

                                                                    return (
                                                                        <Badge
                                                                            key={
                                                                                catName
                                                                            }
                                                                            variant="secondary"
                                                                            className="rounded-sm border-border/50 bg-muted/40 px-1.5 py-0.5 text-[10px]"
                                                                        >
                                                                            <span className="mr-1 font-bold text-foreground">
                                                                                {
                                                                                    catName
                                                                                }

                                                                                :
                                                                            </span>

                                                                            <span className="font-medium text-muted-foreground">
                                                                                {
                                                                                    levelText
                                                                                }
                                                                            </span>
                                                                        </Badge>
                                                                    );
                                                                },
                                                            )
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground/60 italic">
                                                                Belum ada
                                                                kategori
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30 p-4 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Belum ada juri yang ditugaskan.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. FORMAT PENILAIAN - KHUSUS USER LOGIN */}
                        {!isGuest && (
                            <Card className="flex h-full flex-col border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                            Format Penilaian
                                        </CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex flex-1 flex-col gap-4 p-4">
                                    <div className="flex flex-col items-center text-center">
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            Pilih jenjang perlombaan di bawah
                                            ini untuk melihat rincian parameter
                                            dan format lembar penilaian juri.
                                        </p>
                                    </div>

                                    <div className="flex w-full flex-col gap-2">
                                        {event.event_levels &&
                                        event.event_levels.length > 0 ? (
                                            event.event_levels.map(
                                                (el: any) => (
                                                    <div
                                                        key={el.event_level_id}
                                                        className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-2.5 shadow-sm transition-colors hover:bg-muted/20"
                                                    >
                                                        <span className="text-xs font-bold text-foreground">
                                                            {el.level
                                                                ?.level_name ||
                                                                `Level ${el.level_id}`}
                                                        </span>

                                                        <Link
                                                            href={`/${userRole}/events/${event.public_id}/scoring-categories/levels/${el.event_level_id}/preview`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 gap-1 px-2.5 text-[11px] transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                Lihat
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 p-3 text-center text-xs text-muted-foreground">
                                                Belum ada jenjang perlombaan.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* PESERTA & LEADERBOARD - KHUSUS USER LOGIN */}
                    {!isGuest && (
                        <div className="grid grid-cols-1 gap-5">
                            {/* PESERTA TERDAFTAR */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between px-4">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        Peserta Terdaftar
                                    </CardTitle>

                                    {isAuthorized && (
                                        <Link
                                            href={`/${userRole}/events/${event.public_id}/participants`}
                                            className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive-foreground"
                                        >
                                            Kelola peserta
                                            <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </CardHeader>

                                <div className="px-4">
                                    <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-border/50 pb-2">
                                        <Badge
                                            variant={
                                                selectedLevel === 'all'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setSelectedLevel('all')
                                            }
                                            className={`cursor-pointer rounded-md px-2 py-0.5 text-xs whitespace-nowrap transition-colors ${
                                                selectedLevel === 'all'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border-transparent text-muted-foreground hover:bg-muted/50'
                                            }`}
                                        >
                                            Semua
                                            <span className="ml-1 opacity-60">
                                                {event.participations_count ||
                                                    0}
                                            </span>
                                        </Badge>

                                        {event.event_levels?.map((el: any) => (
                                            <Badge
                                                key={el.event_level_id}
                                                variant={
                                                    selectedLevel ===
                                                    el.event_level_id
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    setSelectedLevel(
                                                        el.event_level_id,
                                                    )
                                                }
                                                className={`cursor-pointer rounded-md px-2 py-0.5 text-xs whitespace-nowrap transition-colors ${
                                                    selectedLevel ===
                                                    el.event_level_id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border-transparent text-muted-foreground hover:bg-muted/50'
                                                }`}
                                            >
                                                {el.level?.level_name ||
                                                    `Level ${el.level_id}`}

                                                <span className="ml-1 opacity-60">
                                                    {el.participations_count ||
                                                        0}
                                                </span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <CardContent>
                                    {filteredParticipations &&
                                    filteredParticipations.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {filteredParticipations.map(
                                                (p: any) => (
                                                    <div
                                                        key={p.participation_id}
                                                        className="flex items-center justify-between rounded-md border border-border/50 bg-card px-3 py-2 shadow-sm transition-colors hover:bg-muted/20"
                                                    >
                                                        <span className="line-clamp-1 text-xs font-medium text-foreground">
                                                            {p.team_name ||
                                                                'Tim Tanpa Nama'}
                                                        </span>

                                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                                            <div className="rounded-md border border-emerald-500/10 bg-emerald-500/5 p-3">
                                                <div className="mb-1.5 flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold tracking-wider text-emerald-600/80 uppercase">
                                                        Disetujui
                                                    </span>
                                                </div>

                                                <p className="text-[11px] leading-tight text-muted-foreground">
                                                    Belum ada pendaftaran tim
                                                    yang disetujui.
                                                </p>
                                            </div>

                                            <div className="rounded-md border border-orange-500/10 bg-orange-500/5 p-3">
                                                <div className="mb-1.5 flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                                                    <span className="text-[10px] font-bold tracking-wider text-orange-600/80 uppercase">
                                                        Menunggu
                                                    </span>
                                                </div>

                                                <p className="text-[11px] leading-tight text-muted-foreground">
                                                    Tidak ada pendaftaran yang
                                                    antre.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* LEADERBOARD */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Trophy className="h-4 w-4 text-amber-500" />
                                        Hasil Perlombaan (Leaderboard)
                                    </CardTitle>

                                    <Link
                                        href={`/${userRole}/events/${event.public_id}/leaderboard`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs"
                                        >
                                            Lihat Papan Peringkat
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </CardHeader>

                                <CardContent className="flex flex-col items-center gap-4 p-5 sm:flex-row">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                        <Trophy className="h-6 w-6" />
                                    </div>

                                    <div className="text-center sm:text-left">
                                        <h4 className="text-sm font-bold text-foreground">
                                            Papan Peringkat & Juara
                                        </h4>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Pantau perolehan nilai murni,
                                            pengurangan penalti, peringkat tim,
                                            dan daftar juara secara transparan
                                            dan real-time.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* SIDEBAR CHECKLIST KESIAPAN EVENT */}
                {isAuthorized && (
                    <div className="space-y-6 lg:col-span-4">
                        <Card className="sticky top-6 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-5 py-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    Kesiapan Event
                                </CardTitle>

                                <span className="text-xs font-bold text-primary">
                                    {completedCount}/8 Selesai
                                </span>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="border-b border-border/50 bg-muted/20 p-3.5 text-xs text-muted-foreground">
                                    {completedCount === 8
                                        ? 'Seluruh persiapan event telah lengkap!'
                                        : `${8 - completedCount} item persiapan masih memerlukan tindakan Anda.`}
                                </div>

                                <div className="flex flex-col divide-y divide-border/40">
                                    {readinessChecklist.map((item, idx) => (
                                        <Link
                                            key={idx}
                                            href={item.link}
                                            className="group flex items-start gap-3 p-3.5 transition-colors hover:bg-muted/30"
                                        >
                                            {item.isOk ? (
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : (
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                            )}

                                            <div className="flex-1 space-y-0.5">
                                                <div className="text-xs font-semibold text-foreground group-hover:text-primary">
                                                    {item.label}
                                                </div>

                                                <div className="text-[11px] leading-snug text-muted-foreground">
                                                    {item.text}
                                                </div>
                                            </div>

                                            <ChevronRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <PdfViewerDialog
                document={viewDocument}
                onClose={() => setViewDocument(null)}
            />
        </div>
    );

    return (
        <>
            <Head title={` ${event.event_name || 'Event'}`} />

            {isGuest ? (
                <LandingPageLayout>{pageContent}</LandingPageLayout>
            ) : isAuthorized ? (
                <InnerAppLayout
                    sidebarNavItems={
                        userRole === 'admin'
                            ? getMasterDataInnerNav()
                            : getEventInnerNav(
                                  event.public_id,
                                  userRole,
                                  committeePosition || undefined,
                              )
                    }
                >
                    {pageContent}
                </InnerAppLayout>
            ) : (
                <AppLayout>{pageContent}</AppLayout>
            )}
        </>
    );
}
