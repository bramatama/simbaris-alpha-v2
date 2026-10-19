import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { ArrowLeft } from 'lucide-react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import JudgeTable from '@/components/tables/judge_table/judge_table';
import AddJudgeDialog from '@/components/dialogs/add-judge-dialog';
import type { PageProps } from '@inertiajs/core';
import type { Auth } from '@/types';

type Expertise = {
    scoring_category_id: number;
    event_level_id: number;
    level_name: string;
    category_name: string;
};

type Judge = {
    judge_id: number;
    user?: {
        name: string;
        email: string;
    };
};

type JudgeExpertise = {
    judge_expertise_id: number;
    scoring_category_id?: number;
    event_level_id?: number;
    level_name?: string;
    category_name?: string;
};

type EventJudge = {
    event_judge_id: number;
    judge?: {
        judge_id: number;
        user?: {
            name: string;
            email: string;
        };
    };
    expertises?: Expertise[];
    judge_expertises?: JudgeExpertise[];
};

type Event = {
    public_id: string;
    event_name: string;
    event_judges?: EventJudge[];
};

type JudgeIndexProps = {
    event: Event;
    existingJudges: Judge[];
    expertises: Expertise[];
};

export default function JudgeIndex({
    event,
    existingJudges = [],
    expertises = [],
}: JudgeIndexProps) {
    const { auth } = usePage<PageProps & { auth: Auth }>().props;
    const userRole = auth.user.role;

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        if (deleteId === null) return;
        setIsDeleting(true);
        router.delete(
            `/${userRole}/events/${event.public_id}/judges/${deleteId}`,
            {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
                onFinish: () => setIsDeleting(false),
            },
        );
    };

    // Ringkasan kategori di halaman utama dikelompokkan berdasarkan Kategori (Expertise)
    const expertisesByCategory = expertises.reduce<Record<string, Expertise[]>>(
        (groups, expertise) => {
            const catName = expertise.category_name || 'Kategori lainnya';
            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(expertise);
            return groups;
        },
        {},
    );

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Daftar Juri - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke
                            Dasbor Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Manajemen Juri
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Kelola penugasan juri dan kategori penilaian untuk{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>

                    <AddJudgeDialog
                        eventPublicId={event.public_id}
                        userRole={userRole}
                        existingJudges={existingJudges}
                        expertises={expertises}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Juri yang Bertugas (
                            {event.event_judges?.length ?? 0})
                        </CardTitle>
                        <CardDescription>
                            Daftar juri yang ditugaskan ke acara ini beserta
                            keahlian kategorinya pada masing-masing jenjang
                            perlombaan.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 px-6">
                        {Object.keys(expertisesByCategory).length > 0 && (
                            <div className="space-y-3 rounded-lg border bg-muted/10 p-4">
                                <h3 className="text-sm font-semibold">
                                    Ringkasan Kategori Penilaian Tersedia
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(expertisesByCategory).map(
                                        ([catName, levels]) => (
                                            <div
                                                key={catName}
                                                className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 shadow-sm"
                                            >
                                                <span className="text-sm font-bold text-foreground">
                                                    {catName}
                                                </span>
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                                    {levels.length} Jenjang
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            {/* Pass allExpertises ke JudgeTable agar fitur 'Semua Jenjang' berfungsi */}
                            <JudgeTable
                                judges={event.event_judges || []}
                                onDeleteClick={(id) => setDeleteId(id)}
                                eventPublicId={event.public_id}
                                userRole={userRole}
                                allExpertises={expertises}
                            />
                        </div>
                    </CardContent>
                </Card>

                <ConfirmationDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    variant="destructive"
                    title="Berhentikan Juri?"
                    description="Akses juri untuk menilai event ini akan dicabut. Akun dan data juri itu sendiri tidak akan terhapus dari sistem."
                    onConfirm={confirmDelete}
                    isProcessing={isDeleting}
                    confirmText="Ya, Berhentikan"
                />
            </div>
        </InnerAppLayout>
    );
}
