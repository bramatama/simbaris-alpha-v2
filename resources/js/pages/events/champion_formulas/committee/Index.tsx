import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { PageProps } from '@inertiajs/core';

import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
    Percent,
    AlertCircle,
    CheckCircle2,
    Layers,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

type CalculationMethod = 'percentage' | 'accumulation';

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
    calculation_method?: CalculationMethod | null;
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
    event_champion_category_id: number;
    event_level_id: number;
    master_category_id?: number;
    scoring_category_id?: number; // Fallback untuk transisi DB lama
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
    calculation_method: CalculationMethod;
    components: FormulaComponent[];
}

interface FormulaFormData {
    event_level_ids: number[];
    formulas: Formula[];
}

interface TrophyFormulaBuilderProps {
    event: SimbarisEvent;
    eventLevels?: EventLevel[];
    championCategories?: ChampionCategory[];
    scoringCategories?: ScoringCategory[];
    existingFormulas?: ExistingFormulasData;
}

/* =========================================================
   HELPERS
========================================================= */

const getFormulaRows = (
    formulas: ExistingFormulasData,
): ExistingFormulaRow[] => {
    if (Array.isArray(formulas)) return formulas;
    return Object.values(formulas).flat();
};

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

const formatNumber = (value: number): string => {
    return Number(value.toFixed(4)).toString();
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TrophyFormulaBuilder({
    event,
    eventLevels = [],
    championCategories = [],
    scoringCategories = [],
    existingFormulas = {},
}: TrophyFormulaBuilderProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    /* =====================================================
       INITIAL DATA STATE
    ===================================================== */

    const initialFormulas: Formula[] = championCategories.map((item) => {
        const existingRows = getCategoryRows(
            existingFormulas,
            item.event_champion_category_id,
        );

        const method: CalculationMethod =
            item.calculation_method === 'accumulation'
                ? 'accumulation'
                : 'percentage';

        return {
            event_champion_category_id: item.event_champion_category_id,
            champion_category_name:
                item.champion_category.champion_category_name,
            calculation_method: method,
            components: existingRows.map((row) => {
                const matchedScoringCategory = scoringCategories.find(
                    (c) => c.scoring_category_id === row.scoring_category_id,
                );

                const masterCategoryId =
                    row.master_category_id ??
                    matchedScoringCategory?.master_category_id;

                const multiplier = Number(row.weight_multiplier);

                return {
                    master_category_id:
                        masterCategoryId !== undefined
                            ? String(masterCategoryId)
                            : '',
                    weight_value: formatNumber(
                        multiplier * (method === 'percentage' ? 100 : 1),
                    ),
                };
            }),
        };
    });

    const allExistingRows = getFormulaRows(existingFormulas);
    const initialLevelIds = [
        ...new Set(allExistingRows.map((row) => Number(row.event_level_id))),
    ];

    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm<FormulaFormData>({
            event_level_ids: initialLevelIds,
            formulas: initialFormulas,
        });

    const formErrors = errors as Record<string, string | undefined>;

    /* =====================================================
       HANDLERS
    ===================================================== */

    const handleLevelToggle = (levelId: number, checked: boolean): void => {
        const nextLevelIds = checked
            ? [...new Set([...data.event_level_ids, levelId])]
            : data.event_level_ids.filter((id) => id !== levelId);

        setData('event_level_ids', nextLevelIds);
        clearErrors('event_level_ids');
    };

    const addComponent = (formulaIndex: number): void => {
        const updatedFormulas = data.formulas.map((formula, index) =>
            index === formulaIndex
                ? {
                      ...formula,
                      components: [
                          ...formula.components,
                          {
                              master_category_id: '',
                              weight_value: '',
                          },
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

    const updateCalculationMethod = (
        formulaIndex: number,
        method: CalculationMethod,
    ): void => {
        const updatedFormulas = data.formulas.map((formula, index) => {
            if (
                index !== formulaIndex ||
                formula.calculation_method === method
            ) {
                return formula;
            }

            return {
                ...formula,
                calculation_method: method,
                components: formula.components.map((component) => {
                    const currentValue = Number(component.weight_value);
                    if (
                        component.weight_value.trim() === '' ||
                        !Number.isFinite(currentValue)
                    ) {
                        return component;
                    }
                    const convertedValue =
                        method === 'percentage'
                            ? currentValue * 100
                            : currentValue / 100;
                    return {
                        ...component,
                        weight_value: formatNumber(convertedValue),
                    };
                }),
            };
        });
        setData('formulas', updatedFormulas);
    };

    /* =====================================================
       VALIDATION LOGIC
    ===================================================== */

    const getTotalWeight = (components: FormulaComponent[]): number => {
        return Number(
            components
                .reduce(
                    (sum, component) =>
                        sum + (Number(component.weight_value) || 0),
                    0,
                )
                .toFixed(2),
        );
    };

    const isPercentageTotalValid = (formula: Formula): boolean => {
        return (
            formula.calculation_method !== 'percentage' ||
            Math.abs(getTotalWeight(formula.components) - 100) < 0.001
        );
    };

    const isFormulaComplete = (formula: Formula): boolean => {
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

    const canSubmit =
        !processing &&
        data.event_level_ids.length > 0 &&
        data.formulas.every(
            (formula) =>
                isFormulaComplete(formula) &&
                !hasDuplicateCategories(formula) &&
                isPercentageTotalValid(formula),
        );

    /* =====================================================
       SUBMIT PAYLOAD TRANSFORMATION
    ===================================================== */

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!canSubmit) return;

        transform((currentData) => ({
            event_level_ids: currentData.event_level_ids,
            formulas: currentData.formulas
                .filter((formula) => formula.components.length > 0)
                .map((formula) => ({
                    event_champion_category_id:
                        formula.event_champion_category_id,
                    calculation_method: formula.calculation_method,
                    components: formula.components.map((component) => ({
                        master_category_id: Number(
                            component.master_category_id,
                        ),
                        weight_multiplier:
                            Number(component.weight_value) /
                            (formula.calculation_method === 'percentage'
                                ? 100
                                : 1),
                    })),
                })),
        }));

        post(`/${userRole}/events/${event.public_id}/formulas`, {
            preserveScroll: true,
        });
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Perumusan Bobot Piala - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
                    <Link
                        href={`/${userRole}/events/${event.public_id}/information`}
                        className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Kembali ke Dasbor
                    </Link>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Perumusan Bobot Piala
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        Atur metode dan persentase perhitungan nilai akhir untuk
                        setiap kategori juara. Formula dapat diterapkan ke
                        beberapa jenjang sekaligus secara massal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: PILIH JENJANG */}
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/10 p-5">
                            <CardTitle className="text-base">
                                1. Terapkan Pada Jenjang
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                {eventLevels.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                        Belum ada jenjang pada event ini.
                                    </p>
                                ) : (
                                    eventLevels.map((level) => (
                                        <div
                                            key={level.event_level_id}
                                            className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/20 px-4 py-2"
                                        >
                                            <Checkbox
                                                id={`level-${level.event_level_id}`}
                                                checked={data.event_level_ids.includes(
                                                    level.event_level_id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleLevelToggle(
                                                        level.event_level_id,
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`level-${level.event_level_id}`}
                                                className="cursor-pointer font-medium"
                                            >
                                                {level.level.level_name}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <InputError
                                message={errors.event_level_ids}
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>

                    {/* SECTION 2: FORMULA */}
                    <div className="space-y-4 pt-2">
                        <h2 className="text-lg font-bold">
                            2. Formula Per Kategori Juara
                        </h2>

                        {championCategories.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                                Belum ada kategori juara. Silakan atur
                                penghargaan terlebih dahulu.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {data.formulas.map((formula, fIndex) => {
                                    const total = getTotalWeight(
                                        formula.components,
                                    );
                                    const isPercentage =
                                        formula.calculation_method ===
                                        'percentage';
                                    const hasComponents =
                                        formula.components.length > 0;
                                    const validTotal =
                                        isPercentageTotalValid(formula);
                                    const complete = isFormulaComplete(formula);
                                    const duplicate =
                                        hasDuplicateCategories(formula);

                                    // Kumpulkan ID kategori yang sudah dipilih untuk filter Dropdown
                                    const selectedCategoryIds =
                                        formula.components
                                            .map((c) => c.master_category_id)
                                            .filter(Boolean);

                                    return (
                                        <Card
                                            key={
                                                formula.event_champion_category_id
                                            }
                                            className="overflow-hidden border-border/70 shadow-sm transition-colors hover:border-primary/40"
                                        >
                                            <CardHeader className="gap-3 border-b border-border/50 bg-muted/10 p-4 sm:p-5">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Calculator className="h-5 w-5 shrink-0 text-primary" />
                                                        <CardTitle className="text-base">
                                                            {
                                                                formula.champion_category_name
                                                            }
                                                        </CardTitle>
                                                    </div>

                                                    {hasComponents && (
                                                        <Badge
                                                            variant={
                                                                validTotal
                                                                    ? 'default'
                                                                    : 'destructive'
                                                            }
                                                            className={
                                                                validTotal &&
                                                                isPercentage
                                                                    ? 'w-fit gap-1.5 bg-emerald-600 hover:bg-emerald-700'
                                                                    : 'w-fit gap-1.5'
                                                            }
                                                        >
                                                            {validTotal ? (
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                            )}
                                                            {isPercentage
                                                                ? `Total: ${total}%`
                                                                : `${formula.components.length} komponen`}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="grid gap-2 sm:max-w-sm">
                                                    <Label>
                                                        Metode Perhitungan
                                                    </Label>
                                                    <Select
                                                        value={
                                                            formula.calculation_method
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateCalculationMethod(
                                                                fIndex,
                                                                value as CalculationMethod,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full bg-background">
                                                            <SelectValue placeholder="Pilih metode" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">
                                                                Persentase
                                                            </SelectItem>
                                                            <SelectItem value="accumulation">
                                                                Akumulasi
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-muted-foreground">
                                                        {isPercentage
                                                            ? 'Setiap komponen memiliki bobot persentase. Totalnya harus 100%.'
                                                            : 'Setiap nilai dikalikan pengalinya, kemudian seluruh hasil dijumlahkan.'}
                                                    </p>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 p-4 sm:p-5">
                                                {formula.components.map(
                                                    (component, cIndex) => (
                                                        <div
                                                            key={cIndex}
                                                            className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/10 p-3 sm:flex-row sm:items-end"
                                                        >
                                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                                <Label className="text-xs text-muted-foreground">
                                                                    Sumber Nilai
                                                                    (Kategori)
                                                                </Label>
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
                                                                    <SelectTrigger className="w-full bg-background">
                                                                        <SelectValue placeholder="Pilih kategori penilaian..." />
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

                                                                                // Nonaktifkan opsi jika sudah dipilih di komponen lain pada formula ini
                                                                                const isAlreadySelected =
                                                                                    selectedCategoryIds.includes(
                                                                                        id,
                                                                                    ) &&
                                                                                    component.master_category_id !==
                                                                                        id;

                                                                                return (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            category.scoring_category_id
                                                                                        }
                                                                                        value={
                                                                                            id
                                                                                        }
                                                                                        disabled={
                                                                                            isAlreadySelected
                                                                                        }
                                                                                    >
                                                                                        {category
                                                                                            .master_category
                                                                                            ?.category_name ??
                                                                                            `Kategori ID: ${id}`}
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
                                                                        (id) =>
                                                                            id ===
                                                                            component.master_category_id,
                                                                    ).length >
                                                                        1 && (
                                                                        <p className="text-xs text-destructive">
                                                                            Kategori
                                                                            ini
                                                                            terduplikasi.
                                                                        </p>
                                                                    )}

                                                                <InputError
                                                                    message={
                                                                        formErrors[
                                                                            `formulas.${fIndex}.components.${cIndex}.master_category_id`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="w-full space-y-1.5 sm:w-36 sm:shrink-0">
                                                                <Label className="text-xs text-muted-foreground">
                                                                    {isPercentage
                                                                        ? 'Bobot (%)'
                                                                        : 'Pengali Nilai'}
                                                                </Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="number"
                                                                        min={
                                                                            isPercentage
                                                                                ? '1'
                                                                                : '0.01'
                                                                        }
                                                                        max={
                                                                            isPercentage
                                                                                ? '100'
                                                                                : undefined
                                                                        }
                                                                        step="0.01"
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
                                                                        className={
                                                                            isPercentage
                                                                                ? 'bg-background pr-8'
                                                                                : 'bg-background'
                                                                        }
                                                                        placeholder={
                                                                            isPercentage
                                                                                ? 'Contoh: 40'
                                                                                : 'Contoh: 1.5'
                                                                        }
                                                                    />
                                                                    {isPercentage && (
                                                                        <Percent className="absolute top-2.5 right-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                                                                    )}
                                                                </div>
                                                                <InputError
                                                                    message={
                                                                        formErrors[
                                                                            `formulas.${fIndex}.components.${cIndex}.weight_multiplier`
                                                                        ]
                                                                    }
                                                                />
                                                            </div>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="Hapus komponen"
                                                                className="h-10 w-full shrink-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive sm:w-10"
                                                                onClick={() =>
                                                                    removeComponent(
                                                                        fIndex,
                                                                        cIndex,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ),
                                                )}

                                                {hasComponents && (
                                                    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm">
                                                        {isPercentage ? (
                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <span className="text-muted-foreground">
                                                                    Total bobot
                                                                    persentase
                                                                </span>
                                                                <span
                                                                    className={
                                                                        validTotal
                                                                            ? 'font-semibold text-emerald-600'
                                                                            : 'font-semibold text-destructive'
                                                                    }
                                                                >
                                                                    {total}%{' '}
                                                                    {' / '} 100%
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                                <Layers className="mt-0.5 h-4 w-4 shrink-0" />
                                                                <p>
                                                                    Total nilai
                                                                    akan
                                                                    dihitung
                                                                    dari
                                                                    penjumlahan
                                                                    setiap
                                                                    kategori
                                                                    setelah
                                                                    dikalikan
                                                                    dengan
                                                                    pengalinya.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {!complete && (
                                                            <p className="mt-2 text-xs text-destructive">
                                                                Lengkapi
                                                                kategori dan
                                                                nilai semua
                                                                komponen form di
                                                                atas.
                                                            </p>
                                                        )}
                                                        {isPercentage &&
                                                            !validTotal && (
                                                                <p className="mt-2 text-xs text-destructive">
                                                                    Total bobot
                                                                    harus tepat
                                                                    berjumlah
                                                                    100% agar
                                                                    dapat
                                                                    disimpan.
                                                                </p>
                                                            )}
                                                    </div>
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-dashed py-5 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary sm:w-auto"
                                                    onClick={() =>
                                                        addComponent(fIndex)
                                                    }
                                                >
                                                    <Plus className="mr-1.5 h-4 w-4" />
                                                    Tambah Komponen Nilai
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="sticky bottom-4 z-20 flex flex-col-reverse justify-end gap-3 rounded-xl border border-border/40 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:flex-row sm:p-4">
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="w-full sm:w-auto"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full px-6 sm:w-auto"
                            >
                                Batal
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={!canSubmit}
                            className="w-full gap-2 px-8 font-semibold shadow-md sm:w-auto"
                        >
                            {processing ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Simpan Formula Bobot
                        </Button>
                    </div>
                </form>
            </div>
        </InnerAppLayout>
    );
}
