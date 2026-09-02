import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
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
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { ArrowLeft, Plus, UserX, Mail } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

// 1. Tambahkan import untuk komponen Table dari Shadcn
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function CommitteeIndex({
    event,
    existingCommittees = [],
}: {
    event: any;
    existingCommittees: any[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Event Management', href: '/events' },
        {
            title: event.event_name,
            href: `/committee/events/${event.public_id}/edit`,
        },
        { title: 'Manage Committees', href: '#' },
    ];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
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
        post(`/committee/events/${event.public_id}/committees`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(
            `/committee/events/${event.public_id}/committees/${deleteId}`,
            {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
                onFinish: () => setIsDeleting(false),
            },
        );
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        clearErrors('confirmation' as keyof typeof errors);

        // Sisipkan flag force_create ke data sebelum dikirim ulang
        transform((data) => ({
            ...data,
            force_create: true,
        }));

        post(`/committee/events/${event.public_id}/committees`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            },
            onFinish: () => {
                // Kembalikan form ke mode normal (tanpa force_create) setelah selesai
                transform((data) => data);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Committees - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/committee/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Committee Roster
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage the team organizing{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>

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
                                    <DialogTitle>
                                        Add Committee Member
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid gap-2 border-b border-dashed pb-4">
                                        <Label className="text-muted-foreground">
                                            Autofill dari akun yang sudah ada
                                            (Opsional)
                                        </Label>
                                        <Select
                                            onValueChange={(val) => {
                                                const c =
                                                    existingCommittees.find(
                                                        (x) =>
                                                            x.committee_id.toString() ===
                                                            val,
                                                    );
                                                if (c) {
                                                    // Update state utama
                                                    setData({
                                                        ...data,
                                                        name:
                                                            c.user?.name || '',
                                                        email:
                                                            c.user?.email || '',
                                                        department:
                                                            c.department || '',
                                                    });
                                                    clearErrors(); // Hapus error merah jika sebelumnya salah ketik
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
                                                    {existingCommittees.map(
                                                        (c) => (
                                                            <SelectItem
                                                                key={
                                                                    c.committee_id
                                                                }
                                                                value={c.committee_id.toString()}
                                                            >
                                                                {c.user?.name} -{' '}
                                                                {c.department}
                                                            </SelectItem>
                                                        ),
                                                    )}
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
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
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
                                        <Label htmlFor="department">
                                            Department
                                        </Label>
                                        <Input
                                            id="department"
                                            placeholder="e.g. Divisi Acara"
                                            value={data.department}
                                            onChange={(e) =>
                                                setData(
                                                    'department',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.department}
                                        />
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
                                                    <SelectLabel>
                                                        Position
                                                    </SelectLabel>
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
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Assigned Personnel (
                            {event.event_committees?.length || 0})
                        </CardTitle>
                        <CardDescription>
                            All members listed below have access to the
                            committee dashboard for this event.
                        </CardDescription>
                    </CardHeader>
                    {/* 2. Ganti blok HTML Table dengan komponen Shadcn */}
                    <CardContent className="px-6">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Name & Contact</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {event.event_committees?.length > 0 ? (
                                    event.event_committees.map((ec: any) => (
                                        <TableRow key={ec.event_committee_id}>
                                            <TableCell>
                                                <div className="text-base font-semibold">
                                                    {ec.committee?.user?.name}
                                                </div>
                                                <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                                                    <Mail className="h-3 w-3" />{' '}
                                                    {ec.committee?.user?.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {ec.committee?.department}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] tracking-wider uppercase"
                                                >
                                                    {ec.position}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() =>
                                                        setDeleteId(
                                                            ec.event_committee_id,
                                                        )
                                                    }
                                                >
                                                    <UserX className="mr-1.5 h-4 w-4" />{' '}
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No committee members assigned yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Dialog Konfirmasi Hapus Panitia */}
                <ConfirmationDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    variant="destructive"
                    title="Remove Committee Member?"
                    description="This will revoke their access to manage this event. Their actual account will not be deleted."
                    onConfirm={confirmDelete}
                    isProcessing={isDeleting}
                    confirmText="Yes, Remove"
                />
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
            </div>
        </AppLayout>
    );
}
