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
import CommitteeTable from '@/components/tables/committee_table/committee_table';
import AddCommitteeDialog from '@/components/dialogs/committees/add-committee-dialog';
import type { PageProps } from '@inertiajs/core';

export default function CommitteeIndex({
    event,
    currentUserCommittee,
    existingCommittees = [],
}: {
    event: any;
    currentUserCommittee: any;
    existingCommittees: any[];
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;
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
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Daftar Panitia - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke
                            Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Daftar Panitia
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Kelola tim penyelenggara{' '}
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
                            Panitia yang Ditugaskan (
                            {event.event_committees?.length || 0})
                        </CardTitle>
                        <CardDescription>
                            Seluruh anggota yang tercantum di bawah ini memiliki
                            akses ke dasbor kepanitiaan untuk event ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6">
                        {/* Komponen Tabel Dipanggil di Sini */}
                        <CommitteeTable
                            committees={event.event_committees}
                            currentUserCommittee={currentUserCommittee}
                            onDeleteClick={(id) => setDeleteId(id)}
                        />
                    </CardContent>
                </Card>

                {/* Dialog Konfirmasi Penghapusan Panitia Tetap di Level Halaman Utama */}
                <ConfirmationDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    variant="destructive"
                    title="Hapus Anggota Panitia?"
                    description="Tindakan ini akan mencabut akses anggota tersebut untuk mengelola event ini. Akun mereka tidak akan dihapus."
                    onConfirm={confirmDelete}
                    isProcessing={isDeleting}
                    confirmText="Ya, Hapus"
                />
            </div>
        </InnerAppLayout>
    );
}
