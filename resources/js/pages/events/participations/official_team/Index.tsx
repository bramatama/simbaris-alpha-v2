import { Head, usePage } from '@inertiajs/react';
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
import { PageProps } from '@inertiajs/core';
import { Search, Star, Users } from 'lucide-react';
import { ParticipationTable } from '@/components/participation_table/participation_table';

export default function OfficialTeamParticipationIndex({
    event,
    participations,
    myOfficialTeamId,
}: {
    event: any;
    participations: any[];
    myOfficialTeamId: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('all');

    // 1. Pisahkan data sejak awal (Tim Saya vs Tim Lain)
    const myParticipations = participations.filter(
        (p) => p.official_team_id === myOfficialTeamId,
    );
    const otherParticipations = participations.filter(
        (p) => p.official_team_id !== myOfficialTeamId,
    );

    // 2. Ambil jenjang unik hanya dari data peserta lain untuk keperluan filter
    const uniqueLevels = Array.from(
        new Set(
            otherParticipations.map((p) => p.event_level?.level?.level_name),
        ),
    ).filter(Boolean);

    // 3. Terapkan pencarian dan filter HANYA pada tabel peserta lain
    const otherParticipationsFiltered = otherParticipations.filter((p) => {
        const matchSearch = p.team_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchLevel =
            filterLevel === 'all' ||
            p.event_level?.level?.level_name === filterLevel;
        return matchSearch && matchLevel;
    });

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Daftar Peserta - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
                {/* Header Judul Halaman */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Peserta Terdaftar
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Pantau pendaftaran tim Anda dan lihat daftar peserta
                            lain pada <strong>{event.event_name}</strong>.
                        </p>
                    </div>
                </div>

                {/* TABEL 1: PENDAFTARAN SAYA */}
                <Card className="overflow-hidden border-primary/30 shadow-sm">
                    <CardHeader className="border-b border-primary/10 bg-primary/5 px-5 py-4">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg text-primary">
                                <Star className="h-5 w-5" /> Pendaftaran Tim
                                Anda
                            </CardTitle>
                            <CardDescription className="text-primary/70">
                                Kelola pendaftaran, dokumen persyaratan, dan
                                pantau status verifikasi tim Anda.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Komponen Tabel Digunakan Ulang */}
                        <ParticipationTable
                            participations={myParticipations}
                            userRole={userRole}
                            myOfficialTeamId={myOfficialTeamId}
                        />
                    </CardContent>
                </Card>

                {/* TABEL 2: PESERTA LAINNYA */}
                <Card className="overflow-hidden border-border/50 shadow-sm">
                    <CardHeader className="flex flex-col justify-between gap-4 border-b border-border/50 bg-muted/10 px-5 py-4 lg:flex-row lg:items-center">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5 text-muted-foreground" />{' '}
                                Peserta Lainnya
                            </CardTitle>
                            <CardDescription>
                                Daftar tim dari pangkalan atau sekolah lain
                                (Privasi kontak terjaga).
                            </CardDescription>
                        </div>

                        {/* Area Filter & Search */}
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                            <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
                                <Badge
                                    variant={
                                        filterLevel === 'all'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`cursor-pointer rounded-md px-3 py-1 transition-colors ${filterLevel === 'all' ? '' : 'hover:bg-muted/50'}`}
                                    onClick={() => setFilterLevel('all')}
                                >
                                    Semua Jenjang
                                </Badge>
                                {uniqueLevels.map((level: any) => (
                                    <Badge
                                        key={level}
                                        variant={
                                            filterLevel === level
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className={`cursor-pointer rounded-md px-3 py-1 transition-colors ${filterLevel === level ? '' : 'hover:bg-muted/50'}`}
                                        onClick={() => setFilterLevel(level)}
                                    >
                                        {level}
                                    </Badge>
                                ))}
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari nama tim kompetitor..."
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Komponen Tabel Digunakan Ulang */}
                        <ParticipationTable
                            participations={otherParticipationsFiltered}
                            userRole={userRole}
                            myOfficialTeamId={myOfficialTeamId}
                        />
                    </CardContent>
                </Card>
            </div>
        </InnerAppLayout>
    );
}
