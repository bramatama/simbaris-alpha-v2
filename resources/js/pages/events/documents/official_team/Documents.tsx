import { Head, Link, usePage, router } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PdfViewerDialog } from '@/components/dialogs/pdf-viewer-dialog';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, FileText, Eye, FileCode2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { FileUploader } from '@/components/ui/file-uploader'; // <-- Import komponen uploader

export default function OfficialTeamParticipationDocuments({
    participation,
}: {
    participation: any;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const [viewDocument, setViewDocument] = useState<{
        name: string;
        url: string;
    } | null>(null);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fungsi konfirmasi hapus dokumen
    const confirmDelete = () => {
        if (deleteId === null) return;
        setIsDeleting(true);

        router.delete(
            `/${userRole}/participations/${participation.public_id}/documents/${deleteId}`,
            {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
                onFinish: () => setIsDeleting(false),
            },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getParticipationInnerNav(participation.public_id)}
        >
            <Head title={`Dokumen Tim - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/participations/${participation.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Detail
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Manajemen Dokumen
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Kelola berkas persyaratan lomba untuk tim{' '}
                            <strong>{participation.team_name}</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* KOLOM KIRI: Form Tambah Dokumen Baru (Lebar 5/12) */}
                    <div className="space-y-6 lg:col-span-5">
                        <Card className="h-full border-dashed border-primary/20 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-primary/5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base text-primary">
                                    Unggah Dokumen
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Hanya menerima format PDF (Maks. 5MB per
                                    file). Anda dapat memilih beberapa file
                                    sekaligus.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5">
                                {/* PENGGUNAAN FILE UPLOADER DENGAN SKENARIO LANGSUNG */}
                                <FileUploader
                                    variant="document"
                                    multiple={true}
                                    maxSizeMB={5}
                                    endpoint={`/${userRole}/participations/${participation.public_id}/documents`}
                                    onUploadSuccess={(fileId, path) => {
                                        router.reload({
                                            only: ['participation'],
                                        });
                                    }}
                                    onRemove={(fileId) => {
                                        // Opsional: Karena upload ini instan, menghapus item dari antrean UI
                                        // tidak benar-benar menghapusnya dari database. Pengguna harus menghapusnya
                                        // dari daftar tabel dokumen di sebelah kanan jika ingin membatalkan.
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* KOLOM KANAN: List Dokumen Terunggah (Lebar 7/12) */}
                    <div className="space-y-6 lg:col-span-7">
                        <Card className="h-full border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10 px-5 py-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4 text-muted-foreground" />{' '}
                                    Berkas Tersimpan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {participation.participation_documents &&
                                participation.participation_documents.length >
                                    0 ? (
                                    <div className="divide-y divide-border/50">
                                        {participation.participation_documents.map(
                                            (doc: any) => (
                                                <div
                                                    key={doc.document_id}
                                                    className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/10"
                                                >
                                                    <div className="shrink-0 rounded-md bg-red-500/10 p-2">
                                                        <FileText className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className="truncate text-sm font-semibold"
                                                            title={
                                                                doc.document_name
                                                            }
                                                        >
                                                            {doc.document_name}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() =>
                                                            setViewDocument({
                                                                name: doc.document_name,
                                                                url: `/storage/${doc.document_path}`,
                                                            })
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            setDeleteId(
                                                                doc.document_id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <FileCode2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-sm font-medium text-foreground">
                                            Belum ada dokumen
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Silakan unggah dokumen persyaratan
                                            di panel samping.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Dialog Konfirmasi Hapus */}
                <ConfirmationDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    variant="destructive"
                    title="Hapus Dokumen?"
                    description="Dokumen ini akan dihapus secara permanen dari server dan panitia tidak akan bisa memverifikasinya lagi."
                    onConfirm={confirmDelete}
                    isProcessing={isDeleting}
                    confirmText="Ya, Hapus Dokumen"
                />

                <PdfViewerDialog
                    document={viewDocument}
                    onClose={() => setViewDocument(null)}
                />
            </div>
        </InnerAppLayout>
    );
}
