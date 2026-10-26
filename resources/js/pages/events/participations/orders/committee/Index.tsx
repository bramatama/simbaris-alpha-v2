import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    ListOrdered,
    Settings2,
    RotateCcw,
    Users,
    LayoutList,
} from 'lucide-react';

export default function ParticipationOrderIndex({
    event,
    eventLevels = [],
    activeLevel = null,
    participations = [],
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleLevelChange = (levelId: number) => {
        router.get(
            `/${userRole}/events/${event.public_id}/participation-orders`,
            { level_id: levelId },
            { preserveState: true, preserveScroll: true, replace: true },
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

    // Pengecekan apakah ada peserta yang belum di-set nomor urutnya
    const hasUnordered = participations.some(
        (p: any) => p.appearance_order === null,
    );

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Nomor Urut Tampil - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Dasbor
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Nomor Urut Tampil Peserta
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground md:text-base">
                            Atur urutan tampil peserta yang telah disetujui pada
                            setiap jenjang perlombaan
                        </p>
                    </div>

                    {activeLevel && participations.length > 0 && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsResetDialogOpen(true)}
                                className="h-9 w-full gap-2 border-destructive/50 text-destructive shadow-sm hover:bg-destructive/10 sm:w-auto"
                            >
                                <RotateCcw className="h-4 w-4" /> Reset Nomor
                            </Button>
                            <Link
                                href={`/${userRole}/events/${event.public_id}/participation-orders/levels/${activeLevel.event_level_id}/edit`}
                            >
                                <Button
                                    size="sm"
                                    className="h-9 w-full gap-1.5 shadow-sm sm:w-auto"
                                >
                                    <Settings2 className="h-4 w-4" /> Atur Nomor
                                    Urut
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* FILTER JENJANG */}
                {eventLevels.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex w-full flex-col gap-2 overflow-hidden">
                            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                Filter Jenjang:
                            </span>
                            <div className="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-2">
                                {eventLevels.map((level: any) => (
                                    <Badge
                                        key={level.event_level_id}
                                        variant={
                                            activeLevel?.event_level_id ===
                                            level.event_level_id
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={`shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                                            activeLevel?.event_level_id ===
                                            level.event_level_id
                                                ? 'pointer-events-none shadow-sm'
                                                : 'border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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
                            <div className="animate-in space-y-4 duration-300 fade-in">
                                <div className="flex items-center justify-between">
                                    <div className="flex min-w-0 items-start gap-2 sm:items-center">
                                        <LayoutList className="h-4 w-4 shrink-0 text-primary" />
                                        <h2 className="text-sm font-bold sm:text-base">
                                            Daftar Peserta (
                                            {activeLevel.level.level_name})
                                        </h2>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="font-semibold"
                                    >
                                        Total: {participations.length} Tim
                                    </Badge>
                                </div>

                                {hasUnordered && participations.length > 0 && (
                                    <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700">
                                        Terdapat tim yang belum memiliki nomor
                                        urut. Silakan klik{' '}
                                        <strong>Atur Nomor Urut</strong> untuk
                                        menyusunnya.
                                    </div>
                                )}

                                {participations.length === 0 ? (
                                    <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-5 text-center shadow-none sm:p-10">
                                        <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-sm font-bold text-foreground sm:text-base">
                                            Belum Ada Peserta Disetujui
                                        </h3>
                                        <p className="mb-4 text-xs text-muted-foreground">
                                            Data urutan akan muncul jika sudah
                                            ada tim yang pendaftarannya
                                            berstatus 'Disetujui'
                                        </p>
                                    </Card>
                                ) : (
                                    <Card className="overflow-hidden border-border/70 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/40">
                                                    <TableRow>
                                                        <TableHead className="w-24 text-center font-bold">
                                                            No. Urut
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Nama Tim / Instansi
                                                        </TableHead>
                                                        <TableHead className="font-bold">
                                                            Nama PIC
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
                                                                            className="text-muted-foreground"
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
                                                                <TableCell className="text-muted-foreground">
                                                                    {p.pic_name}
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
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        Event ini belum memiliki jenjang perlombaan sama sekali.
                    </div>
                )}

                <ConfirmationDialog
                    open={isResetDialogOpen}
                    onOpenChange={setIsResetDialogOpen}
                    title="Reset Nomor Urut?"
                    description="Apakah Anda yakin ingin mereset seluruh nomor urut pada jenjang ini menjadi kosong? Anda harus mengaturnya kembali dari awal"
                    confirmText="Ya, Reset"
                    variant="destructive"
                    onConfirm={handleReset}
                    isProcessing={isResetting}
                />
            </div>
        </InnerAppLayout>
    );
}
