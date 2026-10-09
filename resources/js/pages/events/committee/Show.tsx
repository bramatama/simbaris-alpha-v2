import { Head, Link, usePage } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    ExternalLink,
    Edit3,
    Image as ImageIcon,
    Banknote,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    CreditCard,
    FileText,
    Gavel,
    GraduationCap,
    EyeOff,
    ImagePlus,
} from 'lucide-react';
import { Auth } from '@/types';
import { formatDate } from '@/config/date_datetime';

type PageProps = {
    auth: Auth;
};

export default function EventShow({ event }: { event: any }) {
    const { props } = usePage<PageProps>();
    const userRole = props.auth.user.role;

    // Data statis tiruan (Mock) untuk menyesuaikan dengan gambar
    // Pada implementasi nyata, Anda bisa mengambil status ini dari props `event`
    const readinessChecklist = [
        { label: 'Materi penilaian', status: 'ok' },
        {
            label: 'Nomor urut peserta',
            status: 'warning',
            text: 'Belum ada tim yang disetujui',
        },
        {
            label: 'Dewan juri',
            status: 'warning',
            text: 'Tugaskan juri sebelum hari penilaian',
        },
        {
            label: 'Poster event',
            status: 'warning',
            text: 'Poster tampil di halaman publik dan daftar event',
        },
        { label: 'Kontak panitia (WhatsApp)', status: 'ok' },
        { label: 'Kategori penilaian', status: 'ok' },
        { label: 'Kuota per jenjang', status: 'ok' },
        { label: 'Batas pendaftaran', status: 'ok' },
        {
            label: 'Juknis / petunjuk teknis',
            status: 'warning',
            text: 'Diunduh peserta dari halaman publik',
        },
    ];
    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={` ${event.event_name || 'Event'}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
                {/* 1. TOP HEADER NAVIGATION */}
                <div className="mb-2 flex flex-row items-center justify-between gap-4">
                    <Link
                        href={`/my-events`}
                        className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Semua Event
                    </Link>
                    <Link href={`/${userRole}/events/${event.public_id}/edit`}>
                        <Button variant="default" size="sm">
                            <Edit3 className="h-4 w-4" /> Edit Event
                        </Button>
                    </Link>
                </div>

                {/* 2. MAIN LAYOUT GRID (Kiri Utama, Kanan Sidebar) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* KOLOM KIRI (Konten Utama) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* A. KARTU HEADER EVENT (Poster, Info Utama, Status) */}
                        <Card className="grid grid-cols-1 grid-rows-6 gap-6 overflow-hidden border-border/50 p-4 md:p-6 lg:grid-cols-6">
                            {event.poster_path ? (
                                <div className="col-span-2 row-span-6 aspect-3/4 w-full max-w-60 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                    <img
                                        src={'/storage/' + event.poster_path}
                                        alt="Event Poster"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-3/4 w-full max-w-60 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                                    <ImagePlus className="mb-3 h-12 w-12 opacity-40" />
                                    <span className="text-sm font-medium">
                                        Belum ada poster
                                    </span>
                                </div>
                            )}
                            <div className="col-span-4 row-span-2 flex flex-col gap-2">
                                <h1 className="text-2xl font-bold tracking-tight wrap-break-word">
                                    {event.event_name || 'Event'}
                                </h1>
                            </div>

                            <div className="col-span-4 row-span-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Pendaftaran
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {formatDate(
                                            event.registration_start_time,
                                            event.registration_end_time,
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Pelaksanaan
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {formatDate(
                                            event.start_time,
                                            event.end_time,
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Lokasi
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {event.location || '-'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Banknote className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm leading-tight font-semibold">
                                        Biaya Pendaftaran
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {event.event_levels.length === 0
                                            ? 'Gratis'
                                            : event.event_levels.length === 1
                                              ? event.event_levels[0]
                                                    .registration_fees !== null
                                                  ? `Rp ${event.event_levels[0].registration_fees.toLocaleString('id-ID')}`
                                                  : 'Gratis'
                                              : event.event_levels[0]
                                                      .registration_fees !==
                                                      null &&
                                                  event.event_levels[
                                                      event.event_levels
                                                          .length - 1
                                                  ].registration_fees !== null
                                                ? `Rp ${event.event_levels[0].registration_fees.toLocaleString('id-ID')} - Rp ${event.event_levels[event.event_levels.length - 1].registration_fees.toLocaleString('id-ID')}`
                                                : 'Gratis'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* D. DEWAN JURI & SEKOLAH TERDAFTAR (Grid 2 Kolom di layar besar) */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* JURI */}
                            <Card className="border-border/50">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Gavel className="h-4 w-4 text-muted-foreground" />{' '}
                                            Dewan Juri
                                        </CardTitle>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            0 juri
                                        </span>
                                    </div>
                                    <Link
                                        href="#"
                                        className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                                    >
                                        Kelola juri{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <p className="text-xs text-muted-foreground">
                                        Belum ada juri yang diundang ke event
                                        ini.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* SEKOLAH TERDAFTAR */}
                            <Card className="border-border/50">
                                <CardHeader className="flex flex-row items-center justify-between px-5 py-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />{' '}
                                        Sekolah Terdaftar
                                    </CardTitle>
                                    <Link
                                        href="#"
                                        className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                                    >
                                        Kelola peserta{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </CardHeader>
                                <div className="px-5 pb-3">
                                    {/* Tabs */}
                                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                        <Badge
                                            variant="secondary"
                                            className="cursor-pointer rounded-md bg-muted/80 text-foreground"
                                        >
                                            Semua{' '}
                                            <span className="ml-1.5 opacity-50">
                                                0
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer rounded-md border-transparent text-muted-foreground hover:bg-muted/50"
                                        >
                                            SD{' '}
                                            <span className="ml-1.5 opacity-50">
                                                0
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer rounded-md border-transparent text-muted-foreground hover:bg-muted/50"
                                        >
                                            SMA{' '}
                                            <span className="ml-1.5 opacity-50">
                                                0
                                            </span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer rounded-md border-transparent text-muted-foreground hover:bg-muted/50"
                                        >
                                            SMP{' '}
                                            <span className="ml-1.5 opacity-50">
                                                0
                                            </span>
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="grid grid-cols-2 gap-4 p-5 pt-0">
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                Sudah Disetujui
                                            </span>
                                            <span className="text-[10px] font-bold">
                                                0 SEKOLAH
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Belum ada sekolah yang disetujui
                                            pendaftarannya.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                Menunggu Persetujuan
                                            </span>
                                            <span className="text-[10px] font-bold">
                                                0 PENDAFTARAN
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Tidak ada pendaftaran yang menunggu.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* KOLOM KANAN (Sidebar Informasi) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* 1. KESIAPAN EVENT */}
                        <Card className="sticky top-6 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-5 py-4">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />{' '}
                                    Kesiapan Event
                                </CardTitle>
                                <span className="text-xs font-semibold text-muted-foreground">
                                    5/9
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="border-b border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground">
                                    4 data belum lengkap — klik untuk
                                    memperbaiki.
                                </div>
                                <div className="flex flex-col">
                                    {readinessChecklist.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex cursor-pointer items-start gap-3 border-b border-border/50 p-3.5 transition-colors last:border-0 hover:bg-muted/30"
                                        >
                                            {item.status === 'ok' ? (
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : (
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                            )}
                                            <div className="flex-1 space-y-1">
                                                <div className="text-xs font-medium text-foreground/90 group-hover:text-foreground">
                                                    {item.label}
                                                </div>
                                                {item.text && (
                                                    <div className="text-[10px] leading-snug text-muted-foreground/80">
                                                        {item.text}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight className="mt-0.5 h-3 w-3 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </InnerAppLayout>
    );
}

// Icon Tambahan
function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
