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
   KOMPONEN ACCORDION KATEGORI
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

    const evaluateUrl = `/${userRole}/events/${event.public_id}/participants/${participation.public_id}/evaluate/${category.scoring_category_id}`;
    const lockUrl = `/${userRole}/events/${event.public_id}/participants/${participation.public_id}/lock/${category.scoring_category_id}`;

    const handleLock = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (
            window.confirm(
                `Apakah Anda yakin ingin mengunci nilai untuk kategori ${category.master_category.category_name}? Aksi ini bersifat permanen.`,
            )
        ) {
            router.post(lockUrl, {}, { preserveScroll: true });
        }
    };

    const isLocked =
        category.category_status === 'locked' ||
        category.category_status === 'needs_review';

    return (
        <Card className="overflow-hidden border-border/70 shadow-sm">
            <div
                className="flex cursor-pointer flex-col gap-4 bg-muted/20 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground sm:text-lg">
                        {category.master_category.category_name}
                    </h3>
                    <div className="ml-2">
                        {getStatusBadge(category.category_status)}
                    </div>
                    {category.category_status === 'draft' && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            *Kriteria yang dibiarkan kosong akan otomatis
                            bernilai 0 saat disimpan atau dikunci.
                        </p>
                    )}
                </div>

                <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    {category.category_status === 'draft' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLock}
                            className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        >
                            <Lock className="mr-1.5 h-4 w-4" /> Kunci Nilai
                        </Button>
                    )}

                    {!isLocked && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.get(evaluateUrl)}
                            className="gap-1.5 shadow-sm"
                        >
                            <Play className="h-4 w-4" />
                            {category.category_status === 'draft'
                                ? 'Lanjutkan'
                                : 'Mulai Menilai'}
                        </Button>
                    )}

                    <div
                        className="ml-2 cursor-pointer p-1"
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
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-175 text-left text-sm">
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
                                                                            className={`flex h-8 w-10 items-center justify-center rounded-md border px-7 font-semibold transition-all ${
                                                                                isSelected
                                                                                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                                                                    : 'border-border/60 bg-background text-muted-foreground opacity-60'
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
    const userRole = auth.user.role;
    const backUrl = `/${userRole}/events/${event.public_id}/participants`;

    // SOLUSI UNTUK "UNKNOWN" STATUS: Menghitung status global secara langsung di sisi Frontend
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

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 pb-12 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col">
                        <Link
                            href={backUrl}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                            Kembali ke Antrean
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Pratinjau Penilaian Tim
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pilih kategori untuk mulai atau melanjutkan
                            penilaian.
                        </p>
                    </div>
                </div>

                <Card className="border-t-4 border-t-primary bg-primary/5 shadow-sm">
                    <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-inner">
                                {participation.appearance_order ?? '?'}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl leading-none font-bold text-foreground">
                                    {participation.team_name}
                                </h2>
                                <span className="text-sm font-medium text-muted-foreground">
                                    Jenjang:{' '}
                                    {
                                        participation.event_level?.level
                                            ?.level_name
                                    }{' '}
                                    | PIC: {participation.pic_name}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-1 sm:items-end">
                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Status Keseluruhan
                            </span>
                            {/* Menggunakan status yang dihitung oleh Frontend */}
                            {getStatusBadge(computedGlobalStatus)}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
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
