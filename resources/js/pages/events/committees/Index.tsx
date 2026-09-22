import { Head, router, Link, usePage } from '@inertiajs/react';
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
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { ArrowLeft } from 'lucide-react';
import CommitteeTable from '@/components/committee_table/committee_table';
import AddCommitteeDialog from '@/components/dialogs/add-committee-dialog';
import { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function CommitteeIndex({
    event,
    existingCommittees = [],
}: {
    event: any;
    existingCommittees: any[];
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(
            `/${userRole}/events/${event.public_id}/committees/${deleteId}`,
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
            <Head title={`Committees - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Committee Roster
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage the team organizing{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>

                    {/* Komponen Form Dialog Dipanggil di Sini */}
                    <AddCommitteeDialog
                        eventPublicId={event.public_id}
                        existingCommittees={existingCommittees}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Assigned Personnel (
                            {event.event_committees?.length || 0})
                        </CardTitle>
                        <CardDescription>
                            All members listed below have access to the
                            committee dashboard for this event.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6">
                        {/* Komponen Tabel Dipanggil di Sini */}
                        <CommitteeTable
                            committees={event.event_committees}
                            onDeleteClick={(id) => setDeleteId(id)}
                        />
                    </CardContent>
                </Card>

                {/* Dialog Konfirmasi Hapus Panitia Tetap di Level Halaman Utama */}
                <ConfirmationDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    variant="destructive"
                    title="Remove Committee Member?"
                    description="This will revoke their access to manage this event. Their actual account will not be deleted."
                    onConfirm={confirmDelete}
                    isProcessing={isDeleting}
                    confirmText="Yes, Remove"
                />
            </div>
        </InnerAppLayout>
    );
}
