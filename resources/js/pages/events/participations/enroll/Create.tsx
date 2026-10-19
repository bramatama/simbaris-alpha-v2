import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ChevronRight,
    Banknote,
    Users,
} from 'lucide-react';
import { FileUploader } from '@/components/ui/file-uploader';

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

    const [step, setStep] = useState<1 | 2>(1);

    const [isValidating, setIsValidating] = useState(false);

    const formTopRef = useRef<HTMLDivElement>(null);

    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const [forceLeave, setForceLeave] = useState(false);

    const { data, setData, post, processing, errors, clearErrors, setError , isDirty} =
        useForm({
            teams: [
                {
                    event_level_id: '',
                    team_name: '',
                    pic_name: '',
                    pic_phone_number: '',
                },
            ] as TeamForm[],
            temp_payment_proof_path: null as string | null,
        });

    const totalFee = data.teams.reduce((total, team) => {
        const level = eventLevels.find(
            (l) => l.event_level_id.toString() === team.event_level_id,
        );
        return total + (level ? Number(level.registration_fees) : 0);
    }, 0);

    const scrollToError = () => {
        setTimeout(() => {
            formTopRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, 100);
    };

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
        clearErrors('teams' as any);
    };

    const canGoToStep2 = data.teams.every(
        (t) =>
            t.event_level_id && t.team_name && t.pic_name && t.pic_phone_number,
    );

    const handleNextStep = async () => {
        if (!canGoToStep2) return;

        setIsValidating(true);
        clearErrors('teams' as any);

        try {
            // Panggil rute khusus untuk ngecek kuota (mengirim array event_level_id)
            await axios.post(
                `/official_team/events/${event.public_id}/check-quota`,
                {
                    teams: data.teams.map((t) => ({
                        event_level_id: t.event_level_id,
                    })),
                },
            );

            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            // Jika gagal (status 422), tangkap pesan dari server dan set error
            if (error.response && error.response.status === 422) {
                setError(
                    'teams' as any,
                    error.response.data.message ||
                        'Sisa kuota tidak mencukupi.',
                );
            } else {
                setError(
                    'teams' as any,
                    'Terjadi kesalahan saat mengecek kuota server.',
                );
            }
            scrollToError();
        } finally {
            setIsValidating(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${event.public_id}/participations`, {
            preserveScroll: true,
            onError: () => {
                scrollToError();
            },
        });
    };

    const confirmLeave = () => {
        setForceLeave(true); // Izinkan navigasi melewati proteksi
        setShowLeaveDialog(false);

        if (pendingUrl) {
            setTimeout(() => {
                router.visit(pendingUrl);
            }, 0);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        const unsubscribe = router.on('before', (event) => {
            if (event.detail.visit.method.toLowerCase() !== 'get') {
                return;
            }

            if (isDirty && !forceLeave) {
                event.preventDefault();

                const destinationUrl =
                    typeof event.detail.visit.url === 'string'
                        ? event.detail.visit.url
                        : event.detail.visit.url.href;

                setPendingUrl(destinationUrl);
                setShowLeaveDialog(true);
            }
        });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            unsubscribe();
        };
    }, [isDirty, forceLeave]);

    return (
        <AppLayout>
            <Head title={`Daftar Event - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
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
                <div ref={formTopRef} className="scroll-mt-24"></div>
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
                    {step === 1 && (
                        <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-left-4">
                            {/* PESAN ERROR KUOTA GLOBAL */}
                            {errors.teams &&
                                typeof errors.teams === 'string' && (
                                    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="font-semibold">
                                                {errors.teams}
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                            <div className="space-y-2 md:col-span-2">
                                                <Label
                                                    htmlFor={`level-${index}`}
                                                    requirement='required'
                                                >
                                                    Kategori / Jenjang Lomba
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
                                                    requirement='required'
                                                >
                                                    Nama Tim / Pangkalan
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
                                                    requirement='required'
                                                >
                                                    Nama PIC
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
                                                    requirement='required'
                                                >
                                                    No. HP / WA
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
                                    disabled={!canGoToStep2 || isValidating}
                                >
                                    {isValidating ? (
                                        <Spinner className="h-4 w-4" />
                                    ) : (
                                        'Lanjut Pembayaran'
                                    )}
                                    {!isValidating && (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in space-y-6 duration-300 fade-in slide-in-from-right-4">
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
                                    <div className="flex flex-col items-start gap-6 sm:flex-row">
                                        <div className="w-full sm:w-1/2">
                                            <FileUploader
                                                variant="image"
                                                endpoint="/api/upload-temp"
                                                maxSizeMB={2}
                                                multiple={false}
                                                onUploadSuccess={(
                                                    fileId,
                                                    path,
                                                ) => {
                                                    setData(
                                                        'temp_payment_proof_path',
                                                        path,
                                                    );
                                                    clearErrors(
                                                        'temp_payment_proof_path',
                                                    );
                                                }}
                                                onRemove={() =>
                                                    setData(
                                                        'temp_payment_proof_path',
                                                        null,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="w-full space-y-2 pt-2 sm:w-1/2 sm:pt-0">
                                            <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-foreground shadow-sm">
                                                <h4 className="mb-1 font-semibold">
                                                    Panduan Unggah:
                                                </h4>
                                                <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                                                    <li>
                                                        Pastikan nama pengirim
                                                        dan nominal terlihat
                                                        jelas.
                                                    </li>
                                                    <li>
                                                        Tunggu hingga proses
                                                        unggah selesai (status
                                                        hijau).
                                                    </li>
                                                    <li>
                                                        Maksimal ukuran file
                                                        adalah 2MB.
                                                    </li>
                                                </ul>
                                            </div>

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
                                                    errors.temp_payment_proof_path
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
                                            !data.temp_payment_proof_path ||
                                            processing
                                        }
                                        className="gap-2 px-8"
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
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
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tinggalkan Halaman?</DialogTitle>
                        <DialogDescription>
                            Anda memiliki data pendaftaran tim pangkalan atau
                            bukti pembayaran yang belum disimpan. Jika Anda
                            meninggalkan halaman ini, perubahan tersebut akan
                            hilang.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLeaveDialog(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmLeave}
                        >
                            Ya, Tinggalkan Halaman
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
