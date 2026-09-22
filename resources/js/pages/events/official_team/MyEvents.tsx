import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import EventCard, { EventData } from '@/components/event-card';
import { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function EventIndex({ events }: { events: EventData[] }) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    return (
        <AppLayout>
            <Head title="Event Management" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
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
                    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 py-20 text-center">
                        <p className="text-muted-foreground">
                            No events found.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.map((event) => (
                            <Link
                                key={event.event_id}
                                href={`/${userRole}/events/${event.public_id}/information`}
                                className="block h-full rounded-(--radius) focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <EventCard event={event} />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
