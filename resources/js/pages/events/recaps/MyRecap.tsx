import { Head, Link } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
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
    Calculator,
    ArrowLeft,
    EyeOff,
    Trophy,
    Clock,
    Timer,
    ShieldAlert,
} from 'lucide-react';

interface EvaluationSessionData {
    session_id: number;
    status: 'waiting' | 'ongoing' | 'finished';
    start_time: string | null;
    end_time: string | null;
    recording_mode?: 'auto' | 'manual';
    manual_reason?: string | null;
}

interface MyRecapProps {
    event: any;
    participation: any;
    myRecapData: any[];
    session?: EvaluationSessionData | null;
    isVisible?: boolean;
}

export default function MyRecap({
    event,
    participation,
    myRecapData,
    session,
    isVisible = true,
}: MyRecapProps) {
    const handleBack = () => {
        window.history.back();
    };

    const parseSafeDate = (dateVal: string | number | null): Date | null => {
        if (!dateVal) return null;

        if (typeof dateVal === 'number') {
            const date = new Date(dateVal);
            return isNaN(date.getTime()) ? null : date;
        }

        let normalized = dateVal;
        if (normalized.includes(' ') && !normalized.includes('T')) {
            normalized = normalized.replace(' ', 'T');
        }

        const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
        if (!hasTimezone) {
            normalized += '+08:00';
        }

        const date = new Date(normalized);
        return isNaN(date.getTime()) ? null : date;
    };

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

    const calculateDuration = () => {
        if (!session?.start_time || !session?.end_time) return '-';

        const startDate = parseSafeDate(session.start_time);
        const endDate = parseSafeDate(session.end_time);
        if (!startDate || !endDate) return '-';

        let diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
        if (diff < 0) diff = 0;

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isManualSession = session?.recording_mode === 'manual';

    return (
        <InnerAppLayout
            sidebarNavItems={getParticipationInnerNav(
                participation.public_id,
                event.public_id,
            )}
        >
            <Head title={`Rapor Tim - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-4 border-b border-border/50 pb-5">
                    <Link
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleBack();
                        }}
                        className="inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                        Kembali
                    </Link>
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                            <Calculator className="h-6 w-6 text-primary" />{' '}
                            Rapor Penilaian Tim
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                            Hasil perhitungan akhir untuk tim{' '}
                            <strong>{participation.team_name}</strong>{' '}
                            berdasarkan keputusan mutlak dewan juri.
                        </p>
                    </div>
                </div>

                {/* BLANK STATE JIKA VISIBILITAS BELUM DIBUKA */}
                {!isVisible ? (
                    <Card className="space-y-3 border-dashed border-border/80 bg-muted/10 p-8 text-center shadow-none md:p-12">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <EyeOff className="h-6 w-6 opacity-60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-foreground sm:text-lg">
                                Hasil Rekap Penilaian Belum Dibuka
                            </h3>
                            <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-sm">
                                Rincian nilai dan penilaian untuk tim Anda belum
                                dirilis secara resmi oleh panitia penyelenggara.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* KETERANGAN WAKTU PENAMPILAN */}
                        {session && (
                            <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
                                <CardContent className="space-y-4 p-4 sm:p-5">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-2">
                                            <Timer className="h-5 w-5 text-primary" />
                                            <h2 className="text-sm font-bold text-foreground sm:text-base">
                                                Catatan Waktu Penampilan
                                            </h2>
                                        </div>

                                        {isManualSession && (
                                            <Badge
                                                variant="outline"
                                                className="w-fit gap-1.5 border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400"
                                            >
                                                <ShieldAlert className="h-3.5 w-3.5" />
                                                Pencatatan Manual
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2.5 sm:flex-col sm:items-start sm:justify-center sm:gap-1">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                                Waktu Mulai
                                            </span>
                                            <span className="font-mono text-sm font-bold text-foreground tabular-nums sm:text-base">
                                                {formatOnlyTime(
                                                    session.start_time,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2.5 sm:flex-col sm:items-start sm:justify-center sm:gap-1">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5 text-destructive" />
                                                Waktu Selesai
                                            </span>
                                            <span className="font-mono text-sm font-bold text-foreground tabular-nums sm:text-base">
                                                {session.status === 'finished'
                                                    ? formatOnlyTime(
                                                          session.end_time,
                                                      )
                                                    : '-'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5 sm:flex-col sm:items-start sm:justify-center sm:gap-1">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                                <Timer className="h-3.5 w-3.5" />
                                                Total Durasi Tampil
                                            </span>
                                            <span className="font-mono text-sm font-black text-primary tabular-nums sm:text-base">
                                                {session.status === 'finished'
                                                    ? calculateDuration()
                                                    : session.status ===
                                                        'ongoing'
                                                      ? 'Sedang Berjalan'
                                                      : 'Belum Tampil'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* KETERANGAN ALASAN JIKA MANUAL SESSION */}
                                    {isManualSession && (
                                        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <div className="space-y-0.5">
                                                <p className="font-bold">
                                                    Keterangan Koreksi Waktu
                                                    Manual:
                                                </p>
                                                <p className="leading-relaxed">
                                                    {session.manual_reason
                                                        ? `"${session.manual_reason}"`
                                                        : 'Waktu penampilan disesuaikan secara manual oleh auditor lapangan.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {myRecapData && myRecapData.length > 0 ? (
                            /* KONTEN RAPOR UTAMA */
                            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                                {myRecapData.map((recap) => {
                                    const formulas =
                                        recap.event_champion_category
                                            ?.formulas || [];
                                    const penalties =
                                        recap.participation?.team_penalties ||
                                        [];

                                    return (
                                        <Card
                                            key={
                                                recap?.recap_id || Math.random()
                                            }
                                            className="overflow-hidden border-border/70 shadow-sm"
                                        >
                                            {/* Header Kartu Kategori Juara */}
                                            <div className="flex items-center justify-between border-b border-border/50 bg-primary/10 px-4 py-3">
                                                <h3 className="text-sm font-bold text-primary sm:text-base">
                                                    {
                                                        recap
                                                            .event_champion_category
                                                            ?.champion_category
                                                            ?.champion_category_name
                                                    }
                                                </h3>
                                                <Badge
                                                    variant="default"
                                                    className={
                                                        recap.champion_title
                                                            ? 'bg-amber-500 text-xs text-amber-950 hover:bg-amber-600'
                                                            : 'border border-border/50 bg-muted text-xs text-muted-foreground shadow-none hover:bg-muted/80'
                                                    }
                                                >
                                                    {recap.champion_title ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <Trophy className="h-3.5 w-3.5" />
                                                            {
                                                                recap.champion_title
                                                            }
                                                        </span>
                                                    ) : (
                                                        `Peringkat ${recap.rank_override || recap.calculated_rank || '-'}`
                                                    )}
                                                </Badge>
                                            </div>

                                            {/* 1. COMPACT CARD LAYOUT UNTUK MOBILE (sm:hidden) */}
                                            <div className="space-y-3 bg-card p-4 sm:hidden">
                                                {/* Komponen Nilai Formulas */}
                                                <div className="space-y-2">
                                                    {formulas.map(
                                                        (formula: any) => {
                                                            const categoryScores =
                                                                recap.participation?.team_scores?.filter(
                                                                    (ts: any) =>
                                                                        ts.scoring_category_id ===
                                                                        formula.scoring_category_id,
                                                                ) || [];
                                                            const rawScore =
                                                                categoryScores.reduce(
                                                                    (
                                                                        acc: number,
                                                                        curr: any,
                                                                    ) =>
                                                                        acc +
                                                                        Number(
                                                                            curr.total_score,
                                                                        ),
                                                                    0,
                                                                );
                                                            const weighted =
                                                                rawScore *
                                                                formula.weight_multiplier;

                                                            return (
                                                                <div
                                                                    key={
                                                                        formula.formula_id
                                                                    }
                                                                    className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-2.5 text-xs"
                                                                >
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-semibold text-foreground">
                                                                            {formula
                                                                                .scoring_category
                                                                                ?.master_category
                                                                                ?.category_name ||
                                                                                formula
                                                                                    .scoring_category
                                                                                    ?.category_name}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            Murni:{' '}
                                                                            {
                                                                                rawScore
                                                                            }{' '}
                                                                            ×
                                                                            Bobot:{' '}
                                                                            {
                                                                                formula.weight_multiplier
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-black text-foreground">
                                                                        {weighted.toFixed(
                                                                            2,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                {/* Komponen Penalti */}
                                                {penalties.length > 0 && (
                                                    <div className="space-y-1.5 pt-1">
                                                        {penalties.map(
                                                            (pen: any) => {
                                                                const deduction =
                                                                    pen.penalty_value *
                                                                    pen.occurrence_count;
                                                                return (
                                                                    <div
                                                                        key={
                                                                            pen.team_penalty_id
                                                                        }
                                                                        className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs"
                                                                    >
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-semibold text-destructive">
                                                                                {
                                                                                    pen
                                                                                        .event_penalty
                                                                                        ?.master_penalty
                                                                                        ?.penalty_name
                                                                                }
                                                                            </span>
                                                                            <span className="text-[10px] text-destructive/80">
                                                                                (
                                                                                {
                                                                                    pen.penalty_value
                                                                                }{' '}
                                                                                pt
                                                                                ×{' '}
                                                                                {
                                                                                    pen.occurrence_count
                                                                                }
                                                                                x)
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-sm font-black text-destructive">
                                                                            -{' '}
                                                                            {
                                                                                deduction
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}

                                                {/* Total Akhir (Mobile Footer) */}
                                                <div className="mt-2 flex items-center justify-between rounded-lg bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
                                                    <span className="text-xs font-bold tracking-wider uppercase">
                                                        Hasil Akhir
                                                    </span>
                                                    <span className="text-lg font-black">
                                                        {recap.final_score}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 2. TABEL KLASIK UNTUK DESKTOP/TABLET (hidden sm:block) */}
                                            <div className="hidden sm:block">
                                                <Table>
                                                    <TableHeader className="bg-muted/30">
                                                        <TableRow>
                                                            <TableHead className="px-4 font-bold">
                                                                Komponen
                                                                Penilaian /
                                                                Penalti
                                                            </TableHead>
                                                            <TableHead className="w-32 px-4 text-right font-bold">
                                                                Nilai / Poin
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {formulas.map(
                                                            (formula: any) => {
                                                                const categoryScores =
                                                                    recap.participation?.team_scores?.filter(
                                                                        (
                                                                            ts: any,
                                                                        ) =>
                                                                            ts.scoring_category_id ===
                                                                            formula.scoring_category_id,
                                                                    ) || [];
                                                                const rawScore =
                                                                    categoryScores.reduce(
                                                                        (
                                                                            acc: number,
                                                                            curr: any,
                                                                        ) =>
                                                                            acc +
                                                                            Number(
                                                                                curr.total_score,
                                                                            ),
                                                                        0,
                                                                    );
                                                                const weighted =
                                                                    rawScore *
                                                                    formula.weight_multiplier;

                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            formula.formula_id
                                                                        }
                                                                    >
                                                                        <TableCell className="px-4">
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">
                                                                                    {formula
                                                                                        .scoring_category
                                                                                        ?.master_category
                                                                                        ?.category_name ||
                                                                                        formula
                                                                                            .scoring_category
                                                                                            ?.category_name}
                                                                                </span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    Nilai
                                                                                    Murni:{' '}
                                                                                    {
                                                                                        rawScore
                                                                                    }{' '}
                                                                                    x
                                                                                    Bobot:{' '}
                                                                                    {
                                                                                        formula.weight_multiplier
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-4 text-right font-semibold">
                                                                            {weighted.toFixed(
                                                                                2,
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            },
                                                        )}

                                                        {penalties.map(
                                                            (pen: any) => {
                                                                const deduction =
                                                                    pen.penalty_value *
                                                                    pen.occurrence_count;
                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            pen.team_penalty_id
                                                                        }
                                                                        className="bg-destructive/5"
                                                                    >
                                                                        <TableCell>
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium text-destructive">
                                                                                    {
                                                                                        pen
                                                                                            .event_penalty
                                                                                            ?.master_penalty
                                                                                            ?.penalty_name
                                                                                    }
                                                                                </span>
                                                                                <span className="text-xs text-destructive/80">
                                                                                    (
                                                                                    {
                                                                                        pen.penalty_value
                                                                                    }{' '}
                                                                                    poin
                                                                                    x{' '}
                                                                                    {
                                                                                        pen.occurrence_count
                                                                                    }{' '}
                                                                                    kejadian)
                                                                                </span>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-bold text-destructive">
                                                                            -{' '}
                                                                            {
                                                                                deduction
                                                                            }
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            },
                                                        )}
                                                    </TableBody>
                                                    <tfoot className="border-t-2 border-border/80 bg-muted/50">
                                                        <tr>
                                                            <td className="px-4 py-3 text-right font-bold">
                                                                HASIL AKHIR
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-lg font-black text-primary">
                                                                {
                                                                    recap.final_score
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </Table>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            /* BLANK STATE JIKA DATA KOSONG */
                            <div className="flex animate-in flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 text-center fade-in">
                                <Calculator className="mb-4 h-10 w-10 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-medium">
                                    Belum Ada Rapor Penilaian
                                </h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Nilai akhir untuk tim ini belum tersedia
                                    atau masih dalam proses rekapitulasi dewan
                                    juri.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </InnerAppLayout>
    );
}
