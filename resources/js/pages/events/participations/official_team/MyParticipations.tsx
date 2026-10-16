import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageProps } from '@inertiajs/core';
import { Search, Star } from 'lucide-react';
import { ParticipationTable } from '@/components/participation_table/participation_table';
import AppLayout from '@/layouts/app-layout';

export default function MyParticipations({
    participations,
    myOfficialTeamId
}: {
    participations: any[],
    myOfficialTeamId:string;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('all');

    // 1. Ambil jenjang unik dari pendaftaran Anda sendiri
    const uniqueLevels = Array.from(
        new Set(participations.map((p) => p.event_level?.level?.level_name)),
    ).filter(Boolean);

    // 2. Terapkan filter & pencarian pada pendaftaran Anda
    const filteredParticipations = participations.filter((p) => {
        const matchSearch = p.team_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchLevel =
            filterLevel === 'all' ||
            p.event_level?.level?.level_name === filterLevel;
        return matchSearch && matchLevel;
    });

    return (
        <AppLayout>
            <Head title="Pendaftaran Saya" />

            <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
                {/* Header Judul Halaman */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Pendaftaran Saya
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Pantau dan kelola seluruh pendaftaran tim Anda pada
                            berbagai event kompetisi.
                        </p>
                    </div>
                </div>

                <Card className="overflow-hidden border-primary/30 shadow-sm">
                    <CardHeader className="flex flex-col justify-between gap-4 border-b border-primary/10 bg-primary/5 px-5 py-4 lg:flex-row lg:items-center">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg text-primary">
                                <Star className="h-5 w-5" /> Tim Anda
                            </CardTitle>
                            <CardDescription className="text-primary/70">
                                Kelola dokumen persyaratan dan pantau status
                                verifikasi seluruh tim.
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
                                    className={`cursor-pointer rounded-md px-3 py-1 transition-colors ${
                                        filterLevel === 'all'
                                            ? ''
                                            : 'border-primary/30 text-primary hover:bg-primary/20 hover:text-primary'
                                    }`}
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
                                        className={`cursor-pointer rounded-md px-3 py-1 transition-colors ${
                                            filterLevel === level
                                                ? ''
                                                : 'border-primary/30 text-primary hover:bg-primary/20 hover:text-primary'
                                        }`}
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
                                    placeholder="Cari nama tim..."
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
                            participations={filteredParticipations}
                            userRole={userRole}
                            myOfficialTeamId={myOfficialTeamId}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
