import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    Play,
    Lock,
} from 'lucide-react';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

/* ==========================================
   TYPES & STATUS HELPERS
========================================== */
interface ScoringProps {
    event: any;
    participation: any;
    scoringCategories: any[];
    existingScores: any[];
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'ready':
            return (
                <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                    Ready
                </Badge>
            );
        case 'draft':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500 bg-amber-50 text-amber-600"
                >
                    Draft
                </Badge>
            );
        case 'locked':
            return (
                <Badge
                    variant="default"
                    className="bg-emerald-500 hover:bg-emerald-600"
                >
                    Locked
                </Badge>
            );
        case 'needs_review':
            return <Badge variant="destructive">Needs Review</Badge>;
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
};

/* ==========================================
   KOMPONEN ACCORDION KATEGORI (RESPONSIVE)
========================================== */
const CategoryAccordion = ({
    category,
    existingScores,
    event,
    participation,
    userRole,
}: {
    category: any;
    existingScores: any[];
    event: any;
    participation: any;
    userRole: string;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showLockDialog, setShowLockDialog] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    const evaluateUrl = `/${userRole}/events/${event.public_id}/participants/${participation.public_id}/evaluate/${category.scoring_category_id}`;
    const lockUrl = `/${userRole}/events/${event.public_id}/participants/${participation.public_id}/lock/${category.scoring_category_id}`;

    const handleOpenLockModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowLockDialog(true);
    };

    const confirmLock = () => {
        setIsLocking(true);
        router.post(
            lockUrl,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsLocking(false);
                    setShowLockDialog(false);
                },
            },
        );
    };

    const isLocked = category.category_status === 'locked';
    const categoryTitle =
        category.master_category?.category_name ||
        category.category_name ||
        'Kategori';

    return (
        <Card className="overflow-hidden border-border/70 shadow-sm">
            {/* ACCORDION HEADER - RESPONSIVE FLEXBOX */}
            <div
                className="flex cursor-pointer flex-col gap-3 bg-muted/20 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex min-w-0 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <ClipboardCheck className="h-5 w-5 shrink-0 text-primary" />
                        <h3 className="truncate text-base font-bold text-foreground sm:text-lg">
                            {categoryTitle}
                        </h3>
                        <div>{getStatusBadge(category.category_status)}</div>
                    </div>
                    {category.category_status === 'draft' && (
                        <p className="text-xs text-muted-foreground">
                            *Kriteria yang dibiarkan kosong akan otomatis
                            bernilai 0 saat dikunci.
                        </p>
                    )}
                </div>

                {/* TOMBOL AKSI METODE FLEX-WRAP */}
                <div
                    className="flex items-center justify-between gap-2 border-t border-border/40 pt-2 sm:justify-end sm:border-t-0 sm:pt-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        {(category.category_status === 'draft' ||
                            category.category_status === 'needs_review') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenLockModal}
                                className="h-8 border-amber-500 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            >
                                <Lock className="mr-1 h-3.5 w-3.5" /> Kunci
                                Nilai
                            </Button>
                        )}

                        {!isLocked && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => router.get(evaluateUrl)}
                                className="h-8 gap-1 text-xs shadow-sm"
                            >
                                <Play className="h-3.5 w-3.5" />
                                {category.category_status === 'needs_review'
                                    ? 'Revisi Nilai'
                                    : category.category_status === 'draft'
                                      ? 'Lanjutkan'
                                      : 'Mulai Menilai'}
                            </Button>
                        )}
                    </div>

                    <div
                        className="cursor-pointer rounded-md p-1 hover:bg-muted"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </div>

            {isOpen && (
                <CardContent className="p-0">
                    {/* ===================================================
                       1. TAMPILAN MOBILE (CARD LIST LAYOUT)
                       =================================================== */}
                    <div className="flex flex-col divide-y divide-border/50 sm:hidden">
                        {category.assessment_criteria.map(
                            (crit: any, cIdx: number) => (
                                <div
                                    key={crit.criteria_id}
                                    className="space-y-3 bg-card p-4"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {cIdx + 1}
                                        </span>
                                        <h4 className="text-xs leading-snug font-bold text-foreground">
                                            {crit.master_criteria
                                                ?.criteria_name ||
                                                crit.masterCriteria
                                                    ?.criteria_name ||
                                                `Kriteria #${crit.master_criteria_id}`}
                                        </h4>
                                    </div>

                                    <div className="space-y-2 pl-8">
                                        {crit.rubric_categories.map(
                                            (rubricCol: any) => (
                                                <div
                                                    key={
                                                        rubricCol.rubric_category_id
                                                    }
                                                    className="space-y-1"
                                                >
                                                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                        {
                                                            rubricCol.category_label
                                                        }
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {rubricCol.rubric_scores.map(
                                                            (score: any) => {
                                                                const isSelected =
                                                                    existingScores.some(
                                                                        (
                                                                            es: any,
                                                                        ) =>
                                                                            es.rubric_score_id ===
                                                                            score.rubric_score_id,
                                                                    );
                                                                return (
                                                                    <div
                                                                        key={
                                                                            score.rubric_score_id
                                                                        }
                                                                        className={`flex h-7 items-center justify-center rounded-md border px-3 text-xs font-semibold ${
                                                                            isSelected
                                                                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                                                : 'border-border/60 bg-muted/20 text-muted-foreground opacity-50'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            score.score_value
                                                                        }
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>

                    {/* ===================================================
                       2. TAMPILAN DESKTOP (TABLE LAYOUT)
                       =================================================== */}
                    <div className="hidden w-full overflow-x-auto sm:block">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/10">
                                <tr>
                                    <th className="border-b border-border/50 p-4 font-semibold text-muted-foreground">
                                        Kriteria / Materi Gerakan
                                    </th>
                                    {category.assessment_criteria[0]?.rubric_categories.map(
                                        (rubricCol: any) => (
                                            <th
                                                key={
                                                    rubricCol.rubric_category_id
                                                }
                                                className="border-b border-border/50 p-4 font-semibold text-muted-foreground"
                                            >
                                                {rubricCol.category_label}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {category.assessment_criteria.map(
                                    (crit: any) => (
                                        <tr
                                            key={crit.criteria_id}
                                            className="transition-colors hover:bg-muted/5"
                                        >
                                            <td className="p-4 font-medium text-foreground">
                                                {crit.master_criteria
                                                    ?.criteria_name ||
                                                    crit.masterCriteria
                                                        ?.criteria_name ||
                                                    `Kriteria #${crit.master_criteria_id}`}
                                            </td>
                                            {crit.rubric_categories.map(
                                                (rubricCol: any) => (
                                                    <td
                                                        key={
                                                            rubricCol.rubric_category_id
                                                        }
                                                        className="p-4"
                                                    >
                                                        <div className="flex flex-wrap gap-2">
                                                            {rubricCol.rubric_scores.map(
                                                                (
                                                                    score: any,
                                                                ) => {
                                                                    const isSelected =
                                                                        existingScores.some(
                                                                            (
                                                                                es: any,
                                                                            ) =>
                                                                                es.rubric_score_id ===
                                                                                score.rubric_score_id,
                                                                        );
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                score.rubric_score_id
                                                                            }
                                                                            className={`flex h-8 w-10 items-center justify-center rounded-md border font-semibold transition-all ${
                                                                                isSelected
                                                                                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                                                                    : 'border-border/60 bg-background text-muted-foreground opacity-50'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                score.score_value
                                                                            }
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            )}

            {/* CONFIRMATION DIALOG KUNCI NILAI */}
            <ConfirmationDialog
                open={showLockDialog}
                onOpenChange={setShowLockDialog}
                title={`Kunci Nilai ${categoryTitle}?`}
                description={`Apakah Anda yakin ingin mengunci nilai untuk kategori ${categoryTitle}? Setelah dikunci, nilai ini tidak dapat diubah kembali kecuali dibuka ulang oleh panitia.`}
                confirmText="Ya, Kunci Nilai"
                cancelText="Batal"
                isProcessing={isLocking}
                onConfirm={confirmLock}
            />
        </Card>
    );
};

/* ==========================================
   HALAMAN UTAMA PRATINJAU
========================================== */
export default function TeamPreview({
    event,
    participation,
    scoringCategories,
    existingScores,
}: ScoringProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const backUrl = `/${userRole}/events/${event.public_id}/participants`;

    let computedGlobalStatus = 'ready';
    const isAnyNeedsReview = scoringCategories.some(
        (c) => c.category_status === 'needs_review',
    );
    const allLocked = scoringCategories.every(
        (c) => c.category_status === 'locked',
    );
    const isAnyDrafting = scoringCategories.some(
        (c) => c.category_status === 'draft',
    );

    if (isAnyNeedsReview) {
        computedGlobalStatus = 'needs_review';
    } else if (allLocked && scoringCategories.length > 0) {
        computedGlobalStatus = 'locked';
    } else if (isAnyDrafting) {
        computedGlobalStatus = 'draft';
    }

    return (
        <AppLayout>
            <Head title={`Pratinjau Penilaian - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-6xl space-y-4 p-3 pb-12 sm:space-y-6 sm:p-6 lg:p-8">
                {/* HEADER UTAMA */}
                <div className="flex flex-col gap-2 border-b border-border/50 pb-4">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary sm:text-sm"
                    >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />{' '}
                        Kembali ke Antrean
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                        Pratinjau Penilaian Tim
                    </h1>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Pilih kategori untuk mulai atau melanjutkan penilaian.
                    </p>
                </div>

                {/* KARTU RINGKASAN TIM */}
                <Card className="border-t-4 border-t-primary bg-primary/5 shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-inner sm:h-14 sm:w-14 sm:text-xl">
                                {participation.appearance_order ?? '?'}
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                                <h2 className="truncate text-lg leading-tight font-bold text-foreground sm:text-xl">
                                    {participation.team_name}
                                </h2>
                                <span className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                                    Jenjang:{' '}
                                    {
                                        participation.event_level?.level
                                            ?.level_name
                                    }{' '}
                                    | PIC: {participation.pic_name}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                                Status Keseluruhan
                            </span>
                            {getStatusBadge(computedGlobalStatus)}
                        </div>
                    </CardContent>
                </Card>

                {/* ACCORDION DAFTAR KATEGORI */}
                <div className="space-y-4 sm:space-y-6">
                    {scoringCategories.map((category) => (
                        <CategoryAccordion
                            key={category.scoring_category_id}
                            category={category}
                            existingScores={existingScores}
                            event={event}
                            participation={participation}
                            userRole={userRole}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
