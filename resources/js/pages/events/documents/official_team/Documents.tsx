import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PdfViewerDialog } from '@/components/dialogs/pdf-viewer-dialog';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    UploadCloud,
    FileText,
    Eye,
    FileCode2,
    X,
    Trash2
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

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

    const documentInputRef = useRef<HTMLInputElement>(null);
    const formDoc = useForm({
        documents: [] as File[],
    });

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            formDoc.setData('documents', [
                ...formDoc.data.documents,
                ...newFiles,
            ]);
        }
        if (documentInputRef.current) documentInputRef.current.value = '';
        formDoc.clearErrors();
    };

    const removeStagedDocument = (indexToRemove: number) => {
        formDoc.setData(
            'documents',
            formDoc.data.documents.filter(
                (_, index) => index !== indexToRemove,
            ),
        );
    };

    const submitDocuments = (e: React.FormEvent) => {
        e.preventDefault();
        formDoc.clearErrors();

        const oversizedFiles = formDoc.data.documents.filter(
            (file) => file.size > 5 * 1024 * 1024,
        );
        const unsupportedFiles = formDoc.data.documents.filter(
            (file) => file.type !== 'application/pdf',
        );

        if (unsupportedFiles.length > 0 || oversizedFiles.length > 0) {
            const errorObject: Record<string, string> = {};
            unsupportedFiles.forEach(
                (file, idx) =>
                    (errorObject[`documents.${idx}`] =
                        `File "${file.name}" bukan PDF.`),
            );
            oversizedFiles.forEach(
                (file, idx) =>
                    (errorObject[`documents.${idx}`] =
                        `File "${file.name}" melebihi 5MB.`),
            );
            formDoc.setError(errorObject);
            return;
        }

        formDoc.post(
            `/${userRole}/participations/${participation.public_id}/documents`,
            {
                preserveScroll: true,
                onSuccess: () => formDoc.reset('documents'),
            },
        );
    };

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
            sidebarNavItems={getEventInnerNav(
                participation.event.public_id,
                userRole,
            )}
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
                    {/* List Dokumen Terunggah (Lebar 7/12) */}
                    <div className="space-y-6 lg:col-span-7">
                        <Card className="border-border/50 shadow-sm">
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

                    {/* Form Tambah Dokumen Baru (Lebar 5/12) */}
                    <div className="space-y-6 lg:col-span-5">
                        <form onSubmit={submitDocuments}>
                            <Card className="border-dashed border-primary/20 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-primary/5 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base text-primary">
                                        <UploadCloud className="h-4 w-4" />{' '}
                                        Unggah Dokumen
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Hanya menerima format PDF (Maks. 5MB).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5">
                                    <input
                                        type="file"
                                        multiple
                                        accept="application/pdf"
                                        className="hidden"
                                        ref={documentInputRef}
                                        onChange={handleDocumentChange}
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() =>
                                            documentInputRef.current?.click()
                                        }
                                    >
                                        Pilih File PDF...
                                    </Button>

                                    {formDoc.data.documents.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <h4 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Antrean Unggahan
                                            </h4>
                                            <div className="flex flex-col gap-2">
                                                {formDoc.data.documents.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded-md border border-border/60 bg-card p-2 shadow-sm"
                                                        >
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FileCode2 className="h-4 w-4 shrink-0 text-red-500" />
                                                                <span className="truncate text-xs font-medium">
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                                                                onClick={() =>
                                                                    removeStagedDocument(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(formDoc.errors).length > 0 && (
                                        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                            <ul className="list-disc space-y-1 pl-4">
                                                {Object.values(
                                                    formDoc.errors,
                                                ).map((err, i) => (
                                                    <li key={i}>
                                                        {err as string}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="border-t border-border/50 bg-primary/5 p-4">
                                    <Button
                                        type="submit"
                                        disabled={
                                            formDoc.data.documents.length ===
                                                0 || formDoc.processing
                                        }
                                        className="w-full gap-2"
                                    >
                                        {formDoc.processing ? (
                                            <Spinner className="h-4 w-4" />
                                        ) : (
                                            <UploadCloud className="h-4 w-4" />
                                        )}
                                        Mulai Unggah
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>
                </div>

                <PdfViewerDialog
                    document={viewDocument}
                    onClose={() => setViewDocument(null)}
                />

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
            </div>
        </InnerAppLayout>
    );
}
