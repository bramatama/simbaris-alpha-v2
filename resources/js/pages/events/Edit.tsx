import { useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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
import { Calendar, UserCheck, ImagePlus, UploadCloud } from 'lucide-react';
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
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Auth } from '@/types';

const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    return localISOTime;
};

type PageProps = {
    auth: Auth;
};

export default function EventEdit({ event }: { event: any }) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // State preview gambar
    const [posterPreview, setPosterPreview] = useState<string | null>(
        event.poster_path ? `/storage/${event.poster_path}` : null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Hook
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        event_name: event.event_name || '',
        description: event.description || '',
        location: event.location || '',
        status: event.status || 'draft',
        registration_start_time: formatDateTime(event.registration_start_time),
        registration_end_time: formatDateTime(event.registration_end_time),
        start_time: formatDateTime(event.start_time),
        end_time: formatDateTime(event.end_time),
        poster: null as File | null,
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

    // Handler Perubahan Gambar
    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('poster', file);

            if (posterPreview && posterPreview.startsWith('blob:')) {
                URL.revokeObjectURL(posterPreview);
            }
            setPosterPreview(URL.createObjectURL(file));
        }
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
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                        {/* BAGIAN KIRI: UPLOAD POSTER */}
                                        <div className="flex flex-col items-center border-b border-border/50 pb-6 md:col-span-5 md:items-start md:border-r md:border-b-0 md:pr-6 md:pb-0 lg:col-span-4">
                                            <Label
                                                requirement="optional"
                                                className="mb-3 text-base"
                                            >
                                                Event Poster
                                            </Label>

                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handlePosterChange}
                                                accept="image/*"
                                            />

                                            <div className="flex w-full flex-col items-center space-y-4">
                                                {posterPreview ? (
                                                    <div className="aspect-3/4 w-full max-w-60 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                                        <img
                                                            src={posterPreview}
                                                            alt="Poster Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex aspect-3/4 w-full max-w-60 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                                                        <ImagePlus className="mb-3 h-12 w-12 opacity-40" />
                                                        <span className="text-sm font-medium">
                                                            Belum ada poster
                                                        </span>
                                                    </div>
                                                )}

                                                <Button
                                                    type="button"
                                                    variant={
                                                        posterPreview
                                                            ? 'outline'
                                                            : 'default'
                                                    }
                                                    className="w-full max-w-60 gap-2"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >
                                                    <UploadCloud className="h-4 w-4" />
                                                    {posterPreview
                                                        ? 'Ganti Poster Baru'
                                                        : 'Upload Poster'}
                                                </Button>

                                                <div className="text-center text-xs leading-relaxed text-muted-foreground">
                                                    <p>
                                                        Format file: JPG, JPEG,
                                                        PNG.
                                                    </p>
                                                    <p>
                                                        Rasio direkomendasikan
                                                        3:4 (Portrait).
                                                    </p>
                                                </div>
                                                <InputError
                                                    message={
                                                        errors.poster as string
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* BAGIAN KANAN: INPUT TEKS */}
                                        <div className="space-y-5 md:col-span-7 lg:col-span-8">
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

                                            <div className="grid gap-2 pt-1">
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
                                                    rows={5}
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
                                <Button
                                    variant="outline"
                                    className="w-full text-xs"
                                    disabled
                                >
                                    Manage Committees
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </InnerAppLayout>
    );
}
