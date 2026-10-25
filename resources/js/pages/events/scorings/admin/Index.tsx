import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
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
import {
    Plus,
    Edit3,
    Trash2,
    Check,
    X,
    ClipboardList,
    ListChecks,
    AlertCircle,
} from 'lucide-react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getMasterDataInnerNav } from '@/config/inner_sidebar';

export default function MasterScoringsIndex({ masterScoringCategories }: any) {
    const { errors: pageErrors } = usePage<PageProps>().props;

    // ==========================================
    // STATE: KATEGORI (TAMBAH & EDIT)
    // ==========================================
    const formAddCategory = useForm({
        category_name: '',
    });

    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
        null,
    );
    const [editCategoryName, setEditCategoryName] = useState('');
    const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

    // ==========================================
    // STATE: KRITERIA (TAMBAH & EDIT)
    // ==========================================
    const [criteriaInputs, setCriteriaInputs] = useState<
        Record<number, string>
    >({});

    const [editingCriteriaId, setEditingCriteriaId] = useState<number | null>(
        null,
    );
    const [editCriteriaName, setEditCriteriaName] = useState('');
    const [isUpdatingCriteria, setIsUpdatingCriteria] = useState(false);

    // ==========================================
    // STATE: HAPUS
    // ==========================================
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{
        type: 'category' | 'criteria';
        id: number;
        name: string;
    } | null>(null);

    // ==========================================
    // HANDLERS: KATEGORI
    // ==========================================
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        formAddCategory.post('/admin/master-scorings', {
            preserveScroll: true,
            onSuccess: () => formAddCategory.reset(),
        });
    };

    const startEditCategory = (category: any) => {
        setEditingCategoryId(category.master_category_id);
        setEditCategoryName(category.category_name);
    };

    const cancelEditCategory = () => {
        setEditingCategoryId(null);
        setEditCategoryName('');
    };

    const saveEditCategory = (id: number) => {
        if (!editCategoryName.trim()) return;
        setIsUpdatingCategory(true);
        router.put(
            `/admin/master-scorings/${id}`,
            { category_name: editCategoryName },
            {
                preserveScroll: true,
                onSuccess: () => cancelEditCategory(),
                onFinish: () => setIsUpdatingCategory(false),
            },
        );
    };

    // ==========================================
    // HANDLERS: KRITERIA
    // ==========================================
    const handleAddCriteria = (categoryId: number) => {
        const name = criteriaInputs[categoryId];
        if (!name?.trim()) return;

        router.post(
            '/admin/master-assessment-criteria',
            {
                master_category_id: categoryId,
                criteria_name: name,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCriteriaInputs((prev) => ({
                        ...prev,
                        [categoryId]: '',
                    }));
                },
            },
        );
    };

    const startEditCriteria = (criteria: any) => {
        setEditingCriteriaId(criteria.master_criteria_id);
        setEditCriteriaName(criteria.criteria_name);
    };

    const cancelEditCriteria = () => {
        setEditingCriteriaId(null);
        setEditCriteriaName('');
    };

    const saveEditCriteria = (criteriaId: number, categoryId: number) => {
        if (!editCriteriaName.trim()) return;
        setIsUpdatingCriteria(true);
        router.put(
            `/admin/master-assessment-criteria/${criteriaId}`,
            {
                master_category_id: categoryId,
                criteria_name: editCriteriaName,
            },
            {
                preserveScroll: true,
                onSuccess: () => cancelEditCriteria(),
                onFinish: () => setIsUpdatingCriteria(false),
            },
        );
    };

    // ==========================================
    // HANDLERS: DELETE
    // ==========================================
    const confirmDelete = (
        type: 'category' | 'criteria',
        id: number,
        name: string,
    ) => {
        setDeleteConfig({ type, id, name });
        setIsDeleteOpen(true);
    };

    const executeDelete = () => {
        if (!deleteConfig) return;

        const endpoint =
            deleteConfig.type === 'category'
                ? `/admin/master-scorings/${deleteConfig.id}`
                : `/admin/master-assessment-criteria/${deleteConfig.id}`;

        router.delete(endpoint, {
            preserveScroll: true,
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <InnerAppLayout sidebarNavItems={getMasterDataInnerNav()}>
            <Head title="Master Kategori Penilaian" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        <ClipboardList className="h-6 w-6 text-primary md:h-8 md:w-8" />
                        Master Kategori Penilaian
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">
                        Kelola kategori penilaian dan susun daftar kriteria di
                        dalamnya
                    </p>
                </div>

                {/* ERROR GLOBAL */}
                {pageErrors?.error && (
                    <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{pageErrors.error}</p>
                    </div>
                )}

                {/* FORM TAMBAH KATEGORI (TOP FORM) */}
                <Card className="border-border/60 bg-muted/10 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <form
                            onSubmit={handleAddCategory}
                            className="flex flex-col gap-3 sm:flex-row sm:items-start"
                        >
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Masukkan nama Kategori baru (Cth: PBB Murni)"
                                    value={formAddCategory.data.category_name}
                                    onChange={(e) =>
                                        formAddCategory.setData(
                                            'category_name',
                                            e.target.value,
                                        )
                                    }
                                    className="bg-background"
                                />
                                <InputError
                                    message={
                                        formAddCategory.errors.category_name
                                    }
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={formAddCategory.processing}
                                className="shrink-0 gap-2"
                            >
                                <Plus className="h-4 w-4" /> Tambah Kategori
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ACCORDION KATEGORI */}
                {masterScoringCategories.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        Belum ada data kategori penilaian. Tambahkan melalui
                        form di atas.
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-full space-y-4">
                        {masterScoringCategories.map((category: any) => {
                            const criteriaList =
                                category.master_assessment_criteria ||
                                category.masterAssessmentCriteria ||
                                [];

                            return (
                                <AccordionItem
                                    key={category.master_category_id}
                                    value={`cat-${category.master_category_id}`}
                                    className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                                >
                                    {/* ACCORDION HEADER & INLINE EDIT KATEGORI */}
                                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/20">
                                        {editingCategoryId ===
                                        category.master_category_id ? (
                                            <div className="flex w-full items-center gap-2 p-4">
                                                <Input
                                                    autoFocus
                                                    value={editCategoryName}
                                                    onChange={(e) =>
                                                        setEditCategoryName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 max-w-md bg-background"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter')
                                                            saveEditCategory(
                                                                category.master_category_id,
                                                            );
                                                        if (e.key === 'Escape')
                                                            cancelEditCategory();
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            saveEditCategory(
                                                                category.master_category_id,
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdatingCategory ||
                                                            !editCategoryName.trim()
                                                        }
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={
                                                            cancelEditCategory
                                                        }
                                                        disabled={
                                                            isUpdatingCategory
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <AccordionTrigger className="w-full flex-1 cursor-pointer border-b-4 border-primary p-4 hover:no-underline [&>svg]:ml-4">
                                                <div className="flex w-full justify-between">
                                                    <div className="flex items-center gap-2 text-left">
                                                        <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
                                                        <span className="font-bold text-foreground">
                                                            {
                                                                category.category_name
                                                            }
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-2 bg-background font-semibold text-muted-foreground"
                                                        >
                                                            {
                                                                criteriaList.length
                                                            }{' '}
                                                            Kriteria
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                startEditCategory(
                                                                    category,
                                                                )
                                                            }
                                                            disabled={
                                                                editingCategoryId !==
                                                                null
                                                            }
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    'category',
                                                                    category.master_category_id,
                                                                    category.category_name,
                                                                )
                                                            }
                                                            disabled={
                                                                editingCategoryId !==
                                                                null
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                        )}
                                    </div>

                                    {/* ACCORDION CONTENT: MANAJEMEN KRITERIA */}
                                    <AccordionContent className="p-4 sm:p-5">
                                        <div className="space-y-5">
                                            {/* Form Tambah Kriteria (Inline) */}
                                            <div className="flex max-w-md items-center gap-2">
                                                <Input
                                                    placeholder="Nama Kriteria Baru (Cth: Keseragaman)"
                                                    value={
                                                        criteriaInputs[
                                                            category
                                                                .master_category_id
                                                        ] || ''
                                                    }
                                                    onChange={(e) =>
                                                        setCriteriaInputs(
                                                            (prev) => ({
                                                                ...prev,
                                                                [category.master_category_id]:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddCriteria(
                                                                category.master_category_id,
                                                            );
                                                        }
                                                    }}
                                                    className="h-9"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddCriteria(
                                                            category.master_category_id,
                                                        )
                                                    }
                                                    disabled={
                                                        !criteriaInputs[
                                                            category
                                                                .master_category_id
                                                        ]?.trim()
                                                    }
                                                    className="h-9 gap-1.5"
                                                >
                                                    <Plus className="h-4 w-4" />{' '}
                                                    Tambah
                                                </Button>
                                            </div>

                                            {/* Daftar Kriteria (Grid Cards / Batu Bata) */}
                                            {criteriaList.length === 0 ? (
                                                <p className="text-sm text-muted-foreground italic">
                                                    Belum ada kriteria yang
                                                    ditambahkan pada kategori
                                                    ini.
                                                </p>
                                            ) : (
                                                <div className="flex flex-wrap gap-3">
                                                    {criteriaList.map(
                                                        (criteria: any) => (
                                                            <div
                                                                key={
                                                                    criteria.master_criteria_id
                                                                }
                                                                className="flex w-max items-center justify-between gap-3 rounded-lg border border-border/70 bg-card py-1.5 pr-1.5 pl-3 shadow-sm"
                                                            >
                                                                {editingCriteriaId ===
                                                                criteria.master_criteria_id ? (
                                                                    <div className="flex items-center gap-1.5 py-0.5">
                                                                        <Input
                                                                            autoFocus
                                                                            value={
                                                                                editCriteriaName
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditCriteriaName(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-7 w-40 text-xs"
                                                                            onKeyDown={(
                                                                                e,
                                                                            ) => {
                                                                                if (
                                                                                    e.key ===
                                                                                    'Enter'
                                                                                )
                                                                                    saveEditCriteria(
                                                                                        criteria.master_criteria_id,
                                                                                        category.master_category_id,
                                                                                    );
                                                                                if (
                                                                                    e.key ===
                                                                                    'Escape'
                                                                                )
                                                                                    cancelEditCriteria();
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-7 w-7 hover:bg-green-500/10 hover:text-green-600"
                                                                            onClick={() =>
                                                                                saveEditCriteria(
                                                                                    criteria.master_criteria_id,
                                                                                    category.master_category_id,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isUpdatingCriteria ||
                                                                                !editCriteriaName.trim()
                                                                            }
                                                                        >
                                                                            <Check className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-7 w-7 text-muted-foreground"
                                                                            onClick={
                                                                                cancelEditCriteria
                                                                            }
                                                                            disabled={
                                                                                isUpdatingCriteria
                                                                            }
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex items-center gap-2">
                                                                            <ListChecks className="h-3.5 w-3.5 text-primary/70" />
                                                                            <span className="text-sm font-semibold text-foreground">
                                                                                {
                                                                                    criteria.criteria_name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-0.5 border-l border-border/50 pl-1.5">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                                onClick={() =>
                                                                                    startEditCriteria(
                                                                                        criteria,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    editingCriteriaId !==
                                                                                    null
                                                                                }
                                                                            >
                                                                                <Edit3 className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                                                                                onClick={() =>
                                                                                    confirmDelete(
                                                                                        'criteria',
                                                                                        criteria.master_criteria_id,
                                                                                        criteria.criteria_name,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    editingCriteriaId !==
                                                                                    null
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                )}
            </div>

            {/* DIALOG KONFIRMASI HAPUS */}
            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title={`Hapus ${deleteConfig?.type === 'category' ? 'Kategori' : 'Kriteria'}?`}
                description={
                    deleteConfig?.type === 'category'
                        ? `Apakah Anda yakin ingin menghapus kategori "${deleteConfig?.name}" beserta seluruh kriteria di dalamnya? Data ini tidak dapat dihapus jika sudah digunakan di event`
                        : `Apakah Anda yakin ingin menghapus kriteria "${deleteConfig?.name}"? Data ini tidak dapat dihapus jika sudah digunakan di form penilaian event`
                }
                confirmText="Ya, Hapus"
                variant="destructive"
                onConfirm={executeDelete}
            />
        </InnerAppLayout>
    );
}
