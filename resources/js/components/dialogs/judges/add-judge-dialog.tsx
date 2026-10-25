import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { Plus } from 'lucide-react';

type Expertise = {
    scoring_category_id: number;
    event_level_id: number;
    level_name: string;
    category_name: string;
};

type Judge = {
    judge_id: number;
    user?: {
        name: string;
        email: string;
    };
};

interface AddJudgeDialogProps {
    eventPublicId: string;
    userRole: string;
    existingJudges: Judge[];
    expertises: Expertise[];
}

export default function AddJudgeDialog({
    eventPublicId,
    userRole,
    existingJudges,
    expertises,
}: AddJudgeDialogProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        data,
        setData,
        transform,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        email: '',
        expertise_ids: [] as number[],
        force_create: false,
    });

    const confirmationError = (errors as any).confirmation;
    useEffect(() => {
        if (confirmationError) {
            setShowConfirm(true);
        }
    }, [confirmationError]);

    const closeForm = () => {
        setIsAddOpen(false);
        reset();
        clearErrors();
        setShowConfirm(false);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${eventPublicId}/judges`, {
            onSuccess: () => closeForm(),
        });
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        clearErrors();
        transform((formData) => ({ ...formData, force_create: true }));
        post(`/${userRole}/events/${eventPublicId}/judges`, {
            onSuccess: () => closeForm(),
            onFinish: () => transform((fd) => fd),
        });
    };

    const toggleExpertise = (id: number, checked: boolean) => {
        if (checked) {
            setData('expertise_ids', [...new Set([...data.expertise_ids, id])]);
        } else {
            setData(
                'expertise_ids',
                data.expertise_ids.filter((i) => i !== id),
            );
        }
    };

    // Kelompokkan kategori berdasarkan Kategori Induk (Expertise), BUKAN Jenjang
    const expertisesByCategory = expertises.reduce<Record<string, Expertise[]>>(
        (groups, expertise) => {
            const catName = expertise.category_name || 'Kategori lainnya';
            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(expertise);
            return groups;
        },
        {},
    );

    const selectedExpertises = expertises.filter((exp) =>
        data.expertise_ids.includes(exp.scoring_category_id),
    );

    return (
        <>
            <Dialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setIsAddOpen(true);
                    } else {
                        closeForm();
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Tambah Juri Baru
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                    <form onSubmit={submitAdd}>
                        <DialogHeader>
                            <DialogTitle>Tugaskan Juri ke Acara</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-5 py-4">
                            <div className="grid gap-2 border-b border-dashed pb-4">
                                <Label className="text-muted-foreground">
                                    Pilih Akun Juri Terdaftar (Otomatis Isi)
                                </Label>
                                <Select
                                    onValueChange={(value) => {
                                        const judge = existingJudges.find(
                                            (item) =>
                                                item.judge_id.toString() ===
                                                value,
                                        );
                                        if (judge) {
                                            setData((p) => ({
                                                ...p,
                                                name: judge.user?.name ?? '',
                                                email: judge.user?.email ?? '',
                                            }));
                                            clearErrors('name');
                                            clearErrors('email');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-muted/30">
                                        <SelectValue placeholder="Pilih juri yang sudah ada di sistem" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>
                                                Daftar Juri
                                            </SelectLabel>
                                            {existingJudges.map((judge) => (
                                                <SelectItem
                                                    key={judge.judge_id}
                                                    value={judge.judge_id.toString()}
                                                >
                                                    {judge.user?.name ??
                                                        'Tanpa Nama'}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="judge-name">Nama Lengkap</Label>
                                <Input
                                    id="judge-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="judge-email">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="judge-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <Label>Kategori Penilaian Juri</Label>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Pilih jenjang untuk masing-masing
                                        kategori yang ditugaskan kepada juri
                                        ini.
                                    </p>
                                </div>

                                <div className="grid gap-4 rounded-lg border bg-muted/10 p-3">
                                    {Object.entries(expertisesByCategory).map(
                                        ([catName, levels]) => {
                                            const levelIds = levels.map(
                                                (l) => l.scoring_category_id,
                                            );
                                            const isAllSelected =
                                                levelIds.every((id) =>
                                                    data.expertise_ids.includes(
                                                        id,
                                                    ),
                                                );

                                            const toggleAll = () => {
                                                if (isAllSelected) {
                                                    setData(
                                                        'expertise_ids',
                                                        data.expertise_ids.filter(
                                                            (id) =>
                                                                !levelIds.includes(
                                                                    id,
                                                                ),
                                                        ),
                                                    );
                                                } else {
                                                    setData('expertise_ids', [
                                                        ...new Set([
                                                            ...data.expertise_ids,
                                                            ...levelIds,
                                                        ]),
                                                    ]);
                                                }
                                            };

                                            return (
                                                <div
                                                    key={catName}
                                                    className="space-y-3 rounded-lg border bg-card p-4 shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                                        <h4 className="text-sm font-bold text-foreground">
                                                            {catName}
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            variant={
                                                                isAllSelected
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                            size="sm"
                                                            onClick={toggleAll}
                                                            className="h-7 px-2.5 text-xs"
                                                        >
                                                            {isAllSelected
                                                                ? 'Batalkan Semua'
                                                                : 'Pilih Semua Jenjang'}
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        {levels.map(
                                                            (expertise) => (
                                                                <label
                                                                    key={
                                                                        expertise.scoring_category_id
                                                                    }
                                                                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-2.5 transition-colors ${data.expertise_ids.includes(expertise.scoring_category_id) ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50'}`}
                                                                >
                                                                    <Checkbox
                                                                        checked={data.expertise_ids.includes(
                                                                            expertise.scoring_category_id,
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) =>
                                                                            toggleExpertise(
                                                                                expertise.scoring_category_id,
                                                                                checked as boolean,
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="text-sm leading-none font-medium">
                                                                        {
                                                                            expertise.level_name
                                                                        }
                                                                    </span>
                                                                </label>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                    {expertises.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada kategori yang
                                            dikonfigurasi pada acara ini.
                                        </p>
                                    )}
                                </div>
                                <InputError message={errors.expertise_ids} />

                                {selectedExpertises.length > 0 && (
                                    <div className="pt-2 text-sm font-medium">
                                        Total Terpilih:{' '}
                                        <Badge
                                            variant="default"
                                            className="ml-1"
                                        >
                                            {selectedExpertises.length} Form
                                            Kategori
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeForm}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    data.expertise_ids.length === 0
                                }
                            >
                                {processing && (
                                    <Spinner className="mr-2 h-4 w-4" />
                                )}{' '}
                                Tugaskan Juri
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={showConfirm}
                onOpenChange={(open) => {
                    setShowConfirm(open);
                    if (!open) clearErrors('confirmation' as any);
                }}
                title="Akun Juri Ditemukan"
                description={
                    confirmationError ??
                    'Akun dengan email tersebut sudah ada. Lanjutkan menugaskan?'
                }
                confirmText="Ya, Tugaskan"
                onConfirm={confirmSubmit}
                isProcessing={processing}
            />
        </>
    );
}
