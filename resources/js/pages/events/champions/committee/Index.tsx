import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LevelDropdownFilter } from '@/components/level-dropdown-filter';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Trophy,
    Plus,
    Edit3,
    Trash2,
    Banknote,
    ScrollText,
    Layers,
} from 'lucide-react';

export default function ChampionsIndex({ event, groupedChampions }: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const committeePosition = auth.user.committee_position;

    // Inisialisasi tab aktif berdasarkan query parameter (atau default jenjang pertama)
    const params = new URLSearchParams(window.location.search);
    const initialLevelId = params.get('level_id')
        ? parseInt(params.get('level_id')!)
        : groupedChampions[0]?.event_level_id || null;

    const eventLevels = groupedChampions.map((group: any) => ({
        event_level_id: group.event_level_id,
        level: {
            level_name: group.level_name,
        },
    }));

    const [activeLevelId, setActiveLevelId] = useState<number | null>(
        initialLevelId,
    );

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

    // Ambil data juara yang sesuai dengan level aktif
    const activeGroup = groupedChampions.find(
        (g: any) => g.event_level_id === activeLevelId,
    );

    const handleLevelChange = (levelIdStr: string) => {
        const levelId = Number(levelIdStr);

        if (!levelId) return;

        setActiveLevelId(levelId);

        window.history.replaceState(null, '', `?level_id=${levelId}`);
    };

    const confirmDelete = (categoryId: number, categoryName: string) => {
        setCategoryToDelete({ id: categoryId, name: categoryName });
        setIsDeleteOpen(true);
    };

    const executeDelete = () => {
        if (!categoryToDelete || !activeLevelId) return;
        router.delete(
            `/committee/events/${event.public_id}/levels/${activeLevelId}/champions/categories/${categoryToDelete.id}`,
            {
                preserveScroll: true,
                onSuccess: () => setIsDeleteOpen(false),
            },
        );
    };

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(number);
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1)
            return 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30';
        if (rank === 2)
            return 'bg-slate-300/30 text-slate-300 border-slate-300/40';
        if (rank === 3)
            return 'bg-amber-600/20 text-amber-700 border-amber-600/30';
        return 'bg-muted/50 text-muted-foreground border-border/50';
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole, committeePosition || undefined)}
        >
            <Head title={`Manajemen Juara - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/committee/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Detail Event
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Manajemen Penghargaan & Piala
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Atur kategori penghargaan dan daftar piala beserta
                            hadiah per jenjang
                        </p>
                    </div>
                </div>

                {/* JENJANG TABS */}
                {groupedChampions.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <LevelDropdownFilter
                                eventLevels={eventLevels}
                                activeLevelId={activeLevelId}
                                onLevelChange={handleLevelChange}
                                placeholder="Pilih jenjang perlombaan..."
                                className="w-full sm:w-64"
                            />
                            <Link
                                href={`/committee/events/${event.public_id}/champions/create`}
                            >
                                <Button className="w-full gap-2 shadow-sm sm:w-auto">
                                    <Plus className="h-4 w-4" /> Tambah
                                    Penghargaan
                                </Button>
                            </Link>
                        </div>

                        {/* KONTEN KATEGORI JUARA */}
                        {activeGroup && (
                            <div className="animate-in space-y-4 duration-300 fade-in">
                                {activeGroup.categories.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                        Belum ada data penghargaan. Mulai dengan
                                        menekan tombol "Tambah Penghargaan" di
                                        atas.
                                    </div>
                                ) : (
                                    <Accordion
                                        type="multiple"
                                        defaultValue={[]}
                                        className="w-full space-y-4"
                                    >
                                        {activeGroup.categories.map(
                                            (category: any) => (
                                                <AccordionItem
                                                    key={
                                                        category.champion_category_id
                                                    }
                                                    value={`cat-${category.champion_category_id}`}
                                                    className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                                                >
                                                    <AccordionTrigger className="cursor-pointer px-4 py-4 hover:bg-muted/30 hover:no-underline md:px-6">
                                                        <div className="flex w-full items-center justify-between pr-4">
                                                            <div className="flex items-center gap-2.5 text-left">
                                                                <Trophy className="h-5 w-5 shrink-0 text-primary" />
                                                                <span className="text-base font-bold text-foreground md:text-lg">
                                                                    {
                                                                        category.category_name
                                                                    }
                                                                </span>
                                                                <span className="ml-2 rounded-full bg-muted/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                                                                    {
                                                                        category
                                                                            .champions
                                                                            .length
                                                                    }{' '}
                                                                    Piala
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>

                                                    <AccordionContent className="border-t border-border/50 bg-muted/5 px-4 py-6 md:px-6">
                                                        {/* AKSI KATEGORI (EDIT/HAPUS) */}
                                                        <div className="mb-4 flex gap-2">
                                                            <Link
                                                                href={`/committee/events/${event.public_id}/levels/${activeLevelId}/champions/categories/${category.champion_category_id}/edit`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 gap-1.5 text-xs"
                                                                >
                                                                    <Edit3 className="h-3.5 w-3.5" />{' '}
                                                                    Edit Daftar
                                                                    Piala
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-8 gap-1.5 text-xs"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        category.champion_category_id,
                                                                        category.category_name,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />{' '}
                                                                Kosongkan
                                                                Kategori
                                                            </Button>
                                                        </div>

                                                        {category.champions
                                                            .length === 0 ? (
                                                            <div className="rounded-lg border border-border bg-muted/20 p-5 text-center text-sm text-muted-foreground">
                                                                Kategori ini
                                                                kosong pada
                                                                jenjang{' '}
                                                                {
                                                                    activeGroup.level_name
                                                                }
                                                                .
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                                {category.champions.map(
                                                                    (
                                                                        et: any,
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                et.event_champion_id
                                                                            }
                                                                            className="transition-hover overflow-hidden border-border/60 shadow-sm hover:border-primary/40"
                                                                        >
                                                                            <div className="flex items-start justify-between border-b border-border/50 bg-muted/20 p-3 sm:p-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    {/* MENGGUNAKAN et.rank_position sesuai controller baru */}
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={`h-8 w-8 justify-center rounded-full p-0 text-sm font-bold ${getRankBadge(et.rank_position)}`}
                                                                                    >
                                                                                        {
                                                                                            et.rank_position
                                                                                        }
                                                                                    </Badge>
                                                                                    <h4 className="line-clamp-2 text-sm leading-tight font-bold">
                                                                                        {
                                                                                            et
                                                                                                .champion
                                                                                                ?.champion_name
                                                                                        }
                                                                                    </h4>
                                                                                </div>
                                                                            </div>
                                                                            <CardContent className="space-y-3 bg-card p-3 sm:p-4">
                                                                                <div className="space-y-2">
                                                                                    <div className="flex items-start gap-2 text-sm">
                                                                                        <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                                                                        <span className="font-medium text-foreground">
                                                                                            {et.prize_money
                                                                                                ? formatRupiah(
                                                                                                      et.prize_money,
                                                                                                  )
                                                                                                : 'Tidak ada uang tunai'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-start gap-2 text-sm">
                                                                                        <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                                                        <span className="font-medium text-foreground">
                                                                                            {et.certificate
                                                                                                ? 'Mendapat Sertifikat'
                                                                                                : 'Tanpa Sertifikat'}
                                                                                        </span>
                                                                                    </div>
                                                                                    {et.prize_descriptions && (
                                                                                        <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                                                                                            {
                                                                                                et.prize_descriptions
                                                                                            }
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ),
                                        )}
                                    </Accordion>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
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
                            dahulu untuk mengonfigurasi format penilaian juri.
                        </p>
                        {userRole === 'committee' && (
                            <Link
                                href={`/${userRole}/events/${event.public_id}/levels`}
                                className="mt-5"
                            >
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" /> Kelola Jenjang
                                    Perlombaan
                                </Button>
                            </Link>
                        )}
                    </Card>
                )}
            </div>

            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Kosongkan Kategori?"
                description={`Apakah Anda yakin ingin menghapus seluruh piala untuk kategori "${categoryToDelete?.name}" pada jenjang ini? Aksi ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                variant="destructive"
                onConfirm={executeDelete}
            />
        </InnerAppLayout>
    );
}
