import { Head, Link, usePage, router } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Plus,
    Eye,
    ClipboardList,
    FileCode2,
    LayoutList,
} from 'lucide-react';

interface MasterCategory {
    category_name: string;
}

interface ScoringCategory {
    scoring_category_id: number;
    master_category_id: number;
    master_category: MasterCategory;
    assessment_criteria_count: number;
}

interface EventLevelData {
    event_level_id: number;
    level: {
        level_name: string;
    };
}

interface ScoringIndexProps {
    event: {
        public_id: string;
        event_name: string;
        status: string;
    };
    eventLevels: EventLevelData[];
    activeLevel: EventLevelData | null;
    scoringCategories: ScoringCategory[];
}

export default function ScoringCategoryIndex({
    event,
    eventLevels = [],
    activeLevel = null,
    scoringCategories = [],
}: ScoringIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const isCommittee = ['committee', 'admin'].includes(userRole);

    const handleLevelChange = (levelId: number) => {
        router.get(
            `/${userRole}/events/${event.public_id}/scoring-categories`,
            { level_id: levelId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Kategori Penilaian - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                {/* HEADER */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Kembalike
                            Dasbor
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Format Penilaian Juri
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Daftar kategori penilaian
                        </p>
                    </div>

                    {isCommittee && activeLevel && (
                        <div className="px-4 py-2 text-sm font-normal">
                            <Link
                                href={`/${userRole}/events/${event.public_id}/scoring-categories/create`}
                            >
                                <Button
                                    size="sm"
                                    className="h-9 w-full gap-1.5 shadow-sm sm:w-auto"
                                >
                                    <Plus className="h-4 w-4" /> Tambah Kategori
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* FILTER JENJANG */}
                {eventLevels.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex w-full flex-col gap-1.5 overflow-hidden">
                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Filter Jenjang:
                            </span>
                            <div className=" flex w-full items-center gap-2 overflow-x-auto pb-2">
                                {eventLevels.map((level) => (
                                    <Badge
                                        key={level.event_level_id}
                                        variant={
                                            activeLevel?.event_level_id ===
                                            level.event_level_id
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={`shrink-0 cursor-pointer rounded-md px-3 py-1 text-xs whitespace-nowrap transition-colors ${
                                            activeLevel?.event_level_id ===
                                            level.event_level_id
                                                ? 'pointer-events-none shadow-sm'
                                                : 'hover:bg-primary/10 hover:text-primary'
                                        }`}
                                        onClick={() =>
                                            handleLevelChange(
                                                level.event_level_id,
                                            )
                                        }
                                    >
                                        {level.level.level_name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {activeLevel && (
                            <div className="animate-in space-y-3 duration-300 fade-in">
                                <div className="flex min-w-0 items-start gap-2 sm:items-center">
                                    <LayoutList className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-bold sm:text-base">
                                        Kategori Penilaian (
                                        {activeLevel.level.level_name})
                                    </h2>
                                </div>

                                {scoringCategories.length === 0 ? (
                                    <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-5 text-center shadow-none sm:p-10">
                                        <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                            <FileCode2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-sm font-bold text-foreground sm:text-base">
                                            Belum Ada Kategori Penilaian
                                        </h3>
                                        <p className="mb-4 text-xs text-muted-foreground">
                                            Belum ada form rubrik untuk jenjang
                                            ini.
                                        </p>
                                        {isCommittee && (
                                            <Link
                                                href={`/${userRole}/events/${event.public_id}/scoring-categories/create`}
                                            >
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="gap-1.5"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />{' '}
                                                    Buat Kategori
                                                </Button>
                                            </Link>
                                        )}
                                    </Card>
                                ) : (
                                    // CARD VIEW (COMPACT, MINIMAL WHITESPACE)
                                    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {scoringCategories.map((category) => (
                                            <Card
                                                key={
                                                    category.scoring_category_id
                                                }
                                                className="group flex flex-col overflow-hidden border-border/70 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                            >
                                                <div className="sm:items-center.5 flex min-w-0 items-start gap-2 border-b border-border/50 bg-muted/20 p-3">
                                                    <div className="shrink-0 rounded-md bg-primary/10 p-1.5 text-primary">
                                                        <ClipboardList className="h-4 w-4" />
                                                    </div>
                                                    <h3
                                                        className="min-w-0 text-sm font-bold wrap-break-word"
                                                        title={
                                                            category
                                                                .master_category
                                                                .category_name
                                                        }
                                                    >
                                                        {
                                                            category
                                                                .master_category
                                                                .category_name
                                                        }
                                                    </h3>
                                                </div>

                                                <div className="flex flex-1 items-center justify-between bg-background p-3">
                                                    <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                                        Parameter
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-sm bg-muted/80 px-1.5 py-0 text-[11px] font-bold"
                                                    >
                                                        {
                                                            category.assessment_criteria_count
                                                        }
                                                    </Badge>
                                                </div>

                                                <div className="border-t border-border/50 bg-card/50 p-2">
                                                    <Link
                                                        href={`/${userRole}/events/${event.public_id}/scoring-categories/${category.scoring_category_id}`}
                                                        className="block"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-full gap-1.5 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />{' '}
                                                            Lihat Detail
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-lg border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        Event ini belum memiliki jenjang perlombaan sama sekali.
                    </div>
                )}
            </div>
        </InnerAppLayout>
    );
}
