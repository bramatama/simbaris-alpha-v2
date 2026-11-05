import { useEffect } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import type { PageProps } from '@inertiajs/core';
import { ArrowLeft, Save, CheckSquare, AlertCircle } from 'lucide-react';
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
};

export default function LevelManagement({
    event,
    levels,
}: LevelManagementProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;

    const initialLevels: FormLevelItem[] =
        event.event_levels?.map((el) => ({
            unique_id: crypto.randomUUID(),
            level_id: el.level_id.toString(),
            level_name: el.level?.level_name || '',
            registration_fees: el.registration_fees,
            quota: el.quota || 0,
        })) || [];

    const { data, setData, post, processing, errors } = useForm({
        levels: initialLevels,
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
                },
            ]);
        } else {
            setData(
                'levels',
                data.levels.filter((l) => l.level_id !== levelId.toString()),
            );
        }
    };

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

    const getError = (uniqueId: string, field: string) => {
        const index = data.levels.findIndex((l) => l.unique_id === uniqueId);
        if (index === -1) return null;
        return errors[`levels.${index}.${field}` as keyof typeof errors] as
            string | undefined;
    };

    const renderErrorBadge = (errorMsg?: string | null) => {
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

    const cleanCurrencyInput = (val: string): number => {
        const numericOnly = val.replace(/[^0-9]/g, '');
        return numericOnly ? parseInt(numericOnly, 10) : 0;
    };

    const handleFeeChange = (uniqueId: string, rawValue: string) => {
        const numericValue = cleanCurrencyInput(rawValue);
        updateLevelField(uniqueId, 'registration_fees', numericValue);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${event.public_id}/levels`, {
            preserveScroll: true,
        });
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Manajemen Jenjang - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke
                            Event
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
                                            masterLevel.level_id.toString(),
                                    );
                                    const isChecked = !!selectedData;

                                    const feeError = selectedData
                                        ? getError(
                                              selectedData.unique_id,
                                              'registration_fees',
                                          )
                                        : undefined;
                                    const quotaError = selectedData
                                        ? getError(
                                              selectedData.unique_id,
                                              'quota',
                                          )
                                        : undefined;

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
                                                    {/* BIAYA PENDAFTARAN */}
                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                                                Biaya
                                                                Pendaftaran (Rp)
                                                            </Label>
                                                            {renderErrorBadge(
                                                                feeError,
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                                                Rp
                                                            </span>
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                placeholder="0"
                                                                className={`bg-background pl-9 ${feeError ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
                                                                value={
                                                                    selectedData.registration_fees
                                                                        ? Number(
                                                                              selectedData.registration_fees,
                                                                          ).toLocaleString(
                                                                              'id-ID',
                                                                          )
                                                                        : ''
                                                                }
                                                                onChange={(e) =>
                                                                    handleFeeChange(
                                                                        selectedData.unique_id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* KUOTA */}
                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                                                                Kuota (Tim)
                                                            </Label>
                                                            {renderErrorBadge(
                                                                quotaError,
                                                            )}
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            onWheel={(e) =>
                                                                e.currentTarget.blur()
                                                            }
                                                            placeholder="Kosongkan = Tanpa Batas"
                                                            className={`bg-background ${quotaError ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' : ''}`}
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
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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
