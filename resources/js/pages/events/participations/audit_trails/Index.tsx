import { Head, Link, usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import {
    getParticipationInnerNav,
    getEventInnerNav,
} from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Clock,
    History,
    Hash,
    UserCircle2,
    FileText,
    Timer,
    Play,
    Square,
    EyeOff,
} from 'lucide-react';
import { formatAuditTime } from '@/config/date_datetime';

interface AuditTrailProps {
    event: {
        public_id: string;
        event_name: string;
        is_result_visible: boolean;
    };
    participation: any;
    session: {
        session_id: number;
        status: 'waiting' | 'ongoing' | 'finished';
        start_time: string | null;
        end_time: string | null;
    } | null;
    auditTrails: any[];
}

export default function ParticipantAuditTrailIndex({
    event,
    participation,
    session,
    auditTrails = [],
}: AuditTrailProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const committeePosition = auth.user.committee_position;
    const isOfficialTeam = userRole === 'official_team';

    const formatOnlyTime = (dateString: string | null) => {
        if (!dateString) return '-';

        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date(dateString));
    };

    const calculateDuration = () => {
        if (!session?.start_time) return '00:00:00';

        const start = new Date(session.start_time).getTime();
        const end = session.end_time
            ? new Date(session.end_time).getTime()
            : new Date().getTime();

        const diff = Math.floor((end - start) / 1000);

        if (diff < 0) return '00:00:00';

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const sidebarNav = isOfficialTeam
        ? getParticipationInnerNav(participation.public_id, event.public_id)
        : getEventInnerNav(
              event.public_id,
              userRole,
              committeePosition || undefined,
          );
    return (
        <InnerAppLayout sidebarNavItems={sidebarNav}>
            <Head title={`Log Penilaian - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-5 border-b border-border/50 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <Link
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.back();
                            }}
                            className="mb-1 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Kembali
                        </Link>

                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                            Log Transparansi & Waktu Penilaian
                        </h1>

                        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Riwayat waktu tampil dan penekanan nilai oleh dewan
                            juri untuk tim{' '}
                            <strong className="text-foreground">
                                {participation.team_name}
                            </strong>
                            .
                        </p>
                    </div>

                    {(!isOfficialTeam || Boolean(event.is_result_visible)) && (
                        <div className="mt-2 flex items-center gap-2 sm:mt-0">
                            <Badge
                                variant="secondary"
                                className="w-full justify-center px-4 py-2 text-sm font-semibold shadow-sm sm:w-auto"
                            >
                                Total Log: {auditTrails.length} Aktivitas
                            </Badge>
                        </div>
                    )}
                </div>

                {/* BLANK STATE */}
                {isOfficialTeam && !event.is_result_visible ? (
                    <Card className="space-y-5 border-dashed border-border/80 bg-muted/10 p-8 text-center shadow-sm sm:p-12">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background">
                            <EyeOff className="h-7 w-7 opacity-60" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">
                                Rekam Jejak Penilaian Belum Dibuka
                            </h3>

                            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                                Log rekam jejak penilaian belum dipublikasikan
                                atau diaktifkan oleh panitia. Silakan periksa
                                kembali nanti.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* RINGKASAN WAKTU */}
                        <Card className="overflow-hidden border-border/60 bg-linear-to-r from-card to-muted/20 shadow-sm">
                            <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-6">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                                    <Timer className="h-5 w-5 text-primary" />
                                    Ringkasan Waktu Penampilan Peserta
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-6">
                                <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12">
                                        <Timer className="h-6 w-6" />
                                    </div>

                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Durasi Tampil
                                        </span>
                                        <span className="font-mono text-xl font-black tracking-tight text-foreground">
                                            {calculateDuration()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 sm:h-12 sm:w-12">
                                        <Play className="h-5 w-5 fill-current" />
                                    </div>

                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Waktu Mulai
                                        </span>
                                        <span className="font-mono text-lg font-bold text-foreground">
                                            {formatOnlyTime(
                                                session?.start_time ?? null,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 sm:h-12 sm:w-12">
                                        <Square className="h-5 w-5 fill-current" />
                                    </div>

                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Waktu Selesai
                                        </span>
                                        <span className="font-mono text-lg font-bold text-foreground">
                                            {formatOnlyTime(
                                                session?.end_time ?? null,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AUDIT TRAIL */}
                        <Card className="overflow-hidden border-border/60 shadow-sm">
                            <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/50 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:px-5 sm:py-5">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
                                        <History className="h-5 w-5 text-muted-foreground" />
                                        Rekam Jejak Input Juri
                                    </CardTitle>

                                    <CardDescription className="text-xs leading-relaxed sm:text-sm">
                                        Catatan riwayat penutupan dan penekanan
                                        poin nilai juri dipisahkan per batch
                                        penyerahan data.
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* MOBILE */}
                                <div className="flex flex-col divide-y divide-border/50 sm:hidden">
                                    {auditTrails.length > 0 ? (
                                        auditTrails.map((trail, idx) => {
                                            const prevTrail =
                                                auditTrails[idx - 1];
                                            const isNewBatch =
                                                prevTrail &&
                                                prevTrail.created_at !==
                                                    trail.created_at;

                                            return (
                                                <div
                                                    key={`mob-${trail.audit_id || idx}`}
                                                    className="flex flex-col"
                                                >
                                                    {isNewBatch && (
                                                        <div className="flex items-center gap-3 bg-muted/40 px-4 py-2">
                                                            <div className="h-px flex-1 bg-border/80" />
                                                            <span className="text-center text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                Batch Masuk:{' '}
                                                                {formatAuditTime(
                                                                    trail.created_at,
                                                                )}
                                                            </span>
                                                            <div className="h-px flex-1 bg-border/80" />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/10">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex min-w-0 flex-col gap-1">
                                                                <span className="text-sm leading-tight font-bold text-foreground">
                                                                    {trail
                                                                        .criterion
                                                                        ?.master_criteria
                                                                        ?.criteria_name ||
                                                                        'Kriteria Penilaian'}
                                                                </span>

                                                                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                                    <UserCircle2 className="h-3 w-3 shrink-0" />
                                                                    {trail.judge
                                                                        ?.user
                                                                        ?.name ||
                                                                        'Juri'}
                                                                </span>
                                                            </div>

                                                            <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-2xs">
                                                                {
                                                                    trail.score_value
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5 text-[10px] text-muted-foreground">
                                                            <span className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
                                                                <Clock className="h-3.5 w-3.5 text-primary" />
                                                                Klik:{' '}
                                                                {formatAuditTime(
                                                                    trail.clicked_at,
                                                                )}
                                                            </span>

                                                            <span className="font-mono text-[10px]">
                                                                Server:{' '}
                                                                {formatAuditTime(
                                                                    trail.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center bg-muted/5 p-10 text-center text-sm text-muted-foreground">
                                            <FileText className="mb-3 h-10 w-10 opacity-30" />
                                            Belum ada log penilaian yang
                                            terekam.
                                        </div>
                                    )}
                                </div>

                                {/* DESKTOP */}
                                <div className="hidden max-h-150 w-full overflow-auto sm:block">
                                    <Table className="w-full min-w-212.5">
                                        <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur-md">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-47.5 px-4 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                                    Waktu Ditekan
                                                </TableHead>

                                                <TableHead className="w-47.5 px-4 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                                    Waktu Server
                                                </TableHead>

                                                <TableHead className="w-50 px-4 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                                    Penilai (Juri)
                                                </TableHead>

                                                <TableHead className="px-4 py-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                                    Materi Penilaian
                                                </TableHead>

                                                <TableHead className="w-22.5 px-4 py-3 text-center text-xs font-bold tracking-wide text-muted-foreground uppercase">
                                                    Poin
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="divide-y divide-border/50">
                                            {auditTrails.length > 0 ? (
                                                auditTrails.map(
                                                    (trail, idx) => {
                                                        const prevTrail =
                                                            auditTrails[
                                                                idx - 1
                                                            ];
                                                        const isNewBatch =
                                                            prevTrail &&
                                                            prevTrail.created_at !==
                                                                trail.created_at;

                                                        return (
                                                            <Fragment
                                                                key={
                                                                    trail.audit_id ||
                                                                    idx
                                                                }
                                                            >
                                                                {isNewBatch && (
                                                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                                        <TableCell
                                                                            colSpan={
                                                                                5
                                                                            }
                                                                            className="px-4 py-2"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="h-px flex-1 bg-border/80" />

                                                                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                                    Batch
                                                                                    Masuk
                                                                                    (
                                                                                    {formatAuditTime(
                                                                                        trail.created_at,
                                                                                    )}

                                                                                    )
                                                                                </span>

                                                                                <div className="h-px flex-1 bg-border/80" />
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}

                                                                <TableRow className="transition-colors hover:bg-muted/20">
                                                                    <TableCell className="px-4 py-2.5 font-mono text-[11px] font-medium whitespace-nowrap text-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                                            {formatAuditTime(
                                                                                trail.clicked_at,
                                                                            )}
                                                                        </div>
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-2.5 font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                                                                        <div className="flex items-center gap-2">
                                                                            <Hash className="h-3.5 w-3.5 shrink-0" />
                                                                            {formatAuditTime(
                                                                                trail.created_at,
                                                                            )}
                                                                        </div>
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                                                                        {trail
                                                                            .judge
                                                                            ?.user
                                                                            ?.name ||
                                                                            'Juri'}
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-2.5">
                                                                        <span className="text-sm font-semibold text-foreground">
                                                                            {trail
                                                                                .criterion
                                                                                ?.master_criteria
                                                                                ?.criteria_name ||
                                                                                'Kriteria Penilaian'}
                                                                        </span>
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-2.5 text-center">
                                                                        <div className="inline-flex h-7 min-w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 px-2 text-sm font-bold text-primary shadow-2xs">
                                                                            {
                                                                                trail.score_value
                                                                            }
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </Fragment>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="h-48 px-4 py-8 text-center text-sm text-muted-foreground"
                                                    >
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FileText className="mb-3 h-8 w-8 opacity-30" />
                                                            Belum ada log
                                                            penilaian yang
                                                            terekam.
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </InnerAppLayout>
    );
}
