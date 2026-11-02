import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { PageProps } from '@inertiajs/core';
import { Search, Star } from 'lucide-react';
import { ParticipationTable } from '@/components/tables/participation_table/participation_table';
import { LevelDropdownFilter } from '@/components/level-dropdown-filter';
import AppLayout from '@/layouts/app-layout';

// 1. TAMBAHKAN INTERFACE EVENT DISINI
interface Participation {
    event_level_id: number;
    team_name: string;
    event?: {
        public_id: string;
        event_name: string;
    };
    event_level?: {
        event_level_id: number;
        level?: {
            level_name: string;
        };
    };
    [key: string]: any;
}

interface EventLevel {
    event_level_id: number;
    level: {
        level_name: string;
    };
}

interface MyParticipationsProps {
    participations: Participation[];
    myOfficialTeamId: string;
}

export default function MyParticipations({
    participations,
    myOfficialTeamId,
}: MyParticipationsProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

    const eventLevels = useMemo<EventLevel[]>(() => {
        const uniqueLevels = new Map<number, EventLevel>();

        participations.forEach((participation) => {
            const eventLevel = participation.event_level;

            if (eventLevel?.event_level_id && eventLevel.level?.level_name) {
                uniqueLevels.set(eventLevel.event_level_id, {
                    event_level_id: eventLevel.event_level_id,
                    level: {
                        level_name: eventLevel.level.level_name,
                    },
                });
            }
        });

        return Array.from(uniqueLevels.values());
    }, [participations]);

    const handleLevelChange = (levelIdStr: string) => {
        setActiveLevelId(levelIdStr ? Number(levelIdStr) : null);
    };

    const filteredParticipations = useMemo(() => {
        return participations.filter((participation) => {
            const matchSearch = participation.team_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            const matchLevel =
                activeLevelId === null ||
                participation.event_level?.event_level_id === activeLevelId;

            return matchSearch && matchLevel;
        });
    }, [participations, searchTerm, activeLevelId]);

    return (
        <AppLayout>
            <Head title="Pendaftaran Saya" />

            <div className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            Pendaftaran Saya
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground md:text-base">
                            Pantau dan kelola seluruh pendaftaran tim Anda pada
                            berbagai event kompetisi.
                        </p>
                    </div>
                </div>

                <Card className="overflow-hidden border-primary/30 shadow-sm">
                    <CardHeader className="flex flex-col justify-between gap-4 border-b border-primary/10 bg-primary/5 px-4 py-4 md:px-5 lg:flex-row lg:items-center">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="flex items-center gap-2 text-base text-primary md:text-lg">
                                <Star className="h-5 w-5 shrink-0" />
                                Tim Anda
                            </CardTitle>
                            <CardDescription className="text-xs text-primary/70 md:text-sm">
                                Kelola dokumen persyaratan dan pantau status
                                verifikasi seluruh tim.
                            </CardDescription>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                            <LevelDropdownFilter
                                eventLevels={eventLevels}
                                activeLevelId={activeLevelId}
                                onLevelChange={handleLevelChange}
                                placeholder="Semua Jenjang"
                                className="w-full sm:w-48"
                            />

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

                    <CardContent className="p-4 md:p-0">
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
