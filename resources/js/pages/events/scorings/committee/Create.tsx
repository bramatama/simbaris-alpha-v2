import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    LayoutList,
    Columns3,
    CheckSquare,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    TouchSensor,
    MouseSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

// Import Komponen Reusable
import {
    GlobalRubric,
    UICriteria,
    ScoreItem,
    SortableRubricBadge,
    SortableCriteriaRow,
} from '@/components/form-builder/sortable-scoring-components';

export default function DynamicScoringBuilderCreate({
    event,
    eventLevels,
    masterCategories,
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm({
            master_category_id: '',
            event_level_ids: [] as number[],
            criteria: [] as any[],
        });

    const [globalRubrics, setGlobalRubrics] = useState<GlobalRubric[]>([]);
    const [uiCriteria, setUiCriteria] = useState<UICriteria[]>([]);
    const [newRubricName, setNewRubricName] = useState('');
    const [newRubricCount, setNewRubricCount] = useState<number | ''>('');
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const selectedMasterCategory = masterCategories?.find(
        (mc: any) =>
            mc.master_category_id.toString() === data.master_category_id,
    );
    const availableMasterCriteria =
        selectedMasterCategory?.master_assessment_criteria || [];

    const isLevelDisabled = (level: any) => {
        if (!data.master_category_id) return true;
        const existingCategories =
            level.scoring_categories || level.scoringCategories || [];
        return existingCategories.some(
            (sc: any) =>
                sc.master_category_id.toString() ===
                data.master_category_id.toString(),
        );
    };

    const handleLevelToggle = (levelId: number, checked: boolean) => {
        if (checked)
            setData('event_level_ids', [...data.event_level_ids, levelId]);
        else
            setData(
                'event_level_ids',
                data.event_level_ids.filter((id) => id !== levelId),
            );
        clearErrors('event_level_ids');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const activeData = active.data.current;
        const overData = over.data.current;
        if (!activeData || !overData) return;

        if (activeData.type === 'rubric' && overData.type === 'rubric') {
            setGlobalRubrics((items) =>
                arrayMove(
                    items,
                    items.findIndex((i) => i.id === active.id),
                    items.findIndex((i) => i.id === over.id),
                ),
            );
        } else if (
            activeData.type === 'criteria' &&
            overData.type === 'criteria'
        ) {
            setUiCriteria((items) =>
                arrayMove(
                    items,
                    items.findIndex((i) => i.id === active.id),
                    items.findIndex((i) => i.id === over.id),
                ),
            );
        } else if (activeData.type === 'score' && overData.type === 'score') {
            if (
                activeData.critId === overData.critId &&
                activeData.rubricId === overData.rubricId
            ) {
                setUiCriteria((prev) =>
                    prev.map((c) => {
                        if (c.id !== activeData.critId) return c;
                        const scores = [...c.rubricData[activeData.rubricId]];
                        return {
                            ...c,
                            rubricData: {
                                ...c.rubricData,
                                [activeData.rubricId]: arrayMove(
                                    scores,
                                    scores.findIndex((s) => s.id === active.id),
                                    scores.findIndex((s) => s.id === over.id),
                                ),
                            },
                        };
                    }),
                );
            }
        }
    };

    const addGlobalRubric = () => {
        if (!newRubricName.trim() || !newRubricCount) return;
        setGlobalRubrics([
            ...globalRubrics,
            {
                id: Math.random().toString(36).substring(7),
                name: newRubricName,
                expected_count: Number(newRubricCount),
            },
        ]);
        setNewRubricName('');
        setNewRubricCount('');
    };
    const removeGlobalRubric = (id: string) =>
        setGlobalRubrics((prev) => prev.filter((gr) => gr.id !== id));

    const addCriteriaRow = () =>
        setUiCriteria([
            ...uiCriteria,
            {
                id: Math.random().toString(36).substring(7),
                name: '',
                rubricData: {},
            },
        ]);
    const removeCriteriaRow = (id: string) =>
        setUiCriteria((prev) => prev.filter((c) => c.id !== id));
    const updateCriteriaName = (id: string, name: string) =>
        setUiCriteria((prev) =>
            prev.map((c) => (c.id === id ? { ...c, name } : c)),
        );

    const duplicateCriteria = (cIndex: number) => {
        setUiCriteria((prev) => {
            const critToCopy = prev[cIndex];
            const newRubricData: Record<string, ScoreItem[]> = {};
            Object.keys(critToCopy.rubricData).forEach((rId) => {
                newRubricData[rId] = critToCopy.rubricData[rId].map((s) => ({
                    id: Math.random().toString(36).substring(7),
                    value: s.value,
                }));
            });
            const newCrit: UICriteria = {
                id: Math.random().toString(36).substring(7),
                name: `${critToCopy.name} (Copy)`,
                rubricData: newRubricData,
            };
            const newArray = [...prev];
            newArray.splice(cIndex + 1, 0, newCrit);
            return newArray;
        });
    };

    const addScore = (critId: string, rubricId: string) =>
        setUiCriteria((prev) =>
            prev.map((c) =>
                c.id === critId
                    ? {
                          ...c,
                          rubricData: {
                              ...c.rubricData,
                              [rubricId]: [
                                  ...(c.rubricData[rubricId] || []),
                                  {
                                      id: Math.random()
                                          .toString(36)
                                          .substring(7),
                                      value: '',
                                  },
                              ],
                          },
                      }
                    : c,
            ),
        );
    const removeScore = (critId: string, rubricId: string, scoreId: string) =>
        setUiCriteria((prev) =>
            prev.map((c) =>
                c.id === critId
                    ? {
                          ...c,
                          rubricData: {
                              ...c.rubricData,
                              [rubricId]: (c.rubricData[rubricId] || []).filter(
                                  (s) => s.id !== scoreId,
                              ),
                          },
                      }
                    : c,
            ),
        );
    const updateScoreValue = (
        critId: string,
        rubricId: string,
        scoreId: string,
        value: string,
    ) =>
        setUiCriteria((prev) =>
            prev.map((c) =>
                c.id === critId
                    ? {
                          ...c,
                          rubricData: {
                              ...c.rubricData,
                              [rubricId]: (c.rubricData[rubricId] || []).map(
                                  (s) =>
                                      s.id === scoreId ? { ...s, value } : s,
                              ),
                          },
                      }
                    : c,
            ),
        );

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;
        const newLocalErrors: Record<string, string> = {};

        if (globalRubrics.length === 0) {
            newLocalErrors['global'] = 'Buat minimal 1 kolom kategori.';
            hasError = true;
        }
        if (uiCriteria.length === 0) {
            newLocalErrors['global'] =
                'Tambahkan minimal 1 baris komponen gerakan.';
            hasError = true;
        }

        uiCriteria.forEach((crit) => {
            if (!crit.name.trim()) {
                newLocalErrors[`crit_${crit.id}`] =
                    'Nama komponen penilaian wajib diisi.';
                hasError = true;
            }
            globalRubrics.forEach((gr) => {
                const count = (crit.rubricData[gr.id] || []).length;
                if (count !== gr.expected_count) {
                    newLocalErrors[`crit_${crit.id}`] =
                        'Terdapat jumlah opsi nilai yang tidak sesuai dengan ketentuan kolom kategori.';
                    hasError = true;
                }
            });
        });

        if (hasError) {
            setLocalErrors(newLocalErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        transform((currentData) => ({
            ...currentData,
            criteria: uiCriteria.map((crit, cIdx) => ({
                master_criteria_id: Number(crit.name),
                order_index: cIdx + 1,
                rubrics: globalRubrics.map((gr, rIdx) => ({
                    category_label: gr.name,
                    category_order: rIdx + 1,
                    scores: (crit.rubricData[gr.id] || []).map((s, sIdx) => ({
                        score_value: s.value,
                        display_order: sIdx + 1,
                    })),
                })),
            })),
        }));
        post(`/${userRole}/events/${event.public_id}/scoring-categories`, {
            preserveScroll: true,
        });
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Buat Form Penilaian - ${event.event_name}`} />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 bg-muted/5 p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Link
                                href={`/${userRole}/events/${event.public_id}/scoring-categories`}
                                className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Batal &
                                Kembali
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Dynamic Form Builder
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Rancang form penilaian tabular persis seperti
                                LJK juri.
                            </p>
                        </div>
                    </div>

                    {localErrors['global'] && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive shadow-sm">
                            {localErrors['global']}
                        </div>
                    )}
                    {errors.criteria && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive shadow-sm">
                            Validasi Server: Terdapat kelengkapan data yang
                            gagal disimpan.
                        </div>
                    )}

                    <form onSubmit={handleCustomSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                            <Card className="flex h-full flex-col overflow-hidden border-t-4 border-t-primary shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10 p-5">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <LayoutList className="h-5 w-5 text-primary" />{' '}
                                        Pengaturan Kategori Induk
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col space-y-5 p-5">
                                    <div className="space-y-2">
                                        <Label
                                            requirement="required"
                                            className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            Kategori Induk
                                        </Label>
                                        <Select
                                            value={data.master_category_id}
                                            onValueChange={(val) => {
                                                setData({
                                                    ...data,
                                                    master_category_id: val,
                                                    event_level_ids: [],
                                                });
                                                clearErrors(
                                                    'master_category_id',
                                                );
                                            }}
                                            required
                                        >
                                            <SelectTrigger className="h-10 bg-background">
                                                <SelectValue placeholder="-- Pilih Master Kategori --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterCategories.map(
                                                    (mc: any) => (
                                                        <SelectItem
                                                            key={
                                                                mc.master_category_id
                                                            }
                                                            value={mc.master_category_id.toString()}
                                                        >
                                                            {mc.category_name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.master_category_id}
                                            className="mt-1 text-[10px]"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label
                                            requirement="required"
                                            className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            Terapkan Pada Jenjang
                                        </Label>
                                        <div className="flex h-[calc(100%-1.5rem)] flex-wrap content-start items-start gap-4 rounded-lg border border-border bg-background p-4 shadow-inner">
                                            {!data.master_category_id && (
                                                <p className="w-full py-2 text-center text-xs text-muted-foreground italic">
                                                    Pilih kategori induk
                                                    terlebih dahulu.
                                                </p>
                                            )}
                                            {eventLevels.map((level: any) => {
                                                const disabled =
                                                    isLevelDisabled(level);
                                                return (
                                                    <div
                                                        key={
                                                            level.event_level_id
                                                        }
                                                        className="flex items-center space-x-2 rounded-full border border-border/50 bg-muted/20 px-3 py-1.5"
                                                    >
                                                        <Checkbox
                                                            id={`level-${level.event_level_id}`}
                                                            disabled={disabled}
                                                            checked={data.event_level_ids.includes(
                                                                level.event_level_id,
                                                            )}
                                                            onCheckedChange={(
                                                                c,
                                                            ) =>
                                                                handleLevelToggle(
                                                                    level.event_level_id,
                                                                    c as boolean,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`level-${level.event_level_id}`}
                                                            className={`cursor-pointer pt-0.5 text-sm font-medium ${disabled ? 'text-muted-foreground opacity-50' : ''}`}
                                                        >
                                                            {
                                                                level.level
                                                                    .level_name
                                                            }
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError
                                            message={errors.event_level_ids}
                                            className="mt-1 text-[10px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex h-full flex-col overflow-hidden border-t-4 border-t-emerald-500 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10 p-5">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Columns3 className="h-5 w-5 text-emerald-500" />{' '}
                                        Struktur Kolom Kategori
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-5 p-5">
                                    <div className="flex items-end gap-3 rounded-xl border border-border/70 p-4">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-xs font-bold text-muted-foreground">
                                                Nama Kolom
                                            </Label>
                                            <Input
                                                value={newRubricName}
                                                onChange={(e) =>
                                                    setNewRubricName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="+ Kategori..."
                                                className="h-9 bg-background focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="w-24 space-y-1.5">
                                            <Label className="text-xs font-bold text-muted-foreground">
                                                Jumlah Opsi
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                onWheel={(e) =>
                                                    e.currentTarget.blur()
                                                }
                                                value={newRubricCount}
                                                onChange={(e) =>
                                                    setNewRubricCount(
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : '',
                                                    )
                                                }
                                                placeholder="Misal: 3"
                                                className="h-9 bg-background text-center focus-visible:ring-emerald-500"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addGlobalRubric}
                                            variant="secondary"
                                            className="h-9 bg-success px-3 text-foreground hover:bg-success/60"
                                        >
                                            <Plus className="h-4 w-4 sm:mr-1" />{' '}
                                            <span className="hidden font-semibold sm:inline">
                                                Tambah
                                            </span>
                                        </Button>
                                    </div>
                                    <div className="flex min-h-12 flex-wrap items-center gap-2.5 pt-1">
                                        <SortableContext
                                            items={globalRubrics.map(
                                                (gr) => gr.id,
                                            )}
                                            strategy={
                                                horizontalListSortingStrategy
                                            }
                                        >
                                            {globalRubrics.map((gr) => (
                                                <SortableRubricBadge
                                                    key={gr.id}
                                                    rubric={gr}
                                                    onRemove={
                                                        removeGlobalRubric
                                                    }
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-5 pt-4">
                            <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-3 sm:flex-row sm:items-center">
                                <CardTitle className="flex items-center gap-2 text-base font-bold tracking-wider text-muted-foreground uppercase">
                                    Baris Komponen Materi Gerakan
                                </CardTitle>
                                <Button
                                    type="button"
                                    onClick={addCriteriaRow}
                                    variant="default"
                                    className="gap-2 rounded-md px-5 shadow-sm"
                                >
                                    <Plus className="h-4 w-4" /> Tambah Baris
                                    Baru
                                </Button>
                            </div>
                            <SortableContext
                                items={uiCriteria.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-6">
                                    {uiCriteria.map((crit, cIdx) => (
                                        <SortableCriteriaRow
                                            key={crit.id}
                                            crit={crit}
                                            index={cIdx}
                                            globalRubrics={globalRubrics}
                                            localErrors={localErrors}
                                            availableMasterCriteria={
                                                availableMasterCriteria
                                            }
                                            onUpdateName={updateCriteriaName}
                                            onDuplicate={duplicateCriteria}
                                            onRemove={removeCriteriaRow}
                                            onAddScore={addScore}
                                            onRemoveScore={removeScore}
                                            onUpdateScore={updateScoreValue}
                                        />
                                    ))}
                                    {uiCriteria.length === 0 && (
                                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/10 p-16">
                                            <CheckSquare className="mb-3 h-10 w-10 text-muted-foreground/30" />
                                            <p className="font-medium text-muted-foreground">
                                                Belum ada baris kriteria
                                                penilaian.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>

                        <div className="sticky bottom-6 z-20 flex justify-end gap-4 rounded-xl border border-border/40 bg-background/90 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md">
                            <Link
                                href={`/${userRole}/events/${event.public_id}/scoring-categories`}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-border/60 px-6 hover:bg-muted/50"
                                >
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="gap-2 px-8 font-semibold shadow-md"
                            >
                                {processing ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}{' '}
                                Simpan Konfigurasi Form
                            </Button>
                        </div>
                    </form>
                </div>
            </DndContext>
        </InnerAppLayout>
    );
}
