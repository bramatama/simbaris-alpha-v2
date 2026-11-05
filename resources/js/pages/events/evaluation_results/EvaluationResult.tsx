import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Filter, Unlock, EyeOff } from 'lucide-react';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

/* =========================================================
   TYPES
========================================================= */
interface EvaluationResultProps {
    event: any;
    participation: any;
    availableCategories: any[];
    activeCategory: any | null;
    judgeHeaders: { judge_id: number; label: string; name: string }[];
    scoresMatrix: {
        criteria_id: number;
        criteria_name: string;
        scores: Record<number, number | null>;
    }[];
    judgeTotals: Record<number, number>;
    grandTotal: number;
    judgeStatuses: Record<number, string>;
    isLocked: boolean;
    isVisible?: boolean;
}

/* =========================================================
   COMPONENT
========================================================= */
export default function EvaluationResult({
    event,
    participation,
    availableCategories,
    activeCategory,
    judgeHeaders,
    scoresMatrix,
    judgeTotals,
    grandTotal,
    judgeStatuses,
    isLocked,
    isVisible = true,
}: EvaluationResultProps) {
    const { auth, url } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;

    const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
    const [isProcessingUnlock, setIsProcessingUnlock] = useState(false);

    const baseUrl = url.split('?')[0];
    const handleBack = () => {
        if (userRole === 'committee') {
            window.history.back();
        } else {
            router.visit(
                `/official_team/participations/${participation.public_id}/information`,
            );
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        router.get(
            baseUrl,
            { category: categoryId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const confirmUnlockRequest = () => {
        if (!activeCategory) return;
        setIsProcessingUnlock(true);
        router.post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/evaluation_result/unlock`,
            { scoring_category_id: activeCategory?.scoring_category_id },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsProcessingUnlock(false);
                    setIsUnlockDialogOpen(false);
                },
            },
        );
    };

    const categoryName =
        activeCategory?.master_category?.category_name ||
        activeCategory?.category_name ||
        'KATEGORI';

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'locked':
                return 'default';
            case 'needs_review':
                return 'destructive';
            case 'draft':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <InnerAppLayout
            sidebarNavItems={
                userRole === 'official_team'
                    ? getParticipationInnerNav(
                          participation.public_id,
                          event.public_id,
                      )
                    : getEventInnerNav(
                          event.public_id,
                          userRole,
                          committeePosition || undefined,
                      )
            }
        >
            <Head title={`Hasil Penilaian - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER & INFO TIM */}
                <div className="space-y-5 border-b border-border/50 pb-5">
                    <div className="flex flex-col gap-2">
                        <Link
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleBack();
                            }}
                            className="inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Kembali
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                Matriks Hasil Penilaian
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                {participation.team_name}
                                <span className="mx-1.5">·</span>
                                No. Urut:{' '}
                                {participation.appearance_order ?? '?'}
                            </p>
                        </div>
                    </div>

                    {/* Filter dan Aksi */}
                    {isVisible && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div className="w-full space-y-1.5 sm:max-w-sm">
                                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Kategori Penilaian
                                </span>

                                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-1.5">
                                    <Filter className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />

                                    <Select
                                        value={
                                            activeCategory?.scoring_category_id?.toString() ??
                                            ''
                                        }
                                        onValueChange={handleCategoryChange}
                                        disabled={
                                            availableCategories.length === 0
                                        }
                                    >
                                        <SelectTrigger className="w-full border-none bg-background shadow-sm">
                                            <SelectValue placeholder="Pilih kategori..." />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {availableCategories.map((cat) => (
                                                <SelectItem
                                                    key={
                                                        cat.scoring_category_id
                                                    }
                                                    value={cat.scoring_category_id.toString()}
                                                >
                                                    {cat.master_category
                                                        ?.category_name ||
                                                        cat.category_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {userRole === 'committee' &&
                                activeCategory &&
                                isLocked && (
                                    <Button
                                        onClick={() =>
                                            setIsUnlockDialogOpen(true)
                                        }
                                        variant="destructive"
                                        className="h-10 w-full shadow-sm sm:w-auto sm:min-w-40"
                                    >
                                        <Unlock className="mr-2 h-4 w-4" />
                                        Butuh Review
                                    </Button>
                                )}
                        </div>
                    )}
                </div>

                {/* KONDISI BLANK STATE */}
                {!isVisible ? (
                    <Card className="space-y-4 border-dashed border-border/80 bg-muted/10 p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <EyeOff className="h-6 w-6 opacity-60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold">
                                Matriks Hasil Penilaian Belum Dibuka
                            </h3>
                            <p className="mx-auto max-w-md text-sm text-muted-foreground">
                                Rincian matriks nilai detail untuk event ini
                                belum dipublikasikan atau diaktifkan oleh
                                panitia. Silakan periksa kembali nanti.
                            </p>
                        </div>
                    </Card>
                ) : (
                    /* TABEL MATRIKS & MOBILE CARDS */
                    <Card className="overflow-hidden border-border/70 p-0 shadow-sm">
                        {/* TAMPILAN MOBILE */}
                        <div className="flex flex-col gap-4 bg-muted/10 p-4 sm:hidden">
                            {scoresMatrix.map((row, idx) => (
                                <div
                                    key={row.criteria_id}
                                    className="rounded-xl border border-border/60 bg-background p-4 shadow-sm"
                                >
                                    <div className="mb-3 flex items-start gap-3 border-b border-border/50 pb-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {idx + 1}
                                        </div>
                                        <div className="leading-snug font-semibold text-foreground">
                                            {row.criteria_name}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {judgeHeaders.map((j) => {
                                            const score =
                                                row.scores[j.judge_id];
                                            return (
                                                <div
                                                    key={j.judge_id}
                                                    className="flex flex-col justify-center rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-center"
                                                >
                                                    <span className="mb-1 text-[10px] font-bold text-muted-foreground uppercase">
                                                        {j.label}
                                                    </span>
                                                    <span className="text-sm font-black text-foreground">
                                                        {score !== null &&
                                                        score !== undefined
                                                            ? score
                                                            : '-'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {scoresMatrix.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border/60 bg-background p-8 text-center text-sm text-muted-foreground italic">
                                    Belum ada kriteria atau nilai untuk kategori
                                    ini.
                                </div>
                            )}

                            {scoresMatrix.length > 0 && (
                                <div className="mt-2 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 shadow-sm">
                                    <h3 className="mb-3 border-b border-primary/20 pb-2 text-sm font-bold tracking-wider text-primary uppercase">
                                        Rekap Total {categoryName}
                                    </h3>
                                    <div className="mb-4 space-y-2.5">
                                        {judgeHeaders.map((j) => (
                                            <div
                                                key={j.judge_id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="font-medium text-muted-foreground">
                                                    {j.label}{' '}
                                                    <span className="text-xs opacity-70">
                                                        ({j.name})
                                                    </span>
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {judgeTotals[j.judge_id] ??
                                                        0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-md">
                                        <span className="text-sm font-bold uppercase">
                                            Grand Total
                                        </span>
                                        <span className="text-xl font-black">
                                            {grandTotal ?? 0}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TAMPILAN DESKTOP */}
                        <div className="hidden w-full overflow-x-auto overscroll-x-contain sm:block">
                            <table className="w-full min-w-175 border-collapse text-left text-sm">
                                <thead className="border-b border-border bg-muted/60 font-semibold text-foreground">
                                    <tr>
                                        <th className="w-16 border-r border-border px-4 py-3 text-center">
                                            NO
                                        </th>
                                        <th className="border-r border-border px-4 py-3 uppercase">
                                            ABA-ABA / KRITERIA
                                        </th>
                                        {judgeHeaders.map((j) => {
                                            const status =
                                                judgeStatuses[j.judge_id] ||
                                                'draft';
                                            return (
                                                <th
                                                    key={j.judge_id}
                                                    className="w-32 border-r border-border px-3 py-3 text-center"
                                                    title={j.name}
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-bold uppercase">
                                                            {j.label}
                                                        </span>
                                                        <span className="line-clamp-1 text-[10px] font-normal text-muted-foreground normal-case">
                                                            {j.name}
                                                        </span>
                                                        <Badge
                                                            variant={getStatusBadgeVariant(
                                                                status,
                                                            )}
                                                            className="mt-1 h-4 px-1.5 py-0 text-[9px] tracking-wider uppercase"
                                                        >
                                                            {status.replace(
                                                                '_',
                                                                ' ',
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {scoresMatrix.map((row, idx) => (
                                        <tr
                                            key={row.criteria_id}
                                            className="transition-colors hover:bg-muted/20"
                                        >
                                            <td className="border-r border-border/60 px-4 py-2.5 text-center font-medium text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="border-r border-border/60 px-4 py-2.5 font-medium text-foreground">
                                                {row.criteria_name}
                                            </td>
                                            {judgeHeaders.map((j) => {
                                                const score =
                                                    row.scores[j.judge_id];
                                                return (
                                                    <td
                                                        key={j.judge_id}
                                                        className="border-r border-border/60 px-3 py-2.5 text-center font-semibold text-foreground"
                                                    >
                                                        {score !== null &&
                                                        score !== undefined
                                                            ? score
                                                            : '-'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {scoresMatrix.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={
                                                    judgeHeaders.length + 2
                                                }
                                                className="px-4 py-12 text-center text-muted-foreground italic"
                                            >
                                                Belum ada kriteria atau nilai
                                                untuk kategori ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="border-t-2 border-border bg-muted/40 font-bold text-foreground">
                                    <tr className="border-b border-border/60">
                                        <td
                                            colSpan={2}
                                            className="border-r border-border/60 px-4 py-2.5 text-right uppercase"
                                        >
                                            NILAI
                                        </td>
                                        {judgeHeaders.map((j) => (
                                            <td
                                                key={j.judge_id}
                                                className="border-r border-border/60 px-3 py-2.5 text-center text-primary"
                                            >
                                                {judgeTotals[j.judge_id] ?? 0}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="bg-primary/5">
                                        <td
                                            colSpan={2}
                                            className="border-r border-border/60 px-4 py-3 text-right text-primary uppercase"
                                        >
                                            TOTAL NILAI {categoryName}
                                        </td>
                                        <td
                                            colSpan={judgeHeaders.length}
                                            className="px-3 py-3 text-center text-lg font-black tracking-widest text-primary"
                                        >
                                            {grandTotal ?? 0}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* CONFIRMATION DIALOG FOR UNLOCK REVIEW */}
            <ConfirmationDialog
                open={isUnlockDialogOpen}
                onOpenChange={setIsUnlockDialogOpen}
                title="Buka Kunci Penilaian Juri?"
                description="Status penilaian kategori ini akan diubah menjadi 'Needs Review' sehingga juri terkait dapat memperbaiki atau menyesuaikan kembali skor nilainya."
                variant="destructive"
                confirmText="Ya, Buka Kunci"
                cancelText="Batal"
                isProcessing={isProcessingUnlock}
                onConfirm={confirmUnlockRequest}
            />
        </InnerAppLayout>
    );
}
