import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Calendar, UserCheck, Trash } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    return localISOTime;
};

export default function EventEdit({ event }: { event: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hosted Events', href: '/my-events' },
        { title: 'Edit Event', href: '#' },
    ];

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        event_name: event.event_name || '',
        description: event.description || '',
        location: event.location || '',
        status: event.status || 'draft',
        registration_start_time: formatDateTime(event.registration_start_time),
        registration_end_time: formatDateTime(event.registration_end_time),
        start_time: formatDateTime(event.start_time),
        end_time: formatDateTime(event.end_time),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDialogOpen(true);
    };

    const confirmSubmit = () => {
        setIsDialogOpen(false);
        put(`/committee/events/${event.public_id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${event.event_name}`} />

            <div className="w-full p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Event
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Update the details and schedule for{' '}
                            {event.event_name}.
                        </p>
                    </div>
                    <Badge variant="secondary" className="p-4 text-sm">
                        Status:{' '}
                        <span className="ml-1 font-bold capitalize">
                            {data.status.replace('_', ' ')}
                        </span>
                    </Badge>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* FORM EDIT (Kiri, Mengambil 2 Kolom) */}
                    <div className="space-y-6 lg:col-span-2">
                        <form onSubmit={submit} className="space-y-6">
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
                                        <InputError
                                            message={errors.event_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">
                                            Location *
                                        </Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) =>
                                                setData(
                                                    'location',
                                                    e.target.value,
                                                )
                                            }
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
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">
                                            Event Status
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
                                            <SelectContent position="popper">
                                                <SelectGroup>
                                                    <SelectLabel>
                                                        Status
                                                    </SelectLabel>
                                                    <SelectItem value="draft">
                                                        Draft (Hidden from
                                                        Public)
                                                    </SelectItem>
                                                    <SelectItem value="registration_open">
                                                        Registration Open
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        Active (On Going)
                                                    </SelectItem>
                                                    <SelectItem value="finished">
                                                        Finished
                                                    </SelectItem>
                                                </SelectGroup>
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
                                        <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                                            <Calendar className="h-4 w-4 text-primary" />{' '}
                                            Registration Period
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>Start Date</Label>
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
                                                <Label>End Date</Label>
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
                                        <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                                            <Calendar className="h-4 w-4 text-orange-500" />{' '}
                                            Event Execution
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>Start Date</Label>
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
                                                <Label>End Date</Label>
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

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                    <ConfirmationDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        title="Confirm Changes"
                        description="Are you sure you want to save these changes to the event?"
                        onConfirm={confirmSubmit}
                        isProcessing={processing}
                    />

                    {/* PANEL KANAN: Informasi Panitia (Read-Only List) */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader className="border-b bg-primary/5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <UserCheck className="h-5 w-5" />
                                    Assigned Committees
                                </CardTitle>
                                <CardDescription>
                                    Team members managing this event.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-125 divide-y overflow-y-auto">
                                    {event.event_committees?.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-muted-foreground">
                                            No committees assigned.
                                        </div>
                                    ) : (
                                        event.event_committees?.map(
                                            (ec: any) => (
                                                <div
                                                    key={ec.event_committee_id}
                                                    className="flex flex-col gap-1 p-4"
                                                >
                                                    <span className="text-sm font-semibold">
                                                        {ec.committee?.user
                                                            ?.name ||
                                                            'Unknown User'}
                                                    </span>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>
                                                            {
                                                                ec.committee
                                                                    ?.department
                                                            }
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] uppercase"
                                                        >
                                                            {ec.position}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    )}
                                </div>
                            </CardContent>
                            <div className="border-t bg-muted/20 p-4">
                                <Button
                                    variant="outline"
                                    className="w-full text-xs"
                                    disabled
                                >
                                    Manage Committees (Coming Soon)
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
