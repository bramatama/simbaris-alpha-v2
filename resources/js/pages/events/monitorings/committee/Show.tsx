import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect, Fragment } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Clock,
    Play,
    Square,
    Activity,
    Timer,
    History,
    AlertCircle,
    Pause,
    PlayCircle,
    Settings2,
    Hash,
    UserCircle2,
    Laptop,
} from 'lucide-react';
import { formatAuditTime } from '@/config/date_datetime';

interface MonitoringProps {
    event: any;
    participation: any;
    session: {
        session_id: number;
        status: 'waiting' | 'ongoing' | 'finished';
        start_time: string | null;
        end_time: string | null;
    };
}

export default function MonitoringShow({
    event,
    participation,
    session,
}: MonitoringProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth?.user?.committee_position;

    const [auditTrails, setAuditTrails] = useState<any[]>([]);
    const [liveDuration, setLiveDuration] = useState<string>('00:00:00');
    const [isPolling, setIsPolling] = useState(false);

    const [frozenEndTime, setFrozenEndTime] = useState<string | null>(null);

    const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    const isPaused = session.status === 'ongoing' && session.end_time !== null;
    const isRunning = session.status === 'ongoing' && session.end_time === null;

    const parseSafeDate = (dateVal: string | number | null): Date | null => {
        if (!dateVal) return null;

        if (typeof dateVal === 'number') {
            const date = new Date(dateVal);
            return isNaN(date.getTime()) ? null : date;
        }

        let normalized = dateVal;

        // Normalisasi format MySQL: YYYY-MM-DD HH:mm:ss
        if (normalized.includes(' ') && !normalized.includes('T')) {
            normalized = normalized.replace(' ', 'T');
        }

        // Jika tidak memiliki timezone, anggap sebagai WITA.
        const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);

        if (!hasTimezone) {
            normalized += '+08:00';
        }

        const date = new Date(normalized);

        return isNaN(date.getTime()) ? null : date;
    };

    const formatDateTimeLocal = (dateString: string | null): string => {
        if (!dateString) return '';

        const date = parseSafeDate(dateString);

        if (!date) return '';

        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Makassar',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(date);

        const values = Object.fromEntries(
            parts.map((part) => [part.type, part.value]),
        );

        return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
    };

    const {
        data: manualData,
        setData: setManualData,
        put,
        processing: manualProcessing,
    } = useForm({
        status: session.status,
        start_time: formatDateTimeLocal(session.start_time),
        end_time: formatDateTimeLocal(session.end_time),
    });

    const formatOnlyTime = (dateString: string | null) => {
        const d = parseSafeDate(dateString);

        if (!d) return '-';

        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
            timeZone: 'Asia/Makassar',
        }).format(d);
    };

    // ==========================================
    // LOGIKA TIMER REAL-TIME (SOLUSI PERMANEN)
    // ==========================================
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const calculateAndSetDuration = () => {
            const startDate = parseSafeDate(session.start_time);
            if (!startDate) {
                setLiveDuration('00:00:00');
                return;
            }

            const startMs = startDate.getTime();
            let endMs: number;

            if (session.status === 'finished' && session.end_time) {
                const endDate = parseSafeDate(session.end_time);
                endMs = endDate ? endDate.getTime() : new Date().getTime();
            } else if (frozenEndTime) {
                const frozenDate = parseSafeDate(frozenEndTime);
                endMs = frozenDate
                    ? frozenDate.getTime()
                    : new Date().getTime();
            } else if (isPaused && session.end_time) {
                const pauseDate = parseSafeDate(session.end_time);
                endMs = pauseDate ? pauseDate.getTime() : new Date().getTime();
            } else {
                endMs = new Date().getTime();
            }

            let diff = Math.floor((endMs - startMs) / 1000);

            if (diff < 0) diff = 0;

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;

            setLiveDuration(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            );
        };

        calculateAndSetDuration();

        if (isRunning && !frozenEndTime && session.status !== 'finished') {
            interval = setInterval(calculateAndSetDuration, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [
        session.status,
        session.start_time,
        session.end_time,
        isRunning,
        isPaused,
        frozenEndTime,
    ]);

    // ==========================================
    // LOGIKA POLLING AUDIT TRAIL
    // ==========================================
    useEffect(() => {
        const fetchAuditTrails = async () => {
            try {
                const response = await fetch(
                    `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/monitoring/audit-trails`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );
                const data = await response.json();
                if (data.data) setAuditTrails(data.data);
            } catch (error) {
                console.error('Gagal menarik data audit trail', error);
            }
        };

        fetchAuditTrails();
        let pollingInterval: ReturnType<typeof setInterval>;

        if (session.status === 'ongoing') {
            setIsPolling(true);
            pollingInterval = setInterval(fetchAuditTrails, 3000);
        } else {
            setIsPolling(false);
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [session.status, event.public_id, participation.public_id, userRole]);

    // ==========================================
    // ACTION HANDLERS
    // ==========================================
    const handleStart = () => {
        router.post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/monitoring/start`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setIsStartDialogOpen(false),
            },
        );
    };

    const handleFinishDirect = () => {
        const frozenTime = isPaused
            ? session.end_time
            : new Date().toISOString();

        setFrozenEndTime(frozenTime);

        router.post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/monitoring/finish`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handlePause = () =>
        router.post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/monitoring/pause`,
            {},
            { preserveScroll: true },
        );

    const handleResume = () =>
        router.post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/monitoring/resume`,
            {},
            { preserveScroll: true },
        );

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/monitoring/manual-update`,
            {
                preserveScroll: true,
                onSuccess: () => setIsManualModalOpen(false),
            },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Monitoring - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/participation-orders`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Daftar Peserta
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                            Monitoring Waktu & Jejak Juri
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {participation.team_name}
                            </span>
                            <span className="mx-2 text-border">|</span>
                            Jenjang{' '}
                            {participation.event_level?.level?.level_name}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsManualModalOpen(true)}
                            className="w-full gap-2 text-muted-foreground sm:w-auto"
                        >
                            <Settings2 className="h-4 w-4" /> Input Manual
                        </Button>
                        <Badge
                            variant="outline"
                            className={`w-full justify-center px-3 py-1.5 text-sm font-medium sm:w-auto ${isRunning ? 'animate-pulse border-info/20 bg-info/10 text-info' : isPaused ? 'border-amber-500/20 bg-amber-500/10 text-amber-600' : session.status === 'finished' ? 'bg-muted text-muted-foreground' : 'border-orange-500/20 bg-orange-500/10 text-orange-600'}`}
                        >
                            {isRunning
                                ? 'Sedang Tampil'
                                : isPaused
                                  ? 'Dihentikan Sementara'
                                  : session.status === 'finished'
                                    ? 'Selesai Tampil'
                                    : 'Menunggu Antrean'}
                        </Badge>
                    </div>
                </div>

                {/* TIMER & INSTRUCTIONS GRID */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
                    <Card className="relative overflow-hidden border-border/60 bg-card shadow-sm lg:col-span-8">
                        <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
                        <CardContent className="relative z-10 flex flex-col items-center justify-between gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8 md:p-10">
                            {/* Waktu Display */}
                            <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                                <span className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase sm:text-sm">
                                    <Timer className="h-4 w-4" /> Waktu Berjalan
                                </span>
                                <div
                                    className={`text-5xl font-black tracking-tighter tabular-nums sm:text-6xl ${isRunning ? 'text-primary' : isPaused ? 'text-amber-500' : 'text-foreground'}`}
                                >
                                    {liveDuration}
                                </div>
                                <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground sm:mt-4">
                                    <p>
                                        <strong>Mulai:</strong>{' '}
                                        {session.start_time
                                            ? formatOnlyTime(session.start_time)
                                            : '-'}
                                    </p>
                                    <p>
                                        <strong>Selesai:</strong>{' '}
                                        {session.status === 'finished' &&
                                        session.end_time
                                            ? formatOnlyTime(session.end_time)
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex w-full min-w-50 flex-col gap-3 sm:w-auto">
                                {session.status === 'waiting' && (
                                    <Button
                                        size="lg"
                                        onClick={() =>
                                            setIsStartDialogOpen(true)
                                        }
                                        className="h-14 w-full bg-emerald-600 text-sm shadow-lg shadow-primary/20 hover:bg-emerald-700 sm:h-16 sm:text-base"
                                    >
                                        <Play className="mr-2 h-5 w-5 fill-current sm:h-6 sm:w-6" />{' '}
                                        Mulai Tampil
                                    </Button>
                                )}

                                {session.status === 'ongoing' && (
                                    <>
                                        {isRunning ? (
                                            <Button
                                                size="lg"
                                                onClick={handlePause}
                                                variant="outline"
                                                className="h-12 w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                            >
                                                <Pause className="mr-2 h-4 w-4 fill-current sm:h-5 sm:w-5" />{' '}
                                                Jeda (Pause)
                                            </Button>
                                        ) : (
                                            <Button
                                                size="lg"
                                                onClick={handleResume}
                                                variant="outline"
                                                className="h-12 w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4 fill-current sm:h-5 sm:w-5" />{' '}
                                                Lanjutkan
                                            </Button>
                                        )}
                                        {/* KLIK LANGSUNG EKSEKUSI & BEKUKAN TIMER */}
                                        <Button
                                            size="lg"
                                            onClick={handleFinishDirect}
                                            variant="destructive"
                                            className="h-14 w-full animate-in text-sm shadow-lg shadow-destructive/20 duration-300 fade-in zoom-in sm:h-16 sm:text-base"
                                        >
                                            <Square className="mr-2 h-5 w-5 fill-current sm:h-6 sm:w-6" />{' '}
                                            Akhiri Penampilan
                                        </Button>
                                    </>
                                )}

                                {session.status === 'finished' && (
                                    <div className="flex h-14 w-full items-center justify-center rounded-md border-2 border-dashed border-muted bg-muted/10 font-semibold text-muted-foreground sm:h-16">
                                        Sesi Ditutup
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-muted/10 shadow-sm lg:col-span-4">
                        <CardHeader className="pt-5 pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                                <AlertCircle className="h-4 w-4 text-primary" />{' '}
                                Instruksi Auditor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-inside list-disc space-y-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                <li>
                                    Pencatatan dimulai sesaat setelah instruksi
                                    komandan dibunyikan.
                                </li>
                                <li>
                                    Gunakan fitur <strong>Jeda</strong> hanya
                                    untuk insiden luar kendali (waktu jeda tidak
                                    menambah total durasi).
                                </li>
                                <li>
                                    Jika ada kesalahan sistem, klik{' '}
                                    <strong>Input Manual</strong>.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* AUDIT TRAIL LOGS */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/50 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base text-foreground">
                                <History className="h-5 w-5 text-muted-foreground" />{' '}
                                Jejak Rekam Juri (Live Feed)
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Aktivitas nilai juri masuk secara real-time.
                            </CardDescription>
                        </div>
                        {isPolling && (
                            <div className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                                <Activity className="h-3.5 w-3.5 animate-pulse" />{' '}
                                Sync Aktif
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* 1. TAMPILAN MOBILE */}
                        <div className="flex flex-col divide-y divide-border/50 sm:hidden">
                            {auditTrails.length > 0 ? (
                                auditTrails.map((trail, idx) => {
                                    const prevTrail = auditTrails[idx - 1];
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
                                                    <div className="h-px flex-1 bg-border/80"></div>
                                                    <span className="text-center text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                                                        Masuk pd{' '}
                                                        {formatAuditTime(
                                                            trail.created_at,
                                                        )}
                                                    </span>
                                                    <div className="h-px flex-1 bg-border/80"></div>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2.5 p-4 transition-colors hover:bg-muted/10">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm leading-tight font-bold text-foreground">
                                                            {trail.criterion
                                                                ?.master_criteria
                                                                ?.criteria_name ||
                                                                'Kriteria Tidak Diketahui'}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                                            <UserCircle2 className="h-3 w-3" />{' '}
                                                            {trail.judge?.user
                                                                ?.name ||
                                                                'Anonim'}
                                                        </span>
                                                    </div>
                                                    <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-sm font-black text-primary">
                                                        {trail.score_value}
                                                    </div>
                                                </div>

                                                <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-2">
                                                    <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-foreground">
                                                        <Clock className="h-3 w-3 text-primary" />{' '}
                                                        {formatAuditTime(
                                                            trail.clicked_at,
                                                        )}
                                                    </span>
                                                    <span
                                                        className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground"
                                                        title={trail.user_agent}
                                                    >
                                                        <Laptop className="h-2.5 w-2.5" />{' '}
                                                        IP:{' '}
                                                        {trail.ip_address ||
                                                            '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-muted/5 p-8 text-center text-sm text-muted-foreground">
                                    Belum ada jejak penilaian yang terekam.
                                </div>
                            )}
                        </div>

                        {/* 2. TAMPILAN DESKTOP */}
                        <div className="hidden max-h-125 w-full overflow-y-auto sm:block">
                            <Table className="relative min-w-full">
                                <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur-md">
                                    <TableRow className="border-b-border/80">
                                        <TableHead className="w-40 font-bold">
                                            Waktu Klik
                                        </TableHead>
                                        <TableHead className="w-40 font-bold">
                                            Waktu Masuk
                                        </TableHead>
                                        <TableHead className="w-48 font-bold">
                                            Nama Juri
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Kriteria Penilaian
                                        </TableHead>
                                        <TableHead className="w-24 text-center font-bold">
                                            Nilai
                                        </TableHead>
                                        <TableHead className="w-32 text-center font-bold">
                                            Info Perangkat
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-border/50">
                                    {auditTrails.length > 0 ? (
                                        auditTrails.map((trail, idx) => {
                                            const prevTrail =
                                                auditTrails[idx - 1];
                                            const isNewBatch =
                                                prevTrail &&
                                                prevTrail.created_at !==
                                                    trail.created_at;

                                            return (
                                                <Fragment
                                                    key={trail.audit_id || idx}
                                                >
                                                    {isNewBatch && (
                                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                            <TableCell
                                                                colSpan={6}
                                                                className="px-4 py-2"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-px flex-1 bg-border/80"></div>
                                                                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                        Batch
                                                                        Masuk
                                                                        Sebelumnya
                                                                        (
                                                                        {formatAuditTime(
                                                                            trail.created_at,
                                                                        )}
                                                                        )
                                                                    </span>
                                                                    <div className="h-px flex-1 bg-border/80"></div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}

                                                    <TableRow className="transition-colors hover:bg-muted/20">
                                                        <TableCell className="font-mono text-[11px] font-medium whitespace-nowrap text-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-primary" />
                                                                {formatAuditTime(
                                                                    trail.clicked_at,
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <Hash className="h-3 w-3" />
                                                                {formatAuditTime(
                                                                    trail.created_at,
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium">
                                                            {trail.judge?.user
                                                                ?.name ||
                                                                'Anonim'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {trail.criterion
                                                                    ?.master_criteria
                                                                    ?.criteria_name ||
                                                                    'Kriteria Tidak Diketahui'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="inline-flex h-7 w-10 items-center justify-center rounded border border-primary/20 bg-primary/10 font-bold text-primary">
                                                                {
                                                                    trail.score_value
                                                                }
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span
                                                                className="mx-auto block max-w-30 truncate text-[9px] text-muted-foreground"
                                                                title={
                                                                    trail.user_agent
                                                                }
                                                            >
                                                                IP:{' '}
                                                                {trail.ip_address ||
                                                                    '-'}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                </Fragment>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-40 text-center text-sm text-muted-foreground"
                                            >
                                                Belum ada jejak penilaian yang
                                                terekam.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* DIALOG HANYA UNTUK START */}
            <ConfirmationDialog
                open={isStartDialogOpen}
                onOpenChange={setIsStartDialogOpen}
                title="Mulai Penampilan"
                description="Apakah Anda yakin ingin memulai perhitungan waktu untuk tim ini?"
                confirmText="Ya, Mulai"
                variant="default"
                onConfirm={handleStart}
            />

            <Dialog
                open={isManualModalOpen}
                onOpenChange={setIsManualModalOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Input Manual Waktu Tampil</DialogTitle>
                        <DialogDescription>
                            Gunakan fitur ini hanya jika terjadi kesalahan
                            pencatatan atau anomali sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleManualSubmit}
                        className="space-y-4 pt-2"
                    >
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                Status Sesi
                            </Label>
                            <Select
                                value={manualData.status}
                                onValueChange={(val) =>
                                    setManualData('status', val as any)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="waiting">
                                        Waiting (Menunggu)
                                    </SelectItem>
                                    <SelectItem value="ongoing">
                                        Ongoing (Sedang Tampil)
                                    </SelectItem>
                                    <SelectItem value="finished">
                                        Finished (Selesai)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                Waktu Mulai
                            </Label>
                            <Input
                                type="datetime-local"
                                step="1"
                                value={manualData.start_time}
                                onChange={(e) =>
                                    setManualData('start_time', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                Waktu Selesai / Jeda
                            </Label>
                            <Input
                                type="datetime-local"
                                step="1"
                                value={manualData.end_time}
                                onChange={(e) =>
                                    setManualData('end_time', e.target.value)
                                }
                            />
                        </div>
                        <DialogFooter className="border-t border-border/50 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsManualModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={manualProcessing}
                                className="gap-2"
                            >
                                <Settings2 className="h-4 w-4" /> Simpan
                                Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </InnerAppLayout>
    );
}
