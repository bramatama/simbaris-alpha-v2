import { Head, Link } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Calculator, ArrowLeft, EyeOff, Trophy } from 'lucide-react';

interface MyRecapProps {
    event: any;
    participation: any;
    myRecapData: any[];
    isVisible?: boolean;
}

export default function MyRecap({
    event,
    participation,
    myRecapData,
    isVisible = true,
}: MyRecapProps) {
    const handleBack = () => {
        window.history.back();
    };

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
                ) : myRecapData && myRecapData.length > 0 ? (
                    /* KONTEN RAPOR UTAMA */
                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                        {myRecapData.map((recap) => {
                            const formulas =
                                recap.event_champion_category?.formulas || [];
                            const penalties =
                                recap.participation?.team_penalties || [];

                            return (
                                <Card
                                    key={recap?.recap_id || Math.random()}
                                    className="overflow-hidden border-border/70 shadow-sm"
                                >
                                    {/* Header Kartu Kategori Juara */}
                                    <div className="flex items-center justify-between border-b border-border/50 bg-primary/10 px-4 py-3">
                                        <h3 className="text-sm font-bold text-primary sm:text-base">
                                            {
                                                recap.event_champion_category
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
                                                    {recap.champion_title}
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
                                            {formulas.map((formula: any) => {
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
                                                        key={formula.formula_id}
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
                                                                {rawScore} ×
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
                                            })}
                                        </div>

                                        {/* Komponen Penalti */}
                                        {penalties.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {penalties.map((pen: any) => {
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
                                                                    pt ×{' '}
                                                                    {
                                                                        pen.occurrence_count
                                                                    }
                                                                    x)
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-black text-destructive">
                                                                - {deduction}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
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
                                                        Komponen Penilaian /
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

                                                {penalties.map((pen: any) => {
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
                                                                        poin x{' '}
                                                                        {
                                                                            pen.occurrence_count
                                                                        }{' '}
                                                                        kejadian)
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-destructive">
                                                                - {deduction}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                            <tfoot className="border-t-2 border-border/80 bg-muted/50">
                                                <tr>
                                                    <td className="px-4 py-3 text-right font-bold">
                                                        HASIL AKHIR
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-lg font-black text-primary">
                                                        {recap.final_score}
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
                            Nilai akhir untuk tim ini belum tersedia atau masih
                            dalam proses rekapitulasi dewan juri.
                        </p>
                    </div>
                )}
            </div>
        </InnerAppLayout>
    );
}
