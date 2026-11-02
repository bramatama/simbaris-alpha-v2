import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ClipboardList,
    CalendarDays,
    ArrowRight,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CommitteeDashboard({ stats }: { stats: any }) {
    const activeEvents = stats.active_events || [];

    return (
        <div className="space-y-8">
            {/* WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-6 shadow-sm">
                <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            <Sparkles className="h-3.5 w-3.5" /> Portal Panitia
                            Event
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                            Kelola Kompetisi dengan Presisi
                        </h2>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Pilih panel event di bawah untuk melakukan
                            verifikasi pendaftaran, penjadwalan, atau audit
                            nilai.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-xs backdrop-blur-md">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Event Dikelola
                            </span>
                            <span className="text-lg font-black text-foreground">
                                {activeEvents.length} Event
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-border/70 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Event Aktif Ditangani
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {stats.managed_events_count || 0}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total event tempat Anda bertugas
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/70 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Antrean Verifikasi
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {stats.pending_verifications || 0}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Pendaftaran tim menunggu cek berkas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* DAFTAR PANEL EVENT */}
            <div className="space-y-4">
                <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    Akses Panel Operasional Event
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {activeEvents.map((event: any) => (
                        <Card
                            key={event.event_id}
                            className="group relative overflow-hidden border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <div className="absolute top-0 left-0 h-1 w-full bg-primary/40 transition-colors group-hover:bg-primary" />
                            <CardHeader className="pt-5 pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                                        {event.event_name}
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className="border-primary/20 bg-primary/10 text-[10px] text-primary"
                                    >
                                        Aktif
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between pb-5">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Status:{' '}
                                    <strong className="text-foreground capitalize">
                                        {event.status || 'Berjalan'}
                                    </strong>
                                </span>
                                <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="gap-1.5 shadow-xs"
                                >
                                    <Link
                                        href={`/committee/events/${event.public_id}/information`}
                                    >
                                        Masuk Panel{' '}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {activeEvents.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/10 p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <ShieldAlert className="h-6 w-6 opacity-40" />
                            </div>
                            <h4 className="text-base font-bold text-foreground">
                                Belum Ada Penugasan Panitia
                            </h4>
                            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                                Anda belum terdaftar sebagai panitia aktif pada
                                event apa pun saat ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
