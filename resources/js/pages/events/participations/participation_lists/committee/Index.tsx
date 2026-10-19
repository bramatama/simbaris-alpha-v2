import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageProps } from '@inertiajs/core';
import {
    Search,
    Users,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Filter,
} from 'lucide-react';
import { ParticipationTable } from '@/components/tables/participation_table/participation_table';

export default function CommitteeParticipationIndex({
    event,
    participations,
}: {
    event: any;
    participations: any[];
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Statistik Cepat
    const totalPending = participations.filter(
        (p) => p.status === 'pending',
    ).length;
    const totalApproved = participations.filter(
        (p) => p.status === 'approved',
    ).length;

    // Filter Data
    const filteredData = participations.filter((p) => {
        const matchSearch =
            p.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.pic_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Daftar Pendaftar - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Dasbor
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Manajemen Peserta
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground md:text-base">
                            Verifikasi pembayaran dan dokumen pendaftaran untuk{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>
                </div>

                {/* Statistik Cepat (Lebih Kompak) */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    <Card className="col-span-2 border-border/50 bg-muted/10 shadow-sm md:col-span-1">
                        <CardContent className="flex items-center gap-3 p-3.5">
                            <div className="shrink-0 rounded-md bg-primary/10 p-2.5 text-primary">
                                <Users className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                    Total Pendaftar
                                </p>
                                <p className="mt-0.5 text-lg leading-none font-bold md:text-xl">
                                    {participations.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-orange-500/5 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-3.5">
                            <div className="shrink-0 rounded-md bg-orange-500/10 p-2.5 text-orange-600">
                                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold tracking-wider text-orange-600/80 uppercase">
                                    Menunggu
                                </p>
                                <p className="mt-0.5 text-lg leading-none font-bold text-orange-600 md:text-xl">
                                    {totalPending}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-500/10 bg-emerald-500/5 shadow-sm">
                        <CardContent className="flex items-center gap-3 p-3.5">
                            <div className="shrink-0 rounded-md bg-emerald-500/10 p-2.5 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold tracking-wider text-emerald-600/80 uppercase">
                                    Disetujui
                                </p>
                                <p className="mt-0.5 text-lg leading-none font-bold text-emerald-600 md:text-xl">
                                    {totalApproved}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Card */}
                <Card className="overflow-hidden border-border/50 shadow-sm">
                    {/* Header Filter dengan Select Dropdown */}
                    <CardHeader className="flex flex-col gap-3 border-b border-border/50 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                            <div className="relative w-full sm:w-40">
                                <Filter className="pointer-events-none absolute top-2.5 left-2.5 z-10 h-4 w-4 text-muted-foreground" />
                                <Select
                                    value={filterStatus}
                                    onValueChange={setFilterStatus}
                                >
                                    <SelectTrigger className="h-9 w-full bg-background pl-8 shadow-sm">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Status
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Menunggu
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Disetujui
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Ditolak
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative w-full sm:w-55 md:w-64">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari tim atau PIC..."
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardHeader>

                    {/* Konten Tabel Pendaftar */}
                    <CardContent className="p-4 md:p-0">
                        <ParticipationTable
                            participations={filteredData}
                            userRole={userRole}
                        />
                    </CardContent>
                </Card>
            </div>
        </InnerAppLayout>
    );
}
