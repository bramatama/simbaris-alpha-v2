import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, Save, GripVertical, AlertCircle } from 'lucide-react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* =========================================================
   KOMPONEN SORTABLE ITEM
========================================================= */
function SortableParticipantRow({
    participant,
    index,
}: {
    participant: any;
    index: number;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: participant.participation_id,
    });

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
                <div className="flex items-center gap-4 p-3 sm:p-4">
                    <div
                        {...attributes}
                        {...listeners}
                        className="-ml-2 cursor-grab rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing"
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-bold text-primary shadow-sm">
                        {index + 1}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground">
                            {participant.team_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            PIC: {participant.pic_name}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

/* =========================================================
   KOMPONEN UTAMA EDIT
========================================================= */
export default function ParticipationOrderEdit({
    event,
    eventLevel,
    participations = [],
}: any) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    // State lokal untuk mengatur urutan Drag & Drop
    const [items, setItems] = useState(participations);

    const { data, put, processing, transform, errors } = useForm({
        orders: [] as any[],
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
            setItems((prevItems: any[]) => {
                const oldIndex = prevItems.findIndex(
                    (i) => i.participation_id === active.id,
                );
                const newIndex = prevItems.findIndex(
                    (i) => i.participation_id === over.id,
                );
                return arrayMove(prevItems, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform(() => ({
            orders: items.map((item: any, index: number) => ({
                participation_id: item.participation_id,
                appearance_order: index + 1,
            })),
        }));

        put(
            `/${userRole}/events/${event.public_id}/participation-orders/levels/${eventLevel.event_level_id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Atur Nomor Urut - ${event.event_name}`} />

            <div className="mx-auto min-h-screen w-full max-w-4xl space-y-6 bg-muted/5 p-4 pb-32 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/participation-orders?level_id=${eventLevel.event_level_id}`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Batal &
                            Kembali
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Atur Urutan Tampil
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Jenjang:{' '}
                            <strong className="text-foreground">
                                {eventLevel.level.level_name}
                            </strong>
                        </p>
                    </div>
                </div>

                {errors.orders && (
                    <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{errors.orders}</p>
                    </div>
                )}

                <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Tahan dan geser (drag & drop) ikon{' '}
                    <strong>titik enam</strong> di sebelah kiri untuk mengubah
                    posisi tim. Angka urutan akan diperbarui secara otomatis.
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* AREA DRAG AND DROP */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map((i: any) => i.participation_id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {items.map(
                                    (participant: any, index: number) => (
                                        <SortableParticipantRow
                                            key={participant.participation_id}
                                            participant={participant}
                                            index={index}
                                        />
                                    ),
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* ACTION FOOTER */}
                    <div className="sticky bottom-6 z-20 flex justify-end gap-4 rounded-xl border border-border/40 bg-background/90 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md">
                        <Link
                            href={`/${userRole}/events/${event.public_id}/participation-orders?level_id=${eventLevel.event_level_id}`}
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
                            Simpan Urutan
                        </Button>
                    </div>
                </form>
            </div>
        </InnerAppLayout>
    );
}
