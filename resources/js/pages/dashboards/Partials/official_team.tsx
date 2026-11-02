import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import {
    ShieldHalf,
    MapPin,
    ArrowRight,
    Search,
    Trophy,
    Sparkles,
} from 'lucide-react';

export default function OfficialTeamDashboard({ stats }: { stats: any }) {
    const myParticipations = stats.my_participations || [];

    return (
        <div className="space-y-8">
            {/* WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-6 shadow-sm">
                <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            <Sparkles className="h-3.5 w-3.5" /> Portal Official
                            / Pelatih
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                            Kelola Tim Paskibra Anda
                        </h2>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Pantau status pendaftaran tim, nomor urut tampil,
                            dan hasil perolehan rekapitulasi nilai lomba.
                        </p>
                    </div>

                    <Button
                        asChild
                        size="default"
                        className="shrink-0 gap-1.5 shadow-sm"
                    >
                        <Link href="/events">
                            <Search className="h-4 w-4" /> Eksplor & Daftar
                            Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-border/70 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tim Terdaftar
                        </CardTitle>
                        <ShieldHalf className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {stats.total_registered || 0}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total unit tim yang Anda kelola
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-linear-to-r from-card to-muted/20 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Status Partisipasi
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {myParticipations.length} Aktif
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Kompetisi yang sedang diikuti
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* DAFTAR TIM AKTIF */}
            <div className="space-y-4">
                <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    Tim & Kompetisi Aktif Anda
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {myParticipations.map((part: any) => (
                        <Card
                            key={part.participation_id}
                            className="group overflow-hidden border-border/70 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <div className="border-b border-border/50 bg-muted/20 px-4 py-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="line-clamp-1 text-xs font-bold text-primary">
                                        {part.event?.event_name ||
                                            'Event Lomba'}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="bg-background text-[10px] font-semibold"
                                    >
                                        No. Urut: {part.appearance_order || '-'}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="flex items-center justify-between p-4 pt-4">
                                <div className="space-y-1">
                                    <span className="text-base font-black text-foreground transition-colors group-hover:text-primary">
                                        {part.team_name}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />{' '}
                                        {part.city || 'Balikpapan'}
                                    </span>
                                </div>
                                <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="shrink-0 gap-1.5 shadow-xs"
                                >
                                    <Link
                                        href={`/official_team/events/${part.event?.public_id}/participations/${part.public_id}/information`}
                                    >
                                        Detail Tim{' '}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {myParticipations.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-muted/10 p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <ShieldHalf className="h-6 w-6 opacity-40" />
                            </div>
                            <h4 className="text-base font-bold text-foreground">
                                Belum Ada Tim Terdaftar
                            </h4>
                            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                                Anda belum mendaftarkan unit tim apa pun. Mulai
                                eksplorasi event lomba yang sedang membuka
                                pendaftaran.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
