import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    UploadCloud,
    Image as ImageIcon,
    Plus,
    Trash2,
    ChevronRight,
    Banknote,
    Users,
} from 'lucide-react';

interface TeamForm {
    event_level_id: string;
    team_name: string;
    pic_name: string;
    pic_phone_number: string;
}

export default function OfficialTeamParticipationCreate({
    event,
    eventLevels,
}: {
    event: any;
    eventLevels: any[];
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    // State untuk Stepper (Langkah 1 atau 2)
    const [step, setStep] = useState<1 | 2>(1);

    // State Preview Gambar Pembayaran
    const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
    const paymentInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        teams: [
            {
                event_level_id: '',
                team_name: '',
                pic_name: '',
                pic_phone_number: '',
            },
        ] as TeamForm[],
        payment_proof_path: null as File | null,
    });

    // Menghitung Total Tagihan secara dinamis
    const totalFee = data.teams.reduce((total, team) => {
        const level = eventLevels.find(
            (l) => l.event_level_id.toString() === team.event_level_id,
        );
        return total + (level ? Number(level.registration_fees) : 0);
    }, 0);

    // Handler Manajemen Array Tim
    const addTeam = () => {
        setData('teams', [
            ...data.teams,
            {
                event_level_id: '',
                team_name: '',
                pic_name: '',
                pic_phone_number: '',
            },
        ]);
    };

    const removeTeam = (index: number) => {
        const newTeams = data.teams.filter((_, i) => i !== index);
        setData('teams', newTeams);
    };

    const updateTeam = (
        index: number,
        field: keyof TeamForm,
        value: string,
    ) => {
        const newTeams = [...data.teams];
        newTeams[index][field] = value;
        setData('teams', newTeams);
        clearErrors(`teams.${index}.${field}` as any);
    };

    // Handler Gambar
    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('payment_proof_path', file);
            setPaymentPreview(URL.createObjectURL(file));
            clearErrors('payment_proof_path');
        }
    };

    // Validasi Langkah 1 sebelum lanjut ke Langkah 2
    const canGoToStep2 = data.teams.every(
        (t) =>
            t.event_level_id && t.team_name && t.pic_name && t.pic_phone_number,
    );

    const handleNextStep = () => {
        if (canGoToStep2) setStep(2);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mengirim data menggunakan POST (Tidak perlu _method: 'put' karena ini form create baru)
        post(`/${userRole}/events/${event.public_id}/participations`, {
            preserveScroll: true,
        });
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Daftar Event - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Judul Halaman */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/participations`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Batal &
                            Kembali
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Pendaftaran Tim
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Pendaftaran resmi untuk{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>
                </div>

                {/* Indikator Stepper */}
                <div className="mb-4 flex items-center gap-2">
                    <div
                        className={`flex flex-1 items-center gap-2 border-b-2 pb-2 transition-colors ${step >= 1 ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}
                    >
                        <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                            1
                        </div>
                        <span className="text-sm font-semibold">
                            Data Tim & Pangkalan
                        </span>
                    </div>
                    <div
                        className={`flex flex-1 items-center gap-2 border-b-2 pb-2 transition-colors ${step === 2 ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}`}
                    >
                        <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                            2
                        </div>
                        <span className="text-sm font-semibold">
                            Pembayaran
                        </span>
                    </div>
                </div>

                <form onSubmit={submit}>
                    {/* ==========================================
                        LANGKAH 1: FORMULIR DATA TIM
                    ========================================== */}
                    {step === 1 && (
                        <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-left-4">
                            {data.teams.map((team, index) => (
                                <Card
                                    key={index}
                                    className="relative overflow-hidden border-border/50 shadow-sm"
                                >
                                    {index > 0 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-sm"
                                            onClick={() => removeTeam(index)}
                                            title="Hapus Tim Ini"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                                        <CardTitle className="flex items-center gap-2 text-base text-primary">
                                            <Users className="h-4 w-4" /> Data
                                            Tim {index + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            {/* Pilihan Jenjang */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label
                                                    htmlFor={`level-${index}`}
                                                >
                                                    Kategori / Jenjang Lomba{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <select
                                                    id={`level-${index}`}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={team.event_level_id}
                                                    onChange={(e) =>
                                                        updateTeam(
                                                            index,
                                                            'event_level_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="" disabled>
                                                        -- Pilih Jenjang --
                                                    </option>
                                                    {eventLevels.map(
                                                        (level) => (
                                                            <option
                                                                key={
                                                                    level.event_level_id
                                                                }
                                                                value={
                                                                    level.event_level_id
                                                                }
                                                            >
                                                                {
                                                                    level.level
                                                                        .level_name
                                                                }{' '}
                                                                - Biaya: Rp{' '}
                                                                {Number(
                                                                    level.registration_fees,
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}{' '}
                                                                (Sisa Kuota:{' '}
                                                                {level.quota ||
                                                                    'Tanpa Batas'}
                                                                )
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `teams.${index}.event_level_id`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label
                                                    htmlFor={`team_name-${index}`}
                                                >
                                                    Nama Tim / Pangkalan{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id={`team_name-${index}`}
                                                    value={team.team_name}
                                                    onChange={(e) =>
                                                        updateTeam(
                                                            index,
                                                            'team_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Pasukan Garuda Muda"
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `teams.${index}.team_name`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`pic_name-${index}`}
                                                >
                                                    Nama PIC{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id={`pic_name-${index}`}
                                                    value={team.pic_name}
                                                    onChange={(e) =>
                                                        updateTeam(
                                                            index,
                                                            'pic_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Penanggung Jawab Tim"
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `teams.${index}.pic_name`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor={`pic_phone-${index}`}
                                                >
                                                    No. HP / WA{' '}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id={`pic_phone-${index}`}
                                                    value={
                                                        team.pic_phone_number
                                                    }
                                                    onChange={(e) =>
                                                        updateTeam(
                                                            index,
                                                            'pic_phone_number',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: 081234567890"
                                                />
                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `teams.${index}.pic_phone_number`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full gap-2 border-2 border-dashed sm:w-auto"
                                    onClick={addTeam}
                                >
                                    <Plus className="h-4 w-4" /> Tambah Tim
                                    Lainnya
                                </Button>

                                <Button
                                    type="button"
                                    className="w-full gap-2 sm:w-auto"
                                    onClick={handleNextStep}
                                    disabled={!canGoToStep2}
                                >
                                    Lanjut Pembayaran{' '}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                        LANGKAH 2: FORMULIR PEMBAYARAN
                    ========================================== */}
                    {step === 2 && (
                        <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
                            {/* Kartu Ringkasan Tagihan */}
                            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
                                <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                                            <Banknote className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-emerald-700/80">
                                                Total Pembayaran (
                                                {data.teams.length} Tim)
                                            </p>
                                            <p className="text-3xl font-bold text-emerald-700">
                                                Rp{' '}
                                                {totalFee.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="max-w-xs text-center text-xs text-muted-foreground sm:text-right">
                                        Lakukan pembayaran sesuai nominal di
                                        atas untuk memproses pendaftaran seluruh
                                        tim Anda secara bersamaan.
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10">
                                    <CardTitle>
                                        Unggah Bukti Pembayaran
                                    </CardTitle>
                                    <CardDescription>
                                        Unggah struk transfer atau tangkapan
                                        layar pembayaran Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="hidden"
                                        ref={paymentInputRef}
                                        onChange={handlePaymentChange}
                                    />

                                    <div className="flex flex-col items-start gap-6 sm:flex-row">
                                        <div
                                            className="relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border/70 bg-muted/20 transition-colors hover:border-primary/50 hover:bg-muted/50 sm:w-1/2"
                                            onClick={() =>
                                                paymentInputRef.current?.click()
                                            }
                                        >
                                            {paymentPreview ? (
                                                <img
                                                    src={paymentPreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover opacity-60"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground/30" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        Klik untuk memilih
                                                        gambar
                                                    </span>
                                                    <span className="mt-1 text-xs text-muted-foreground">
                                                        JPG, PNG maks 2MB
                                                    </span>
                                                </div>
                                            )}

                                            {paymentPreview && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 opacity-0 backdrop-blur-[2px] transition-opacity hover:opacity-100">
                                                    <UploadCloud className="mb-2 h-8 w-8 text-primary" />
                                                    <span className="text-xs font-semibold text-foreground">
                                                        Ganti Gambar
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full space-y-2 sm:w-1/2">
                                            {Object.keys(errors).length > 0 && (
                                                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                                    <ul className="list-disc space-y-1 pl-4">
                                                        {Object.values(
                                                            errors,
                                                        ).map((err, i) => (
                                                            <li key={i}>
                                                                {err as string}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <InputError
                                                message={
                                                    errors.payment_proof_path
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between gap-3 border-t border-border/50 bg-muted/10 p-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => setStep(1)}
                                    >
                                        <ArrowLeft className="h-4 w-4" />{' '}
                                        Kembali
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            !data.payment_proof_path ||
                                            processing
                                        }
                                        className="gap-2"
                                    >
                                        {processing ? (
                                            <Spinner className="h-4 w-4" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Selesaikan Pendaftaran
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </form>
            </div>
        </InnerAppLayout>
    );
}
