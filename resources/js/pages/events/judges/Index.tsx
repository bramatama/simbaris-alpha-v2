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
import { Auth } from '@/types';
import InnerAppLayout from '@/layouts/app/inner-app-layout';

import JudgeTable from '@/components/judge_table/judge_table';
import AddJudgeDialog from '@/components/dialogs/add-judge-dialog';
import type { PageProps } from '@inertiajs/core';


type Expertise = {
    expertise_id: number;
    expertise_name: string;
};

type Judge = {
    judge_id: number;
    user?: {
        name: string;
        email: string;
    };
};

type EventJudge = {
    event_judge_id: number;
    judge?: {
        user?: {
            name: string;
            email: string;
        };
    };
    judge_expertises?: {
        judge_expertise_id: number;
        expertise?: Expertise;
    }[];
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
    const { auth } = usePage<PageProps>().props;
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

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Judges - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Event
                        </Link>

                        <h1 className="text-3xl font-bold tracking-tight">
                            Judge Roster
                        </h1>

                        <p className="mt-1 text-muted-foreground">
                            Manage the judges for{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>

                    {/* Komponen Form Dialog Penambahan Juri */}
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
                            Assigned Judges ({event.event_judges?.length ?? 0})
                        </CardTitle>
                        <CardDescription>
                            Judges assigned to this event and their areas of
                            expertise.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6">
                        {/* Komponen Tabel Juri */}
                        <JudgeTable
                            judges={event.event_judges || []}
                            onDeleteClick={(id) => setDeleteId(id)}
                        />
                    </CardContent>
                </Card>

                {/* Dialog Konfirmasi Hapus Juri Tetap di Level Index */}
                <ConfirmationDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    variant="destructive"
                    title="Remove Judge?"
                    description="This will revoke the judge's access to this event. Their account will not be deleted."
                    onConfirm={confirmDelete}
                    isProcessing={isDeleting}
                    confirmText="Yes, Remove"
                />
            </div>
        </InnerAppLayout>
    );
}
