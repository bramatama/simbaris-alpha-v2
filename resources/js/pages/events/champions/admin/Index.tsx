import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getMasterDataInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import InputError from '@/components/input-error';
import { PageProps } from '@inertiajs/core';
import { Plus, Edit3, Trash2, Check, X, Trophy, Medal } from 'lucide-react';

interface Champion {
    champion_id: number;
    champion_category_id: number;
    champion_name: string;
}

interface ChampionCategory {
    champion_category_id: number;
    champion_category_name: string;
    champions?: Champion[];
}

export default function MasterChampionCategoryIndex({
    championCategories,
}: {
    championCategories: ChampionCategory[];
}) {
    const { errors: pageErrors } = usePage<PageProps>().props;

    // State untuk form penambahan Kategori (Top Input)
    const formAdd = useForm({
        champion_category_name: '',
    });

    // State untuk Edit Inline Kategori
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // State untuk form penambahan Piala (per kategori)
    const [championInputs, setChampionInputs] = useState<
        Record<number, string>
    >({});

    // State untuk Hapus (Dinamis: Kategori atau Piala)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<
        'category' | 'champion' | null
    >(null);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    // ==========================================
    // HANDLERS UNTUK KATEGORI (CATEGORY)
    // ==========================================
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        formAdd.post('/admin/master-champion-categories', {
            preserveScroll: true,
            onSuccess: () => formAdd.reset(),
        });
    };

    const startEditing = (category: ChampionCategory) => {
        setEditingId(category.champion_category_id);
        setEditValue(category.champion_category_name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = (id: number) => {
        if (!editValue.trim()) return;

        setIsUpdating(true);
        router.put(
            `/admin/master-champion-categories/${id}`,
            { champion_category_name: editValue },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    setEditValue('');
                },
                onFinish: () => setIsUpdating(false),
            },
        );
    };

    // ==========================================
    // HANDLERS UNTUK PIALA (CHAMPION)
    // ==========================================
    const handleAddChampion = (categoryId: number) => {
        const name = championInputs[categoryId];
        if (!name?.trim()) return;

        router.post(
            '/admin/master-champions',
            {
                champion_category_id: categoryId,
                champion_name: name,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setChampionInputs((prev) => ({
                        ...prev,
                        [categoryId]: '',
                    }));
                },
            },
        );
    };

    // ==========================================
    // HANDLERS UNTUK HAPUS (DELETE)
    // ==========================================
    const confirmDeleteCategory = (category: ChampionCategory) => {
        setDeleteType('category');
        setItemToDelete(category);
        setIsDeleteOpen(true);
    };

    const confirmDeleteChampion = (champion: Champion) => {
        setDeleteType('champion');
        setItemToDelete(champion);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;

        if (deleteType === 'category') {
            router.delete(
                `/admin/master-champion-categories/${itemToDelete.champion_category_id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => setIsDeleteOpen(false),
                },
            );
        } else if (deleteType === 'champion') {
            router.delete(
                `/admin/master-champions/${itemToDelete.champion_id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => setIsDeleteOpen(false),
                },
            );
        }
    };

    return (
        <InnerAppLayout sidebarNavItems={getMasterDataInnerNav()}>
            <Head title="Master Kategori Juara" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        <Trophy className="h-6 w-6 text-primary md:h-8 md:w-8" />
                        Master Kategori Juara & Piala
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">
                        Kelola data referensi kategori juara pusat dan daftar
                        master piala untuk event.
                    </p>
                </div>

                {pageErrors?.error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive">
                        {pageErrors.error}
                    </div>
                )}
                {pageErrors?.champion_name && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive">
                        {pageErrors.champion_name}
                    </div>
                )}

                {/* Form Tambah Kategori */}
                <Card className="border-border/60 bg-muted/10 shadow-sm">
                    <CardContent className="p-4">
                        <form
                            onSubmit={handleAddCategory}
                            className="flex flex-col gap-3 sm:flex-row sm:items-start"
                        >
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Masukkan nama Kategori baru (Cth: Juara Peringkat)"
                                    value={formAdd.data.champion_category_name}
                                    onChange={(e) =>
                                        formAdd.setData(
                                            'champion_category_name',
                                            e.target.value,
                                        )
                                    }
                                    className="bg-background"
                                />
                                <InputError
                                    message={
                                        formAdd.errors.champion_category_name
                                    }
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={formAdd.processing}
                                className="shrink-0 gap-2"
                            >
                                <Plus className="h-4 w-4" /> Tambah Kategori
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Accordion Daftar Kategori & Piala */}
                {championCategories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        Belum ada data master kategori juara.
                    </div>
                ) : (
                    <Accordion type="multiple" className="space-y-4">
                        {championCategories.map((cat) => (
                            <AccordionItem
                                key={cat.champion_category_id}
                                value={cat.champion_category_id.toString()}
                                className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                            >
                                {/* CUSTOM HEADER DENGAN INLINE EDIT */}
                                <div className="flex w-full items-center border-b border-border/50 bg-muted/20">
                                    {editingId === cat.champion_category_id ? (
                                        <div className="flex w-full items-center justify-between gap-2 p-4">
                                            <Input
                                                autoFocus
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                className="h-9 max-w-sm bg-background"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        saveEdit(
                                                            cat.champion_category_id,
                                                        );
                                                    if (e.key === 'Escape')
                                                        cancelEditing();
                                                }}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        saveEdit(
                                                            cat.champion_category_id,
                                                        )
                                                    }
                                                    disabled={
                                                        isUpdating ||
                                                        !editValue.trim()
                                                    }
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={cancelEditing}
                                                    disabled={isUpdating}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <AccordionTrigger className="w-full border-b-4 border-primary flex-1 p-4 hover:no-underline [&>svg]:ml-4">
                                            <div className="flex w-full justify-between">
                                                <div className="flex items-center gap-2 text-left">
                                                    <Trophy className="h-4 w-4 shrink-0 text-primary" />
                                                    <span className="font-bold text-foreground">
                                                        {
                                                            cat.champion_category_name
                                                        }
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-2 bg-background font-semibold text-muted-foreground hidden md:block"
                                                    >
                                                        {cat.champions
                                                            ?.length || 0}{' '}
                                                        Piala
                                                    </Badge>
                                                </div>
                                                {/* TOMBOL AKSI KATEGORI */}
                                                <div className="flex gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            startEditing(cat)
                                                        }
                                                        disabled={
                                                            editingId !== null
                                                        } // Disabled jika baris lain diedit
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            confirmDeleteCategory(
                                                                cat,
                                                            )
                                                        }
                                                        disabled={
                                                            editingId !== null
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                    )}
                                </div>

                                {/* KONTEN ACCORDION: MANAJEMEN PIALA */}
                                <AccordionContent className="p-4 sm:p-5">
                                    <div className="space-y-5">
                                        {/* Input Tambah Piala Baru */}
                                        <div className="flex max-w-md items-center gap-2">
                                            <Input
                                                placeholder="Nama Piala Baru (Cth: Juara 1)"
                                                value={
                                                    championInputs[
                                                        cat.champion_category_id
                                                    ] || ''
                                                }
                                                onChange={(e) =>
                                                    setChampionInputs(
                                                        (prev) => ({
                                                            ...prev,
                                                            [cat.champion_category_id]:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddChampion(
                                                            cat.champion_category_id,
                                                        );
                                                    }
                                                }}
                                                className="h-9"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleAddChampion(
                                                        cat.champion_category_id,
                                                    )
                                                }
                                                disabled={
                                                    !championInputs[
                                                        cat.champion_category_id
                                                    ]?.trim()
                                                }
                                                className="h-9 gap-1.5"
                                            >
                                                <Plus className="h-4 w-4" />{' '}
                                                Tambah
                                            </Button>
                                        </div>

                                        {/* Daftar Badge Piala */}
                                        <div className="flex flex-wrap gap-2">
                                            {cat.champions &&
                                            cat.champions.length > 0 ? (
                                                cat.champions.map((champ) => (
                                                    <Badge
                                                        key={champ.champion_id}
                                                        variant="outline"
                                                        className="flex items-center gap-1.5 border-border/70 bg-muted/10 py-1.5 pr-1 pl-3 text-sm font-medium shadow-sm"
                                                    >
                                                        <Medal className="h-3.5 w-3.5 text-primary/70" />
                                                        {champ.champion_name}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                confirmDeleteChampion(
                                                                    champ,
                                                                )
                                                            }
                                                            className="ml-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive focus:outline-none"
                                                            title="Hapus Piala"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    Belum ada piala yang
                                                    ditambahkan pada kategori
                                                    ini.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>

            {/* Dialog Konfirmasi Hapus Dinamis */}
            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title={
                    deleteType === 'category'
                        ? 'Hapus Master Kategori Juara?'
                        : 'Hapus Master Piala?'
                }
                description={
                    deleteType === 'category'
                        ? `Apakah Anda yakin ingin menghapus kategori "${itemToDelete?.champion_category_name}" dari sistem? Kategori ini tidak dapat dihapus jika sudah digunakan di dalam event.`
                        : `Apakah Anda yakin ingin menghapus piala "${itemToDelete?.champion_name}"? Piala ini tidak dapat dihapus jika sudah digunakan di dalam event.`
                }
                confirmText="Ya, Hapus"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </InnerAppLayout>
    );
}
