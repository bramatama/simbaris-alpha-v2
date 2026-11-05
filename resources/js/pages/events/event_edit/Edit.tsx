import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Eye,
    ClipboardCheck,
    Calculator,
    Podium,
    FileText,
    CalendarDays,
    Clock,
    Users,
    ImageOff,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { FileUploader } from '@/components/ui/file-uploader';
import { getEventInnerNav } from '@/config/inner_sidebar';
import type { PageProps } from '@inertiajs/core';

const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    return localISOTime;
};

export default function EventEdit({ event }: { event: any }) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // State pratinjau poster (diinisialisasi dengan poster saat ini dari server jika ada)
    const [posterPreview, setPosterPreview] = useState<string | null>(
        event.poster_path ? `/storage/${event.poster_path}` : null,
    );

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'put',
        event_name: event.event_name || '',
        description: event.description || '',
        location: event.location || '',
        status: event.status || 'draft',
        registration_start_time: formatDateTime(event.registration_start_time),
        registration_end_time: formatDateTime(event.registration_end_time),
        start_time: formatDateTime(event.start_time),
        end_time: formatDateTime(event.end_time),
        is_result_visible: Boolean(event.is_result_visible),
        is_leaderboard_visible: Boolean(event.is_leaderboard_visible),
        is_recap_visible: Boolean(event.is_recap_visible),
        temp_poster_path: null as string | null,
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const errorBanner = document.querySelector('.is-error-banner');

            if (errorBanner) {
                errorBanner.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            } else {
                const firstErrorKey = Object.keys(errors)[0];
                let targetElement =
                    document.getElementById(firstErrorKey) ||
                    document.querySelector(`[name="${firstErrorKey}"]`);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    targetElement.focus?.();
                }
            }
        }
    }, [errors]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDialogOpen(true);
    };

    const confirmSubmit = () => {
        setIsDialogOpen(false);
        post(`/${userRole}/events/${event.public_id}`, {
            preserveScroll: true,
        });
    };

    const renderErrorBadge = (errorMsg?: string) => {
        if (!errorMsg) return null;
        return (
            <span
                className="flex animate-in cursor-help items-center gap-1 text-xs font-medium text-destructive duration-200 fade-in"
                title={errorMsg}
            >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Periksa Kolom</span>
            </span>
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Edit: ${event.event_name}`} />

            <div className="w-full p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke
                            Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Event
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Perbarui detail, jadwal, dan visibilitas hasil
                            perlombaan untuk {event.event_name}.
                        </p>
                    </div>
                    <Badge
                        variant="secondary"
                        className="px-4 py-2 text-sm font-normal"
                    >
                        Status:{' '}
                        <span className="ml-1 font-bold tracking-wide capitalize">
                            {data.status.replace('_', ' ')}
                        </span>
                    </Badge>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="is-error-banner mb-6 flex animate-in items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm duration-300 fade-in slide-in-from-top-2">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-sm font-bold">
                                Pengisian Form Belum Lengkap / Terjadi
                                Kesalahan:
                            </h4>
                            <ul className="list-disc space-y-1 pl-4 text-xs text-destructive/90">
                                {Object.entries(errors).map(
                                    ([key, err], idx) => (
                                        <li
                                            key={idx}
                                            className="leading-relaxed"
                                        >
                                            {err as string}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="space-y-6 xl:col-span-8">
                        <form
                            id="event-edit-form"
                            onSubmit={submit}
                            className="space-y-6"
                        >
                            <Card className="overflow-hidden rounded-xl border-border/60 shadow-sm">
                                <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <FileText className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                        <CardTitle className="text-base">
                                            Detail Event
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Informasi umum, identitas, dan
                                            poster kompetisi.
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-5 p-4 sm:p-5">
                                    <div className="space-y-6">
                                        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    requirement="optional"
                                                    className="mb-1 text-base"
                                                >
                                                    Poster Event
                                                </Label>
                                                {renderErrorBadge(
                                                    errors.temp_poster_path as string,
                                                )}
                                            </div>
                                            <p className="mb-4 text-sm text-muted-foreground">
                                                Format file: JPG, JPEG, PNG
                                                (Maks 5MB). Rasio
                                                direkomendasikan 3:4.
                                            </p>

                                            <div className="flex flex-col items-start gap-6 sm:flex-row">
                                                {posterPreview ? (
                                                    <div className="group relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm sm:w-40">
                                                        <img
                                                            src={posterPreview}
                                                            alt="Pratinjau Poster"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex aspect-3/4 w-full max-w-60 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground sm:w-40">
                                                        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-800 via-slate-900 to-black p-4 text-center">
                                                            <div className="pointer-events-none absolute inset-0 opacity-10">
                                                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full border-20 border-white" />
                                                                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full border-20 border-white" />
                                                                <div className="absolute top-1/2 left-0 h-px w-full bg-white/50" />
                                                            </div>

                                                            <div className="relative z-10 flex flex-col items-center gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-lg">
                                                                    <ImageOff className="h-6 w-6" />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <span className="block text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">
                                                                        Poster
                                                                        Event
                                                                    </span>
                                                                    <span className="block text-[9px] font-medium text-white/40">
                                                                        Belum
                                                                        Tersedia
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="w-full min-w-0 flex-1">
                                                    <FileUploader
                                                        variant="image"
                                                        endpoint="/upload-temp-file"
                                                        maxSizeMB={5}
                                                        multiple={false}
                                                        onUploadSuccess={(
                                                            _fileId,
                                                            path,
                                                        ) => {
                                                            setData(
                                                                'temp_poster_path',
                                                                path,
                                                            );
                                                            setPosterPreview(
                                                                `/storage/${path}`,
                                                            );
                                                            clearErrors(
                                                                'temp_poster_path',
                                                            );
                                                        }}
                                                        onRemove={() => {
                                                            setData(
                                                                'temp_poster_path',
                                                                null,
                                                            );
                                                            // Revert pratinjau ke poster asli server jika ada
                                                            setPosterPreview(
                                                                event.poster_path
                                                                    ? `/storage/${event.poster_path}`
                                                                    : null,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            {/* NAMA EVENT */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="event_name"
                                                    >
                                                        Nama Event
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.event_name,
                                                    )}
                                                </div>
                                                <Input
                                                    id="event_name"
                                                    value={data.event_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'event_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Lomba Paskibra Pandawa Vol IV 2026"
                                                    className={`h-10 ${errors.event_name ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                    required
                                                />
                                            </div>

                                            {/* LOKASI */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="location"
                                                    >
                                                        Lokasi
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.location,
                                                    )}
                                                </div>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) =>
                                                        setData(
                                                            'location',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: GOR Segiri Samarinda"
                                                    className={`h-10 ${errors.location ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                    required
                                                />
                                            </div>

                                            {/* STATUS EVENT */}
                                            <div className="space-y-2 md:col-span-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="status">
                                                        Status Event
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.status,
                                                    )}
                                                </div>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) =>
                                                        setData('status', value)
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="status"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Status Publikasi
                                                            </SelectLabel>
                                                            <SelectItem value="draft">
                                                                Draf
                                                            </SelectItem>
                                                            <SelectItem value="registration_open">
                                                                Pendaftaran
                                                                Dibuka
                                                            </SelectItem>
                                                            <SelectItem value="ongoing">
                                                                Sedang
                                                                Berlangsung
                                                            </SelectItem>
                                                            <SelectItem value="finished">
                                                                Selesai
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* DESKRIPSI */}
                                            <div className="space-y-2 pt-1 md:col-span-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="optional"
                                                        htmlFor="description"
                                                    >
                                                        Deskripsi
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.description,
                                                    )}
                                                </div>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Tuliskan deskripsi kompetisi..."
                                                    rows={4}
                                                    className="resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* KARTU 2: PENJADWALAN */}
                            <Card className="overflow-hidden rounded-xl border-border/60 shadow-sm">
                                <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                        <CardTitle className="text-base">
                                            Penjadwalan
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Atur periode pendaftaran dan waktu
                                            pelaksanaan kompetisi.
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 p-4 sm:p-5">
                                    {/* PERIODE PENDAFTARAN */}
                                    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            Periode Pendaftaran
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="registration_start_time"
                                                    >
                                                        Tanggal Buka
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.registration_start_time,
                                                    )}
                                                </div>
                                                <Input
                                                    id="registration_start_time"
                                                    type="datetime-local"
                                                    value={
                                                        data.registration_start_time
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'registration_start_time',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`h-10 min-w-0 text-xs sm:text-sm ${errors.registration_start_time ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                    required
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="registration_end_time"
                                                    >
                                                        Penutupan Pendaftaran
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.registration_end_time,
                                                    )}
                                                </div>
                                                <Input
                                                    id="registration_end_time"
                                                    type="datetime-local"
                                                    value={
                                                        data.registration_end_time
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'registration_end_time',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`h-10 min-w-0 text-xs sm:text-sm ${errors.registration_end_time ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* HARI PELAKSANAAN */}
                                    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            Hari Pelaksanaan
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="start_time"
                                                    >
                                                        Tanggal Mulai
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.start_time,
                                                    )}
                                                </div>
                                                <Input
                                                    id="start_time"
                                                    type="datetime-local"
                                                    value={data.start_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            'start_time',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`h-10 min-w-0 text-xs sm:text-sm ${errors.start_time ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                    required
                                                />
                                            </div>

                                            <div className="min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="end_time"
                                                    >
                                                        Tanggal Berakhir
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.end_time,
                                                    )}
                                                </div>
                                                <Input
                                                    id="end_time"
                                                    type="datetime-local"
                                                    value={data.end_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            'end_time',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`h-10 min-w-0 text-xs sm:text-sm ${errors.end_time ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* KARTU 3: PENGATURAN VISIBILITAS HASIL & LEADERBOARD */}
                            {userRole === 'committee' && (
                                <Card className="overflow-hidden rounded-xl border-border/60 shadow-sm">
                                    <CardHeader className="flex flex-row items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Eye className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 space-y-0.5">
                                            <CardTitle className="text-base">
                                                Visibilitas Hasil
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Atur akses hasil penilaian dan
                                                informasi kompetisi.
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="divide-y divide-border/50 px-4 py-1">
                                        {/* Hasil Penilaian */}
                                        <div className="flex items-center gap-3 py-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <ClipboardCheck className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <Label className="text-sm font-semibold">
                                                    Hasil Penilaian Juri
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Tampilkan rincian nilai dari
                                                    setiap juri.
                                                </p>
                                            </div>

                                            <Switch
                                                checked={data.is_result_visible}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'is_result_visible',
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Rekap Perhitungan */}
                                        <div className="flex items-center gap-3 py-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Calculator className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <Label className="text-sm font-semibold">
                                                    Rekap Perhitungan
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Tampilkan rincian kalkulasi
                                                    dan hasil akhir.
                                                </p>
                                            </div>

                                            <Switch
                                                checked={data.is_recap_visible}
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'is_recap_visible',
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Leaderboard */}
                                        <div className="flex items-center gap-3 py-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <Podium className="h-4 w-4" />
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <Label className="text-sm font-semibold">
                                                    Papan Peringkat
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Tampilkan leaderboard
                                                    peringkat peserta.
                                                </p>
                                            </div>

                                            <Switch
                                                checked={
                                                    data.is_leaderboard_visible
                                                }
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'is_leaderboard_visible',
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </form>
                    </div>

                    <ConfirmationDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        title="Konfirmasi Perubahan"
                        description="Apakah Anda yakin ingin menyimpan perubahan pada event ini?"
                        confirmText="Simpan Perubahan"
                        cancelText="Batal"
                        onConfirm={confirmSubmit}
                        isProcessing={processing}
                    />

                    <div className="space-y-6 xl:col-span-4">
                        <div className="space-y-6 xl:sticky xl:top-6">
                            <Card className="overflow-hidden rounded-xl border-border/60 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>

                                        <div className="space-y-0.5">
                                            <CardTitle className="text-base">
                                                Panitia Ditugaskan
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Daftar panitia pengelola event.
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="secondary"
                                        className="rounded-md tabular-nums"
                                    >
                                        {event.event_committees?.length ?? 0}
                                    </Badge>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <div className="max-h-125 divide-y divide-border/50 overflow-y-auto">
                                        {event.event_committees?.length ===
                                        0 ? (
                                            <div className="flex flex-col items-center gap-2 p-8 text-center">
                                                <Users className="h-8 w-8 text-muted-foreground/40" />
                                                <p className="text-sm text-muted-foreground">
                                                    Belum ada panitia yang
                                                    ditugaskan.
                                                </p>
                                            </div>
                                        ) : (
                                            event.event_committees?.map(
                                                (ec: any) => (
                                                    <div
                                                        key={
                                                            ec.event_committee_id
                                                        }
                                                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                            {ec.committee?.user?.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ??
                                                                '?'}
                                                        </div>

                                                        <div className="min-w-0 flex-1 space-y-1">
                                                            <p className="truncate text-sm font-semibold">
                                                                {ec.committee
                                                                    ?.user
                                                                    ?.name ??
                                                                    'Pengguna Tidak Diketahui'}
                                                            </p>

                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {ec.committee
                                                                    ?.department ??
                                                                    '-'}
                                                            </p>
                                                        </div>

                                                        <Badge
                                                            variant="outline"
                                                            className="shrink-0 bg-muted/40 text-[10px] font-medium capitalize"
                                                        >
                                                            {ec.position}
                                                        </Badge>
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    form="event-edit-form"
                                    size="lg"
                                    disabled={processing}
                                    className="px-8 shadow-sm"
                                >
                                    {processing ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    )}
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </InnerAppLayout>
    );
}
