import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
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
import { ArrowLeft, Calendar, ImagePlus, Star, UserCheck } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { FileUploader } from '@/components/ui/file-uploader';
import { getEventInnerNav } from '@/config/inner_sidebar';
import type { PageProps } from '@inertiajs/core';

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
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'put',
        event_name: event.event_name || '',
        description: event.description || '',
        location: event.location || '',
        status: event.status || 'draft',
        registration_start_time: formatDateTime(event.registration_start_time),
        registration_end_time: formatDateTime(event.registration_end_time),
        start_time: formatDateTime(event.start_time),
        end_time: formatDateTime(event.end_time),
        temp_poster_path: null as string | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDialogOpen(true);
    };

    const confirmSubmit = () => {
        setIsDialogOpen(false);
        post(`/committee/events/${event.public_id}`, {
            preserveScroll: true,
        });
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Edit: ${event.event_name}`} />

            <div className="w-full p-4 md:p-6 lg:p-8">
                {/* HEADER */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Event
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Update the details and schedule for{' '}
                            {event.event_name}.
                        </p>
                    </div>
                    <Badge
                        variant="secondary"
                        className="px-4 py-2 text-sm font-normal"
                    >
                        Status:{' '}
                        <span className="ml-1 font-bold tracking-wide capitalize">
                            {data.status.replace('_', ' ')}
                        </span>
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    {/* FORM UTAMA */}
                    <div className="space-y-6 xl:col-span-9">
                        <form onSubmit={submit} className="space-y-6">
                            {/* KARTU 1: DETAIL DASAR & POSTER */}
                            <Card className="overflow-hidden">
                                <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
                                    <CardTitle>Basic Details</CardTitle>
                                    <CardDescription>
                                        Informasi umum dan poster event
                                        kompetisi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {/* AREA UPLOAD POSTER (Di Bawah, Lebar Penuh) */}
                                        <div className="border-t border-border/50 pt-6">
                                            <Label
                                                requirement="optional"
                                                className="mb-1 text-base"
                                            >
                                                Event Poster
                                            </Label>
                                            <p className="mb-4 text-sm text-muted-foreground">
                                                Format file: JPG, JPEG, PNG
                                                (Maks 5MB). Rasio
                                                direkomendasikan 3:4.
                                            </p>

                                            <div className="flex flex-col items-start gap-6 sm:flex-row">
                                                {/* Tampilkan poster saat ini JIKA belum ada file baru yang diunggah */}
                                                {event.poster_path ? (
                                                    <div className="group relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm sm:w-48">
                                                        <img
                                                            src={`/storage/${event.poster_path}`}
                                                            alt="Current Poster"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-background/80 p-2 text-center text-xs font-semibold text-foreground backdrop-blur-sm">
                                                            Poster Saat Ini
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex aspect-3/4 w-full max-w-60 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                                                        <ImagePlus className="mb-3 h-12 w-12 opacity-40" />
                                                        <span className="text-sm font-medium">
                                                            Belum ada poster
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="w-full min-w-0 flex-1">
                                                    <FileUploader
                                                        variant="image"
                                                        endpoint="/upload-temp-file"
                                                        maxSizeMB={5}
                                                        multiple={false}
                                                        onUploadSuccess={(
                                                            fileId,
                                                            path,
                                                        ) => {
                                                            setData(
                                                                'temp_poster_path',
                                                                path,
                                                            );
                                                            clearErrors(
                                                                'temp_poster_path',
                                                            );
                                                        }}
                                                        onRemove={() =>
                                                            setData(
                                                                'temp_poster_path',
                                                                null,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.temp_poster_path as string
                                                        }
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* GRID INPUTAN TEKS (Di Atas) */}
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label
                                                    requirement="required"
                                                    htmlFor="event_name"
                                                >
                                                    Event Name
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
                                                <Label
                                                    requirement="required"
                                                    htmlFor="location"
                                                >
                                                    Location
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
                                                <InputError
                                                    message={errors.location}
                                                />
                                            </div>

                                            <div className="grid gap-2 md:col-span-2">
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
                                                                Status Publikasi
                                                            </SelectLabel>
                                                            <SelectItem value="draft">
                                                                Draft (Hidden
                                                                from Public)
                                                            </SelectItem>
                                                            <SelectItem value="registration_open">
                                                                Registration
                                                                Open
                                                            </SelectItem>
                                                            <SelectItem value="active">
                                                                Active (On
                                                                Going)
                                                            </SelectItem>
                                                            <SelectItem value="finished">
                                                                Finished
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-2 pt-1 md:col-span-2">
                                                <Label
                                                    requirement="optional"
                                                    htmlFor="description"
                                                >
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
                                                    className="resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* KARTU 2: PENJADWALAN */}
                            <Card>
                                <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
                                    <CardTitle>Scheduling</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 p-6">
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 border-b border-border/50 pb-2 text-sm font-semibold">
                                            <Calendar className="h-4 w-4 text-primary" />{' '}
                                            Registration Period
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label requirement="required">
                                                    Start Date
                                                </Label>
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
                                                <Label requirement="required">
                                                    End Date
                                                </Label>
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

                                    <div className="space-y-4 pt-2">
                                        <h3 className="flex items-center gap-2 border-b border-border/50 pb-2 text-sm font-semibold">
                                            <Calendar className="h-4 w-4 text-orange-500" />{' '}
                                            Event Execution
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label requirement="required">
                                                    Start Date
                                                </Label>
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
                                                <Label requirement="required">
                                                    End Date
                                                </Label>
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

                            {/* TOMBOL AKSI */}
                            <div className="flex items-center justify-end gap-4 pt-2">
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
                                    className="px-8"
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

                    {/* PANEL KANAN (SIDEBAR): Panitia */}
                    <div className="space-y-6 xl:col-span-3">
                        <Card className="sticky top-6">
                            <CardHeader className="border-b border-border/50 bg-primary/5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                    Committees
                                </CardTitle>
                                <CardDescription>
                                    Team managing this event.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-125 divide-y divide-border/50 overflow-y-auto">
                                    {event.event_committees?.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-muted-foreground">
                                            No committees assigned.
                                        </div>
                                    ) : (
                                        event.event_committees?.map(
                                            (ec: any) => (
                                                <div
                                                    key={ec.event_committee_id}
                                                    className="flex flex-col gap-1.5 p-4 transition-colors hover:bg-muted/30"
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
                                                            className="bg-muted/50 text-[10px] font-medium uppercase"
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
                            <div className="border-t border-border/50 bg-muted/20 p-4">
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/committees`}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs"
                                    >
                                        <Star className="h-4 w-4" />
                                        Manage Committees
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </InnerAppLayout>
    );
}
