import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Trash2, PlusCircle, UserPlus } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import {
    Select,
    SelectLabel,
    SelectGroup,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Event Management', href: '/events' },
    { title: 'Create Event', href: '#' },
];

export default function EventCreate({
    existingCommittees = [],
}: {
    existingCommittees: any[];
}) {
    const { data, setData, post, processing, errors, clearErrors, transform } =
        useForm({
            event_name: '',
            description: '',
            location: '',
            status: 'draft',
            registration_start_time: '',
            registration_end_time: '',
            start_time: '',
            end_time: '',
            committees: [{ name: '', email: '', department: '', position: '' }],
        });

    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (errors['confirmation' as keyof typeof errors]) {
            setShowConfirm(true);
        }
    }, [errors['confirmation' as keyof typeof errors]]);

    const addCommittee = () => {
        if (data.committees.length >= 3) return;

        setData('committees', [
            ...data.committees,
            { name: '', email: '', department: '', position: '' },
        ]);
    };

    const removeCommittee = (index: number) => {
        const newCommittees = [...data.committees];
        newCommittees.splice(index, 1);
        setData('committees', newCommittees);
    };

    const updateCommittee = (
        index: number,
        field: 'name' | 'email' | 'department' | 'position',
        value: string,
    ) => {
        const newCommittees = [...data.committees];
        newCommittees[index] = { ...newCommittees[index], [field]: value };
        setData('committees', newCommittees);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/events'); // Sesuaikan rute store-nya
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        clearErrors('confirmation' as keyof typeof errors);

        transform((data) => ({
            ...data,
            force_create: true,
        }));

        post('/admin/events', {
            onFinish: () => {
                transform((data) => data);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Event" />

            <div className="w-full p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create New Event
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Set up a new competition and register its committee
                        accounts.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6 pb-12">
                    {/* INFO DASAR & JADWAL */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="event_name">
                                        Event Name *
                                    </Label>
                                    <Input
                                        id="event_name"
                                        value={data.event_name}
                                        onChange={(e) =>
                                            setData(
                                                'event_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={errors.event_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) =>
                                            setData('location', e.target.value)
                                        }
                                        placeholder="e.g. GOR Segiri Samarinda"
                                        required
                                    />
                                    <InputError message={errors.location} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">
                                        Initial Status
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger
                                            id="status"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="registration_open">
                                                Registration Open
                                            </SelectItem>
                                            <SelectItem value="active">
                                                Active (On Going)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Scheduling</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="border-b pb-2 text-sm font-semibold">
                                        Registration Period
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Start</Label>
                                            <Input
                                                type="datetime-local"
                                                value={
                                                    data.registration_start_time
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'registration_start_time',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.registration_start_time
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>End</Label>
                                            <Input
                                                type="datetime-local"
                                                value={
                                                    data.registration_end_time
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'registration_end_time',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.registration_end_time
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="border-b pb-2 text-sm font-semibold">
                                        Event Period
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Start</Label>
                                            <Input
                                                type="datetime-local"
                                                value={data.start_time}
                                                onChange={(e) =>
                                                    setData(
                                                        'start_time',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.start_time}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>End</Label>
                                            <Input
                                                type="datetime-local"
                                                value={data.end_time}
                                                onChange={(e) =>
                                                    setData(
                                                        'end_time',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.end_time}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* MANAJEMEN PEMBUATAN AKUN PANITIA */}
                    <Card className="border-primary/20">
                        <CardHeader className="mb-4">
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Register Committee Accounts
                            </CardTitle>
                            <CardDescription>
                                Create accounts for the committee members. They
                                will be automatically assigned to this event.
                                Default password: <strong>password123</strong>.
                            </CardDescription>
                            <Separator></Separator>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Alert jika ada error validasi di array panitia (misal email kembar) */}
                            {Object.keys(errors).some((key) =>
                                key.includes('committees'),
                            ) && (
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                    Please check the committee fields. Some
                                    emails might be already registered.
                                </div>
                            )}

                            {data.committees.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-lg border bg-card p-4 shadow-sm"
                                >
                                    <div className="mb-4 flex items-center justify-between border-b pb-2">
                                        <h4 className="text-sm font-semibold">
                                            Committee #{index + 1}
                                        </h4>
                                        {data.committees.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-red-600 hover:text-red-700"
                                                onClick={() =>
                                                    removeCommittee(index)
                                                }
                                            >
                                                <Trash2 className="mr-2 h-3 w-3" />{' '}
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mb-4 grid gap-2 border-b border-dashed pb-4 md:col-span-2">
                                        <Label className="text-muted-foreground">
                                            Autofill dari akun yang sudah ada
                                            (Opsional)
                                        </Label>
                                        <Select
                                            onValueChange={(val) => {
                                                if (val === '__clear__') {
                                                    const newCommittees = [
                                                        ...data.committees,
                                                    ];

                                                    newCommittees[index] = {
                                                        name: '',
                                                        email: '',
                                                        department: '',
                                                        position: '',
                                                    };

                                                    setData(
                                                        'committees',
                                                        newCommittees,
                                                    );
                                                    return;
                                                }

                                                const c =
                                                    existingCommittees.find(
                                                        (x) =>
                                                            x.committee_id.toString() ===
                                                            val,
                                                    );
                                                if (c) {
                                                    const newCommittees = [
                                                        ...data.committees,
                                                    ];

                                                    newCommittees[index] = {
                                                        ...newCommittees[index],
                                                        name:
                                                            c.user?.name || '',
                                                        email:
                                                            c.user?.email || '',
                                                        department:
                                                            c.department || '',
                                                    };

                                                    setData(
                                                        'committees',
                                                        newCommittees,
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full bg-muted/30">
                                                <SelectValue placeholder="-- Pilih Panitia yang sudah terdaftar --" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectItem value="__clear__">
                                                    ...
                                                </SelectItem>
                                                {existingCommittees
                                                    .filter((committee) => {
                                                        const selectedDepartments =
                                                            data.committees
                                                                .filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                )
                                                                .map(
                                                                    (c) =>
                                                                        c.department,
                                                                );

                                                        return !selectedDepartments.includes(
                                                            committee.department,
                                                        );
                                                    })
                                                    .map((c) => (
                                                        <SelectItem
                                                            key={c.committee_id}
                                                            value={c.committee_id.toString()}
                                                        >
                                                            {c.user?.name} -{' '}
                                                            {c.department}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Full Name *</Label>
                                            <Input
                                                placeholder="e.g. Budi Santoso"
                                                value={item.name}
                                                onChange={(e) =>
                                                    updateCommittee(
                                                        index,
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {/* Menampilkan pesan error per indeks jika ada */}
                                            <InputError
                                                message={
                                                    errors[
                                                        `committees.${index}.name` as keyof typeof errors
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Email Address *</Label>
                                            <Input
                                                type="email"
                                                placeholder="budi@example.com"
                                                value={item.email}
                                                onChange={(e) =>
                                                    updateCommittee(
                                                        index,
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `committees.${index}.email` as keyof typeof errors
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Department *</Label>
                                            <Input
                                                placeholder="e.g. Divisi Acara"
                                                value={item.department}
                                                onChange={(e) =>
                                                    updateCommittee(
                                                        index,
                                                        'department',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Event Position *</Label>
                                            <Select
                                                value={item.position}
                                                onValueChange={(value) =>
                                                    updateCommittee(
                                                        index,
                                                        'position',
                                                        value,
                                                    )
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
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addCommittee}
                                className="w-full gap-2 border-dashed"
                                disabled={data.committees.length >= 3}
                            >
                                <PlusCircle className="h-4 w-4" /> Add Another
                                Committee Member
                            </Button>
                        </CardContent>
                    </Card>

                    {/* SUBMIT BUTTON */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" size="lg" disabled={processing}>
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            Create Event & Accounts
                        </Button>
                    </div>
                </form>

                <ConfirmationDialog
                    open={showConfirm}
                    onOpenChange={(open) => {
                        setShowConfirm(open);
                        if (!open)
                            clearErrors('confirmation' as keyof typeof errors);
                    }}
                    title="Committee Account Exists"
                    description={
                        errors['confirmation' as keyof typeof errors] as string
                    }
                    confirmText="Proceed"
                    onConfirm={confirmSubmit}
                    isProcessing={processing}
                />
            </div>
        </AppLayout>
    );
}
