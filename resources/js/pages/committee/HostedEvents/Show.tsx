import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    MapPin,
    Users,
    Scale,
    ShieldCheck,
    Settings,
    ArrowLeft,
    Trophy,
    FileText,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

export default function EventShow({ event }: { event: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hosted Events', href: '/my-events' },
        {
            title: event.event_name,
            href: `/committee/events/${event.public_id}/information`,
        },
        { title: 'Event Details', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Link
                            href="/events"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to List
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {event.event_name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {event.location}
                            </span>
                            <Badge variant="outline" className="capitalize">
                                {event.status.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/committee/events/${event.public_id}/edit`}>
                            <Button variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" /> Edit Event
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Participants
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {event.participations_count || 0} Tim
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-blue-500/10 p-3 text-blue-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Committees
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {event.event_committees_count || 0} Orang
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-600">
                                <Scale className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Judges
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {event.event_judges_count || 0} Orang
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-amber-500/10 p-3 text-amber-600">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Event Date
                                </p>
                                <h3 className="text-lg font-bold">
                                    {new Date(
                                        event.start_time,
                                    ).toLocaleDateString()}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left: Management Links */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Management</CardTitle>
                            <CardDescription>
                                Shortcut to manage event resources.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link
                                href={`/committee/events/${event.public_id}/committees`}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                >
                                    <ShieldCheck className="h-4 w-4" /> Manage
                                    Committees
                                </Button>
                            </Link>
                            <Link
                                href={`/committee/events/${event.public_id}/judges`}
                            >
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                >
                                    <Scale className="h-4 w-4" /> Manage Judges
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                disabled
                            >
                                <FileText className="h-4 w-4" /> Export
                                Participant Data
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Right: Event Information & Timeline */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Event Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">
                                    Description
                                </h4>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {event.description ||
                                        'No description provided for this event.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                                        <Calendar className="h-4 w-4 text-primary" />{' '}
                                        Registration Period
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            event.registration_start_time,
                                        ).toLocaleString()}{' '}
                                        - <br />
                                        {new Date(
                                            event.registration_end_time,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                                        <Calendar className="h-4 w-4 text-orange-500" />{' '}
                                        Competition Dates
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            event.start_time,
                                        ).toLocaleString()}{' '}
                                        - <br />
                                        {new Date(
                                            event.end_time,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
