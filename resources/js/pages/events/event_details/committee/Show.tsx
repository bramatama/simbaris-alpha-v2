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

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={` ${event.event_name || 'Event'}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                {/* 1. TOP HEADER NAVIGATION */}
                <div className="mb-2 flex flex-row items-center justify-between gap-4">
                    <Link
                        href={`/my-events`}
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
                        <Card className="grid grid-cols-1 grid-rows-6 gap-6 overflow-hidden border-border/50 p-4 md:p-6 lg:grid-cols-6">
                            {event.poster_path ? (
                                <div className="col-span-2 row-span-6 aspect-3/4 w-full max-w-60 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                    <img
                                        src={'/storage/' + event.poster_path}
                                        alt="Event Poster"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-3/4 w-full max-w-60 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                                    <ImagePlus className="mb-3 h-12 w-12 opacity-40" />
                                    <span className="text-sm font-medium">
                                        Belum ada poster
                                    </span>
                                </div>
                            )}
                            <div className="col-span-4 row-span-2 flex flex-col gap-2">
                                <h1 className="text-2xl font-bold tracking-tight wrap-break-word">
                                    {event.event_name || 'Event'}
                                </h1>
                            </div>

                            <div className="col-span-4 row-span-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Pendaftaran
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {formatDate(
                                            event.registration_start_time,
                                            event.registration_end_time,
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Pelaksanaan
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {formatDate(
                                            event.start_time,
                                            event.end_time,
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Lokasi
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {event.location || '-'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Banknote className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Biaya Pendaftaran
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {(() => {
                                            const levels =
                                                event.event_levels || [];

                                            if (levels.length === 0) {
                                                return 'Gratis';
                                            }

                                            const fees = levels.map(
                                                (level: {
                                                    registration_fees?: number;
                                                }) =>
                                                    level.registration_fees ??
                                                    0,
                                            );

                                            const minFee = Math.min(...fees);
                                            const maxFee = Math.max(...fees);

                                            if (maxFee === 0) {
                                                return 'Gratis';
                                            }

                                            if (minFee === maxFee) {
                                                return `Rp ${minFee.toLocaleString('id-ID')}`;
                                            }

                                            return `${minFee === 0 ? 'Gratis' : `Rp ${minFee.toLocaleString('id-ID')}`} - Rp ${maxFee.toLocaleString('id-ID')}`;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* B. DOKUMEN, JURI & PESERTA TERDAFTAR */}
                        <div className="grid grid-cols-1 gap-5">
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
                                                        {/* Ikon File Besar */}
                                                        <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-500/20">
                                                            <FileText className="h-7 w-7" />
                                                        </div>

                                                        {/* Nama File */}
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

                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <Gavel className="h-4 w-4 text-muted-foreground" />{' '}
                                            Dewan Juri
                                        </CardTitle>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {event.event_judges_count || 0}{' '}
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
                                                (ej: any) => (
                                                    <div
                                                        key={ej.event_judge_id}
                                                        className="flex flex-col justify-center rounded-md border border-border/60 bg-card px-3 py-2 shadow-sm"
                                                    >
                                                        <span className="mb-1.5 line-clamp-1 text-xs font-semibold text-foreground">
                                                            {ej.judge?.user
                                                                ?.name ||
                                                                'Unknown'}
                                                        </span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {ej.expertises?.map(
                                                                (
                                                                    exp: string,
                                                                    idx: number,
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            idx
                                                                        }
                                                                        variant="secondary"
                                                                        className="rounded-sm border-0 bg-primary/10 px-1.5 text-[9px] font-medium text-primary hover:bg-primary/20"
                                                                    >
                                                                        {exp}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed border-border/60 bg-muted/30 text-center">
                                            <p className="text-xs text-muted-foreground">
                                                Belum ada juri yang ditugaskan.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* D. SEKOLAH TERDAFTAR DENGAN FILTER TAB */}
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
                                            <span className="opacity-60">
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
