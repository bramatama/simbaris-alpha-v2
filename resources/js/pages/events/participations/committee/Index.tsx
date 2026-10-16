import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageProps } from '@inertiajs/core';
import { formatDate } from '@/config/date_datetime';
import {
    Search,
    Users,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Edit3,
    ShieldAlert,
    ArrowLeft,
} from 'lucide-react';
import { ParticipationTable } from '@/components/participation_table/participation_table';

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
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Manajemen Peserta
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Verifikasi pembayaran dan dokumen pendaftaran untuk{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-border/50 bg-muted/10 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="shrink-0 rounded-full bg-primary/10 p-3 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total Pendaftar
                                </p>
                                <p className="text-2xl font-bold">
                                    {participations.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-orange-500/5 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="shrink-0 rounded-full bg-orange-500/10 p-3 text-orange-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-orange-600/80">
                                    Menunggu Verifikasi
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {totalPending}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-500/10 bg-emerald-500/5 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="shrink-0 rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-emerald-600/80">
                                    Peserta Resmi
                                </p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {totalApproved}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border-border/50 shadow-sm">
                    <CardHeader className="flex flex-col justify-between gap-4 border-b border-border/50 bg-muted/10 px-5 py-4 sm:flex-row sm:items-center">
                        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
                            {['all', 'pending', 'approved', 'rejected'].map(
                                (status) => (
                                    <Badge
                                        key={status}
                                        variant={
                                            filterStatus === status
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={`cursor-pointer rounded-md px-3 py-1 transition-colors ${filterStatus === status ? '' : 'hover:bg-muted/50'}`}
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status === 'all'
                                            ? 'Semua Data'
                                            : status === 'pending'
                                              ? 'Menunggu'
                                              : status === 'approved'
                                                ? 'Disetujui'
                                                : 'Ditolak'}
                                    </Badge>
                                ),
                            )}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama tim / PIC..."
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* KOMPONEN TABEL REUSABLE SHADCN */}
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
