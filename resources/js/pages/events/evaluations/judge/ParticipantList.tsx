import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEvaluationInnerNav } from '@/config/inner_sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    ClipboardEdit,
    Users,
    LayoutList,
    Filter,
    ChevronRight,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

interface SimbarisEvent {
    public_id: string;
    event_name: string;
}

interface EventLevel {
    event_level_id: number;
    level: {
        level_name: string;
    };
}

interface Participation {
    participation_id: number;
    public_id: number;
    event_level_id: number;
    team_name: string;
    pic_name: string;
    appearance_order: number | null;
    evaluation_status: 'ready' | 'draft' | 'locked' | 'needs_review';
}

interface ParticipantListProps {
    event: SimbarisEvent;
    eventLevels: EventLevel[];
    participations: Record<string, Participation[]>;
}

/* =========================================================
   HELPER STATUS BADGE
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

export default function ParticipantList({
    event,
    eventLevels = [],
    participations = {},
}: ParticipantListProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [activeLevelId, setActiveLevelId] = useState<number | null>(
        eventLevels.length > 0 ? eventLevels[0].event_level_id : null,
    );

    const currentParticipations = activeLevelId
        ? participations[String(activeLevelId)] || []
        : [];

    return (
        <InnerAppLayout
            sidebarNavItems={getEvaluationInnerNav(event.public_id)}
        >
            <Head title={`Antrean Peserta - ${event.event_name}`} />

            <div className="grid w-full min-w-0 grid-cols-1">
                <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                    {/* HEADER & FILTER */}
                    <div className="flex flex-col gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
                        <div className="flex flex-col">
                            <Link
                                href={`/${userRole}/events/${event.public_id}/information`}
                                className="mb-2 inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                                Kembali ke Dasbor
                            </Link>
                            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                                Antrean Penilaian Peserta
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                Daftar tim yang menjadi tanggung jawab penilaian
                                Anda.
                            </p>
                        </div>

                        {/* FILTER JENJANG CONTAINER */}
                        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:hidden">
                                Filter Jenjang:
                            </span>
                            {eventLevels.length > 0 && (
                                <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 p-1.5 sm:w-auto">
                                    <Filter className="mr-2 h-4 w-4 shrink-0 text-muted-foreground sm:mr-0 sm:ml-1" />
                                    <Select
                                        value={activeLevelId?.toString() || ''}
                                        onValueChange={(val) =>
                                            setActiveLevelId(Number(val))
                                        }
                                    >
                                        <SelectTrigger className="w-full border-none bg-background shadow-sm sm:w-45">
                                            <SelectValue placeholder="Pilih jenjang..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventLevels.map((level) => (
                                                <SelectItem
                                                    key={level.event_level_id}
                                                    value={level.event_level_id.toString()}
                                                >
                                                    {level.level.level_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KONTEN UTAMA */}
                    {eventLevels.length > 0 ? (
                        <div className="space-y-4 sm:space-y-5">
                            {activeLevelId && (
                                <div className="animate-in space-y-4 duration-300 fade-in">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-2 sm:items-center">
                                            <LayoutList className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                                            <h2 className="text-sm font-bold sm:text-base">
                                                Daftar Peserta (
                                                {
                                                    eventLevels.find(
                                                        (l) =>
                                                            l.event_level_id ===
                                                            activeLevelId,
                                                    )?.level.level_name
                                                }
                                                )
                                            </h2>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="w-fit shrink-0 font-semibold"
                                        >
                                            Total:{' '}
                                            {currentParticipations.length} Tim
                                        </Badge>
                                    </div>

                                    {currentParticipations.length === 0 ? (
                                        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-6 text-center shadow-none sm:p-10">
                                            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                                <Users className="h-6 w-6 shrink-0" />
                                            </div>
                                            <h3 className="mb-1 text-sm font-bold text-foreground sm:text-base">
                                                Belum Ada Peserta
                                            </h3>
                                            <p className="max-w-sm text-xs text-muted-foreground">
                                                Belum ada peserta yang disetujui
                                                untuk jenjang ini, atau nomor
                                                urut belum diatur oleh panitia
                                            </p>
                                        </Card>
                                    ) : (
                                        <Card className="overflow-hidden border-border/70 shadow-sm">
                                            {/* TAMPILAN MOBILE (Card Mode) */}
                                            <div className="flex flex-col divide-y divide-border/50 sm:hidden">
                                                {currentParticipations.map(
                                                    (p) => (
                                                        <div
                                                            key={
                                                                p.participation_id
                                                            }
                                                            className="flex flex-col gap-3 p-4 hover:bg-muted/30"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex shrink-0 items-center justify-center">
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
                                                                                ?
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                                        <span className="font-bold text-foreground">
                                                                            {
                                                                                p.team_name
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            PIC:{' '}
                                                                            {
                                                                                p.pic_name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    {getStatusBadge(
                                                                        p.evaluation_status,
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <Link
                                                                href={`/${userRole}/events/${event.public_id}/participants/${p.public_id}`}
                                                                className="mt-1"
                                                            >
                                                                <Button
                                                                    className="w-full gap-2"
                                                                    variant="default"
                                                                    size="sm"
                                                                >
                                                                    <ClipboardEdit className="h-4 w-4" />{' '}
                                                                    Buka
                                                                    Penilaian
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {/* TAMPILAN DESKTOP/TABLET */}
                                            <div className="hidden w-full min-w-0 overflow-x-auto sm:block">
                                                <Table className="min-w-175">
                                                    <TableHeader className="bg-muted/40">
                                                        <TableRow>
                                                            <TableHead className="w-24 text-center font-bold">
                                                                No. Urut
                                                            </TableHead>
                                                            <TableHead className="font-bold">
                                                                Nama Tim /
                                                                Instansi
                                                            </TableHead>
                                                            <TableHead className="w-48 font-bold">
                                                                Nama PIC
                                                            </TableHead>
                                                            <TableHead className="w-36 text-center font-bold">
                                                                Status Penilaian
                                                            </TableHead>
                                                            <TableHead className="w-32 text-right font-bold">
                                                                Aksi
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {currentParticipations.map(
                                                            (p) => (
                                                                <TableRow
                                                                    key={
                                                                        p.participation_id
                                                                    }
                                                                >
                                                                    <TableCell className="text-center font-medium">
                                                                        {p.appearance_order !==
                                                                        null ? (
                                                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
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
                                                                    <TableCell className="text-muted-foreground">
                                                                        {
                                                                            p.pic_name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        {getStatusBadge(
                                                                            p.evaluation_status,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Link
                                                                            href={`/${userRole}/events/${event.public_id}/participants/${p.public_id}`}
                                                                        >
                                                                            <Button
                                                                                size="sm"
                                                                                className="gap-1.5 shadow-sm"
                                                                            >
                                                                                <ClipboardEdit className="h-4 w-4 shrink-0" />
                                                                                <span className="hidden lg:inline">
                                                                                    Nilai
                                                                                </span>
                                                                                <ChevronRight className="h-4 w-4 shrink-0 lg:hidden" />
                                                                            </Button>
                                                                        </Link>
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
                            Anda belum ditugaskan untuk menilai kategori apapun
                            di acara ini
                        </div>
                    )}
                </div>
            </div>
        </InnerAppLayout>
    );
}
