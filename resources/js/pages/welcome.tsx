import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import LandingPageLayout from '@/layouts/landing-page-layout';
import { PageProps } from '@inertiajs/core';
import EventCard, { EventData } from '@/components/event-card';
import { ArrowRight, CalendarX, Trophy, ShieldCheck, Zap } from 'lucide-react';

interface WelcomeProps {
    events?: EventData[];
}

export default function Welcome({ events = [] }: WelcomeProps) {
    const { props } = usePage<PageProps>();
    const appName = props.name || 'SIMBARIS';
    const user = props.auth?.user;
    const userRole = user?.role ?? 'guest';

    return (
        <LandingPageLayout>
            <Head title="Selamat Datang" />

            <main className="flex w-full flex-col">
                {/* 1. HERO SECTION (HOME) */}
                <section
                    id="home"
                    className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-6 py-16"
                >
                    <div className="flex w-full max-w-4xl flex-col items-center text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
                            <Trophy className="h-3.5 w-3.5" />
                            Platform Kompetisi Marching Drill Terpadu
                        </div>

                        <h1 className="mb-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                            Kelola & Ikuti Kompetisi Baris-Berbaris Lebih
                            Presisi
                        </h1>

                        <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                            Platform digital terintegrasi untuk pendaftaran tim,
                            rekapitulasi nilai digital secara real-time,
                            transparansi hasil, dan papan peringkat kompetisi
                            Paskibra se-Indonesia.
                        </p>

                        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                            {user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/events"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                                    >
                                        Jelajahi Event
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-8 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                                    >
                                        Daftar Tim Resmi
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. ABOUT SECTION */}
                <section
                    id="about"
                    className="flex min-h-screen w-full flex-col items-center justify-center rounded-4xl border border-border/60 bg-muted/30 px-6 py-20"
                >
                    <div className="w-full max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                                Mengapa Memilih {appName}?
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                Dirancang khusus untuk menjawab kebutuhan
                                panitia, dewan juri, dan official team dalam
                                menyelenggarakan ajang perlombaan Paskibra yang
                                profesional, akuntabel, dan transparan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {/* Feature Card 1 */}
                            <div className="rounded-2xl border border-border/70 bg-card p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-foreground">
                                    Penilaian Real-Time
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Proses input skor nilai oleh dewan juri
                                    dilakukan secara digital, memangkas waktu
                                    rekapitulasi, serta meminimalisir risiko
                                    kesalahan rekap manual.
                                </p>
                            </div>

                            {/* Feature Card 2 */}
                            <div className="rounded-2xl border border-border/70 bg-card p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-foreground">
                                    Transparansi & Audit Log
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Dilengkapi dengan riwayat jejak audit (audit
                                    trail) dan transparansi timer wamda untuk
                                    menjamin keadilan bagi setiap tim peserta
                                    yang bertanding.
                                </p>
                            </div>

                            {/* Feature Card 3 */}
                            <div className="rounded-2xl border border-border/70 bg-card p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                    <Trophy className="h-6 w-6" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-foreground">
                                    Papan Peringkat Otomatis
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Kalkulasi bobot nilai murni, akumulasi
                                    pengurangan penalti, hingga penentuan gelar
                                    juara terformat secara presisi dan
                                    sistematis.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. EVENTS SECTION */}
                <section
                    id="events"
                    className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-20"
                >
                    <div className="w-full max-w-7xl">
                        <div className="mb-12 flex flex-col items-start justify-between gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                                    Event Mendatang
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Bergabunglah dan ikuti kompetisi marching
                                    drill terbaik yang sedang berlangsung maupun
                                    yang akan segera hadir.
                                </p>
                            </div>

                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-primary/50 hover:bg-muted"
                            >
                                Lihat Semua Event
                                <ArrowRight className="h-4 w-4 text-primary" />
                            </Link>
                        </div>

                        {events.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
                                <CalendarX className="mb-3 h-10 w-10 text-muted-foreground/50" />
                                <h3 className="text-base font-bold text-foreground">
                                    Belum Ada Event Tersedia
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Event mendatang akan ditampilkan di sini
                                    setelah dipublikasikan oleh panitia.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {events.map((event) => (
                                    <Link
                                        key={event.event_id}
                                        href={
                                            user
                                                ? `/${userRole}/events/${event.public_id}/information`
                                                : `/events/${event.public_id}/information`
                                        }
                                        className="block h-full w-full rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <EventCard event={event} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </LandingPageLayout>
    );
}
