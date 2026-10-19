import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    Plus,
    Columns3,
    Info,
    CheckSquare,
} from 'lucide-react';

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

export default function DynamicScoringBuilderEdit({
    event,
    eventLevel,
    scoringCategory,
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const { put, processing, errors, transform } = useForm({
        criteria: [] as any[],
    });

    const [globalRubrics, setGlobalRubrics] = useState<GlobalRubric[]>(() => {
        const firstCrit = scoringCategory.assessment_criteria[0];
        if (!firstCrit || !firstCrit.rubric_categories) return [];
        return firstCrit.rubric_categories.map((rc: any, idx: number) => ({
            id: `col_visual_${idx}`,
            name: rc.category_label,
            expected_count: rc.rubric_scores?.length || 0,
        }));
    });

    const [uiCriteria, setUiCriteria] = useState<UICriteria[]>(() => {
        return (
            scoringCategory.assessment_criteria?.map((crit: any) => {
                const dbRubricIds: Record<string, string> = {};
                const rubricData: Record<string, ScoreItem[]> = {};
                crit.rubric_categories?.forEach((rc: any, idx: number) => {
                    const colId = `col_visual_${idx}`;
                    dbRubricIds[colId] = rc.rubric_category_id.toString();
                    rubricData[colId] =
                        rc.rubric_scores?.map((rs: any) => ({
                            id: rs.rubric_score_id.toString(),
                            value: rs.score_value.toString(),
                        })) || [];
                });
                return {
                    id: crit.criteria_id.toString(),
                    name: crit.criteria_name,
                    dbRubricIds,
                    rubricData,
                };
            }) || []
        );
    });

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

    const generateNewId = () =>
        `new_${Math.random().toString(36).substring(2, 9)}`;

    const addGlobalRubric = () => {
        if (!newRubricName.trim() || !newRubricCount) return;
        setGlobalRubrics([
            ...globalRubrics,
            {
                id: generateNewId(),
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
            { id: generateNewId(), name: '', dbRubricIds: {}, rubricData: {} },
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
                    id: generateNewId(),
                    value: s.value,
                }));
            });
            const newCrit: UICriteria = {
                id: generateNewId(),
                name: `${critToCopy.name} (Copy)`,
                dbRubricIds: {},
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
                                  { id: generateNewId(), value: '' },
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

    const scrollToError = () => {
        setTimeout(() => {
            const firstError = document.querySelector('.is-error-msg');
            if (firstError)
                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
        }, 100);
    };

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
            scrollToError();
            return;
        }

        transform((currentData) => ({
            ...currentData,
            criteria: uiCriteria.map((crit, cIdx) => {
                const isNewCrit = crit.id.startsWith('new_');
                return {
                    ...(isNewCrit ? {} : { criteria_id: Number(crit.id) }),
                    criteria_name: crit.name,
                    order_index: cIdx + 1,
                    rubrics: globalRubrics.map((gr, rIdx) => {
                        const dbRubricId = crit.dbRubricIds
                            ? crit.dbRubricIds[gr.id]
                            : null;
                        const isNewRubric =
                            !dbRubricId || dbRubricId.startsWith('new_');
                        return {
                            ...(isNewRubric
                                ? {}
                                : { rubric_category_id: Number(dbRubricId) }),
                            category_label: gr.name,
                            category_order: rIdx + 1,
                            scores: (crit.rubricData[gr.id] || []).map(
                                (s, sIdx) => {
                                    const isNewScore = s.id.startsWith('new_');
                                    return {
                                        ...(isNewScore
                                            ? {}
                                            : {
                                                  rubric_score_id: Number(s.id),
                                              }),
                                        score_value: s.value,
                                        display_order: sIdx + 1,
                                    };
                                },
                            ),
                        };
                    }),
                };
            }),
        }));
        put(
            `/${userRole}/events/${event.public_id}/scoring-categories/${scoringCategory.scoring_category_id}`,
            { preserveScroll: true, onError: scrollToError },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head
                title={`Edit Form: ${scoringCategory.master_category?.category_name}`}
            />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 bg-muted/5 p-4 pb-32 md:p-6 lg:p-8">
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
                                Edit Form Penilaian
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Perbarui konfigurasi parameter dan bobot
                                penilaian.
                            </p>
                        </div>
                    </div>

                    {localErrors['global'] && (
                        <div className="is-error-msg rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive shadow-sm">
                            {localErrors['global']}
                        </div>
                    )}
                    {errors.criteria && (
                        <div className="is-error-msg rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive shadow-sm">
                            Validasi Server: Terdapat data yang tidak valid.
                            Periksa peringatan di setiap baris.
                        </div>
                    )}

                    <form onSubmit={handleCustomSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                            <Card className="flex h-full flex-col overflow-hidden border-t-4 border-t-primary shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10 p-5">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Info className="h-5 w-5 text-primary" />{' '}
                                        Informasi Kategori
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col justify-center gap-6 p-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                            Kategori Induk Form
                                        </Label>
                                        <div className="border-b border-border pb-2 text-lg font-bold text-foreground">
                                            {
                                                scoringCategory.master_category
                                                    ?.category_name
                                            }
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                            Diterapkan Pada Jenjang
                                        </Label>
                                        <div>
                                            <Badge
                                                variant="default"
                                                className="pointer-events-none rounded-full px-4 py-1.5 text-sm shadow-sm"
                                            >
                                                {eventLevel.level?.level_name}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="mt-auto rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground italic">
                                        Kategori induk dan jenjang perlombaan
                                        tidak dapat diubah setelah form dibuat.
                                    </p>
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
                                                Jml Opsi
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
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
                                Simpan Perubahan Form
                            </Button>
                        </div>
                    </form>
                </div>
            </DndContext>
        </InnerAppLayout>
    );
}
