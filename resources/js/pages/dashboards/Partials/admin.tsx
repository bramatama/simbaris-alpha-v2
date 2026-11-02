import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    Trophy,
    Users,
    ShieldCheck,
    UserCog,
    CalendarDays,
    ArrowRight,
} from 'lucide-react';

export default function AdminDashboard({ stats }: { stats: any }) {
    return (
        <div className="space-y-8">
            {/* WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-6 shadow-sm">
                <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            <ShieldCheck className="h-3.5 w-3.5" /> Super
                            Administrator
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                            Pusat Kendali Sistem SIMBARIS
                        </h2>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Kelola seluruh akun pengguna serta pengawasan event
                            baris-berbaris dari satu panel terpusat.
                        </p>
                    </div>
                </div>
            </div>

            {/* STAT CARDS: FOKUS USER & EVENT */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-border/70 shadow-sm transition-all hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Manajemen Pengguna (User)
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {stats.total_users || 0} Akun
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total admin, panitia, juri, dan official team
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/70 shadow-sm transition-all hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Manajemen Event
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Trophy className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">
                            {stats.total_events || 0} Event
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total kompetisi yang terdaftar dalam sistem
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* QUICK ACTIONS / MENU UTAMA ADMIN */}
            <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                    Menu Utama Pengelolaan
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Kotak Aksi Manajemen User */}
                    <Card className="group relative overflow-hidden border-border/70 bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-primary">
                                    <UserCog className="h-4 w-4" /> Manajemen
                                    User
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Kelola akun, ubah role, dan hak akses
                                    pengguna
                                </p>
                            </div>
                            <Button
                                asChild
                                size="sm"
                                className="shrink-0 gap-1.5 shadow-xs"
                            >
                                <Link href="/admin/users">
                                    Kelola{' '}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Kotak Aksi Manajemen Event */}
                    <Card className="group relative overflow-hidden border-border/70 bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-primary">
                                    <CalendarDays className="h-4 w-4" />{' '}
                                    Manajemen Event
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Buat, edit, dan pantau jalannya kompetisi
                                    event
                                </p>
                            </div>
                            <Button
                                asChild
                                size="sm"
                                className="shrink-0 gap-1.5 shadow-xs"
                            >
                                <Link href="/events">
                                    Kelola{' '}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
