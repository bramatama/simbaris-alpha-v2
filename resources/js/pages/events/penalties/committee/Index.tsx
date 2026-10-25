import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
    ComboboxGroup,
} from '@/components/ui/combobox';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import InputError from '@/components/input-error';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    Plus,
    Edit3,
    Trash2,
    Gavel,
    AlertCircle,
    X,
} from 'lucide-react';

export default function EventPenaltiesIndex({
    event,
    eventPenalties,
    masterPenalties,
    championCategories,
}: any) {
    const { auth, errors: pageErrors } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    // State Manajemen Form (Tambah/Edit)
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            master_penalty_id: '',
            penalty_name_ui: '',
            description: '',
            penalty_value: '',
            calculation_type: 'fixed',
            penalty_action: 'deduction',
            event_champion_category_ids: [] as number[],
        });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    const [searchPenalty, setSearchPenalty] = useState('');

    const filteredPenalties = masterPenalties.filter((mp: any) =>
        mp.penalty_name.toLowerCase().includes(searchPenalty.toLowerCase()),
    );

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleCategoryToggle = (id: number) => {
        const current = data.event_champion_category_ids;
        setData(
            'event_champion_category_ids',
            current.includes(id)
                ? current.filter((val) => val !== id)
                : [...current, id],
        );
    };

    const handleEditClick = (penalty: any) => {
        setIsEditing(true);
        setEditId(penalty.event_penalty_id);

        setData({
            master_penalty_id: penalty.master_penalty_id.toString(),
            penalty_name_ui: penalty.master_penalty?.penalty_name || '',
            description: penalty.description || '',
            penalty_value: penalty.penalty_value.toString(),
            calculation_type: penalty.calculation_type,
            penalty_action: penalty.penalty_action,
            event_champion_category_ids: penalty.champion_categories.map(
                (c: any) => c.event_champion_category_id,
            ),
        });

        clearErrors();
        // Gulir ke atas untuk pengguna mobile agar fokus ke form
        if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && editId) {
            put(`/committee/events/${event.public_id}/penalties/${editId}`, {
                preserveScroll: true,
                onSuccess: () => handleCancelEdit(),
            });
        } else {
            post(`/committee/events/${event.public_id}/penalties`, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const toggleStatus = (penaltyId: number) => {
        router.patch(
            `/committee/events/${event.public_id}/penalties/${penaltyId}/toggle`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const confirmDelete = (penalty: any) => {
        setItemToDelete(penalty);
        setIsDeleteOpen(true);
    };

    const executeDelete = () => {
        if (!itemToDelete) return;
        router.delete(
            `/committee/events/${event.public_id}/penalties/${itemToDelete.event_penalty_id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    // Jika sedang mengedit item yang dihapus, reset formnya
                    if (isEditing && editId === itemToDelete.event_penalty_id) {
                        handleCancelEdit();
                    }
                },
            },
        );
    };

    // ==========================================
    // HELPERS UTILITY
    // ==========================================
    const translateCalcType = (type: string) => {
        const types: Record<string, string> = {
            fixed: 'Tetap (Sekali Berlaku)',
            per_occurrence: 'Per Kejadian (Akumulasi)',
            per_second: 'Per Detik (Durasi)',
        };
        return types[type] || type;
    };

    const translateAction = (action: string) => {
        return action === 'disqualification'
            ? 'Diskualifikasi'
            : 'Pengurangan Nilai';
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Penalti & Pelanggaran - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                    <div>
                        <Link
                            href={`/committee/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Detail Event
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Aturan Penalti & Pelanggaran
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Atur daftar penalti, nilai pengurangan, dan kategori
                            yang terdampak pada event ini
                        </p>
                    </div>
                </div>

                {/* ERROR ALERT (Jika duplikasi master_penalty_id) */}
                {pageErrors?.error && (
                    <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{pageErrors.error}</p>
                    </div>
                )}

                {/* LAYOUT KANAN-KIRI */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* KOLOM KIRI: FORM BUILDER STICKY */}
                    <div className="order-1 flex flex-col space-y-4 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                Konfigurasi Umum{' '}
                            </h3>
                        </div>
                        <Card
                            className={`border-border/60 shadow-sm transition-colors ${isEditing ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                        >
                            <CardContent className="p-5">
                                <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
                                    <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                        {isEditing
                                            ? 'Edit Aturan Penalti'
                                            : 'Tambah Penalti Baru'}
                                    </h3>
                                    {isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={handleCancelEdit}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <Label requirement="required">
                                            Pilih Jenis Penalti (Master)
                                        </Label>
                                        <Combobox
                                            value={data.penalty_name_ui}
                                            onValueChange={(val: any) => {
                                                const selectedPenalty =
                                                    masterPenalties.find(
                                                        (mp: any) =>
                                                            mp.penalty_name ===
                                                            val,
                                                    );

                                                setData((prev) => ({
                                                    ...prev,
                                                    penalty_name_ui: val ?? '',
                                                    master_penalty_id:
                                                        selectedPenalty
                                                            ? selectedPenalty.master_penalty_id.toString()
                                                            : '',
                                                }));
                                            }}
                                            inputValue={searchPenalty}
                                            onInputValueChange={(val: string) =>
                                                setSearchPenalty(val)
                                            }
                                        >
                                            <ComboboxInput
                                                placeholder="Cari referensi penalti..."
                                                showClear={
                                                    !!data.master_penalty_id
                                                }
                                            />
                                            <ComboboxContent>
                                                <ComboboxList>
                                                    {filteredPenalties.length ===
                                                        0 && (
                                                        <ComboboxEmpty>
                                                            Penalti tidak
                                                            ditemukan.
                                                        </ComboboxEmpty>
                                                    )}
                                                    <ComboboxGroup>
                                                        {filteredPenalties.map(
                                                            (mp: any) => (
                                                                <ComboboxItem
                                                                    key={
                                                                        mp.master_penalty_id
                                                                    }
                                                                    value={
                                                                        mp.penalty_name
                                                                    }
                                                                    className={
                                                                        'rounded-none px-4 py-2 text-xs'
                                                                    }
                                                                >
                                                                    {
                                                                        mp.penalty_name
                                                                    }
                                                                </ComboboxItem>
                                                            ),
                                                        )}
                                                    </ComboboxGroup>
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        <InputError
                                            message={errors.master_penalty_id}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label requirement="required">
                                            Tindakan Hukuman
                                        </Label>
                                        <Select
                                            value={data.penalty_action}
                                            onValueChange={(val) =>
                                                setData('penalty_action', val)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="deduction">
                                                    Pengurangan Nilai
                                                </SelectItem>
                                                <SelectItem value="disqualification">
                                                    Diskualifikasi
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.penalty_action}
                                        />
                                    </div>

                                    {/* Jika Disqualifikasi, tidak perlu input angka */}
                                    {data.penalty_action === 'deduction' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label requirement="required">
                                                    Nilai Potongan
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    onWheel={(e) =>
                                                        e.currentTarget.blur()
                                                    }
                                                    value={data.penalty_value}
                                                    onChange={(e) =>
                                                        setData(
                                                            'penalty_value',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Cth: 10"
                                                />
                                                <InputError
                                                    message={
                                                        errors.penalty_value
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label requirement="required">
                                                    Tipe Kalkulasi
                                                </Label>
                                                <Select
                                                    value={
                                                        data.calculation_type
                                                    }
                                                    onValueChange={(val) =>
                                                        setData(
                                                            'calculation_type',
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fixed">
                                                            Tetap
                                                        </SelectItem>
                                                        <SelectItem value="per_occurrence">
                                                            Per Kejadian
                                                        </SelectItem>
                                                        <SelectItem value="per_second">
                                                            Per Detik
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        errors.calculation_type
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>
                                            Deskripsi Spesifik (Opsional)
                                        </Label>
                                        <Textarea
                                            rows={2}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tulis jika ada spesifikasi khusus pada event ini..."
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/10 p-4">
                                        <Label requirement="required">
                                            Terapkan Pada Kategori:
                                        </Label>
                                        {championCategories.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">
                                                Belum ada kategori juara di
                                                event ini.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {championCategories.map(
                                                    (cat: any) => (
                                                        <div
                                                            key={
                                                                cat.event_champion_category_id
                                                            }
                                                            className="flex items-center space-x-3"
                                                        >
                                                            <Checkbox
                                                                id={`cat-${cat.event_champion_category_id}`}
                                                                checked={data.event_champion_category_ids.includes(
                                                                    cat.event_champion_category_id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handleCategoryToggle(
                                                                        cat.event_champion_category_id,
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`cat-${cat.event_champion_category_id}`}
                                                                className="cursor-pointer text-sm leading-none font-medium"
                                                            >
                                                                {
                                                                    cat
                                                                        .champion_category
                                                                        .champion_category_name
                                                                }
                                                            </label>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        <InputError
                                            message={
                                                errors.event_champion_category_ids
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full gap-2"
                                        >
                                            {isEditing ? (
                                                <Save className="h-4 w-4" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                            {isEditing
                                                ? 'Simpan Perubahan'
                                                : 'Tambahkan Penalti'}
                                        </Button>
                                        {isEditing && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={handleCancelEdit}
                                            >
                                                Batal Edit
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* KOLOM KANAN: DAFTAR KARTU PENALTI */}
                    <div className="order-2 space-y-4 lg:col-span-7 xl:col-span-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                Daftar Penalti Aktif
                            </h3>
                            <Badge variant="secondary">
                                {eventPenalties.length} Aturan
                            </Badge>
                        </div>

                        {eventPenalties.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-12 text-center text-sm text-muted-foreground">
                                Belum ada aturan penalti yang ditambahkan untuk
                                event ini. <br />
                                Silakan gunakan formulir di samping.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {eventPenalties.map((ep: any) => (
                                    <Card
                                        key={ep.event_penalty_id}
                                        className={`relative overflow-hidden border-border/60 shadow-sm transition-all ${
                                            !ep.is_active
                                                ? 'opacity-70 grayscale-50'
                                                : ''
                                        } ${editId === ep.event_penalty_id ? 'border-primary ring-2 ring-primary' : ''}`}
                                    >
                                        {/* Status Line Indicator */}
                                        <div
                                            className={`absolute top-0 bottom-0 left-0 w-1.5 ${ep.is_active ? (ep.penalty_action === 'disqualification' ? 'bg-destructive' : 'bg-amber-500') : 'bg-muted-foreground/30'}`}
                                        ></div>

                                        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 p-3 pl-5">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={!!ep.is_active}
                                                    onCheckedChange={() =>
                                                        toggleStatus(
                                                            ep.event_penalty_id,
                                                        )
                                                    }
                                                    title={
                                                        ep.is_active
                                                            ? 'Nonaktifkan Penalti'
                                                            : 'Aktifkan Penalti'
                                                    }
                                                />
                                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    {ep.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:bg-muted"
                                                    onClick={() =>
                                                        handleEditClick(ep)
                                                    }
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() =>
                                                        confirmDelete(ep)
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <CardContent className="p-4 pl-5">
                                            <div className="mb-3">
                                                <div className="flex items-start gap-2">
                                                    <Gavel
                                                        className={`mt-0.5 h-4 w-4 shrink-0 ${ep.penalty_action === 'disqualification' ? 'text-destructive' : 'text-amber-500'}`}
                                                    />
                                                    <h4 className="leading-tight font-bold text-foreground">
                                                        {
                                                            ep.master_penalty
                                                                ?.penalty_name
                                                        }
                                                    </h4>
                                                </div>
                                                {ep.description && (
                                                    <p className="mt-1 ml-6 text-xs text-muted-foreground">
                                                        {ep.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mb-3 ml-6 space-y-2">
                                                {ep.penalty_action ===
                                                'disqualification' ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="font-bold"
                                                    >
                                                        Diskualifikasi
                                                    </Badge>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-amber-500/30 bg-amber-500/10 font-bold text-amber-600"
                                                        >
                                                            -{ep.penalty_value}{' '}
                                                            Poin
                                                        </Badge>
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {translateCalcType(
                                                                ep.calculation_type,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-6 border-t border-border/50 pt-3">
                                                <p className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                    Berlaku Pada Kategori:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {ep.champion_categories &&
                                                    ep.champion_categories
                                                        .length > 0 ? (
                                                        ep.champion_categories.map(
                                                            (catPivot: any) => (
                                                                <Badge
                                                                    key={
                                                                        catPivot.event_champion_category_id
                                                                    }
                                                                    variant="secondary"
                                                                    className="bg-muted/60 px-1.5 py-0 text-[10px] font-medium"
                                                                >
                                                                    {
                                                                        catPivot
                                                                            .champion_category
                                                                            ?.champion_category_name
                                                                    }
                                                                </Badge>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Tidak ada
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Hapus Aturan Penalti?"
                description={`Apakah Anda yakin ingin menghapus penalti "${itemToDelete?.master_penalty?.penalty_name}" dari event ini? Aksi ini akan menghapus semua konfigurasi yang terhubung`}
                confirmText="Ya, Hapus"
                variant="destructive"
                onConfirm={executeDelete}
            />
        </InnerAppLayout>
    );
}
