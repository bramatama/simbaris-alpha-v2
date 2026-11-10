import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, type FormEvent } from 'react';
import type { PageProps } from '@inertiajs/core';

import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { LevelDropdownFilter } from '@/components/level-dropdown-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';

import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Calculator,
    Info,
    LayoutList,
    Layers,
    AlertCircle,
} from 'lucide-react';

/* =========================================================
   TYPES & HELPERS
========================================================= */
interface SimbarisEvent {
    public_id: string;
    event_name: string;
}

interface EventLevel {
    event_level_id: number;
    level: {
        level_name: string;
    };
}

interface ChampionCategory {
    event_champion_category_id: number;
    champion_category: {
        champion_category_name: string;
    };
}

interface ScoringCategory {
    scoring_category_id: number;
    master_category_id: number;
    master_category?: {
        category_name: string;
    } | null;
}

interface ExistingFormulaRow {
    formula_id?: number;
    event_champion_category_id: number;
    event_level_id: number;
    master_category_id?: number;
    weight_multiplier: number | string;
}

type ExistingFormulasData =
    Record<string, ExistingFormulaRow[]> | ExistingFormulaRow[];

interface FormulaComponent {
    master_category_id: string;
    weight_value: string;
}

interface Formula {
    event_champion_category_id: number;
    champion_category_name: string;
    components: FormulaComponent[];
}

interface FormulaFormData {
    event_level_id: number | null;
    formulas: Formula[];
}

interface IndexProps {
    event: SimbarisEvent;
    eventLevels?: EventLevel[];
    activeLevel?: EventLevel | null;
    championCategories?: ChampionCategory[];
    scoringCategories?: ScoringCategory[];
    existingFormulas?: ExistingFormulasData;
}

const getCategoryRows = (
    formulas: ExistingFormulasData,
    categoryId: number,
): ExistingFormulaRow[] => {
    if (Array.isArray(formulas)) {
        return formulas.filter(
            (item) => Number(item.event_champion_category_id) === categoryId,
        );
    }
    return formulas[String(categoryId)] ?? [];
};

export default function ChampionFormulaIndex({
    event,
    eventLevels = [],
    activeLevel = null,
    championCategories = [],
    scoringCategories = [],
    existingFormulas = {},
}: IndexProps) {
    const { auth, errors: pageErrors } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;
    const isCommittee = ['committee', 'admin'].includes(userRole);

    const { data, setData, post, processing, errors, transform } =
        useForm<FormulaFormData>({
            event_level_id: activeLevel?.event_level_id || null,
            formulas: [],
        });

    const formErrors = errors as Record<string, string | undefined>;

    useEffect(() => {
        if (Object.keys(errors).length > 0 || pageErrors?.error) {
            const errorBanner = document.querySelector('.is-error-banner');
            if (errorBanner) {
                errorBanner.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            } else {
                const firstErrorKey = Object.keys(errors)[0];
                const targetElement =
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
    }, [errors, pageErrors]);

    useEffect(() => {
        setData({
            event_level_id: activeLevel?.event_level_id || null,
            formulas: championCategories.map((item) => {
                const existingRows = getCategoryRows(
                    existingFormulas,
                    item.event_champion_category_id,
                );
                return {
                    event_champion_category_id: item.event_champion_category_id,
                    champion_category_name:
                        item.champion_category.champion_category_name,
                    components: existingRows.map((row) => {
                        const numericVal = Number(row.weight_multiplier);
                        const percentVal = isNaN(numericVal)
                            ? ''
                            : (numericVal * 100).toString();

                        return {
                            master_category_id:
                                row.master_category_id !== undefined
                                    ? String(row.master_category_id)
                                    : '',
                            weight_value: percentVal,
                        };
                    }),
                };
            }),
        });
    }, [activeLevel, existingFormulas, championCategories]);

    const handleLevelChange = (levelIdStr: string) => {
        const levelId = Number(levelIdStr);

        if (!levelId) return;

        router.get(
            `/${userRole}/events/${event.public_id}/formulas`,
            { level_id: levelId },
            {
                preserveState: false,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const addComponent = (formulaIndex: number): void => {
        const updatedFormulas = data.formulas.map((formula, index) =>
            index === formulaIndex
                ? {
                      ...formula,
                      components: [
                          ...formula.components,
                          { master_category_id: '', weight_value: '' },
                      ],
                  }
                : formula,
        );
        setData('formulas', updatedFormulas);
    };

    const removeComponent = (
        formulaIndex: number,
        componentIndex: number,
    ): void => {
        const updatedFormulas = data.formulas.map((formula, index) =>
            index === formulaIndex
                ? {
                      ...formula,
                      components: formula.components.filter(
                          (_, idx) => idx !== componentIndex,
                      ),
                  }
                : formula,
        );
        setData('formulas', updatedFormulas);
    };

    const updateComponent = (
        formulaIndex: number,
        componentIndex: number,
        field: keyof FormulaComponent,
        value: string,
    ): void => {
        const updatedFormulas = data.formulas.map((formula, index) => {
            if (index !== formulaIndex) return formula;
            return {
                ...formula,
                components: formula.components.map((item, itemIdx) =>
                    itemIdx === componentIndex
                        ? { ...item, [field]: value }
                        : item,
                ),
            };
        });
        setData('formulas', updatedFormulas);
    };

    const isFormulaComplete = (formula: Formula): boolean => {
        if (formula.components.length === 0) return true;
        return formula.components.every(
            (component) =>
                component.master_category_id !== '' &&
                component.weight_value.trim() !== '' &&
                Number.isFinite(Number(component.weight_value)) &&
                Number(component.weight_value) > 0,
        );
    };

    const hasDuplicateCategories = (formula: Formula): boolean => {
        const selectedIds = formula.components
            .map((component) => component.master_category_id)
            .filter(Boolean);
        return new Set(selectedIds).size !== selectedIds.length;
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

    const canSubmit =
        !processing &&
        data.event_level_id !== null &&
        data.formulas.every(
            (formula) =>
                isFormulaComplete(formula) && !hasDuplicateCategories(formula),
        );

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!canSubmit) return;

        transform((currentData) => ({
            event_level_id: currentData.event_level_id,
            formulas: currentData.formulas.map((formula) => ({
                event_champion_category_id: formula.event_champion_category_id,
                components: formula.components.map((component) => ({
                    master_category_id: Number(component.master_category_id),
                    weight_multiplier: Number(component.weight_value) / 100,
                })),
            })),
        }));

        post(`/${userRole}/events/${event.public_id}/formulas`, {
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
            <Head title={`Formula Bobot - ${event.event_name}`} />
            <div className="grid w-full min-w-0 grid-cols-1">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 pt-4 pb-32 sm:space-y-6 sm:px-5 sm:pt-6 sm:pb-28 lg:px-8"
                >
                    {/* HEADER & FILTER */}
                    <div className="mb-5 flex min-w-0 flex-col justify-between gap-4 border-b border-border/50 pb-5 sm:mb-6 sm:gap-5 sm:pb-6 md:flex-row md:items-start">
                        <div className="min-w-0">
                            <Link
                                href={`/${userRole}/events/${event.public_id}/information`}
                                className="mb-3 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />
                                Kembali ke Dasbor
                            </Link>

                            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                                Formula Bobot Piala
                            </h1>

                            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
                                Pilih jenjang yang dituju, lalu atur pengali
                                nilai piala (dalam persentase %). Anda dapat
                                mengosongkan komponen jika piala tidak
                                dipertandingkan.
                            </p>
                        </div>
                    </div>

                    {/* ERROR BANNER ATAS (Metode 3) */}
                    {(Object.keys(errors).length > 0 || pageErrors?.error) && (
                        <div className="is-error-banner flex animate-in items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm duration-300 fade-in slide-in-from-top-2">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <h4 className="text-sm font-bold">
                                    Pengisian Form Belum Lengkap / Terjadi
                                    Kesalahan:
                                </h4>
                                <ul className="list-disc space-y-1 pl-4 text-xs text-destructive/90">
                                    {pageErrors?.error && (
                                        <li className="leading-relaxed">
                                            {pageErrors.error as string}
                                        </li>
                                    )}
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

                    {/* KONTEN UTAMA */}
                    {eventLevels.length > 0 ? (
                        <div className="space-y-5">
                            {activeLevel && (
                                <div className="animate-in space-y-4 duration-300 fade-in">
                                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <LayoutList className="h-4 w-4 shrink-0 text-primary" />

                                            <h2 className="min-w-0 text-sm font-bold sm:text-base">
                                                Konfigurasi Jenjang (
                                                {activeLevel.level.level_name})
                                            </h2>
                                        </div>
                                        <div className="w-full sm:w-auto sm:shrink-0">
                                            {eventLevels.length > 0 && (
                                                <LevelDropdownFilter
                                                    eventLevels={eventLevels}
                                                    activeLevelId={
                                                        activeLevel?.event_level_id ??
                                                        null
                                                    }
                                                    onLevelChange={
                                                        handleLevelChange
                                                    }
                                                    placeholder="Pilih jenjang..."
                                                    className="w-full"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {championCategories.length === 0 ? (
                                        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-5 text-center shadow-none sm:p-10">
                                            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                                <Calculator className="h-6 w-6" />
                                            </div>
                                            <h3 className="mb-1 text-sm font-bold text-foreground sm:text-base">
                                                Belum Ada Daftar Piala (Kategori
                                                Juara)
                                            </h3>
                                            <p className="mb-4 text-xs text-muted-foreground">
                                                Silakan atur master penghargaan
                                                / kategori juara terlebih dahulu
                                                sebelum menyusun bobot.
                                            </p>
                                        </Card>
                                    ) : (
                                        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                                            {data.formulas.map(
                                                (formula, fIndex) => {
                                                    const hasComponents =
                                                        formula.components
                                                            .length > 0;
                                                    const complete =
                                                        isFormulaComplete(
                                                            formula,
                                                        );
                                                    const duplicate =
                                                        hasDuplicateCategories(
                                                            formula,
                                                        );

                                                    const selectedCategoryIds =
                                                        formula.components
                                                            .map(
                                                                (c) =>
                                                                    c.master_category_id,
                                                            )
                                                            .filter(Boolean);

                                                    return (
                                                        <Card
                                                            key={
                                                                formula.event_champion_category_id
                                                            }
                                                            className="min-w-0 overflow-hidden border-border/70 shadow-sm transition-colors hover:border-primary/40"
                                                        >
                                                            <CardHeader className="border-b border-border/50 bg-muted/10 p-3 sm:p-4 lg:p-5">
                                                                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="flex min-w-0 items-start gap-2 sm:items-center">
                                                                        <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />

                                                                        <CardTitle className="min-w-0 text-sm leading-tight font-bold wrap-break-word sm:text-base">
                                                                            {
                                                                                formula.champion_category_name
                                                                            }
                                                                        </CardTitle>
                                                                    </div>
                                                                    <Badge
                                                                        variant={
                                                                            hasComponents
                                                                                ? 'default'
                                                                                : 'outline'
                                                                        }
                                                                        className="w-fit shrink-0"
                                                                    >
                                                                        {
                                                                            formula
                                                                                .components
                                                                                .length
                                                                        }{' '}
                                                                        komponen
                                                                    </Badge>
                                                                </div>
                                                            </CardHeader>

                                                            <CardContent className="min-w-0 space-y-4 p-3 sm:p-4 lg:p-5">
                                                                {!hasComponents && (
                                                                    <div className="flex items-start gap-2 rounded-md border border-muted-foreground/20 bg-muted/30 p-3 text-sm text-muted-foreground">
                                                                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                                                        <p className="leading-relaxed">
                                                                            Piala
                                                                            ini
                                                                            belum
                                                                            memiliki
                                                                            komponen
                                                                            bobot.
                                                                            Jika
                                                                            disimpan
                                                                            seperti
                                                                            ini,
                                                                            piala
                                                                            akan
                                                                            diabaikan
                                                                            pada
                                                                            jenjang
                                                                            ini.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {formula.components.map(
                                                                    (
                                                                        component,
                                                                        cIndex,
                                                                    ) => {
                                                                        const masterCatError =
                                                                            formErrors[
                                                                                `formulas.${fIndex}.components.${cIndex}.master_category_id`
                                                                            ];
                                                                        const weightError =
                                                                            formErrors[
                                                                                `formulas.${fIndex}.components.${cIndex}.weight_multiplier`
                                                                            ];

                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    cIndex
                                                                                }
                                                                                className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-border/50 bg-muted/10 p-3 sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,1fr)_110px_auto] lg:items-end"
                                                                            >
                                                                                {/* KATEGORI PENILAIAN */}
                                                                                <div className="flex flex-col gap-1.5">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <Label className="text-xs font-semibold text-muted-foreground">
                                                                                            Sumber
                                                                                            Nilai
                                                                                            (Kategori)
                                                                                        </Label>
                                                                                        {renderErrorBadge(
                                                                                            masterCatError,
                                                                                        )}
                                                                                    </div>
                                                                                    <Select
                                                                                        value={
                                                                                            component.master_category_id
                                                                                        }
                                                                                        onValueChange={(
                                                                                            value,
                                                                                        ) =>
                                                                                            updateComponent(
                                                                                                fIndex,
                                                                                                cIndex,
                                                                                                'master_category_id',
                                                                                                value,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger
                                                                                            id={`formulas.${fIndex}.components.${cIndex}.master_category_id`}
                                                                                            className={`h-10 w-full bg-background sm:h-9 ${
                                                                                                masterCatError
                                                                                                    ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                                                                    : ''
                                                                                            }`}
                                                                                        >
                                                                                            <SelectValue placeholder="Pilih sumber penilaian..." />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {scoringCategories.map(
                                                                                                (
                                                                                                    category,
                                                                                                ) => {
                                                                                                    const id =
                                                                                                        String(
                                                                                                            category.master_category_id,
                                                                                                        );
                                                                                                    const isAlreadySelected =
                                                                                                        selectedCategoryIds.includes(
                                                                                                            id,
                                                                                                        ) &&
                                                                                                        component.master_category_id !==
                                                                                                            id;

                                                                                                    return (
                                                                                                        <SelectItem
                                                                                                            key={
                                                                                                                category.master_category_id
                                                                                                            }
                                                                                                            value={
                                                                                                                id
                                                                                                            }
                                                                                                            disabled={
                                                                                                                isAlreadySelected
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                category
                                                                                                                    .master_category
                                                                                                                    ?.category_name
                                                                                                            }
                                                                                                        </SelectItem>
                                                                                                    );
                                                                                                },
                                                                                            )}
                                                                                        </SelectContent>
                                                                                    </Select>

                                                                                    {duplicate &&
                                                                                        component.master_category_id !==
                                                                                            '' &&
                                                                                        selectedCategoryIds.filter(
                                                                                            (
                                                                                                id,
                                                                                            ) =>
                                                                                                id ===
                                                                                                component.master_category_id,
                                                                                        )
                                                                                            .length >
                                                                                            1 && (
                                                                                            <p className="text-xs text-destructive">
                                                                                                Kategori
                                                                                                ini
                                                                                                terduplikasi
                                                                                            </p>
                                                                                        )}
                                                                                    <InputError
                                                                                        message={
                                                                                            masterCatError
                                                                                        }
                                                                                    />
                                                                                </div>

                                                                                {/* BOBOT / PENGALI (PERSEN) */}
                                                                                <div className="flex flex-col gap-1.5">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <Label className="text-xs font-semibold text-muted-foreground">
                                                                                            Bobot
                                                                                            (%)
                                                                                        </Label>
                                                                                        {renderErrorBadge(
                                                                                            weightError,
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="relative flex items-center">
                                                                                        <Input
                                                                                            id={`formulas.${fIndex}.components.${cIndex}.weight_multiplier`}
                                                                                            type="number"
                                                                                            min="0.01"
                                                                                            step="any"
                                                                                            onWheel={(
                                                                                                e,
                                                                                            ) =>
                                                                                                e.currentTarget.blur()
                                                                                            }
                                                                                            value={
                                                                                                component.weight_value
                                                                                            }
                                                                                            onChange={(
                                                                                                e,
                                                                                            ) =>
                                                                                                updateComponent(
                                                                                                    fIndex,
                                                                                                    cIndex,
                                                                                                    'weight_value',
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                )
                                                                                            }
                                                                                            className={`h-10 w-full min-w-0 bg-background pr-7 text-center sm:h-9 ${
                                                                                                weightError
                                                                                                    ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                                                                    : ''
                                                                                            }`}
                                                                                            placeholder="100"
                                                                                        />
                                                                                        <span className="pointer-events-none absolute right-2.5 text-xs font-bold text-muted-foreground">
                                                                                            %
                                                                                        </span>
                                                                                    </div>
                                                                                    <InputError
                                                                                        message={
                                                                                            weightError
                                                                                        }
                                                                                    />
                                                                                </div>

                                                                                {/* HAPUS KOMPONEN */}
                                                                                <div className="flex pt-1 sm:h-14.5 sm:items-end sm:pt-0 sm:pb-px">
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        aria-label="Hapus komponen"
                                                                                        className="flex h-10 w-full items-center justify-center border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground lg:h-9 lg:w-9 lg:border-transparent lg:bg-transparent lg:px-0 lg:hover:bg-destructive/10 lg:hover:text-destructive"
                                                                                        onClick={() =>
                                                                                            removeComponent(
                                                                                                fIndex,
                                                                                                cIndex,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Trash2 className="mr-2 h-4 w-4 sm:mr-0" />
                                                                                        <span className="font-semibold sm:hidden">
                                                                                            Hapus
                                                                                            Komponen
                                                                                        </span>
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                                {hasComponents &&
                                                                    !complete && (
                                                                        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm">
                                                                            <p className="text-xs font-medium text-destructive">
                                                                                *
                                                                                Lengkapi
                                                                                kategori
                                                                                dan
                                                                                nilai
                                                                                pada
                                                                                semua
                                                                                baris
                                                                                komponen.
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full border-dashed py-5 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary sm:w-auto"
                                                                    onClick={() =>
                                                                        addComponent(
                                                                            fIndex,
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus className="mr-1.5 h-4 w-4" />
                                                                    Tambah
                                                                    Komponen
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* BLANK STATE EVENT LEVELS KOSONG */
                        <Card className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center shadow-none sm:p-12">
                            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                                <Layers className="h-8 w-8" />
                            </div>
                            <h3 className="mb-1.5 text-base font-bold text-foreground sm:text-lg">
                                Belum Ada Jenjang Perlombaan
                            </h3>
                            <p className="max-w-md text-xs text-muted-foreground sm:text-sm">
                                Event ini belum memiliki jenjang perlombaan
                                terdaftar. Tambahkan jenjang perlombaan terlebih
                                dahulu untuk menyusun formula bobot piala/juara.
                            </p>
                            {isCommittee && (
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/levels`}
                                    className="mt-5"
                                >
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" /> Kelola
                                        Jenjang Perlombaan
                                    </Button>
                                </Link>
                            )}
                        </Card>
                    )}

                    {/* ACTION FOOTER (STICKY) */}
                    {activeLevel &&
                        championCategories.length > 0 &&
                        isCommittee && (
                            <div className="sticky bottom-2 z-20 flex flex-col-reverse gap-2 rounded-xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:bottom-4 sm:flex-row sm:justify-end sm:gap-3 sm:p-4">
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/information`}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-border/60 sm:w-auto sm:px-6"
                                        size="lg"
                                    >
                                        Batal
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!canSubmit}
                                    className="w-full gap-2 font-semibold shadow-md sm:w-auto sm:px-8"
                                >
                                    {processing ? (
                                        <Spinner className="h-4 w-4" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Simpan Formula
                                </Button>
                            </div>
                        )}
                </form>
            </div>
        </InnerAppLayout>
    );
}
