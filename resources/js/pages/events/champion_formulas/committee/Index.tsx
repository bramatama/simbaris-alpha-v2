import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, type FormEvent } from 'react';
import type { PageProps } from '@inertiajs/core';

import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';

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
    Filter,
} from 'lucide-react';

/* =========================================================
   TYPES
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

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

export default function ChampionFormulaIndex({
    event,
    eventLevels = [],
    activeLevel = null,
    championCategories = [],
    scoringCategories = [],
    existingFormulas = {},
}: IndexProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const isCommittee = ['committee', 'admin'].includes(userRole);

    /* =====================================================
       INITIAL DATA STATE
    ===================================================== */
    const { data, setData, post, processing, errors, transform } =
        useForm<FormulaFormData>({
            event_level_id: activeLevel?.event_level_id || null,
            formulas: [], // Akan langsung diisi oleh useEffect di bawah
        });

    const formErrors = errors as Record<string, string | undefined>;

    // Sinkronisasi data ketika props berubah (saat pindah jenjang atau setelah berhasil simpan)
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
                    components: existingRows.map((row) => ({
                        master_category_id:
                            row.master_category_id !== undefined
                                ? String(row.master_category_id)
                                : '',
                        weight_value: Number(row.weight_multiplier).toString(),
                    })),
                };
            }),
        });
    }, [activeLevel, existingFormulas, championCategories]);

    /* =====================================================
       HANDLERS
    ===================================================== */
    const handleLevelChange = (levelId: number) => {
        router.get(
            `/${userRole}/events/${event.public_id}/formulas`,
            { level_id: levelId },
            // UBAH: preserveState menjadi false agar state form lama dibuang saat ganti jenjang
            { preserveState: false, preserveScroll: true, replace: true },
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

    /* =====================================================
       VALIDATION LOGIC
    ===================================================== */
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

    const canSubmit =
        !processing &&
        data.event_level_id !== null &&
        data.formulas.every(
            (formula) =>
                isFormulaComplete(formula) && !hasDuplicateCategories(formula),
        );

    /* =====================================================
       SUBMIT PAYLOAD
    ===================================================== */
    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!canSubmit) return;

        transform((currentData) => ({
            event_level_id: currentData.event_level_id,
            formulas: currentData.formulas.map((formula) => ({
                event_champion_category_id: formula.event_champion_category_id,
                components: formula.components.map((component) => ({
                    master_category_id: Number(component.master_category_id),
                    weight_multiplier: Number(component.weight_value),
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
            <Head title={`Formula Bobot - ${event.event_name}`} />
            <div className="grid w-full min-w-0 grid-cols-1">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-5xl space-y-6 p-4 pb-28 md:p-6 lg:p-8"
                >
                    {/* HEADER & FILTER */}
                    <div className="mb-6 flex flex-col justify-between gap-5 border-b border-border/50 pb-6 md:flex-row md:items-start">
                        <div>
                            <Link
                                href={`/${userRole}/events/${event.public_id}/information`}
                                className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
                                ke Dasbor
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Formula Bobot Piala
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground md:text-base">
                                Pilih jenjang yang dituju, lalu atur pengali
                                nilai piala yang diinginkan. Anda dapat
                                mengosongkan komponen jika piala tidak
                                dipertandingkan.
                            </p>
                        </div>

                        {/* FILTER JENJANG CONTAINER */}
                        <div className="flex w-full shrink-0 items-center md:mt-0 md:w-auto">
                            {eventLevels.length > 0 && (
                                <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 p-1.5 sm:w-auto">
                                    <Filter className="mr-2 h-4 w-4 shrink-0 text-muted-foreground md:mr-0 md:ml-1" />
                                    <Select
                                        value={
                                            activeLevel?.event_level_id?.toString() ||
                                            ''
                                        }
                                        onValueChange={(val) =>
                                            handleLevelChange(Number(val))
                                        }
                                    >
                                        <SelectTrigger className="w-full border-none bg-background shadow-sm sm:w-45">
                                            <SelectValue placeholder="Pilih jenjang..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventLevels.map((level: any) => (
                                                <SelectItem
                                                    key={level.event_level_id}
                                                    value={level.event_level_id.toString()}
                                                >
                                                    {level.level.level_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KONTEN UTAMA */}
                    {eventLevels.length > 0 ? (
                        <div className="space-y-5">
                            {activeLevel && (
                                <div className="animate-in space-y-4 duration-300 fade-in">
                                    <div className="flex min-w-0 items-start gap-2 sm:items-center">
                                        <LayoutList className="h-4 w-4 shrink-0 text-primary" />
                                        <h2 className="text-sm font-bold sm:text-base">
                                            Konfigurasi Jenjang (
                                            {activeLevel.level.level_name})
                                        </h2>
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
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                                                            className="overflow-hidden border-border/70 shadow-sm transition-colors hover:border-primary/40"
                                                        >
                                                            <CardHeader className="border-b border-border/50 bg-muted/10 p-4 sm:p-5">
                                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div className="flex items-start gap-2 sm:items-center">
                                                                        <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />
                                                                        <CardTitle className="text-base leading-tight font-bold">
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

                                                            <CardContent className="space-y-4 p-4 sm:p-5">
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
                                                                            ini
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {formula.components.map(
                                                                    (
                                                                        component,
                                                                        cIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                cIndex
                                                                            }
                                                                            className="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/10 p-3.5 sm:grid sm:grid-cols-[1fr_140px_auto] sm:items-start sm:gap-4 sm:p-4"
                                                                        >
                                                                            {/* KATEGORI PENILAIAN */}
                                                                            <div className="flex flex-col gap-1.5">
                                                                                <Label className="text-xs font-semibold text-muted-foreground">
                                                                                    Sumber
                                                                                    Nilai
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
                                                                                    <SelectTrigger className="h-10 w-full bg-background sm:h-9">
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
                                                                                        formErrors[
                                                                                            `formulas.${fIndex}.components.${cIndex}.master_category_id`
                                                                                        ]
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            {/* BOBOT / PENGALI */}
                                                                            <div className="flex flex-col gap-1.5">
                                                                                <Label className="text-xs font-semibold text-muted-foreground">
                                                                                    Bobot
                                                                                    /
                                                                                    Pengali
                                                                                </Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0.01"
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
                                                                                    className="h-10 bg-background sm:h-9"
                                                                                    placeholder="Contoh: 1.5"
                                                                                />
                                                                                <InputError
                                                                                    message={
                                                                                        formErrors[
                                                                                            `formulas.${fIndex}.components.${cIndex}.weight_multiplier`
                                                                                        ]
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
                                                                                    className="flex h-10 w-full items-center justify-center border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground sm:h-9 sm:w-9 sm:border-transparent sm:bg-transparent sm:px-0 sm:hover:bg-destructive/10 sm:hover:text-destructive"
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
                                                                    ),
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
                        <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                            Event ini belum memiliki jenjang perlombaan sama
                            sekali.
                        </div>
                    )}

                    {/* ACTION FOOTER (STICKY) */}
                    {activeLevel &&
                        championCategories.length > 0 &&
                        isCommittee && (
                            <div className="sticky bottom-6 z-20 flex justify-end gap-4 rounded-xl border border-border/40 bg-background/90 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md">
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/information`}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-border/60 px-6 hover:bg-muted/50"
                                        size={'lg'}
                                    >
                                        Batal
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!canSubmit}
                                    className="gap-2 px-8 font-semibold shadow-md"
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
