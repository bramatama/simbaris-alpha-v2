import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxGroup,
} from '@/components/ui/combobox';
import { GripVertical, X, Copy, Trash2, CheckSquare, Plus } from 'lucide-react';
import {
    useSortable,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

// =========================================================================
// INTERFACE & TYPES
// =========================================================================
export interface ScoreItem {
    id: string;
    value: string;
}

export interface GlobalRubric {
    id: string;
    name: string;
    expected_count: number;
}

export interface UICriteria {
    id: string;
    name: string;
    dbRubricIds?: Record<string, string>; // Opsional untuk Create, digunakan di Edit
    rubricData: Record<string, ScoreItem[]>;
}

// =========================================================================
// KOMPONEN DND REUSABLE
// =========================================================================

export function SortableRubricBadge({
    rubric,
    onRemove,
}: {
    rubric: GlobalRubric;
    onRemove: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: rubric.id,
        data: { type: 'rubric' },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="z-10 flex items-center gap-1.5 rounded-full border border-success/40 bg-success px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm transition-colors"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab rounded-sm px-2 transition-colors hover:bg-success/60 active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4" />
            </div>
            {rubric.name}{' '}
            <span className="ml-0.5 font-medium opacity-60">
                ({rubric.expected_count})
            </span>
            <button
                type="button"
                onClick={() => onRemove(rubric.id)}
                className="ml-1 cursor-pointer rounded-full p-0.5 transition-colors hover:bg-destructive hover:text-white"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function SortableScoreBox({
    score,
    index,
    critId,
    rubricId,
    onUpdate,
    onRemove,
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: score.id,
        data: { type: 'score', critId, rubricId },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex w-auto items-center overflow-hidden rounded-md border border-input bg-background shadow-sm transition-shadow ${isDragging ? 'shadow-md ring-2 ring-primary' : ''}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="flex cursor-grab items-center justify-center border-r border-input bg-muted/60 py-1.5 pr-2 pl-1.5 font-mono text-xs text-muted-foreground transition-colors outline-none hover:bg-muted/90 active:cursor-grabbing"
            >
                <GripVertical className="mr-0.5 h-3 w-3 opacity-40" />{' '}
                {index + 1}
            </div>
            <Input
                type="number"
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                value={score.value}
                onChange={(e) =>
                    onUpdate(critId, rubricId, score.id, e.target.value)
                }
                className="h-8 w-16 rounded-none border-0 bg-transparent px-2 text-center font-bold text-primary focus-visible:ring-0"
            />
            <button
                type="button"
                onClick={() => onRemove(critId, rubricId, score.id)}
                className="flex h-8 w-7 items-center justify-center border-l border-input bg-muted/20 text-muted-foreground transition-colors hover:bg-destructive hover:text-white"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function SortableCriteriaRow({
    crit,
    index,
    globalRubrics,
    localErrors,
    availableMasterCriteria,
    onUpdateName,
    onDuplicate,
    onRemove,
    onAddScore,
    onRemoveScore,
    onUpdateScore,
}: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: crit.id,
        data: { type: 'criteria' },
    });
    const initialMatchedCriteria = availableMasterCriteria?.find(
        (mc: any) => mc.master_criteria_id.toString() === crit.name,
    );
    const [uiName, setUiName] = useState(
        initialMatchedCriteria ? initialMatchedCriteria.criteria_name : '',
    );
    const [searchValue, setSearchValue] = useState('');

    const filteredMasterCriteria =
        availableMasterCriteria?.filter((mc: any) =>
            mc.criteria_name.toLowerCase().includes(searchValue.toLowerCase()),
        ) || [];

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative transition-all">
            <Card
                className={`overflow-hidden border border-border/80 bg-background shadow-sm transition-shadow ${isDragging ? 'border-primary/60 shadow-lg ring-2 ring-primary/60' : 'hover:border-primary/30'}`}
            >
                <div className="flex flex-col items-start justify-between gap-4 border-b border-border/50 bg-muted/10 p-4 sm:flex-row sm:items-center">
                    <div className="flex w-full items-center gap-3 sm:max-w-xl">
                        <div
                            {...attributes}
                            {...listeners}
                            className="-ml-2 cursor-grab rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing"
                        >
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                            {index + 1}
                        </div>
                        <div className="w-full flex-1">
                            <Combobox
                                value={uiName}
                                onValueChange={(val: any) => {
                                    const selectedCriteria =
                                        availableMasterCriteria?.find(
                                            (mc: any) =>
                                                mc.criteria_name === val,
                                        );

                                    setUiName(val ?? '');

                                    // Kirim ID ke parent melalui onUpdateName
                                    onUpdateName(
                                        crit.id,
                                        selectedCriteria
                                            ? selectedCriteria.master_criteria_id.toString()
                                            : '',
                                    );
                                }}
                                inputValue={searchValue}
                                onInputValueChange={(val: string) =>
                                    setSearchValue(val)
                                }
                            >
                                <ComboboxInput
                                    placeholder="Pilih Kriteria/Materi Gerakan..."
                                    showClear={!!uiName}
                                    className="h-9 w-full rounded-none border-0 border-b-2 border-dashed border-border bg-transparent px-1 text-base font-bold shadow-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/60 hover:border-primary/50 focus:border-solid focus-visible:border-primary focus-visible:ring-0"
                                />
                                <ComboboxContent>
                                    <ComboboxList>
                                        {filteredMasterCriteria.length ===
                                            0 && (
                                            <ComboboxEmpty>
                                                Kriteria tidak ditemukan.
                                            </ComboboxEmpty>
                                        )}
                                        <ComboboxGroup>
                                            {filteredMasterCriteria.map(
                                                (mc: any) => (
                                                    <ComboboxItem
                                                        key={
                                                            mc.master_criteria_id
                                                        }
                                                        value={mc.criteria_name}
                                                        className="rounded-none px-4 py-2 text-sm"
                                                    >
                                                        {mc.criteria_name}
                                                    </ComboboxItem>
                                                ),
                                            )}
                                        </ComboboxGroup>
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end pl-11 sm:self-auto sm:pl-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onDuplicate(index)}
                            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                        >
                            <Copy className="h-3.5 w-3.5 sm:mr-1.5" />{' '}
                            <span className="hidden sm:inline">Duplikat</span>
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemove(crit.id)}
                            className="h-8 px-2.5 text-xs font-semibold opacity-90 shadow-sm transition-opacity hover:opacity-100"
                        >
                            <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />{' '}
                            <span className="hidden sm:inline">
                                Hapus Baris
                            </span>
                        </Button>
                    </div>
                </div>

                <CardContent className="space-y-6 p-5 sm:p-6">
                    {localErrors[`crit_${crit.id}`] && (
                        <p className="is-error-msg mt-0 rounded-md bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                            {localErrors[`crit_${crit.id}`]}
                        </p>
                    )}

                    {globalRubrics.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {globalRubrics.map((gr: GlobalRubric) => {
                                const scores = crit.rubricData[gr.id] || [];
                                const isCountValid =
                                    scores.length === gr.expected_count;

                                return (
                                    <div
                                        key={gr.id}
                                        className="flex flex-col rounded-xl border border-border/70 bg-muted/5 p-4 transition-colors hover:border-border"
                                    >
                                        <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
                                            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                                                <CheckSquare className="h-4 w-4 text-emerald-600" />{' '}
                                                {gr.name}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${!isCountValid ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}
                                                >
                                                    {scores.length} /{' '}
                                                    {gr.expected_count}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        onAddScore(
                                                            crit.id,
                                                            gr.id,
                                                        )
                                                    }
                                                    className="h-7 w-7 rounded-full bg-background shadow-sm hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                                                    title="Tambah Nilai"
                                                    disabled={
                                                        gr.expected_count <=
                                                        scores.length
                                                    }
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <SortableContext
                                            items={scores.map((s: any) => s.id)}
                                            strategy={
                                                horizontalListSortingStrategy
                                            }
                                        >
                                            <div className="flex flex-1 flex-wrap items-start gap-2.5">
                                                {scores.map(
                                                    (score: any, sIdx: any) => (
                                                        <SortableScoreBox
                                                            key={score.id}
                                                            score={score}
                                                            index={sIdx}
                                                            critId={crit.id}
                                                            rubricId={gr.id}
                                                            onUpdate={
                                                                onUpdateScore
                                                            }
                                                            onRemove={
                                                                onRemoveScore
                                                            }
                                                        />
                                                    ),
                                                )}
                                                {scores.length === 0 && (
                                                    <div className="w-full rounded-lg border-2 border-dashed border-border/50 bg-background/50 py-4 text-center text-xs text-muted-foreground italic">
                                                        Belum ada nilai.
                                                    </div>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/5 p-8 text-center text-sm text-muted-foreground/60 italic">
                            Kolom kategori rubrik masih kosong. Tambahkan pada
                            form Bagian 1 di atas.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
