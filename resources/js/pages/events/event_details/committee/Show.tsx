import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
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
} from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { formatDate } from '@/config/date_datetime';
import { PdfViewerDialog } from '@/components/dialogs/pdf-viewer-dialog';

export default function EventShow({ event }: { event: any }) {
    const { props } = usePage<PageProps>();
    const userRole = props.auth.user.role;

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

    const readinessChecklist = [
        { label: 'Materi penilaian', status: 'ok' },
        {
            label: 'Nomor urut peserta',
            status: 'warning',
            text: 'Belum ada tim yang disetujui',
        },
        {
            label: 'Dewan juri',
            status: 'warning',
            text: 'Tugaskan juri sebelum hari penilaian',
        },
        {
            label: 'Poster event',
            status: 'warning',
            text: 'Poster tampil di halaman publik dan daftar event',
        },
        { label: 'Kontak panitia (WhatsApp)', status: 'ok' },
        { label: 'Kategori penilaian', status: 'ok' },
        { label: 'Kuota per jenjang', status: 'ok' },
        { label: 'Batas pendaftaran', status: 'ok' },
        {
            label: 'Juknis / petunjuk teknis',
            status: 'warning',
            text: 'Diunduh peserta dari halaman publik',
        },
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'registration_open':
                return {
                    color: 'bg-success text-success-foreground',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Pendaftaran Dibuka',
                };
            case 'active':
                return {
                    color: 'bg-info text-info-foreground',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Aktif',
                };
            case 'finished':
                return {
                    color: 'bg-muted text-muted-foreground',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Selesai',
                };
            default:
                return {
                    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
                    icon: <Clock className="h-4 w-4" />,
                    text: 'Menunggu Verifikasi',
                };
        }
    };

    const statusConfig = getStatusConfig(event.status);

    // Dapatkan array ID level yang sah pada event ini untuk menghitung kondisi "Semua Jenjang"
    const totalEventLevels = event.event_levels?.length || 0;

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={` ${event.event_name || 'Event'}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                {/* 1. TOP HEADER NAVIGATION */}
                <div className="mb-2 flex flex-row items-center justify-between gap-4">
                    <Link
                        href={`/${userRole}/my-events`}
                        className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Semua Event
                    </Link>
                    <Link href={`/${userRole}/events/${event.public_id}/edit`}>
                        <Button variant="default" size="sm">
                            <Edit3 className="h-4 w-4" /> Edit Event
                        </Button>
                    </Link>
                </div>

                {/* 2. MAIN LAYOUT GRID */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* KOLOM KIRI (Konten Utama) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* A. KARTU HEADER EVENT */}
                        <Card className="overflow-hidden border-border/50 p-4 md:p-6">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                {/* Poster */}
                                <div className="w-full shrink-0 sm:w-44 lg:w-52">
                                    <div className="aspect-3/4 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                        {event.poster_path ? (
                                            <img
                                                src={`/storage/${event.poster_path}`}
                                                alt={`Poster ${event.event_name || 'event'}`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                                                <ImagePlus className="h-10 w-10 opacity-40" />
                                                <span className="text-sm font-medium">
                                                    Belum ada poster
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Event Information */}
                                <div className="min-w-0 flex-1 space-y-6">
                                    {/* Header */}
                                    <div className="space-y-3">
                                        <div
                                            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}
                                        >
                                            {statusConfig.icon}
                                            {statusConfig.text}
                                        </div>
                                        <h1 className="text-2xl leading-tight font-bold tracking-tight wrap-break-word md:text-3xl">
                                            {event.event_name || 'Event'}
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-5 sm:grid-cols-2">
                                        {/* Registration Period */}
                                        <div className="flex items-start gap-3">
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

                                        {/* Event Period */}
                                        <div className="flex items-start gap-3">
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

                                        {/* Location */}
                                        <div className="flex items-start gap-3">
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

                                        {/* Registration Fee */}
                                        <div className="flex items-start gap-3">
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
                                                        return `${minFee === 0 ? 'Gratis' : `Rp ${minFee.toLocaleString('id-ID')}`} - Rp ${maxFee.toLocaleString('id-ID')}`;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* B. DOKUMEN, JURI & PESERTA TERDAFTAR */}
                        <div className="grid grid-cols-1 gap-5">
                            {/* DOKUMEN JUKNIS */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <FileText className="h-4 w-4 text-muted-foreground" />{' '}
                                            Dokumen Juknis
                                        </CardTitle>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {event.event_documents?.length || 0}{' '}
                                            berkas
                                        </span>
                                    </div>
                                    <Link
                                        href={`/${userRole}/events/${event.public_id}/documents`}
                                        className="flex items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-600"
                                    >
                                        Kelola dokumen{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {event.event_documents &&
                                    event.event_documents.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {event.event_documents.map(
                                                (doc: any) => (
                                                    <div
                                                        key={doc.document_id}
                                                        className="group relative flex flex-col items-center justify-start rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:bg-muted/20"
                                                    >
                                                        <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-500/20">
                                                            <FileText className="h-7 w-7" />
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
                                                                setViewDocument(
                                                                    {
                                                                        name: doc.document_name,
                                                                        url: `/storage/${doc.document_path}`,
                                                                    },
                                                                )
                                                            }
                                                            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-xl bg-background/80 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
                                                        >
                                                            <div className="flex flex-col items-center gap-1.5 text-primary">
                                                                <div className="rounded-full bg-primary/10 p-2 shadow-sm">
                                                                    <Eye className="h-5 w-5" />
                                                                </div>
                                                                <span className="text-[10px] font-bold tracking-wider uppercase">
                                                                    Lihat PDF
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed border-border/60 bg-muted/30 py-6 text-center">
                                            <p className="text-xs text-muted-foreground">
                                                Belum ada dokumen yang diunggah.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* DEWAN JURI */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <Gavel className="h-4 w-4 text-muted-foreground" />{' '}
                                            Dewan Juri
                                        </CardTitle>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {event.event_judges?.length || 0}{' '}
                                            orang
                                        </span>
                                    </div>
                                    <Link
                                        href={`/${userRole}/events/${event.public_id}/judges`}
                                        className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive-foreground"
                                    >
                                        Kelola juri{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    {event.event_judges &&
                                    event.event_judges.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                            {event.event_judges.map(
                                                (ej: any) => {
                                                    // Grouping Category seperti di table juri
                                                    const judgeAssignedMap = (
                                                        ej.expertises || []
                                                    ).reduce(
                                                        (
                                                            acc: any,
                                                            exp: any,
                                                        ) => {
                                                            const catName =
                                                                exp.category_name ||
                                                                'Kategori Lainnya';
                                                            const levelName =
                                                                exp.level_name ||
                                                                'Jenjang Lainnya';
                                                            if (!acc[catName])
                                                                acc[catName] =
                                                                    [];
                                                            acc[catName].push(
                                                                levelName,
                                                            );
                                                            return acc;
                                                        },
                                                        {} as Record<
                                                            string,
                                                            string[]
                                                        >,
                                                    );

                                                    return (
                                                        <div
                                                            key={
                                                                ej.event_judge_id
                                                            }
                                                            className="flex flex-col rounded-md border border-border/60 bg-card px-3 py-2.5 shadow-sm"
                                                        >
                                                            <span className="mb-2 line-clamp-1 text-xs font-bold text-foreground">
                                                                {ej.judge?.user
                                                                    ?.name ||
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
                                                                        Belum
                                                                        ada
                                                                        kategori
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-4 text-center">
                                            <p className="text-xs text-muted-foreground">
                                                Belum ada juri yang ditugaskan.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* PESERTA TERDAFTAR */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between px-4">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />{' '}
                                        Peserta Terdaftar
                                    </CardTitle>
                                    <Link
                                        href={`/${userRole}/events/${event.public_id}/participants`}
                                        className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive-foreground"
                                    >
                                        Kelola peserta{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
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
                                            className={`cursor-pointer rounded-md px-2 py-0.5 text-xs whitespace-nowrap transition-colors ${selectedLevel === 'all' ? 'bg-primary text-primary-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                                        >
                                            Semua{' '}
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
                                                className={`cursor-pointer rounded-md px-2 py-0.5 text-xs whitespace-nowrap transition-colors ${selectedLevel === el.event_level_id ? 'bg-primary text-primary-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                                            >
                                                {el.level?.level_name ||
                                                    `Level ${el.level_id}`}{' '}
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
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                                        <div className="grid grid-cols-2 gap-4 pt-1">
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
                        </div>
                    </div>

                    {/* KOLOM KANAN (Sidebar Informasi) */}
                    <div className="space-y-6 lg:col-span-4">
                        <Card className="sticky top-6 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-5 py-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />{' '}
                                    Kesiapan Event
                                </CardTitle>
                                <span className="text-xs font-semibold text-muted-foreground">
                                    5/9
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="border-b border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground">
                                    4 data belum lengkap — klik untuk
                                    memperbaiki.
                                </div>
                                <div className="flex flex-col">
                                    {readinessChecklist.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex cursor-pointer items-start gap-3 border-b border-border/50 p-3.5 transition-colors last:border-0 hover:bg-muted/30"
                                        >
                                            {item.status === 'ok' ? (
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : (
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                            )}
                                            <div className="flex-1 space-y-1">
                                                <div className="text-xs font-medium text-foreground/90 group-hover:text-foreground">
                                                    {item.label}
                                                </div>
                                                {item.text && (
                                                    <div className="text-[10px] leading-snug text-muted-foreground/80">
                                                        {item.text}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight className="mt-0.5 h-3 w-3 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <PdfViewerDialog
                    document={viewDocument}
                    onClose={() => setViewDocument(null)}
                />
            </div>
        </InnerAppLayout>
    );
}
