import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ConfirmationDialog } from './confirmation-dialog';
import { Plus } from 'lucide-react';
import { Auth } from '@/types';

interface AddCommitteeDialogProps {
    eventPublicId: string;
    existingCommittees: any[];
}

type PageProps = {
    auth: Auth;
};

export default function AddCommitteeDialog({
    eventPublicId,
    existingCommittees,
}: AddCommitteeDialogProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm({
        name: '',
        email: '',
        department: '',
        position: '',
    });

    useEffect(() => {
        if (errors['confirmation' as keyof typeof errors]) {
            setShowConfirm(true);
        }
    }, [errors['confirmation' as keyof typeof errors]]);

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${userRole}/events/${eventPublicId}/committees`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        clearErrors('confirmation' as keyof typeof errors);

        transform((currentData) => ({
            ...currentData,
            force_create: true,
        }));

        post(`/${userRole}/events/${eventPublicId}/committees`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
            onFinish: () => {
                transform((currentData) => currentData);
            },
        });
    };

    return (
        <>
            <Dialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) {
                        reset();
                        clearErrors();
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Assign New Member
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={submitAdd}>
                        <DialogHeader>
                            <DialogTitle>Add Committee Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2 border-b border-border pb-4">
                                <Label className="text-muted-foreground">
                                    Autofill dari akun yang sudah ada (Opsional)
                                </Label>
                                <Select
                                    onValueChange={(val) => {
                                        const c = existingCommittees.find(
                                            (x) =>
                                                x.committee_id.toString() ===
                                                val,
                                        );
                                        if (c) {
                                            setData({
                                                ...data,
                                                name: c.user?.name || '',
                                                email: c.user?.email || '',
                                                department: c.department || '',
                                            });
                                            clearErrors();
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-muted/30">
                                        <SelectValue placeholder="-- Pilih Panitia yang sudah terdaftar --" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>
                                                Daftar Panitia
                                            </SelectLabel>
                                            {existingCommittees.map((c) => (
                                                <SelectItem
                                                    key={c.committee_id}
                                                    value={c.committee_id.toString()}
                                                >
                                                    {c.user?.name} -{' '}
                                                    {c.department}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    placeholder="e.g. Divisi Acara"
                                    value={data.department}
                                    onChange={(e) =>
                                        setData('department', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.department} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="position">
                                    Position / Role
                                </Label>
                                <Select
                                    value={data.position}
                                    onValueChange={(value) =>
                                        setData('position', value)
                                    }
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Position</SelectLabel>
                                            <SelectItem value="administration">
                                                Administration
                                            </SelectItem>
                                            <SelectItem value="auditor">
                                                Auditor
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.position} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Spinner className="mr-2 h-4 w-4" />
                                )}{' '}
                                Save & Create Account
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={showConfirm}
                onOpenChange={(open) => {
                    setShowConfirm(open);
                    if (!open)
                        clearErrors('confirmation' as keyof typeof errors);
                }}
                title="Akun Panitia Ditemukan"
                description={
                    errors['confirmation' as keyof typeof errors] as string
                }
                confirmText="Lanjutkan Assignment"
                onConfirm={confirmSubmit}
                isProcessing={processing}
            />
        </>
    );
}
