import { useState } from 'react';
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
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    ImagePlus,
    UserCheck,
    Eye,
    ClipboardCheck,
    Calculator,
    Podium,
    FileText,
    CalendarDays,
    Clock,
    Users,
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
    const userRole = auth.user.role;
    const committeePosition = auth.user.committee_position;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole, committeePosition || undefined)}
        >
            <Head title={`Edit: ${event.event_name}`} />

            <div className="w-full p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="space-y-6 xl:col-span-8">
                        <form
                            id="event-edit-form"
                            onSubmit={submit}
                            className="space-y-6"
                        >
                            {/* KARTU 1: DETAIL DASAR & POSTER */}
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
                                            <Label
                                                requirement="optional"
                                                className="mb-1 text-base"
                                            >
                                                Event Poster
                                            </Label>
                                            <p className="mb-4 text-sm text-muted-foreground">
                                                Format file: JPG, JPEG, PNG
                                                (Maks 5MB). Rasio
                                                direkomendasikan 3:4.
                                            </p>
                                            <div className="flex flex-col items-start gap-6 sm:flex-row">
                                                {event.poster_path ? (
                                                    <div className="group relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm sm:w-40">
                                                        <img
                                                            src={`/storage/${event.poster_path}`}
                                                            alt="Current Poster"
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

                                                <div className="w-full min-w-0 flex-1">
                                                    <FileUploader
                                                        variant="image"
                                                        endpoint="/upload-temp-file"
                                                        maxSizeMB={5}
                                                        multiple={false}
                                                        onUploadSuccess={(
                                                            fileId,
                                                            path,
                                                        ) => {
                                                            setData(
                                                                'temp_poster_path',
                                                                path,
                                                            );
                                                            clearErrors(
                                                                'temp_poster_path',
                                                            );
                                                        }}
                                                        onRemove={() =>
                                                            setData(
                                                                'temp_poster_path',
                                                                null,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.temp_poster_path as string
                                                        }
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label
                                                    requirement="required"
                                                    htmlFor="event_name"
                                                >
                                                    Event Name
                                                </Label>
                                                <Input
                                                    id="event_name"
                                                    value={data.event_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'event_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.event_name}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label
                                                    requirement="required"
                                                    htmlFor="location"
                                                >
                                                    Location
                                                </Label>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) =>
                                                        setData(
                                                            'location',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.location}
                                                />
                                            </div>

                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="status">
                                                    Event Status
                                                </Label>
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
                                                        <SelectValue placeholder="Select status" />
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
                                                                berlangsung
                                                            </SelectItem>
                                                            <SelectItem value="finished">
                                                                Selesai
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2 pt-1 md:col-span-2">
                                                <Label
                                                    requirement="optional"
                                                    htmlFor="description"
                                                >
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={4}
                                                    className="resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* KARTU: PENJADWALAN */}
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
                                    {/* Periode Pendaftaran */}
                                    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            Periode Pendaftaran
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label requirement="required">
                                                    Tanggal Buka
                                                </Label>
                                                <Input
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
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label requirement="required">
                                                    Penutupan Pendaftaran
                                                </Label>
                                                <Input
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
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            Hari Pelaksanaan
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label requirement="required">
                                                    Tanggal Mulai
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={data.start_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            'start_time',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label requirement="required">
                                                    Tanggal Berakhir
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={data.end_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            'end_time',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* KARTU BARU: PENGATURAN VISIBILITAS HASIL & LEADERBOARD */}
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
                        title="Confirm Changes"
                        description="Are you sure you want to save these changes to the event?"
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
                                                Committees
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Daftar panitia event.
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
                                                    No committees assigned.
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
                                                                    'Unknown User'}
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
                            <div className="flex items-center justify-end gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="event-edit-form"
                                    size="lg"
                                    disabled={processing}
                                    className="px-8"
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </InnerAppLayout>
    );
}
