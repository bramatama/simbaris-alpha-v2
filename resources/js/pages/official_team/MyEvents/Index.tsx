import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Events', href: '/events' },
];

// Interface yang sesuai dengan model Event.php milikmu
interface EventData {
    event_id: number;
    public_id: string;
    event_name: string;
    description: string | null;
    location: string;
    status: string;
    registration_start_time: string;
    registration_end_time: string;
    start_time: string;
    end_time: string;
    participations_count?: number;
}

export default function EventIndex({ events }: { events: EventData[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registration_open':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            case 'active':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
            case 'finished':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'; // Draft
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Events
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Lists of all competition events, schedules, and
                            committees.
                        </p>
                    </div>
                </div>

                {/* Grid Cards Section */}
                {events.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed bg-muted/30 py-20 text-center">
                        <p className="text-muted-foreground">
                            No events found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                            <Card
                                key={event.event_id}
                                className="flex flex-col transition-shadow hover:shadow-md"
                            >
                                <CardHeader className="border-b pb-4">
                                    <div className="mb-2 flex items-start justify-between gap-4">
                                        <CardTitle className="line-clamp-2 text-xl leading-tight">
                                            {event.event_name}
                                        </CardTitle>
                                        <Badge
                                            variant="outline"
                                            className={`whitespace-nowrap capitalize ${getStatusColor(event.status)}`}
                                        >
                                            {event.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {event.location}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 py-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 text-sm">
                                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            <div>
                                                <span className="block font-medium">
                                                    Registration:
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {new Date(
                                                        event.registration_start_time,
                                                    ).toLocaleDateString()}{' '}
                                                    -{' '}
                                                    {new Date(
                                                        event.registration_end_time,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                            <div>
                                                <span className="block font-medium">
                                                    Event Dates:
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {new Date(
                                                        event.start_time,
                                                    ).toLocaleDateString()}{' '}
                                                    -{' '}
                                                    {new Date(
                                                        event.end_time,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between border-t bg-muted/50 py-3">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4 shrink-0" />
                                        <span>
                                            {event.participations_count || 0}{' '}
                                            Teams
                                        </span>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
