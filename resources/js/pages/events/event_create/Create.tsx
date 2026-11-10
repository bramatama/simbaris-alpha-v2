import { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
    Trash2,
    PlusCircle,
    X,
    ImagePlus,
    CalendarDays,
    FileText,
    MapPin,
    Users,
    Clock3,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

import {
    Select,
    SelectLabel,
    SelectGroup,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

export default function EventCreate({
    existingCommittees = [],
}: {
    existingCommittees: any[];
}) {
    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm({
            event_name: '',
            description: '',
            location: '',
            status: 'draft',
            registration_start_time: '',
            registration_end_time: '',
            start_time: '',
            end_time: '',
            poster_path: null as File | null,
            committees: [{ name: '', email: '', department: '', position: '' }],
        });

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCommittees, setSelectedCommittees] = useState<
        (string | null)[]
    >([]);

    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('poster_path', file);
            if (posterPreview) {
                URL.revokeObjectURL(posterPreview);
            }
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const removePoster = () => {
        setData('poster_path', null);
        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
            setPosterPreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const clearSelectedCommittee = (index: number) => {
        const newCommittees = [...data.committees];

        newCommittees[index] = {
            name: '',
            email: '',
            department: '',
            position: '',
        };

        setData('committees', newCommittees);

        setSelectedCommittees((prev) => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };

    useEffect(() => {
        if (errors['confirmation' as keyof typeof errors]) {
            setShowConfirm(true);
        }
    }, [errors['confirmation' as keyof typeof errors]]);

    const addCommittee = () => {
        if (data.committees.length >= 3) return;

        setData('committees', [
            ...data.committees,
            { name: '', email: '', department: '', position: '' },
        ]);

        setSelectedCommittees((prev) => [...prev, null]);
    };

    const removeCommittee = (index: number) => {
        const newCommittees = [...data.committees];
        newCommittees.splice(index, 1);

        setData('committees', newCommittees);

        setSelectedCommittees((prev) =>
            prev.filter((_, committeeIndex) => committeeIndex !== index),
        );
    };

    const updateCommittee = (
        index: number,
        field: 'name' | 'email' | 'department' | 'position',
        value: string,
    ) => {
        const newCommittees = [...data.committees];
        newCommittees[index] = { ...newCommittees[index], [field]: value };
        setData('committees', newCommittees);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/events');
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        clearErrors('confirmation' as keyof typeof errors);

        transform((data) => ({
            ...data,
            force_create: true,
        }));

        post('/admin/events', {
            onFinish: () => {
                transform((data) => data);
            },
        });
    };

    // Helper untuk render Ikon Error + Tooltip di sebelah Label
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
        <AppLayout>
            <Head title="Buat Event Baru" />

            <div className="min-h-screen w-full bg-muted/20 p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* PAGE HEADER */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Link
                                    href={'/events'}
                                    className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                                >
                                    <ArrowLeft className="mr-1.5 h-4 w-4" />{' '}
                                    Semua Event
                                </Link>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Membuat Event Baru
                            </h1>

                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Atur informasi kompetisi, jadwal pelaksanaan,
                                dan akun panitia yang akan bertugas dalam event.
                            </p>
                        </div>

                        <div className="flex w-fit items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Penyiapan Event
                        </div>
                    </div>

                    {/* SOLUSI 3: BANNER RINGKASAN ERROR GABUNGAN DI ATAS FORM */}
                    {Object.keys(errors).length > 0 && (
                        <div className="is-error-banner flex animate-in items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm duration-300 fade-in slide-in-from-top-2">
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

                    <form onSubmit={submit} className="space-y-6 pb-12">
                        {/* INFORMASI DASAR & PENJADWALAN */}
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            {/* CARD INFORMASI DASAR */}
                            <Card className="overflow-hidden border-border/70 shadow-sm">
                                <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <CardTitle className="text-base">
                                                Informasi Dasar
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                Informasi utama dan identitas
                                                kompetisi.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-5 p-4 sm:p-6">
                                    {/* POSTER */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label requirement="optional">
                                                Poster Event
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                {renderErrorBadge(
                                                    errors.poster_path as string,
                                                )}
                                                <span className="text-[11px] text-muted-foreground">
                                                    JPG / PNG
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 rounded-xl border border-dashed bg-muted/20 p-3 sm:flex-row sm:items-center sm:p-4">
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handlePosterChange}
                                                accept="image/*"
                                                id="poster"
                                            />

                                            {posterPreview ? (
                                                <div className="group relative mx-auto aspect-3/4 w-32 shrink-0 overflow-hidden rounded-lg border bg-background shadow-sm sm:mx-0">
                                                    <img
                                                        src={posterPreview}
                                                        alt="Pratinjau Poster"
                                                        className="h-full w-full object-cover"
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-full"
                                                            onClick={
                                                                removePoster
                                                            }
                                                            aria-label="Hapus Poster"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    className="flex aspect-3/4 w-32 shrink-0 flex-col items-center justify-center self-center rounded-lg border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary sm:self-auto"
                                                >
                                                    <ImagePlus className="mb-2 h-8 w-8" />
                                                    <span className="text-xs font-semibold">
                                                        Unggah Poster
                                                    </span>
                                                </button>
                                            )}

                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <p className="text-sm font-semibold">
                                                    Poster Kompetisi
                                                </p>
                                                <p className="text-xs leading-relaxed text-muted-foreground">
                                                    Tambahkan poster untuk
                                                    memberikan identitas visual
                                                    pada event. Gunakan gambar
                                                    dengan rasio 3:4 agar tampil
                                                    optimal.
                                                </p>

                                                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                                    <span className="rounded-md bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                        Potret 3:4
                                                    </span>
                                                    <span className="rounded-md bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                        JPG / PNG
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t" />

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
                                            {renderErrorBadge(errors.location)}
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                                className={`h-10 pl-9 ${errors.location ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* DESKRIPSI */}
                                    <div className="space-y-2">
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
                                            placeholder="Tuliskan deskripsi singkat mengenai kompetisi..."
                                            rows={4}
                                            className="resize-y"
                                        />
                                    </div>

                                    {/* STATUS AWAL */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="status">
                                                Status Awal
                                            </Label>
                                            {renderErrorBadge(errors.status)}
                                        </div>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData('status', value)
                                            }
                                        >
                                            <SelectTrigger
                                                id="status"
                                                className="h-10 w-full"
                                            >
                                                <SelectValue placeholder="Pilih status awal" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectItem value="draft">
                                                    Draf
                                                </SelectItem>
                                                <SelectItem value="registration_open">
                                                    Pendaftaran Dibuka
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    Sedang Berlangsung
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CARD PENJADWALAN */}
                            <Card className="overflow-hidden border-border/70 shadow-sm">
                                <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <CalendarDays className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <CardTitle className="text-base">
                                                Penjadwalan
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                Atur periode pendaftaran dan
                                                pelaksanaan kompetisi.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-5 p-4 sm:p-6">
                                    {/* PERIODE PENDAFTARAN */}
                                    <div className="space-y-4 rounded-xl border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Clock3 className="h-4 w-4" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Periode Pendaftaran
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Periode penerimaan peserta.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="registration_start_time"
                                                    >
                                                        Mulai
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
                                                        Sampai
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

                                    {/* TANGGAL PELAKSANAAN */}
                                    <div className="space-y-4 rounded-xl border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <CalendarDays className="h-4 w-4" />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Tanggal Pelaksanaan
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Jadwal pelaksanaan
                                                    kompetisi.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="min-w-0 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="start_time"
                                                    >
                                                        Mulai
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
                                                        Selesai
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

                                    <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <p>
                                            Pastikan periode pendaftaran dan
                                            pelaksanaan sudah sesuai sebelum
                                            membuat event.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* MANAJEMEN AKUN PANITIA */}
                        <Card className="overflow-hidden border-border/70 shadow-sm">
                            <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Users className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <CardTitle className="text-base">
                                                Daftarkan Akun Panitia
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-xs">
                                                Buat akun dan tentukan posisi
                                                panitia untuk event ini.
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <div className="flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                                        <Users className="h-3.5 w-3.5 text-primary" />
                                        <span>
                                            {data.committees.length} / 3 Panitia
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5 p-4 sm:p-6">
                                {/* DEFAULT PASSWORD INFO */}
                                <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2">
                                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-foreground">
                                                Informasi Akun Panitia
                                            </p>
                                            <p className="mt-0.5 text-muted-foreground">
                                                Akun panitia baru akan otomatis
                                                ditambahkan dan dikirimkan
                                                konfirmasi via email.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Kata sandi bawaan:
                                        </span>
                                        <code className="rounded-md border bg-background px-2 py-1 font-semibold text-foreground">
                                            password123
                                        </code>
                                    </div>
                                </div>

                                {/* COMMITTEE LIST */}
                                <div className="space-y-4">
                                    {data.committees.map((item, index) => (
                                        <div
                                            key={index}
                                            className="overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-primary/30"
                                        >
                                            {/* COMMITTEE HEADER */}
                                            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                                        {String(
                                                            index + 1,
                                                        ).padStart(2, '0')}
                                                    </div>

                                                    <div>
                                                        <h4 className="text-sm font-semibold">
                                                            Panitia #{index + 1}
                                                        </h4>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Informasi Akun
                                                        </p>
                                                    </div>
                                                </div>

                                                {data.committees.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            removeCommittee(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">
                                                            Hapus
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="space-y-4 p-4">
                                                {/* AUTOFILL */}
                                                <div className="space-y-2 rounded-lg border border-dashed bg-muted/20 p-3">
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                        <Label
                                                            requirement="optional"
                                                            className="text-xs"
                                                        >
                                                            Isi Otomatis Panitia
                                                            Terdaftar
                                                        </Label>

                                                        <span className="text-[10px] text-muted-foreground">
                                                            Gunakan akun yang
                                                            sudah terdaftar
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            value={
                                                                selectedCommittees[
                                                                    index
                                                                ] ?? ''
                                                            }
                                                            onValueChange={(
                                                                val,
                                                            ) => {
                                                                const c =
                                                                    existingCommittees.find(
                                                                        (x) =>
                                                                            x.committee_id.toString() ===
                                                                            val,
                                                                    );

                                                                if (c) {
                                                                    const newCommittees =
                                                                        [
                                                                            ...data.committees,
                                                                        ];

                                                                    newCommittees[
                                                                        index
                                                                    ] = {
                                                                        ...newCommittees[
                                                                            index
                                                                        ],
                                                                        name:
                                                                            c
                                                                                .user
                                                                                ?.name ||
                                                                            '',
                                                                        email:
                                                                            c
                                                                                .user
                                                                                ?.email ||
                                                                            '',
                                                                        department:
                                                                            c.department ||
                                                                            '',
                                                                    };

                                                                    setData(
                                                                        'committees',
                                                                        newCommittees,
                                                                    );

                                                                    setSelectedCommittees(
                                                                        (
                                                                            prev,
                                                                        ) => {
                                                                            const updated =
                                                                                [
                                                                                    ...prev,
                                                                                ];
                                                                            updated[
                                                                                index
                                                                            ] =
                                                                                val;
                                                                            return updated;
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-10 w-full bg-background text-xs sm:text-sm">
                                                                <SelectValue placeholder="-- Pilih panitia yang sudah terdaftar --" />
                                                            </SelectTrigger>

                                                            <SelectContent position="popper">
                                                                {existingCommittees
                                                                    .filter(
                                                                        (
                                                                            committee,
                                                                        ) => {
                                                                            const selectedDepartments =
                                                                                data.committees
                                                                                    .filter(
                                                                                        (
                                                                                            _,
                                                                                            i,
                                                                                        ) =>
                                                                                            i !==
                                                                                            index,
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            c,
                                                                                        ) =>
                                                                                            c.department,
                                                                                    );

                                                                            return !selectedDepartments.includes(
                                                                                committee.department,
                                                                            );
                                                                        },
                                                                    )
                                                                    .map(
                                                                        (c) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    c.committee_id
                                                                                }
                                                                                value={c.committee_id.toString()}
                                                                            >
                                                                                {
                                                                                    c
                                                                                        .user
                                                                                        ?.name
                                                                                }{' '}
                                                                                -{' '}
                                                                                {
                                                                                    c.department
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                            </SelectContent>
                                                        </Select>

                                                        {selectedCommittees[
                                                            index
                                                        ] && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                                                                onClick={() =>
                                                                    clearSelectedCommittee(
                                                                        index,
                                                                    )
                                                                }
                                                                title="Batalkan pilihan panitia"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* COMMITTEE FIELDS */}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label requirement="required">
                                                                Nama Lengkap
                                                            </Label>
                                                            {renderErrorBadge(
                                                                errors[
                                                                    `committees.${index}.name` as keyof typeof errors
                                                                ],
                                                            )}
                                                        </div>
                                                        <Input
                                                            id={`committees.${index}.name`}
                                                            placeholder="Contoh: Budi Santoso"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                updateCommittee(
                                                                    index,
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`h-10 ${errors[`committees.${index}.name` as keyof typeof errors] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label requirement="required">
                                                                Email
                                                            </Label>
                                                            {renderErrorBadge(
                                                                errors[
                                                                    `committees.${index}.email` as keyof typeof errors
                                                                ],
                                                            )}
                                                        </div>
                                                        <Input
                                                            id={`committees.${index}.email`}
                                                            type="email"
                                                            placeholder="budi@example.com"
                                                            value={item.email}
                                                            onChange={(e) =>
                                                                updateCommittee(
                                                                    index,
                                                                    'email',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`h-10 ${errors[`committees.${index}.email` as keyof typeof errors] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label requirement="required">
                                                                Departemen /
                                                                Bidang
                                                            </Label>
                                                            {renderErrorBadge(
                                                                errors[
                                                                    `committees.${index}.department` as keyof typeof errors
                                                                ],
                                                            )}
                                                        </div>
                                                        <Input
                                                            id={`committees.${index}.department`}
                                                            placeholder="Contoh: Manajemen Juara"
                                                            value={
                                                                item.department
                                                            }
                                                            onChange={(e) =>
                                                                updateCommittee(
                                                                    index,
                                                                    'department',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`h-10 ${errors[`committees.${index}.department` as keyof typeof errors] ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label requirement="required">
                                                                Posisi Panitia
                                                            </Label>
                                                            {renderErrorBadge(
                                                                errors[
                                                                    `committees.${index}.position` as keyof typeof errors
                                                                ],
                                                            )}
                                                        </div>
                                                        <Select
                                                            value={
                                                                item.position
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateCommittee(
                                                                    index,
                                                                    'position',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                id={`committees.${index}.position`}
                                                                className="h-10 w-full"
                                                            >
                                                                <SelectValue placeholder="Pilih Posisi" />
                                                            </SelectTrigger>

                                                            <SelectContent position="popper">
                                                                <SelectGroup>
                                                                    <SelectLabel>
                                                                        Posisi
                                                                    </SelectLabel>
                                                                    <SelectItem value="administration">
                                                                        Administrasi
                                                                    </SelectItem>
                                                                    <SelectItem value="auditor">
                                                                        Auditor
                                                                        / Rekap
                                                                    </SelectItem>
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ADD COMMITTEE BUTTON */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCommittee}
                                    disabled={data.committees.length >= 3}
                                    className="h-11 w-full gap-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Tambah Anggota Panitia Lain
                                    <span className="text-xs text-muted-foreground">
                                        ({data.committees.length}/3)
                                    </span>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* FORM ACTIONS */}
                        <div className="sticky bottom-0 z-20 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="h-10 w-full sm:w-auto"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Batal
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-10 w-full sm:w-auto"
                                >
                                    {processing ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                    )}
                                    Buat Event & Akun Panitia
                                </Button>
                            </div>
                        </div>
                    </form>

                    <ConfirmationDialog
                        open={showConfirm}
                        onOpenChange={(open) => {
                            setShowConfirm(open);
                            if (!open) {
                                clearErrors(
                                    'confirmation' as keyof typeof errors,
                                );
                            }
                        }}
                        title="Akun Panitia Sudah Ada"
                        description={
                            errors[
                                'confirmation' as keyof typeof errors
                            ] as string
                        }
                        confirmText="Lanjutkan"
                        cancelText="Batal"
                        onConfirm={confirmSubmit}
                        isProcessing={processing}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
