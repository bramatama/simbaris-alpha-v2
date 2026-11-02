import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import {
    Gavel,
    ClipboardList,
    ArrowRight,
    Users,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';

export default function JudgeDashboard({ stats }: { stats: any }) {
    const assignedEvents = stats.assigned_events || [];

    return (
        <div className="space-y-8">
            {/* WELCOME BANNER / STATS OVERVIEW */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-6 shadow-sm">
                <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

                <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            <Sparkles className="h-3.5 w-3.5" /> Portal Dewan
                            Juri
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                            Siap Melakukan Penilaian?
                        </h2>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Pilih event penugasan di bawah untuk mengakses
                            lembar rubrik atau mulai memasukkan nilai peserta.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-xs backdrop-blur-md">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Gavel className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Event Tugas
                            </span>
                            <span className="text-lg font-black text-foreground">
                                {assignedEvents.length} Event
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DAFTAR EVENT PENUGASAN */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                        Daftar Event Penugasan Anda
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {assignedEvents.map((event: any) => (
                        <Card
                            key={event.event_id}
                            className="group relative overflow-hidden border-border/70 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                        >
                            <div className="absolute top-0 left-0 h-1 w-full bg-primary/40 transition-colors group-hover:bg-primary" />

                            <CardHeader className="pt-5 pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
                                        {event.event_name}
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600"
                                    >
                                        <CheckCircle2 className="mr-1 h-3 w-3" />{' '}
                                        Ditugaskan
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pb-5">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1">
                                        <Users className="h-3.5 w-3.5 text-primary" />
                                        <span>
                                            {event.participations_count || 0}{' '}
                                            Tim Peserta Terdaftar
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-1.5 border-border/80 bg-background text-xs font-semibold hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Link
                                            href={`/judge/events/${event.public_id}/form-previews`}
                                        >
                                            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />{' '}
                                            Pratinjau Rubrik
                                        </Link>
                                    </Button>

                                    <Button
                                        asChild
                                        variant="default"
                                        size="sm"
                                        className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
                                    >
                                        <Link
                                            href={`/judge/events/${event.public_id}/participants`}
                                        >
                                            Mulai Menilai{' '}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {assignedEvents.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/10 p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Gavel className="h-6 w-6 opacity-40" />
                            </div>
                            <h4 className="text-base font-bold text-foreground">
                                Belum Ada Penugasan Event
                            </h4>
                            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                                Saat ini Anda belum terdaftar sebagai juri aktif
                                di event mana pun. Hubungi administrator jika
                                ini adalah sebuah kesalahan.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
