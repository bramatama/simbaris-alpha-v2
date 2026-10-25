import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, Edit, Trash2, Calculator, CheckSquare } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ScoringCategoryShow({
    event,
    eventLevel,
    scoringCategory,
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const isCommittee = ['committee', 'admin'].includes(userRole);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            `/${userRole}/events/${event.public_id}/scoring-categories/${scoringCategory.scoring_category_id}`,
            {
                preserveScroll: true,
                onSuccess: () => setIsDeleteDialogOpen(false),
                onFinish: () => setIsDeleting(false),
            },
        );
    };

    const getTableHeaders = (criteriaList: any[]) => {
        if (!criteriaList || criteriaList.length === 0) return [];
        return criteriaList[0].rubric_categories || [];
    };

    const tableHeaders = getTableHeaders(scoringCategory.assessment_criteria);

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head
                title={`Preview Form: ${scoringCategory.master_category?.category_name}`}
            />

            <div className="mx-auto w-full max-w-7xl space-y-6 bg-muted/5 p-4 md:p-6 lg:p-8">
                {/* HEADER HALAMAN */}
                <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/scoring-categories?level_id=${eventLevel.event_level_id}`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Daftar Kategori
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {scoringCategory.master_category?.category_name}
                        </h1>
                        <p className="mt-1 leading-relaxed text-muted-foreground">
                            Pratinjau form penilaian untuk jenjang{' '}
                            <strong className="text-foreground">
                                {eventLevel.level?.level_name}
                            </strong>
                        </p>
                    </div>

                    {isCommittee && (
                        <div className="flex gap-2">
                            <Link
                                href={`/${userRole}/events/${event.public_id}/scoring-categories/${scoringCategory.scoring_category_id}/edit`}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 border-primary/50 text-primary shadow-sm hover:bg-primary/10 sm:w-auto"
                                >
                                    <Edit className="h-4 w-4" /> Edit Form
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="w-full gap-2 shadow-sm sm:w-auto"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" /> Hapus
                            </Button>
                        </div>
                    )}
                </div>

                {/* AREA PREVIEW */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <h2 className="text-base font-semibold sm:text-lg">
                            Parameter Penilaian
                        </h2>
                    </div>

                    {scoringCategory.assessment_criteria?.length === 0 ? (
                        <div className="rounded-lg border border-border bg-muted/20 p-5 text-center text-sm text-muted-foreground sm:p-8">
                            Kategori ini belum memiliki kriteria/materi gerakan.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3 sm:gap-4 md:hidden">
                                {scoringCategory.assessment_criteria.map(
                                    (criteria: any) => (
                                        <Card
                                            key={criteria.criteria_id}
                                            className="min-w-0 overflow-hidden border-border/50 shadow-sm"
                                        >
                                            <CardHeader className="flex flex-row items-start gap-3 space-y-0 border-b border-border/50 bg-muted/20 p-3 sm:items-center sm:p-4">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                                                    {criteria.order_index}
                                                </div>
                                                <CardTitle className="min-w-0 text-sm leading-tight font-bold wrap-break-word sm:text-base">
                                                    {
                                                        criteria.master_criteria
                                                            ?.criteria_name
                                                    }
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-5 p-3 sm:p-4">
                                                {criteria.rubric_categories?.map(
                                                    (rubric: any) => (
                                                        <div
                                                            key={
                                                                rubric.rubric_category_id
                                                            }
                                                            className="space-y-2.5"
                                                        >
                                                            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                                <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />{' '}
                                                                {
                                                                    rubric.category_label
                                                                }
                                                            </span>
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                {rubric
                                                                    .rubric_scores
                                                                    ?.length >
                                                                0 ? (
                                                                    rubric.rubric_scores.map(
                                                                        (
                                                                            score: any,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    score.rubric_score_id
                                                                                }
                                                                                className="flex h-8 w-auto min-w-10 cursor-default items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-bold text-primary shadow-sm"
                                                                            >
                                                                                {
                                                                                    score.score_value
                                                                                }
                                                                            </div>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground italic">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </CardContent>
                                        </Card>
                                    ),
                                )}
                            </div>

                            <div className="hidden min-w-0 md:block">
                                <div className="max-w-full overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
                                    <Table className="min-w-max">
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead
                                                    rowSpan={2}
                                                    className="w-12 border-r border-border/50 text-center font-bold text-foreground"
                                                >
                                                    NO
                                                </TableHead>
                                                <TableHead
                                                    rowSpan={2}
                                                    className="min-w-40 border-r border-border/50 text-center font-bold text-foreground"
                                                >
                                                    Materi Penilaian
                                                </TableHead>
                                                {tableHeaders.map(
                                                    (
                                                        header: any,
                                                        index: number,
                                                    ) => (
                                                        <TableHead
                                                            key={
                                                                header.rubric_category_id
                                                            }
                                                            colSpan={Math.max(
                                                                header
                                                                    .rubric_scores
                                                                    ?.length ||
                                                                    1,
                                                                1,
                                                            )}
                                                            className={`border-r border-b border-border/50 text-center font-bold text-foreground last:border-r-0 ${index % 2 === 0 ? 'bg-muted/10' : 'bg-muted/40'}`}
                                                        >
                                                            {
                                                                header.category_label
                                                            }
                                                        </TableHead>
                                                    ),
                                                )}
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {scoringCategory.assessment_criteria.map(
                                                (criteria: any) => (
                                                    <TableRow
                                                        key={
                                                            criteria.criteria_id
                                                        }
                                                        className="transition-colors hover:bg-muted/5"
                                                    >
                                                        <TableCell className="border-r border-border/50 p-2 text-center font-semibold whitespace-nowrap text-muted-foreground sm:p-3">
                                                            {
                                                                criteria.order_index
                                                            }
                                                        </TableCell>
                                                        <TableCell className="max-w-[20rem] min-w-40 border-r border-border/50 p-2 font-bold wrap-break-word whitespace-normal text-foreground sm:p-3">
                                                            {
                                                                criteria
                                                                    .master_criteria
                                                                    ?.criteria_name
                                                            }
                                                        </TableCell>

                                                        {criteria.rubric_categories?.map(
                                                            (
                                                                rubric: any,
                                                                rIndex: number,
                                                            ) =>
                                                                rubric
                                                                    .rubric_scores
                                                                    ?.length >
                                                                0 ? (
                                                                    rubric.rubric_scores.map(
                                                                        (
                                                                            score: any,
                                                                        ) => (
                                                                            <TableCell
                                                                                key={
                                                                                    score.rubric_score_id
                                                                                }
                                                                                className={`cursor-default border-r border-border/50 p-2 text-center align-middle font-medium whitespace-nowrap transition-colors last:border-r-0 hover:bg-primary/10 hover:text-primary ${rIndex % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}`}
                                                                            >
                                                                                {
                                                                                    score.score_value
                                                                                }
                                                                            </TableCell>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <TableCell
                                                                        key={`empty-${rubric.rubric_category_id}`}
                                                                        className={`border-r border-border/50 p-2 text-center last:border-r-0 ${rIndex % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}`}
                                                                    >
                                                                        -
                                                                    </TableCell>
                                                                ),
                                                        )}
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <ConfirmationDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    title="Hapus Kategori Penilaian?"
                    description="Anda yakin ingin menghapus kategori ini? Semua kriteria, rubrik, dan pilihan nilai di dalamnya akan terhapus secara permanen. Tindakan ini tidak dapat dibatalkan."
                    confirmText="Ya, Hapus Kategori"
                    variant="destructive"
                    onConfirm={handleDelete}
                    isProcessing={isDeleting}
                />
            </div>
        </InnerAppLayout>
    );
}
