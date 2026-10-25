import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import InputError from '@/components/input-error';
import { PageProps } from '@inertiajs/core';
import { Plus, Edit3, Trash2, AlertOctagon, Save, Gavel } from 'lucide-react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getMasterDataInnerNav } from '@/config/inner_sidebar';

interface MasterPenalty {
    master_penalty_id: number;
    penalty_name: string;
}

export default function MasterPenaltiesIndex({
    masterPenalties,
}: {
    masterPenalties: MasterPenalty[];
}) {
    const { errors: pageErrors } = usePage<PageProps>().props;

    // State untuk Form Tambah (Top Form)
    const formAdd = useForm({
        penalty_name: '',
    });

    // State untuk Form Edit (Dialog)
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingPenalty, setEditingPenalty] = useState<MasterPenalty | null>(
        null,
    );
    const formEdit = useForm({
        penalty_name: '',
    });

    // State untuk Hapus (Dialog Konfirmasi)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MasterPenalty | null>(
        null,
    );

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        formAdd.post('/admin/master-penalties', {
            preserveScroll: true,
            onSuccess: () => formAdd.reset(),
        });
    };

    const openEdit = (penalty: MasterPenalty) => {
        setEditingPenalty(penalty);
        formEdit.setData({
            penalty_name: penalty.penalty_name,
        });
        setIsEditOpen(true);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPenalty) return;

        formEdit.put(
            `/admin/master-penalties/${editingPenalty.master_penalty_id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditOpen(false);
                    formEdit.reset();
                },
            },
        );
    };

    const confirmDelete = (penalty: MasterPenalty) => {
        setItemToDelete(penalty);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!itemToDelete) return;
        router.delete(
            `/admin/master-penalties/${itemToDelete.master_penalty_id}`,
            {
                preserveScroll: true,
                onSuccess: () => setIsDeleteOpen(false),
            },
        );
    };

    return (
        <InnerAppLayout sidebarNavItems={getMasterDataInnerNav()}>
            <Head title="Master Penalti" />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        <AlertOctagon className="h-6 w-6 text-destructive md:h-8 md:w-8" />
                        Master Penalti
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">
                        Kelola data referensi aturan pelanggaran dan penalti
                        pusat.
                    </p>
                </div>

                {/* ERROR GLOBAL (Jika gagal hapus karena berelasi) */}
                {pageErrors?.error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive">
                        {pageErrors.error}
                    </div>
                )}

                {/* FORM TAMBAH (TOP FORM) */}
                <Card className="border-border/60 bg-muted/10 shadow-sm">
                    <CardContent className="p-6">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                Tambah Aturan Baru
                            </h3>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className="flex-1 space-y-2">
                                    <Label
                                        htmlFor="penalty_name"
                                        requirement="required"
                                    >
                                        Nama Penalti
                                    </Label>
                                    <Input
                                        id="penalty_name"
                                        placeholder="Cth: Menginjak Garis Arena"
                                        value={formAdd.data.penalty_name}
                                        onChange={(e) =>
                                            formAdd.setData(
                                                'penalty_name',
                                                e.target.value,
                                            )
                                        }
                                        className="bg-background"
                                    />
                                    <InputError
                                        message={formAdd.errors.penalty_name}
                                    />
                                </div>
                                <div className="flex shrink-0 items-end sm:pt-6">
                                    <Button
                                        type="submit"
                                        disabled={formAdd.processing}
                                        className="w-full gap-2 sm:w-auto"
                                    >
                                        <Plus className="h-4 w-4" /> Tambah
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* DAFTAR MASTER PENALTI (FLEX WRAP / BATU BATA) */}
                <div>
                    {masterPenalties.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-12 text-center text-sm text-muted-foreground">
                            Belum ada data master penalti yang ditambahkan.
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {masterPenalties.map((penalty) => (
                                <div
                                    key={penalty.master_penalty_id}
                                    className="flex w-max items-center justify-between gap-2 rounded-xl border border-border/70 bg-card py-1 pr-1 pl-3 shadow-sm"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                            <Gavel className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-semibold text-sm text-foreground">
                                            {penalty.penalty_name}
                                        </span>
                                    </div>

                                    {/* Aksi Selalu Tampil */}
                                    <div className="flex shrink-0 items-center gap-1 border-l border-border/50 pl-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            onClick={() => openEdit(penalty)}
                                            title="Edit"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                confirmDelete(penalty)
                                            }
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* DIALOG EDIT */}
            <Dialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) formEdit.reset();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Master Penalti</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="edit_penalty_name"
                                requirement="required"
                            >
                                Nama Penalti
                            </Label>
                            <Input
                                id="edit_penalty_name"
                                value={formEdit.data.penalty_name}
                                onChange={(e) =>
                                    formEdit.setData(
                                        'penalty_name',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={formEdit.errors.penalty_name}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={formEdit.processing}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" /> Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIALOG KONFIRMASI HAPUS */}
            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Hapus Master Penalti?"
                description={`Apakah Anda yakin ingin menghapus "${itemToDelete?.penalty_name}" dari sistem? Data ini tidak dapat dihapus jika sedang digunakan pada event.`}
                confirmText="Ya, Hapus"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </InnerAppLayout>
    );
}
