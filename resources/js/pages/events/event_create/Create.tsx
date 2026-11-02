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
import InputError from '@/components/input-error';
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
    // 1. Tambahkan properti poster di inisialisasi useForm
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
            poster: null as File | null, // <-- Field poster baru
            committees: [{ name: '', email: '', department: '', position: '' }],
        });

    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedCommittees, setSelectedCommittees] = useState<
        (string | null)[]
    >([]);

    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('poster', file);
            if (posterPreview) {
                URL.revokeObjectURL(posterPreview);
            }
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const removePoster = () => {
        setData('poster', null);
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

    return (
        <AppLayout>
            <Head title="Create New Event" />

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

                    <form onSubmit={submit} className="space-y-6 pb-12">
                        {/* BASIC INFORMATION & SCHEDULING */}
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            {/* BASIC DETAILS */}
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
                                            <span className="text-[11px] text-muted-foreground">
                                                JPG / PNG
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-4 rounded-xl border border-dashed bg-muted/20 p-3 sm:flex-row sm:items-center sm:p-4">
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handlePosterChange}
                                                accept="image/*"
                                            />

                                            {posterPreview ? (
                                                <div className="group relative mx-auto aspect-3/4 w-32 shrink-0 overflow-hidden rounded-lg border bg-background shadow-sm sm:mx-0">
                                                    <img
                                                        src={posterPreview}
                                                        alt="Poster Preview"
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
                                                        Portrait 3:4
                                                    </span>
                                                    <span className="rounded-md bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                        JPG / PNG
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <InputError
                                            message={errors.poster as string}
                                        />
                                    </div>

                                    <div className="border-t" />

                                    {/* EVENT NAME */}
                                    <div className="grid gap-2">
                                        <Label
                                            requirement="required"
                                            htmlFor="event_name"
                                        >
                                            Nama Event
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
                                            placeholder="e.g. Lomba Paskibra Pandawa Vol IV 2026"
                                            className="h-10"
                                            required
                                        />
                                        <InputError
                                            message={errors.event_name}
                                        />
                                    </div>

                                    {/* LOCATION */}
                                    <div className="grid gap-2">
                                        <Label
                                            requirement="required"
                                            htmlFor="location"
                                        >
                                            Lokasi
                                        </Label>
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
                                                placeholder="e.g. GOR Segiri Samarinda"
                                                className="h-10 pl-9"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.location} />
                                    </div>

                                    {/* DESCRIPTION */}
                                    <div className="grid gap-2">
                                        <Label
                                            requirement="optional"
                                            htmlFor="description"
                                        >
                                            Deskripsi
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
                                            placeholder="Tuliskan deskripsi singkat mengenai kompetisi..."
                                            rows={4}
                                            className="resize-y"
                                        />
                                    </div>

                                    {/* STATUS */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">
                                            Status Awal
                                        </Label>
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
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectItem value="draft">
                                                    Draf
                                                </SelectItem>
                                                <SelectItem value="registration_open">
                                                    Pendaftaran dibuka
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    Sedang Berlangsung
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SCHEDULING */}
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
                                    {/* REGISTRATION PERIOD */}
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
                                            <div className="grid min-w-0 gap-2">
                                                <Label requirement="required">
                                                    Mulai
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
                                                    className="h-10 min-w-0 text-xs sm:text-sm"
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors.registration_start_time
                                                    }
                                                />
                                            </div>

                                            <div className="grid min-w-0 gap-2">
                                                <Label requirement="required">
                                                    Sampai
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
                                                    className="h-10 min-w-0 text-xs sm:text-sm"
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors.registration_end_time
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* EVENT PERIOD */}
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
                                            <div className="grid min-w-0 gap-2">
                                                <Label requirement="required">
                                                    Mulai
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
                                                    className="h-10 min-w-0 text-xs sm:text-sm"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.start_time}
                                                />
                                            </div>

                                            <div className="grid min-w-0 gap-2">
                                                <Label requirement="required">
                                                    Selesai
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
                                                    className="h-10 min-w-0 text-xs sm:text-sm"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.end_time}
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

                        {/* COMMITTEE MANAGEMENT */}
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
                                                Akun panitia akan otomatis
                                                ditambahkan ke event ini.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-muted-foreground">
                                            Default password:
                                        </span>
                                        <code className="rounded-md border bg-background px-2 py-1 font-semibold text-foreground">
                                            password123
                                        </code>
                                    </div>
                                </div>

                                {/* COMMITTEE ERRORS */}
                                {Object.keys(errors).some((key) =>
                                    key.includes('committees'),
                                ) && (
                                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                        <X className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p>
                                            Harap periksa kolom-kolom komite.
                                            Beberapa alamat email mungkin sudah
                                            terdaftar.
                                        </p>
                                    </div>
                                )}

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
                                                            Committee #
                                                            {index + 1}
                                                        </h4>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Account information
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
                                                            Remove
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
                                                            Autofill Existing
                                                            Committee
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
                                                                title="Batalkan pilihan committee"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* COMMITTEE FIELDS */}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="grid min-w-0 gap-2">
                                                        <Label requirement="required">
                                                            Full Name
                                                        </Label>
                                                        <Input
                                                            placeholder="e.g. Budi Santoso"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                updateCommittee(
                                                                    index,
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10"
                                                            required
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `committees.${index}.name` as keyof typeof errors
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid min-w-0 gap-2">
                                                        <Label requirement="required">
                                                            Email
                                                        </Label>
                                                        <Input
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
                                                            className="h-10"
                                                            required
                                                        />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `committees.${index}.email` as keyof typeof errors
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div className="grid min-w-0 gap-2">
                                                        <Label requirement="required">
                                                            Departemen
                                                        </Label>
                                                        <Input
                                                            placeholder="e.g. Juara Management"
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
                                                            className="h-10"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid min-w-0 gap-2">
                                                        <Label requirement="required">
                                                            Committee Position
                                                        </Label>
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
                                                            <SelectTrigger className="h-10 w-full">
                                                                <SelectValue placeholder="Pilih Posisi" />
                                                            </SelectTrigger>

                                                            <SelectContent position="popper">
                                                                <SelectGroup>
                                                                    <SelectLabel>
                                                                        Posisi
                                                                    </SelectLabel>
                                                                    <SelectItem value="administration">
                                                                        Administration
                                                                    </SelectItem>
                                                                    <SelectItem value="auditor">
                                                                        Auditor
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

                                {/* ADD COMMITTEE */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCommittee}
                                    disabled={data.committees.length >= 3}
                                    className="h-11 w-full gap-2 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Add Another Committee Member
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
                                    Cancel
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
                                    Create Event & Accounts
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
                        title="Committee Account Exists"
                        description={
                            errors[
                                'confirmation' as keyof typeof errors
                            ] as string
                        }
                        confirmText="Proceed"
                        onConfirm={confirmSubmit}
                        isProcessing={processing}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
