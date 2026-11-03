import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import {
    Trophy,
    ArrowLeft,
    Medal,
    AlertTriangle,
    FileText,
    Star,
    CheckCircle2,
    Calculator,
} from 'lucide-react';
import type { PageProps } from '@inertiajs/core';

/* =========================================================
   TYPES
========================================================= */
interface LeaderboardProps {
    event: any;
    role: 'committee' | 'official_team';
    myOfficialTeamId?: number | null;
    eventLevels: any[];
    championCategories: any[];
    scoringCategories: any[];
    activeCategoryData: any;
    leaderboardData: any;
    filters: {
        type: 'champion' | 'scoring';
        id: string | number;
        level?: string | number;
        sort: string;
    };
    activeEventChampions?: any[];
    isVisible: boolean;
}

/* =========================================================
   COMPONENT UTAMA
========================================================= */
export default function Leaderboard({
    event,
    role,
    myOfficialTeamId,
    eventLevels,
    championCategories,
    scoringCategories,
    activeCategoryData,
    activeEventChampions,
    leaderboardData,
    filters,
    isVisible,
}: LeaderboardProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const committeePosition = auth.user.committee_position;
    const isChampion = filters.type === 'champion';
    const currentFilterValue = `${filters.type}-${filters.id}`;

    // State untuk Modal Tiebreaker Massal
    const [isBulkOverrideModalOpen, setIsBulkOverrideModalOpen] =
        useState(false);
    const [, setAvailableTieRanks] = useState<number[]>([]);

    // Form data
    const {
        data: formData,
        setData: setFormData,
        put,
        processing,
        reset,
    } = useForm({
        overrides: [] as {
            recap_id: number;
            rank_override: string | number;
            team_name: string;
            final_score: number;
            participation: any;
        }[],
    });

    const handleBack = () => {
        window.history.back();
    };

    const getRankClassName = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-amber-400 text-amber-900 shadow-md';
            case 2:
                return 'bg-slate-300 text-slate-800';
            case 3:
                return 'bg-orange-300 text-orange-900';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getAvailableRanks = (currentIndex: number) => {
        const totalTied = formData.overrides.length;
        const allPossibleRanks = Array.from(
            { length: totalTied },
            (_, i) => i + 1,
        );

        const selectedRanksByOthers = formData.overrides
            .filter((_, idx) => idx !== currentIndex)
            .map((o) => Number(o.rank_override))
            .filter((r) => r > 0);

        return allPossibleRanks.map((rank) => ({
            rank,
            disabled: selectedRanksByOthers.includes(rank),
        }));
    };

    const handleResetRanks = () => {
        const resetOverrides = formData.overrides.map((ov) => ({
            ...ov,
            rank_override: '',
        }));
        setFormData('overrides', resetOverrides);
    };

    /* =========================================================
       FILTER HANDLERS
    ========================================================= */
    const handleLevelChange = (value: string) => {
        router.get(
            window.location.pathname,
            {
                level_id: value,
                filter_type: filters.type,
                filter_id: filters.id,
                sort_by: filters.sort,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleFilterChange = (value: string) => {
        const [type, id] = value.split('-');
        router.get(
            window.location.pathname,
            {
                filter_type: type,
                filter_id: id,
                sort_by: filters.sort,
                level_id: filters.level,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSortChange = (value: string) => {
        router.get(
            window.location.pathname,
            {
                filter_type: filters.type,
                filter_id: filters.id,
                sort_by: value,
                level_id: filters.level,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    /* =========================================================
       TIE CHECKER & BULK OVERRIDE HANDLER
    ========================================================= */
    const checkIsTie = (index: number, dataArray: any[]) => {
        const currentScore =
            dataArray[index]?.final_score ?? dataArray[index]?.total_score;
        if (currentScore == null) return false;

        const prevScore =
            index > 0
                ? (dataArray[index - 1]?.final_score ??
                  dataArray[index - 1]?.total_score)
                : null;
        const nextScore =
            index < dataArray.length - 1
                ? (dataArray[index + 1]?.final_score ??
                  dataArray[index + 1]?.total_score)
                : null;

        return currentScore === prevScore || currentScore === nextScore;
    };

    const openBulkOverrideModal = (targetScore: number) => {
        const tiedTeamsWithIndex = leaderboardData.data
            .map((row: any, index: number) => ({
                ...row,
                originalIndex: index,
            }))
            .filter((row: any) => row.final_score === targetScore);

        const rankPool = tiedTeamsWithIndex.map(
            (t: any) => t.originalIndex + 1,
        );
        setAvailableTieRanks(rankPool);

        setFormData(
            'overrides',
            tiedTeamsWithIndex.map((t: any) => ({
                recap_id: t.recap_id,
                rank_override: t.rank_override || '',
                team_name: t.participation.team_name,
                final_score: t.final_score,
                participation: t.participation,
            })),
        );
        setIsBulkOverrideModalOpen(true);
    };

    const handleBulkOverrideSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/${role}/events/${event.public_id}/leaderboard/bulk-override`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsBulkOverrideModalOpen(false);
                reset();
            },
        });
    };

    const updateOverrideRank = (index: number, value: string) => {
        const newOverrides = [...formData.overrides];
        newOverrides[index].rank_override = value === 'reset' ? '' : value;
        setFormData('overrides', newOverrides);
    };

    const pageContent = (
        <>
            <Head title={`Leaderboard - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-border/50 pb-5">
                    <Link
                        href="#"
                        onClick={handleBack}
                        className="inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                        Kembali
                    </Link>

                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                            <Trophy className="h-6 w-6 text-amber-500" />
                            Papan Peringkat (Leaderboard)
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                            Hasil rekapitulasi perolehan nilai, peringkat tim,
                            dan daftar juara keseluruhan.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
                        <div className="w-60 shrink-0">
                            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                Jenjang / Tingkat
                            </Label>
                            <Select
                                value={
                                    filters.level?.toString() ||
                                    eventLevels[0]?.event_level_id?.toString()
                                }
                                onValueChange={handleLevelChange}
                                disabled={!isVisible}
                            >
                                <SelectTrigger className="h-9 w-full border-border/80 bg-background font-medium text-primary shadow-sm">
                                    <SelectValue placeholder="Pilih Jenjang..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventLevels.map((level) => (
                                        <SelectItem
                                            key={`level-${level.event_level_id}`}
                                            value={level.event_level_id.toString()}
                                        >
                                            {level.level.level_name ||
                                                `Jenjang ${level.event_level_id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-60 shrink-0">
                            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                Tampilkan Kategori
                            </Label>
                            <Select
                                value={currentFilterValue}
                                onValueChange={handleFilterChange}
                                disabled={!isVisible}
                            >
                                <SelectTrigger className="h-9 w-full border-border/80 bg-background shadow-sm">
                                    <SelectValue placeholder="Pilih Kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="bg-primary/10 font-bold text-primary">
                                            -- KATEGORI JUARA --
                                        </SelectLabel>
                                        {championCategories.map((cat) => (
                                            <SelectItem
                                                key={`champion-${cat.event_champion_category_id}`}
                                                value={`champion-${cat.event_champion_category_id}`}
                                            >
                                                <Medal className="mr-1 inline h-3 w-3 text-amber-500" />{' '}
                                                {
                                                    cat.champion_category
                                                        .champion_category_name
                                                }
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel className="mt-2 bg-muted font-bold text-muted-foreground">
                                            -- KATEGORI PENILAIAN (MURNI) --
                                        </SelectLabel>
                                        {scoringCategories.map((cat) => (
                                            <SelectItem
                                                key={`scoring-${cat.scoring_category_id}`}
                                                value={`scoring-${cat.scoring_category_id}`}
                                            >
                                                {cat.master_category
                                                    ?.category_name ||
                                                    cat.category_name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-60 shrink-0">
                            <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                Urutkan
                            </Label>
                            <Select
                                value={filters.sort}
                                onValueChange={handleSortChange}
                                disabled={!isVisible}
                            >
                                <SelectTrigger className="h-9 w-full border-border/80 bg-background shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rank">
                                        Berdasarkan Peringkat
                                    </SelectItem>
                                    <SelectItem value="appearance_order">
                                        Berdasarkan Nomor Urut
                                    </SelectItem>
                                    <SelectItem value="name">
                                        Berdasarkan Nama Tim
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Card className="overflow-hidden border-border/70 p-0 shadow-sm">
                        {/* 1. TAMPILAN MOBILE (CARD LAYOUT) */}
                        <div className="flex flex-col gap-4 bg-muted/10 p-4 sm:hidden">
                            {isVisible === false ? (
                                <>
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Calculator className="h-6 w-6 opacity-40" />
                                    </div>
                                    <h3 className="text-lg font-bold">
                                        Rapor Hasil Penilaian Belum Dibuka
                                    </h3>
                                    <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                        Rincian nilai dan rapor untuk semua tim
                                        belum dirilis secara resmi oleh panitia
                                        penyelenggara.
                                    </p>
                                </>
                            ) : leaderboardData?.data?.length > 0 ? (
                                leaderboardData.data.map(
                                    (row: any, index: number) => {
                                        const participation = row.participation;
                                        const tieExists = checkIsTie(
                                            index,
                                            leaderboardData.data,
                                        );

                                        const visualRowNumber =
                                            (leaderboardData.from || 1) + index;

                                        const actualRank =
                                            row.actual_rank ?? visualRowNumber;

                                        const isMyTeam =
                                            role === 'official_team' &&
                                            myOfficialTeamId &&
                                            participation?.official_team_id ===
                                                myOfficialTeamId;

                                        // PENCARIAN JUARA BERDASARKAN actual_rank ASLI
                                        const championTitle = isChampion
                                            ? activeEventChampions?.find(
                                                  (ec: any) =>
                                                      Number(
                                                          ec.rank_position,
                                                      ) === Number(actualRank),
                                              )?.champion?.champion_name
                                            : null;

                                        return (
                                            <div
                                                key={
                                                    row.recap_id ||
                                                    row.score_id ||
                                                    index
                                                }
                                                className={`relative flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-4 shadow-sm ${isMyTeam ? 'ring-2 ring-primary/50' : ''}`}
                                            >
                                                {/* Header Card: Peringkat & Nama Tim */}
                                                <div className="flex items-start gap-3 border-b border-border/50 pb-3">
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${getRankClassName(Number(   ))}`}
                                                    >
                                                        {visualRowNumber}
                                                    </div>
                                                    <div className="flex min-w-0 flex-col">
                                                        <span className="leading-tight font-bold text-foreground">
                                                            {
                                                                participation?.team_name
                                                            }
                                                            {isMyTeam && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="ml-2 h-5 px-1.5 text-[10px]"
                                                                >
                                                                    <Star className="mr-1 h-3 w-3" />{' '}
                                                                    Tim Anda
                                                                </Badge>
                                                            )}
                                                        </span>
                                                        {championTitle ? (
                                                            <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500">
                                                                <Trophy className="h-3.5 w-3.5" />
                                                                {championTitle}
                                                            </span>
                                                        ) : (
                                                            <span className="mt-0.5 text-xs text-muted-foreground">
                                                                No. Urut:{' '}
                                                                {participation?.appearance_order ??
                                                                    '-'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Rincian Nilai */}
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {isChampion ? (
                                                        <>
                                                            {activeCategoryData?.formulas?.map(
                                                                (f: any) => {
                                                                    const categoryScores =
                                                                        participation?.team_scores?.filter(
                                                                            (
                                                                                ts: any,
                                                                            ) =>
                                                                                ts.scoring_category_id ===
                                                                                f.scoring_category_id,
                                                                        ) || [];
                                                                    const raw =
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
                                                                    const val =
                                                                        raw *
                                                                        f.weight_multiplier;
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                f.formula_id
                                                                            }
                                                                            className="flex flex-col rounded border border-border/30 bg-muted/30 p-2"
                                                                        >
                                                                            <span className="text-[10px] leading-tight font-bold text-muted-foreground uppercase">
                                                                                {f
                                                                                    .scoring_category
                                                                                    ?.master_category
                                                                                    ?.category_name ||
                                                                                    f
                                                                                        .scoring_category
                                                                                        ?.category_name}
                                                                            </span>
                                                                            <span className="font-semibold text-foreground">
                                                                                {val.toFixed(
                                                                                    2,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                            <div className="flex flex-col rounded border border-destructive/20 bg-destructive/5 p-2">
                                                                <span className="text-[10px] font-bold text-destructive uppercase">
                                                                    Penalti
                                                                </span>
                                                                <span className="font-semibold text-destructive">
                                                                    -{' '}
                                                                    {participation?.team_penalties?.reduce(
                                                                        (
                                                                            sum: number,
                                                                            p: any,
                                                                        ) =>
                                                                            sum +
                                                                            p.penalty_value *
                                                                                p.occurrence_count,
                                                                        0,
                                                                    ) || 0}
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="col-span-2 flex items-center justify-between rounded border border-primary/20 bg-primary/5 p-3">
                                                            <span className="text-xs font-bold text-primary uppercase">
                                                                Total Nilai
                                                                Murni
                                                            </span>
                                                            <span className="text-lg font-black text-primary">
                                                                {
                                                                    row.total_score
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Final Score & Aksi */}
                                                {isChampion && (
                                                    <div className="mt-1 flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm">
                                                        <span className="text-sm font-bold uppercase">
                                                            Nilai Akhir
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xl font-black">
                                                                {
                                                                    row.final_score
                                                                }
                                                            </span>
                                                            {tieExists && (
                                                                <>
                                                                    <AlertTriangle className="h-5 w-5 text-warning" />
                                                                    <p className="">
                                                                        Seri
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tombol Aksi Panitia */}
                                                {role === 'committee' && (
                                                    <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                                                        {tieExists &&
                                                            isChampion && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                                                    onClick={() =>
                                                                        openBulkOverrideModal(
                                                                            row.final_score,
                                                                        )
                                                                    }
                                                                >
                                                                    Selesaikan
                                                                    Seri
                                                                </Button>
                                                            )}
                                                        <Link
                                                            href={`/${role}/events/${event.public_id}/participations/${participation?.public_id}/evaluation_result`}
                                                            className={
                                                                tieExists &&
                                                                isChampion
                                                                    ? 'flex-none'
                                                                    : 'w-full'
                                                            }
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full gap-1.5 border-border/60"
                                                            >
                                                                <FileText className="h-4 w-4 text-primary" />{' '}
                                                                Rekap Nilai
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    },
                                )
                            ) : (
                                <div className="rounded-lg border border-dashed border-border/60 bg-background p-8 text-center text-sm text-muted-foreground">
                                    Belum ada data nilai yang memenuhi syarat
                                    untuk kategori ini.
                                </div>
                            )}
                        </div>

                        {/* 2. TAMPILAN DESKTOP/TABLET (TABEL KLASIK) */}
                        <div className="hidden w-full overflow-x-auto sm:block">
                            {isVisible === false ? (
                                <Card className="space-y-4 p-12 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <Calculator className="h-6 w-6 opacity-40" />
                                    </div>
                                    <h3 className="text-lg font-bold">
                                        Rapor Hasil Penilaian Belum Dibuka
                                    </h3>
                                    <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                        Rincian nilai dan rapor untuk tim Anda
                                        belum dirilis secara resmi oleh panitia
                                        penyelenggara.
                                    </p>
                                </Card>
                            ) : (
                                <Table className="w-full min-w-175 border-collapse text-left text-sm">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="w-20 text-center font-bold">
                                                No / Peringkat
                                            </TableHead>
                                            <TableHead className="min-w-50 font-bold">
                                                Nama Tim / Peserta
                                            </TableHead>
                                            {isChampion ? (
                                                <>
                                                    {activeCategoryData?.formulas?.map(
                                                        (f: any) => (
                                                            <TableHead
                                                                key={
                                                                    f.formula_id
                                                                }
                                                                className="text-center text-xs font-bold"
                                                            >
                                                                {f
                                                                    .scoring_category
                                                                    ?.master_category
                                                                    ?.category_name ||
                                                                    f
                                                                        .scoring_category
                                                                        ?.category_name}
                                                                <br />
                                                                <span className="text-[10px] font-normal text-muted-foreground">
                                                                    (x{' '}
                                                                    {
                                                                        f.weight_multiplier
                                                                    }
                                                                    )
                                                                </span>
                                                            </TableHead>
                                                        ),
                                                    )}
                                                    <TableHead className="text-center font-bold text-destructive">
                                                        Pengurangan
                                                    </TableHead>
                                                    <TableHead className="text-center text-base font-bold text-primary">
                                                        Nilai Akhir
                                                    </TableHead>
                                                </>
                                            ) : (
                                                <TableHead className="text-center text-base font-bold text-primary">
                                                    Total Nilai Murni
                                                </TableHead>
                                            )}
                                            {role === 'committee' && (
                                                <TableHead className="w-28 text-center font-bold">
                                                    Aksi
                                                </TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-border/50">
                                        {leaderboardData?.data?.length > 0 ? (
                                            leaderboardData.data.map(
                                                (row: any, index: number) => {
                                                    const participation =
                                                        row.participation;
                                                    const tieExists =
                                                        checkIsTie(
                                                            index,
                                                            leaderboardData.data,
                                                        );
                                                    const visualRowNumber =
                                                        (leaderboardData.from ||
                                                            1) + index;

                                                    const actualRank =
                                                        row.actual_rank ??
                                                        visualRowNumber;

                                                    const isMyTeam =
                                                        role ===
                                                            'official_team' &&
                                                        myOfficialTeamId &&
                                                        participation?.official_team_id ===
                                                            myOfficialTeamId;

                                                    // PENCARIAN JUARA BERDASARKAN actual_rank ASLI
                                                    const championTitle =
                                                        isChampion
                                                            ? activeEventChampions?.find(
                                                                  (ec: any) =>
                                                                      Number(
                                                                          ec.rank_position,
                                                                      ) ===
                                                                      Number(
                                                                          actualRank,
                                                                      ),
                                                              )?.champion
                                                                  ?.champion_name
                                                            : null;

                                                    return (
                                                        <TableRow
                                                            key={
                                                                row.recap_id ||
                                                                row.score_id ||
                                                                index
                                                            }
                                                            className="transition-colors hover:bg-muted/20"
                                                        >
                                                            {/* Sel Peringkat */}
                                                            <TableCell className="text-center">
                                                                <div className="flex flex-col items-center justify-center">
                                                                    <span
                                                                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${getRankClassName(Number(actualRank))}`}
                                                                    >
                                                                        {
                                                                            visualRowNumber
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </TableCell>

                                                            {/* Sel Nama Tim */}
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="flex items-center gap-2 font-bold text-foreground">
                                                                        {
                                                                            participation?.team_name
                                                                        }
                                                                        {isMyTeam && (
                                                                            <Badge
                                                                                variant="default"
                                                                                className="h-5 px-1.5 text-[10px]"
                                                                            >
                                                                                <Star className="mr-1 h-3 w-3" />{' '}
                                                                                Tim
                                                                                Anda
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                    {championTitle ? (
                                                                        <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500">
                                                                            <Trophy className="h-3.5 w-3.5" />
                                                                            {
                                                                                championTitle
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            No.
                                                                            Urut:{' '}
                                                                            {participation?.appearance_order ??
                                                                                '-'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>

                                                            {/* Sel Nilai Murni Berbobot (Champion Mode) */}
                                                            {isChampion ? (
                                                                <>
                                                                    {activeCategoryData?.formulas?.map(
                                                                        (
                                                                            f: any,
                                                                        ) => {
                                                                            const categoryScores =
                                                                                participation?.team_scores?.filter(
                                                                                    (
                                                                                        ts: any,
                                                                                    ) =>
                                                                                        ts.scoring_category_id ===
                                                                                        f.scoring_category_id,
                                                                                ) ||
                                                                                [];
                                                                            const raw =
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
                                                                            const val =
                                                                                raw *
                                                                                f.weight_multiplier;
                                                                            return (
                                                                                <TableCell
                                                                                    key={
                                                                                        f.formula_id
                                                                                    }
                                                                                    className="text-center font-medium"
                                                                                >
                                                                                    {val.toFixed(
                                                                                        2,
                                                                                    )}
                                                                                </TableCell>
                                                                            );
                                                                        },
                                                                    )}

                                                                    {/* Sel Penalti */}
                                                                    <TableCell className="text-center font-medium text-destructive">
                                                                        -{' '}
                                                                        {participation?.team_penalties?.reduce(
                                                                            (
                                                                                sum: number,
                                                                                p: any,
                                                                            ) =>
                                                                                sum +
                                                                                p.penalty_value *
                                                                                    p.occurrence_count,
                                                                            0,
                                                                        ) || 0}
                                                                    </TableCell>

                                                                    {/* Sel Nilai Akhir */}
                                                                    <TableCell className="text-center">
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <span className="text-lg font-black text-primary">
                                                                                {
                                                                                    row.final_score
                                                                                }
                                                                            </span>
                                                                            {tieExists && (
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <div
                                                                                        title="Terdapat nilai seri (TIE) pada perolehan akhir."
                                                                                        className="mt-0.5 flex cursor-help"
                                                                                    >
                                                                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                                                                    </div>
                                                                                    {role ===
                                                                                        'committee' && (
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            className="h-6 border-amber-500/30 bg-amber-500/10 px-2 text-[10px] whitespace-nowrap text-amber-600 hover:bg-amber-500/20"
                                                                                            onClick={() =>
                                                                                                openBulkOverrideModal(
                                                                                                    row.final_score,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Selesaikan
                                                                                            Seri
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </>
                                                            ) : (
                                                                <TableCell className="text-center text-lg font-black text-primary">
                                                                    {
                                                                        row.total_score
                                                                    }
                                                                </TableCell>
                                                            )}

                                                            {/* Sel Aksi (Panitia) */}
                                                            {role ===
                                                                'committee' && (
                                                                <TableCell className="text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <Link
                                                                            href={`/${role}/events/${event.public_id}/participations/${participation?.public_id}/evaluation_result`}
                                                                        >
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8 gap-1 text-xs text-muted-foreground hover:text-primary"
                                                                            >
                                                                                <FileText className="h-3.5 w-3.5" />{' '}
                                                                                Rekap
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    );
                                                },
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={
                                                        isChampion
                                                            ? (activeCategoryData
                                                                  ?.formulas
                                                                  ?.length ||
                                                                  0) + 5
                                                            : 4
                                                    }
                                                    className="h-32 text-center text-muted-foreground"
                                                >
                                                    Belum ada data nilai yang
                                                    memenuhi syarat untuk
                                                    kategori ini.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {leaderboardData?.links &&
                            leaderboardData.links.length > 3 && (
                                <div className="flex items-center justify-center border-t border-border/50 bg-muted/10 p-4">
                                    <div className="flex items-center gap-1">
                                        {leaderboardData.links.map(
                                            (link: any, idx: number) => (
                                                <Link
                                                    key={idx}
                                                    href={link.url || '#'}
                                                    className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors ${
                                                        !link.url
                                                            ? 'pointer-events-none text-muted-foreground opacity-50'
                                                            : link.active
                                                              ? 'bg-primary text-primary-foreground shadow-sm'
                                                              : 'text-foreground hover:bg-muted'
                                                    }`}
                                                    preserveScroll
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </Card>
                </div>
            </div>

            {/* BULK OVERRIDE MODAL TIEBREAKER */}
            {role === 'committee' && (
                <Dialog
                    open={isBulkOverrideModalOpen}
                    onOpenChange={setIsBulkOverrideModalOpen}
                >
                    <DialogContent className="sm:max-w-4xl lg:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Sidang Pemecah Nilai Seri (Tiebreaker)
                            </DialogTitle>
                            <DialogDescription>
                                Perbandingan rincian perolehan nilai dari
                                tim-tim yang seri. Tentukan peringkat akhir
                                dengan memilih dropdown di bawah. Peringkat yang
                                sudah dipilih tim lain akan otomatis terkunci.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleBulkOverrideSubmit}
                            className="space-y-4 py-2"
                        >
                            <div className="overflow-x-auto rounded-md border border-border/50">
                                <Table className="min-w-full">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="min-w-40 font-bold whitespace-nowrap">
                                                Tim Peserta
                                            </TableHead>

                                            {isChampion &&
                                                activeCategoryData?.formulas?.map(
                                                    (f: any) => (
                                                        <TableHead
                                                            key={`modal-th-${f.formula_id}`}
                                                            className="text-center text-xs font-bold whitespace-nowrap"
                                                        >
                                                            {f.scoring_category
                                                                ?.master_category
                                                                ?.category_name ||
                                                                f
                                                                    .scoring_category
                                                                    ?.category_name}
                                                        </TableHead>
                                                    ),
                                                )}

                                            {isChampion && (
                                                <TableHead className="text-center font-bold whitespace-nowrap text-destructive">
                                                    Pengurangan
                                                </TableHead>
                                            )}
                                            <TableHead className="text-center font-bold whitespace-nowrap">
                                                Nilai Akhir
                                            </TableHead>
                                            <TableHead className="w-48 text-center font-bold whitespace-nowrap">
                                                Peringkat Final
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.overrides.map((ov, index) => {
                                            const penaltySum =
                                                ov.participation?.team_penalties?.reduce(
                                                    (sum: number, p: any) =>
                                                        sum +
                                                        p.penalty_value *
                                                            p.occurrence_count,
                                                    0,
                                                ) || 0;
                                            const availableRanks =
                                                getAvailableRanks(index);

                                            return (
                                                <TableRow key={ov.recap_id}>
                                                    <TableCell className="font-medium">
                                                        {ov.team_name}
                                                    </TableCell>

                                                    {isChampion &&
                                                        activeCategoryData?.formulas?.map(
                                                            (f: any) => {
                                                                const categoryScores =
                                                                    ov.participation?.team_scores?.filter(
                                                                        (
                                                                            ts: any,
                                                                        ) =>
                                                                            ts.scoring_category_id ===
                                                                            f.scoring_category_id,
                                                                    ) || [];
                                                                const raw =
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
                                                                const val =
                                                                    raw *
                                                                    f.weight_multiplier;
                                                                return (
                                                                    <TableCell
                                                                        key={`modal-td-${f.formula_id}`}
                                                                        className="text-center font-medium"
                                                                    >
                                                                        {val.toFixed(
                                                                            2,
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            },
                                                        )}

                                                    {isChampion && (
                                                        <TableCell className="text-center font-medium text-destructive">
                                                            - {penaltySum}
                                                        </TableCell>
                                                    )}

                                                    <TableCell className="text-center font-bold text-primary">
                                                        {ov.final_score}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Select
                                                            value={
                                                                ov.rank_override
                                                                    ? ov.rank_override.toString()
                                                                    : ''
                                                            }
                                                            onValueChange={(
                                                                val,
                                                            ) =>
                                                                updateOverrideRank(
                                                                    index,
                                                                    val,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 w-full font-bold text-primary">
                                                                <SelectValue placeholder="Pilih Peringkat..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableRanks.map(
                                                                    ({
                                                                        rank,
                                                                        disabled,
                                                                    }) => (
                                                                        <SelectItem
                                                                            key={
                                                                                rank
                                                                            }
                                                                            value={rank.toString()}
                                                                            disabled={
                                                                                disabled
                                                                            }
                                                                        >
                                                                            Peringkat{' '}
                                                                            {
                                                                                rank
                                                                            }{' '}
                                                                            {disabled &&
                                                                                '(Sudah dipilih)'}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <p className="text-xs text-muted-foreground">
                                    <em>
                                        Semua tim yang seri wajib ditentukan
                                        peringkatnya secara unik.
                                    </em>
                                </p>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="lg"
                                    onClick={handleResetRanks}
                                >
                                    Reset Pilihan Peringkat
                                </Button>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setIsBulkOverrideModalOpen(false)
                                    }
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Simpan Peringkat
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );

    if (role === 'official_team') {
        return <AppLayout>{pageContent}</AppLayout>;
    }

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                role,
                committeePosition || undefined,
            )}
        >
            {pageContent}
        </InnerAppLayout>
    );
}
