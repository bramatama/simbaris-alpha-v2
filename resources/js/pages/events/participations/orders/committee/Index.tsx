import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PageProps } from '@inertiajs/core';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Settings2,
    RotateCcw,
    Users,
    LayoutList,
    FileText,
    TriangleAlert,
    Search,
    UserCheck,
    Layers,
    Plus,
} from 'lucide-react';
import { LevelDropdownFilter } from '@/components/level-dropdown-filter';

const renderEvaluationStatusBadge = (evaluationSession: any) => {
    const status = evaluationSession?.status;

    switch (status) {
        case 'ongoing':
            return (
                <Badge
                    variant="outline"
                    className="animate-pulse border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold text-amber-600"
                >
                    Sedang Tampil
                </Badge>
            );
        case 'finished':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600"
                >
                    Selesai Dinilai
                </Badge>
            );
        case 'waiting':
        default:
            return (
                <Badge
                    variant="outline"
                    className="border-slate-300 bg-slate-100 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                >
                    Menunggu Giliran
                </Badge>
            );
    }
};

export default function ParticipationOrderIndex({
    event,
    eventLevels = [],
    activeLevel = null,
    participations = [],
    committeePosition = '',
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;

    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const isAuditor = committeePosition === 'auditor';
    const isAdministration = committeePosition === 'administration';

    const handleLevelChange = (levelIdStr: string) => {
        const levelId = Number(levelIdStr);
        router.get(
            `/${userRole}/events/${event.public_id}/participation-orders`,
            { level_id: levelId },
            { preserveState: false, preserveScroll: true, replace: true },
        );
    };

    const handleReset = () => {
        if (!activeLevel) return;
        setIsResetting(true);
        router.delete(
            `/${userRole}/events/${event.public_id}/participation-orders/levels/${activeLevel.event_level_id}`,
            {
                preserveScroll: true,
                onSuccess: () => setIsResetDialogOpen(false),
                onFinish: () => setIsResetting(false),
            },
        );
    };

    const hasUnordered = participations.some(
        (p: any) => p.appearance_order === null,
    );

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Nomor Urut Tampil - ${event.event_name}`} />

            <div className="grid w-full min-w-0 grid-cols-1">
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                    {/* HEADER */}
                    <div className="flex flex-col gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
                        <div className="flex flex-col">
                            <Link
                                href={`/${userRole}/events/${event.public_id}/information`}
                                className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                                Kembali ke Dasbor
                            </Link>
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                                Nomor Urut Tampil Peserta
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                Atur urutan tampil peserta yang telah disetujui
                                pada setiap jenjang perlombaan.
                            </p>
                        </div>
                    </div>

                    {/* FILTER JENJANG (DROPDOWN) */}
                    {eventLevels.length > 0 ? (
                        <div className="space-y-4 sm:space-y-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <LevelDropdownFilter
                                    eventLevels={eventLevels}
                                    activeLevelId={activeLevel?.event_level_id}
                                    onLevelChange={handleLevelChange}
                                />

                                {activeLevel && participations.length > 0 && (
                                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setIsResetDialogOpen(true)
                                            }
                                            className="h-10 w-full gap-2 border-destructive/50 text-destructive shadow-sm hover:bg-destructive/10 sm:h-9 sm:w-auto"
                                            disabled={isAuditor}
                                        >
                                            <RotateCcw className="h-4 w-4 shrink-0" />{' '}
                                            Reset Nomor
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-10 w-full gap-1.5 shadow-sm sm:h-9 sm:w-auto"
                                            disabled={isAuditor}
                                            onClick={() =>
                                                router.visit(
                                                    `/${userRole}/events/${event.public_id}/participation-orders/levels/${activeLevel.event_level_id}/edit`,
                                                )
                                            }
                                        >
                                            <Settings2 className="h-4 w-4 shrink-0" />
                                            Atur Nomor Urut
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {activeLevel && (
                                <div className="animate-in space-y-4 duration-300 fade-in">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-2 sm:items-center">
                                            <LayoutList className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                                            <h2 className="text-sm font-bold sm:text-base">
                                                Daftar Peserta (
                                                {activeLevel.level.level_name})
                                            </h2>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="w-fit shrink-0 font-semibold"
                                        >
                                            Total: {participations.length} Tim
                                        </Badge>
                                    </div>

                                    {hasUnordered &&
                                        participations.length > 0 && (
                                            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700">
                                                Terdapat tim yang belum memiliki
                                                nomor urut. Silakan klik{' '}
                                                <strong>Atur Nomor Urut</strong>{' '}
                                                untuk menyusunnya.
                                            </div>
                                        )}

                                    {participations.length === 0 ? (
                                        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-6 text-center shadow-none sm:p-10">
                                            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                                <Users className="h-6 w-6 shrink-0" />
                                            </div>
                                            <h3 className="mb-1 text-sm font-bold text-foreground sm:text-base">
                                                Belum Ada Peserta Disetujui
                                            </h3>
                                            <p className="max-w-sm text-xs text-muted-foreground">
                                                Data urutan akan muncul jika
                                                sudah ada tim yang
                                                pendaftarannya berstatus
                                                'Disetujui'.
                                            </p>
                                        </Card>
                                    ) : (
                                        <Card className="overflow-hidden border-border/70 shadow-sm">
                                            <div className="flex flex-col divide-y divide-border/50 sm:hidden">
                                                {participations.map(
                                                    (p: any) => (
                                                        <div
                                                            key={
                                                                p.participation_id
                                                            }
                                                            className="flex flex-col gap-3 p-4 hover:bg-muted/30"
                                                        >
                                                            <div className="flex min-w-0 items-start gap-3">
                                                                <div className="flex shrink-0 items-center justify-center pt-0.5">
                                                                    {p.appearance_order !==
                                                                    null ? (
                                                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                                            {
                                                                                p.appearance_order
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] text-muted-foreground"
                                                                        >
                                                                            Belum
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="truncate font-bold text-foreground">
                                                                            {
                                                                                p.team_name
                                                                            }
                                                                        </span>
                                                                        {renderEvaluationStatusBadge(
                                                                            p.evaluation_session,
                                                                        )}
                                                                    </div>
                                                                    <span className="truncate text-xs text-muted-foreground">
                                                                        PIC:{' '}
                                                                        {
                                                                            p.pic_name
                                                                        }
                                                                    </span>
                                                                    <span className="truncate text-xs text-muted-foreground">
                                                                        No HP:{' '}
                                                                        {p.pic_phone_number ||
                                                                            '-'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="mt-1 flex flex-col gap-2">
                                                                <Link
                                                                    href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/evaluation_result`}
                                                                    className="w-full"
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full gap-1.5 border-border/60"
                                                                    >
                                                                        <FileText className="h-4 w-4 text-primary" />
                                                                        <span className="text-xs">
                                                                            Hasil
                                                                            Nilai
                                                                        </span>
                                                                    </Button>
                                                                </Link>

                                                                {isAuditor && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <Link
                                                                            href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/monitoring`}
                                                                            className="w-full"
                                                                        >
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="w-full gap-1.5 border-border/60"
                                                                            >
                                                                                <Search className="h-4 w-4 text-primary" />
                                                                                <span className="text-xs">
                                                                                    Monitoring
                                                                                </span>
                                                                            </Button>
                                                                        </Link>

                                                                        <Link
                                                                            href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/penalties`}
                                                                            className="w-full"
                                                                        >
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="w-full gap-1.5 border-border/60 hover:bg-warning/10"
                                                                            >
                                                                                <TriangleAlert className="h-4 w-4 text-warning" />
                                                                                <span className="text-xs">
                                                                                    Penalti
                                                                                </span>
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                )}

                                                                {isAdministration && (
                                                                    <Link
                                                                        href={`/events/${event.public_id}/participations/${p.public_id}/members`}
                                                                        className="w-full"
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full gap-1.5 border-border/60 hover:bg-primary/5"
                                                                        >
                                                                            <UserCheck className="h-4 w-4 text-primary" />
                                                                            <span className="text-xs">
                                                                                Anggota
                                                                                Tim
                                                                            </span>
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className="hidden w-full overflow-x-auto sm:block">
                                                <Table className="min-w-150">
                                                    <TableHeader className="bg-muted/40">
                                                        <TableRow>
                                                            <TableHead className="w-20 text-center font-bold">
                                                                No. Urut
                                                            </TableHead>
                                                            <TableHead className="font-bold">
                                                                Nama Tim /
                                                                Instansi
                                                            </TableHead>
                                                            <TableHead className="w-36 text-center font-bold">
                                                                Status Penilaian
                                                            </TableHead>
                                                            <TableHead className="w-40 font-bold">
                                                                Nama PIC
                                                            </TableHead>
                                                            <TableHead className="w-36 font-bold">
                                                                Nomor PIC
                                                            </TableHead>
                                                            <TableHead className="w-80 text-right font-bold">
                                                                Aksi
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {participations.map(
                                                            (p: any) => (
                                                                <TableRow
                                                                    key={
                                                                        p.participation_id
                                                                    }
                                                                >
                                                                    <TableCell className="text-center font-medium">
                                                                        {p.appearance_order !==
                                                                        null ? (
                                                                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                                                {
                                                                                    p.appearance_order
                                                                                }
                                                                            </span>
                                                                        ) : (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="whitespace-nowrap text-muted-foreground"
                                                                            >
                                                                                Belum
                                                                                diatur
                                                                            </Badge>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="font-bold">
                                                                        {
                                                                            p.team_name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        {renderEvaluationStatusBadge(
                                                                            p.evaluation_session,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-muted-foreground">
                                                                        {
                                                                            p.pic_name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-muted-foreground">
                                                                        {p.pic_phone_number ||
                                                                            '-'}
                                                                    </TableCell>
                                                                    <TableCell className="flex justify-end gap-2 text-right">
                                                                        {isAuditor && (
                                                                            <Link
                                                                                href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/monitoring`}
                                                                            >
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="gap-1.5 border-border/60 hover:bg-muted/50"
                                                                                >
                                                                                    <Search className="h-4 w-4 text-primary" />
                                                                                    <span>
                                                                                        Monitoring
                                                                                    </span>
                                                                                </Button>
                                                                            </Link>
                                                                        )}

                                                                        {isAdministration && (
                                                                            <Link
                                                                                href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/members`}
                                                                            >
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="gap-1.5 border-border/60 hover:bg-primary/5"
                                                                                >
                                                                                    <UserCheck className="h-4 w-4 text-primary" />
                                                                                    <span>
                                                                                        Anggota
                                                                                        Tim
                                                                                    </span>
                                                                                </Button>
                                                                            </Link>
                                                                        )}
                                                                        <Link
                                                                            href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/evaluation_result`}
                                                                        >
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="gap-1.5 border-border/60 hover:bg-muted/50"
                                                                            >
                                                                                <FileText className="h-4 w-4 text-primary" />
                                                                                <span>
                                                                                    Hasil
                                                                                    Nilai
                                                                                </span>
                                                                            </Button>
                                                                        </Link>

                                                                        {isAuditor && (
                                                                            <Link
                                                                                href={`/${userRole}/events/${event.public_id}/participations/${p.public_id}/penalties`}
                                                                            >
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="gap-1.5 border-border/60 hover:bg-warning/10"
                                                                                >
                                                                                    <TriangleAlert className="h-4 w-4 text-warning" />
                                                                                    <span>
                                                                                        Penalti
                                                                                    </span>
                                                                                </Button>
                                                                            </Link>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </Card>
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
                                dahulu untuk mengatur nomor urut tampil peserta.
                            </p>
                            {isAdministration && (
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/levels`}
                                    className="mt-5"
                                >
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Jenjang Perlombaan
                                    </Button>
                                </Link>
                            )}
                        </Card>
                    )}

                    <ConfirmationDialog
                        open={isResetDialogOpen}
                        onOpenChange={setIsResetDialogOpen}
                        title="Reset Nomor Urut?"
                        description="Apakah Anda yakin ingin mereset seluruh nomor urut pada jenjang ini menjadi kosong? Anda harus mengaturnya kembali dari awal."
                        confirmText="Ya, Reset"
                        variant="destructive"
                        onConfirm={handleReset}
                        isProcessing={isResetting}
                    />
                </div>
            </div>
        </InnerAppLayout>
    );
}
