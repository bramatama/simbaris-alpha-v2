import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, Calculator, CheckSquare } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export default function PreviewLevel({
    event,
    eventLevel,
    scoringCategories,
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const isCommittee = ['committee', 'admin'].includes(userRole);

    const defaultValue = scoringCategories.map(
        (cat: any) => `category-${cat.scoring_category_id}`,
    );

    const pageContent = (
        <div className="mx-auto w-full max-w-7xl space-y-6 bg-muted/5 p-4 md:p-6 lg:p-8">
            {/* HEADER */}
            <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href={
                            isCommittee
                                ? `/${userRole}/events/${event.public_id}/scoring-categories?level_id=${eventLevel.event_level_id}`
                                : `/${userRole}/events/${event.public_id}/information`
                        }
                        className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        {isCommittee
                            ? 'Kembali ke Daftar Kategori'
                            : 'Kembali ke Detail Event'}
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Format Penilaian Juri
                    </h1>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                        Pratinjau lengkap form lembar penilaian untuk jenjang{' '}
                        <strong className="text-foreground">
                            {eventLevel.level?.level_name}
                        </strong>
                    </p>
                </div>
            </div>

            {/* PREVIEW ACCORDION */}
            {scoringCategories.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    Belum ada kategori penilaian yang dibuat untuk jenjang ini.
                </div>
            ) : (
                <Accordion
                    type="multiple"
                    defaultValue={defaultValue}
                    className="w-full space-y-4"
                >
                    {scoringCategories.map((category: any) => {
                        const tableHeaders =
                            category.assessment_criteria?.[0]
                                ?.rubric_categories || [];

                        return (
                            <AccordionItem
                                key={category.scoring_category_id}
                                value={`category-${category.scoring_category_id}`}
                                className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                            >
                                <AccordionTrigger className="px-4 py-4 hover:bg-muted/30 hover:no-underline md:px-6">
                                    <div className="flex items-center gap-2.5 text-left">
                                        <Calculator className="h-5 w-5 shrink-0 text-primary" />
                                        <span className="text-base font-bold text-foreground md:text-lg">
                                            {
                                                category.master_category
                                                    ?.category_name
                                            }
                                        </span>
                                        <span className="ml-2 rounded-full bg-muted/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                            {category.assessment_criteria
                                                ?.length || 0}{' '}
                                            Materi
                                        </span>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="border-t border-border/50 bg-muted/5 px-4 py-6 md:px-6">
                                    {category.assessment_criteria?.length ===
                                    0 ? (
                                        <div className="rounded-lg border border-border bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                                            Kategori ini belum memiliki
                                            kriteria/materi penilaian.
                                        </div>
                                    ) : (
                                        <>
                                            {/* VIEW MOBILE */}
                                            <div className="flex flex-col gap-3 sm:gap-4 md:hidden">
                                                {category.assessment_criteria.map(
                                                    (criteria: any) => (
                                                        <Card
                                                            key={
                                                                criteria.criteria_id
                                                            }
                                                            className="min-w-0 overflow-hidden border-border/50 bg-card shadow-sm"
                                                        >
                                                            <CardHeader className="flex flex-row items-start gap-3 space-y-0 border-b border-border/50 bg-muted/20 p-3 sm:items-center sm:p-4">
                                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                                                                    {
                                                                        criteria.order_index
                                                                    }
                                                                </div>
                                                                <CardTitle className="min-w-0 text-sm leading-tight font-bold wrap-break-word sm:text-base">
                                                                    {
                                                                        criteria
                                                                            .master_criteria
                                                                            ?.criteria_name
                                                                    }
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-2 p-4">
                                                                {criteria.rubric_categories?.map(
                                                                    (
                                                                        rubric: any,
                                                                    ) => (
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

                                            {/* VIEW DESKTOP */}
                                            <div className="hidden min-w-0 md:block">
                                                <div className="max-w-full overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
                                                    <Table className="min-w-max border-collapse">
                                                        <TableHeader className="bg-muted/30">
                                                            <TableRow className="border-b border-border/50 hover:bg-transparent">
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
                                                                    Materi
                                                                    Penilaian
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
                                                            {category.assessment_criteria.map(
                                                                (
                                                                    criteria: any,
                                                                ) => (
                                                                    <TableRow
                                                                        key={
                                                                            criteria.criteria_id
                                                                        }
                                                                        className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/5"
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
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );

    return (
        <>
            <Head title={`Preview Form - ${eventLevel.level?.level_name}`} />
            {isCommittee ? (
                <InnerAppLayout
                    sidebarNavItems={getEventInnerNav(
                        event.public_id,
                        userRole,
                    )}
                >
                    {pageContent}
                </InnerAppLayout>
            ) : (
                <AppLayout>{pageContent}</AppLayout>
            )}
        </>
    );
}
