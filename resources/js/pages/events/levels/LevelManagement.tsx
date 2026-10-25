import { Head, useForm, Link, usePage } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import type { PageProps } from '@inertiajs/core';
import { ArrowLeft, Plus, Save, Trash2, Tag, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type MasterLevel = {
    level_id: number;
    level_name: string;
};

type EventLevel = {
    event_level_id: number;
    event_id: number;
    level_id: number;
    registration_fees: number;
    quota: number | null;
    level?: MasterLevel;
};

type Event = {
    public_id: string;
    event_name: string;
    event_levels?: EventLevel[];
};

type LevelManagementProps = {
    event: Event;
    levels: MasterLevel[];
};

type FormLevelItem = {
    unique_id: string;
    level_id: string;
    level_name: string;
    registration_fees: number | string;
    quota: number | string;
    is_custom: boolean;
};

export default function LevelManagement({
    event,
    levels,
}: LevelManagementProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    // 1. Inisialisasi data form dari database
    const initialLevels: FormLevelItem[] =
        event.event_levels?.map((el) => ({
            unique_id: crypto.randomUUID(),
            level_id: el.level_id.toString(),
            level_name: el.level?.level_name || '',
            registration_fees: el.registration_fees,
            quota: el.quota || 0,
            is_custom: false,
        })) || [];

    const { data, setData, post, processing, errors } = useForm({
        levels: initialLevels,
    });

    // 2. Fungsi Toggle Checkbox untuk Master Data Level
    const toggleMasterLevel = (
        levelId: number,
        levelName: string,
        checked: boolean,
    ) => {
        if (checked) {
            setData('levels', [
                ...data.levels,
                {
                    unique_id: crypto.randomUUID(),
                    level_id: levelId.toString(),
                    level_name: levelName,
                    registration_fees: 0,
                    quota: '',
                    is_custom: false,
                },
            ]);
        } else {
            setData(
                'levels',
                data.levels.filter(
                    (l) => l.level_id !== levelId.toString() || l.is_custom,
                ),
            );
        }
    };

    // 3. Fungsi Tambah/Hapus Jenjang Baru (Custom)
    const addCustomLevel = () => {
        setData('levels', [
            ...data.levels,
            {
                unique_id: crypto.randomUUID(),
                level_id: '',
                level_name: '',
                registration_fees: 0,
                quota: 0,
                is_custom: true,
            },
        ]);
    };

    const removeCustomLevel = (uniqueId: string) => {
        setData(
            'levels',
            data.levels.filter((l) => l.unique_id !== uniqueId),
        );
    };

    // 4. Update field biaya & kuota
    const updateLevelField = (
        uniqueId: string,
        field: keyof FormLevelItem,
        value: any,
    ) => {
        setData(
            'levels',
            data.levels.map((l) =>
                l.unique_id === uniqueId ? { ...l, [field]: value } : l,
            ),
        );
    };

    // Membantu mengambil error berdasarkan indeks array yang bergeser-geser
    const getError = (uniqueId: string, field: string) => {
        const index = data.levels.findIndex((l) => l.unique_id === uniqueId);
        if (index === -1) return null;
        return errors[`levels.${index}.${field}` as keyof typeof errors] as
            string | undefined;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${event.public_id}/levels`, {
            preserveScroll: true,
        });
    };

    // Pisahkan daftar custom level untuk di-render di bawah
    const customLevels = data.levels.filter((l) => l.is_custom);

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Manajemen Jenjang - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Manajemen Jenjang & Biaya
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Pilih jenjang yang diizinkan mendaftar dan atur
                            biayanya.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/30">
                            <CardTitle className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-primary" />
                                Daftar Jenjang Kompetisi
                            </CardTitle>
                            <CardDescription>
                                Centang jenjang yang tersedia, lalu isi biaya
                                dan kuota maksimal (isi 0 jika kuota tidak
                                terbatas).
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 p-6">
                            {/* MASTER DATA LEVELS (SD, SMP, SMA, dll) */}
                            <div className="space-y-4">
                                {levels.map((masterLevel) => {
                                    const selectedData = data.levels.find(
                                        (l) =>
                                            l.level_id ===
                                                masterLevel.level_id.toString() &&
                                            !l.is_custom,
                                    );
                                    const isChecked = !!selectedData;

                                    return (
                                        <div
                                            key={masterLevel.level_id}
                                            className={cn(
                                                'rounded-xl border transition-all duration-200',
                                                isChecked
                                                    ? 'border-primary/50 bg-primary/5 shadow-sm'
                                                    : 'border-border/50 bg-card hover:border-border',
                                            )}
                                        >
                                            <div className="flex items-center space-x-3 p-4">
                                                <Checkbox
                                                    id={`level-${masterLevel.level_id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(c) =>
                                                        toggleMasterLevel(
                                                            masterLevel.level_id,
                                                            masterLevel.level_name,
                                                            c as boolean,
                                                        )
                                                    }
                                                    className="h-5 w-5 cursor-pointer"
                                                />
                                                <Label
                                                    htmlFor={`level-${masterLevel.level_id}`}
                                                    className="flex-1 cursor-pointer text-base font-bold select-none"
                                                >
                                                    Tingkat{' '}
                                                    {masterLevel.level_name}
                                                </Label>
                                            </div>

                                            {/* Form Detail Terbuka Jika Dicentang */}
                                            {isChecked && selectedData && (
                                                <div className="grid grid-cols-1 gap-5 px-4 pt-1 pb-5 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                                            Biaya Pendaftaran
                                                            (Rp)
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                                                Rp
                                                            </span>
                                                            <Input
                                                                type="number"
                                                                onWheel={(e) =>
                                                                    e.currentTarget.blur()
                                                                }
                                                                className="bg-background pl-9"
                                                                value={
                                                                    selectedData.registration_fees
                                                                }
                                                                onChange={(e) =>
                                                                    updateLevelField(
                                                                        selectedData.unique_id,
                                                                        'registration_fees',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={
                                                                getError(
                                                                    selectedData.unique_id,
                                                                    'registration_fees',
                                                                ) ?? undefined
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                                            Kuota (Tim)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            onWheel={(e) =>
                                                                e.currentTarget.blur()
                                                            }
                                                            placeholder="Kosong = Tanpa Batas"
                                                            className="bg-background"
                                                            value={
                                                                selectedData.quota
                                                            }
                                                            onChange={(e) =>
                                                                updateLevelField(
                                                                    selectedData.unique_id,
                                                                    'quota',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={
                                                                getError(
                                                                    selectedData.unique_id,
                                                                    'quota',
                                                                ) ?? undefined
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CUSTOM LEVELS (Jenjang Baru) */}
                            {customLevels.length > 0 && (
                                <div className="space-y-4 border-t border-dashed border-border/70 pt-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <Tag className="h-4 w-4" /> Jenjang
                                        Tambahan
                                    </div>

                                    {customLevels.map((customLevel) => (
                                        <div
                                            key={customLevel.unique_id}
                                            className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 shadow-sm"
                                        >
                                            <div className="mb-4 flex flex-col gap-4 border-b border-orange-500/20 pb-4 sm:flex-row">
                                                <div className="flex-1 space-y-2">
                                                    <Label
                                                        requirement="required"
                                                        className="text-xs tracking-wider text-orange-700/80 uppercase dark:text-orange-400/80"
                                                    >
                                                        Nama Jenjang Baru
                                                    </Label>
                                                    <Input
                                                        value={
                                                            customLevel.level_name
                                                        }
                                                        onChange={(e) =>
                                                            updateLevelField(
                                                                customLevel.unique_id,
                                                                'level_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Misal: UMUM, KAMPUS"
                                                        className="bg-background uppercase"
                                                        required
                                                    />
                                                    <InputError
                                                        message={
                                                            getError(
                                                                customLevel.unique_id,
                                                                'level_name',
                                                            ) ?? undefined
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        className="w-full sm:w-auto"
                                                        onClick={() =>
                                                            removeCustomLevel(
                                                                customLevel.unique_id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 sm:mr-2" />
                                                        <span className="sm:hidden">
                                                            Hapus Jenjang
                                                        </span>
                                                        <span className="hidden sm:inline">
                                                            Hapus
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                                        Biaya Pendaftaran (Rp)
                                                    </Label>
                                                    <div className="relative">
                                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                                            Rp
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            onWheel={(e) =>
                                                                e.currentTarget.blur()
                                                            }
                                                            className="bg-background pl-9"
                                                            value={
                                                                customLevel.registration_fees
                                                            }
                                                            onChange={(e) =>
                                                                updateLevelField(
                                                                    customLevel.unique_id,
                                                                    'registration_fees',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                    <InputError
                                                        message={
                                                            getError(
                                                                customLevel.unique_id,
                                                                'registration_fees',
                                                            ) ?? undefined
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                                        Kuota (Tim)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        onWheel={(e) =>
                                                            e.currentTarget.blur()
                                                        }
                                                        placeholder="0 = Tanpa Batas"
                                                        className="bg-background"
                                                        value={
                                                            customLevel.quota
                                                        }
                                                        onChange={(e) =>
                                                            updateLevelField(
                                                                customLevel.unique_id,
                                                                'quota',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            getError(
                                                                customLevel.unique_id,
                                                                'quota',
                                                            ) ?? undefined
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tombol Tambah Jenjang Custom */}
                            <div className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCustomLevel}
                                    className="w-full gap-2 border-dashed md:w-auto"
                                >
                                    <Plus className="h-4 w-4" /> Buat Jenjang
                                    Baru (Luar Daftar)
                                </Button>
                            </div>

                            {errors.levels && (
                                <InputError
                                    message={errors.levels as string}
                                    className="mt-2 text-center"
                                />
                            )}
                        </CardContent>

                        <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/10 p-6">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total {data.levels.length} jenjang diaktifkan
                            </span>
                            <Button
                                type="submit"
                                disabled={
                                    processing || data.levels.length === 0
                                }
                                className="gap-2 px-6"
                            >
                                {processing && <Spinner className="h-4 w-4" />}
                                <Save className="h-4 w-4" /> Simpan Konfigurasi
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </InnerAppLayout>
    );
}
