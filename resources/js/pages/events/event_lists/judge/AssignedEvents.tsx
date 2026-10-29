import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Pen } from 'lucide-react';
import { EventData } from '@/components/event-card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function EventIndex({ events }: { events: EventData[] }) {
    // Fungsi pembantu untuk memformat tanggal
    const formatDate = (start: string, end?: string): string => {
        if (!start) return '-';
        const startDate = new Date(start).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        const endDate = end
            ? new Date(end).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
              })
            : null;

        return startDate === endDate || !endDate
            ? startDate
            : `${startDate} - ${endDate}`;
    };

    // Fungsi pembantu untuk mewarnai badge status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registration_open':
                return 'bg-success text-success-foreground hover:bg-success/80';
            case 'active':
                return 'bg-info text-info-foreground hover:bg-info/80';
            case 'finished':
                return 'bg-muted text-muted-foreground hover:bg-muted/80';
            default:
                return 'bg-warning text-warning-foreground hover:bg-warning/80';
        }
    };

    return (
        <AppLayout>
            <Head title="Event Management" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Event Management
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground md:text-base">
                            Kelola semua event kompetisi, jadwal, dan panitia.
                        </p>
                    </div>
                </div>

                {/* Mobile View: Cards (Tampil di layar kecil) */}
                <div className="flex flex-col gap-3 md:hidden">
                    {events.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Tidak ada event yang ditemukan. Mulai dengan membuat
                            event baru.
                        </div>
                    ) : (
                        events.map((event) => (
                            <Card
                                key={event.event_id}
                                className="overflow-hidden border-border/50 shadow-sm"
                            >
                                <CardContent className="space-y-3 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-base leading-snug font-semibold text-foreground">
                                            {event.event_name}
                                        </h3>
                                        <Badge
                                            variant="secondary"
                                            className={`shrink-0 text-[10px] tracking-wide whitespace-nowrap capitalize ${getStatusColor(event.status)}`}
                                        >
                                            {event.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1.5 border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            <span>
                                                {formatDate(
                                                    event.start_time,
                                                    event.end_time,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            <span className="truncate">
                                                {event.location || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 pt-2">
                                        <Link
                                            href={`/committee/events/${event.public_id}/information`}
                                            className="block w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-1.5 text-xs"
                                            >
                                                <Pen className="h-3.5 w-3.5" />
                                                Kelola Event
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Desktop View: Table (Tampil di layar md ke atas) */}
                <div className="hidden overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm md:block">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-75">
                                    Nama Event
                                </TableHead>
                                <TableHead>Tanggal Pelaksanaan</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        Tidak ada event yang ditemukan. Mulai
                                        dengan membuat event baru.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.event_id}>
                                        <TableCell className="font-semibold">
                                            {event.event_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="h-4 w-4 shrink-0" />
                                                <span className="whitespace-nowrap">
                                                    {formatDate(
                                                        event.start_time,
                                                        event.end_time,
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="max-w-50 truncate">
                                                    {event.location || '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={`tracking-wide whitespace-nowrap capitalize ${getStatusColor(event.status)}`}
                                            >
                                                {event.status.replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link
                                                href={`/judge/events/${event.public_id}/participants`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5"
                                                >
                                                    <Pen className="h-3.5 w-3.5" />
                                                    Kelola
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
