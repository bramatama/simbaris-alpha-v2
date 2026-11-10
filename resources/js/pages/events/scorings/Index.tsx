import { Head, Link, usePage, router } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LevelDropdownFilter } from '@/components/level-dropdown-filter';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Plus,
    Eye,
    ClipboardList,
    FileCode2,
    LayoutList,
    SearchCode,
    Lock,
    Layers,
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
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;

    const isCommittee = ['committee', 'admin'].includes(userRole);
    const isOngoing = event.status === 'ongoing';

    const handleLevelChange = (levelIdStr: string) => {
        const levelId = Number(levelIdStr);

        if (!levelId) return;

        router.get(
            `/${userRole}/events/${event.public_id}/scoring-categories`,
            { level_id: levelId },
            { preserveState: true, preserveScroll: true, replace: true },
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
            <Head title={`Kategori Penilaian - ${event.event_name}`} />
            <div className="grid w-full min-w-0 grid-cols-1">
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                    {/* HEADER */}
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <Link
                                href={`/${userRole}/events/${event.public_id}/information`}
                                className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
                                ke Dasbor
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Format Penilaian Juri
                            </h1>
                            <p className="mt-1 text-sm wrap-break-word text-muted-foreground md:text-base">
                                Daftar kategori penilaian
                            </p>
                        </div>
                    </div>

                    {/* PERINGATAN BILA EVENT SEDANG ONGOING */}
                    {isOngoing ? (
                        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
                            <Lock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="text-sm">
                                <span className="font-bold">
                                    Form Penilaian Dikunci:
                                </span>{' '}
                                Event saat ini sedang berlangsung. Seluruh
                                struktur kategori dan rubrik penilaian tidak
                                dapat ditambah, diubah, atau dihapus.
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-primary">
                            <Lock className="h-5 w-5 shrink-0 text-primary" />
                            <div className="text-sm">
                                <span className="font-bold">
                                    Peringatan Status:
                                </span>{' '}
                                Form Penilaian akan terkunci ketika hari
                                perlombaan dimulai
                            </div>
                        </div>
                    )}

                    {/* FILTER JENJANG */}
                    {eventLevels.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <LevelDropdownFilter
                                    eventLevels={eventLevels}
                                    activeLevelId={
                                        activeLevel?.event_level_id ?? null
                                    }
                                    onLevelChange={handleLevelChange}
                                    placeholder="Pilih jenjang perlombaan..."
                                    className="w-full sm:w-64"
                                />

                                {activeLevel && (
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        {scoringCategories.length > 0 && (
                                            <Link
                                                href={`/${userRole}/events/${event.public_id}/scoring-categories/levels/${activeLevel.event_level_id}/preview`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 w-full gap-2 border-primary/50 text-primary shadow-sm hover:bg-primary/10 sm:w-auto"
                                                >
                                                    <SearchCode className="h-4 w-4" />
                                                    Preview Keseluruhan
                                                </Button>
                                            </Link>
                                        )}

                                        {isCommittee &&
                                            (isOngoing ? (
                                                <Button
                                                    size="sm"
                                                    disabled
                                                    className="h-9 w-full cursor-not-allowed gap-1.5 opacity-60 shadow-sm sm:w-auto"
                                                    title="Tidak dapat menambah kategori saat event berlangsung"
                                                >
                                                    <Lock className="h-4 w-4" />
                                                    Tambah Kategori
                                                </Button>
                                            ) : (
                                                <Link
                                                    href={`/${userRole}/events/${event.public_id}/scoring-categories/create`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="h-9 w-full gap-1.5 shadow-sm sm:w-auto"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Tambah Kategori
                                                    </Button>
                                                </Link>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {activeLevel && (
                                <div className="animate-in space-y-4 duration-300 fade-in">
                                    <div className="flex min-w-0 items-start gap-2 sm:items-center">
                                        <LayoutList className="h-4 w-4 shrink-0 text-primary" />
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
                                                Belum ada form rubrik untuk
                                                jenjang ini.
                                            </p>
                                            {isCommittee && !isOngoing && (
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
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {scoringCategories.map(
                                                (category) => (
                                                    <Card
                                                        key={
                                                            category.scoring_category_id
                                                        }
                                                        className="group flex flex-col overflow-hidden border-border/70 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                                    >
                                                        <div className="flex min-w-0 items-start gap-2 border-b border-border/50 bg-muted/20 p-3 sm:items-center">
                                                            <div className="shrink-0 rounded-md bg-primary/10 p-1.5 text-primary">
                                                                <ClipboardList className="h-4 w-4" />
                                                            </div>
                                                            <h3
                                                                className="min-w-0 text-sm leading-snug font-bold wrap-break-word"
                                                                title={
                                                                    category
                                                                        .master_category
                                                                        ?.category_name
                                                                }
                                                            >
                                                                {
                                                                    category
                                                                        .master_category
                                                                        ?.category_name
                                                                }
                                                            </h3>
                                                        </div>

                                                        <div className="flex flex-1 items-center justify-between bg-background p-3">
                                                            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                Materi Penilaian
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
                                                                    Lihat Form
                                                                    Kategori
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </Card>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* BLANK STATE EVENT LEVELS KOSONG */
                        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center shadow-none sm:p-12">
                            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                                <Layers className="h-8 w-8" />
                            </div>
                            <h3 className="mb-1.5 text-base font-bold text-foreground sm:text-lg">
                                Belum Ada Jenjang Perlombaan
                            </h3>
                            <p className="max-w-md text-xs text-muted-foreground sm:text-sm">
                                Event ini belum memiliki jenjang perlombaan
                                terdaftar. Tambahkan jenjang perlombaan terlebih
                                dahulu untuk mengonfigurasi format penilaian
                                juri.
                            </p>
                            {isCommittee && (
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/levels`}
                                    className="mt-5"
                                >
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" /> Kelola
                                        Jenjang Perlombaan
                                    </Button>
                                </Link>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </InnerAppLayout>
    );
}
