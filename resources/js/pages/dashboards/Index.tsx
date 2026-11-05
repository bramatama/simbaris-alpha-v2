import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';

import AdminDashboard from './Partials/admin';
import CommitteeDashboard from './Partials/committee';
import OfficialTeamDashboard from './Partials/official_team';
import JudgeDashboard from './Partials/judge';

export default function Dashboard({ stats }: { stats: any }) {
    const { auth } = usePage<PageProps>().props;
    const role = auth?.user?.role;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Global */}
                <div className="flex flex-col gap-1 border-b border-border/50 pb-5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Selamat datang, {auth.user.name}!
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Berikut adalah ringkasan aktivitas dan informasi terkini
                        Anda di SIMBARIS.
                    </p>
                </div>

                {/* Render dinamis berdasarkan role */}
                {role === 'admin' && <AdminDashboard stats={stats} />}
                {role === 'committee' && <CommitteeDashboard stats={stats} />}
                {role === 'official_team' && (
                    <OfficialTeamDashboard stats={stats} />
                )}
                {role === 'judge' && <JudgeDashboard stats={stats} />}
            </div>
        </AppLayout>
    );
}
