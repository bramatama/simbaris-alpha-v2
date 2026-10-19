import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    MapPin,
    ArrowLeft,
    Banknote,
    CheckCircle2,
    AlertTriangle,
    Gavel,
    GraduationCap,
    ImagePlus,
    FileText,
    Eye,
    Clock,
    Users,
    ArrowRight,
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

    const totalQuota = (event.event_levels ?? []).reduce(
        (total: number, level: any) => total + (Number(level.quota) || 0),
        0,
    );

    const registeredCount = event.participations_count || 0;

    const remainingQuota = totalQuota - registeredCount;

    const filteredParticipations =
        selectedLevel === 'all'
            ? event.participations
            : event.participations?.filter(
                  (p: any) => p.event_level_id === selectedLevel,
              );

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
    const totalEventLevels = event.event_levels?.length || 0;

    return (
        <AppLayout>
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
                </div>

                {/* 2. MAIN LAYOUT GRID */}
                <div className="flex flex-col gap-4">
                    {/* A. KARTU HEADER EVENT */}
                    <Card className="overflow-hidden border-border/50 p-4 md:p-6 lg:p-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
                            {/* Poster */}
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
                                            <ImagePlus className="h-10 w-10 opacity-40" />
                                            <span className="text-sm font-medium">
                                                Belum ada poster
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Event Information */}
                            <div className="grid min-w-0 grid-cols-1 content-start gap-6">
                                {/* Header */}
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

                                {/* Event Details */}
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-border/60 pt-5 sm:grid-cols-2">
                                    {/* Registration Period */}
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

                                    {/* Event Period */}
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

                                    {/* Location */}
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

                                    {/* Registration Fee */}
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

                                                    const minFee = Math.min(
                                                        ...fees,
                                                    );
                                                    const maxFee = Math.max(
                                                        ...fees,
                                                    );

                                                    if (maxFee === 0) {
                                                        return 'Gratis';
                                                    }

                                                    if (minFee === maxFee) {
                                                        return `Rp ${minFee.toLocaleString('id-ID')}`;
                                                    }

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

                                {/* Quota & Registration */}
                                <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                    {/* Remaining Quota */}
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Sisa Kuota
                                            </p>

                                            <p className="text-sm font-semibold">
                                                {remainingQuota.toLocaleString(
                                                    'id-ID',
                                                )}
                                                {' / '}
                                                {totalQuota.toLocaleString(
                                                    'id-ID',
                                                )}
                                                {' Tim'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Registration Button */}
                                    <Button
                                        asChild
                                        className="w-full sm:w-auto"
                                        disabled={remainingQuota <= 0}
                                    >
                                        <Link
                                            href={`/${userRole}/events/${event.public_id}/enroll`}
                                        >
                                            {remainingQuota <= 0
                                                ? 'Kuota Penuh'
                                                : 'Daftar Sekarang'}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
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
                                                            setViewDocument({
                                                                name: doc.document_name,
                                                                url: `/storage/${doc.document_path}`,
                                                            })
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
                                        {event.event_judges_count || 0} orang
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {event.event_judges &&
                                event.event_judges.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                        {event.event_judges.map((ej: any) => {
                                            // Grouping Category seperti di table juri
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
                                                    if (!acc[catName])
                                                        acc[catName] = [];
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
                                    <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-4 text-center">
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
                            </CardHeader>

                            <div className="px-4">
                                <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-border/50 pb-2">
                                    <Badge
                                        variant={
                                            selectedLevel === 'all'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() => setSelectedLevel('all')}
                                        className={`cursor-pointer rounded-md px-2 py-0.5 text-xs whitespace-nowrap transition-colors ${selectedLevel === 'all' ? 'bg-primary text-primary-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        Semua{' '}
                                        <span className="opacity-60">
                                            {event.participations_count || 0}
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
                                                {el.participations_count || 0}
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
                                                Belum ada pendaftaran tim yang
                                                disetujui.
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

                <PdfViewerDialog
                    document={viewDocument}
                    onClose={() => setViewDocument(null)}
                />
            </div>
        </AppLayout>
    );
}
