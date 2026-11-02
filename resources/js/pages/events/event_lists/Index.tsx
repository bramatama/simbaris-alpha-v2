import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import LandingPageLayout from '@/layouts/landing-page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    Clock,
    CalendarX,
    RotateCcw,
} from 'lucide-react';
import EventCard, { EventData } from '@/components/event-card';
import type { PageProps } from '@inertiajs/core';

export default function EventIndex({ events = [] }: { events: EventData[] }) {
    const { auth } = usePage<PageProps>().props;

    // Periksa apakah auth.user ada, jika tidak, maka tamu (guest)
    const userRole = auth?.user?.role || null;
    const isGuest = !userRole;

    // State Filter & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    // Filter & Sort Logic
    const filteredEvents = useMemo(() => {
        return events
            .filter((event) => {
                // Search Keyword Filter
                const matchesSearch =
                    event.event_name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (event.location &&
                        event.location
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()));

                // Status Filter
                const matchesStatus =
                    statusFilter === 'all' || event.status === statusFilter;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return (
                        new Date(b.start_time).getTime() -
                        new Date(a.start_time).getTime()
                    );
                }
                if (sortBy === 'oldest') {
                    return (
                        new Date(a.start_time).getTime() -
                        new Date(b.start_time).getTime()
                    );
                }
                if (sortBy === 'name') {
                    return a.event_name.localeCompare(b.event_name);
                }
                return 0; // Default order dari controller
            });
    }, [events, searchQuery, statusFilter, sortBy]);

    const pageContent = (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        Event
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Temukan berbagai event dan kompetisi Paskibra dari
                        seluruh Indonesia
                    </p>
                </div>
                {userRole === 'admin' && (
                    <Link href={`/${userRole}/events/create`}>
                        <Button className="gap-2 shadow-sm">
                            <Plus className="h-4 w-4" />
                            Buat Event Baru
                        </Button>
                    </Link>
                )}
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
                    {/* Search */}
                    <div className="relative col-span-2 md:col-span-6 lg:col-span-7">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            type="text"
                            placeholder="Cari nama event atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 border-border/70 bg-background pr-9 pl-9 text-sm shadow-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Hapus pencarian"
                            >
                                <span className="text-lg leading-none">
                                    &times;
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Filter Status */}
                    <div className="col-span-1 md:col-span-3 lg:col-span-3">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="h-10 w-full border-border/70 bg-background text-sm shadow-none focus:ring-2 focus:ring-primary/15">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <SelectValue placeholder="Semua Status" />
                                </div>
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="registration_open">
                                    Pendaftaran Dibuka
                                </SelectItem>
                                <SelectItem value="active">
                                    Berlangsung / Aktif
                                </SelectItem>
                                <SelectItem value="finished">
                                    Selesai
                                </SelectItem>
                                {userRole === 'admin' && (
                                    <SelectItem value="draft">Draft</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort */}
                    <div className="col-span-1 md:col-span-3 lg:col-span-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-10 w-full border-border/70 bg-background text-sm shadow-none focus:ring-2 focus:ring-primary/15">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <SelectValue placeholder="Urutkan" />
                                </div>
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="newest">Terbaru</SelectItem>
                                <SelectItem value="oldest">Terlama</SelectItem>
                                <SelectItem value="name">Nama (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filter Information */}
                {(searchQuery ||
                    statusFilter !== 'all' ||
                    sortBy !== 'default') && (
                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan{' '}
                            <span className="font-semibold text-foreground">
                                {filteredEvents.length}
                            </span>{' '}
                            event
                        </p>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setSortBy('default');
                            }}
                            className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                )}
            </div>

            {/* Grid Cards Section */}
            {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 py-16 text-center">
                    <CalendarX className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="text-base font-bold text-foreground">
                        Event Tidak Ditemukan
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Coba ubah kata kunci pencarian atau filter status acara
                        Anda.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {filteredEvents.map((event) => (
                        <Link
                            key={event.event_id}
                            href={
                                isGuest
                                    ? `/events/${event.public_id}/information`
                                    : `/${userRole}/events/${event.public_id}/information`
                            }
                            className="block h-full w-full rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <EventCard event={event} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return isGuest ? (
        <LandingPageLayout>
            <Head title="Events" />
            {pageContent}
        </LandingPageLayout>
    ) : (
        <AppLayout>
            <Head title="Events" />
            {pageContent}
        </AppLayout>
    );
}
