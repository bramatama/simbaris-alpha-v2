import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
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
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PdfViewerDialog } from '@/components/dialogs/pdf-viewer-dialog';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    FileText,
    Trash2,
    UploadCloud,
    X,
    Download,
    FileCode2,
    Eye,
} from 'lucide-react';
import { formatDate } from '@/config/date_datetime';

type EventDocument = {
    document_id: number;
    event_id: number;
    document_name: string;
    document_path: string;
    created_at: string;
};

type Event = {
    public_id: string;
    event_name: string;
};

type DocumentManagementProps = {
    event: Event;
    documents: EventDocument[];
};

export default function DocumentManagement({
    event,
    documents,
}: DocumentManagementProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    // State untuk form upload dokumen
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        documents: [] as File[],
    });

    // State untuk konfirmasi hapus dokumen
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [viewDocument, setViewDocument] = useState<{
        name: string;
        url: string;
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setData('documents', [...data.documents, ...newFiles]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        clearErrors();
    };

    const removeStagedFile = (indexToRemove: number) => {
        setData(
            'documents',
            data.documents.filter((_, index) => index !== indexToRemove),
        );
    };

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();

        clearErrors();

        const oversizedFiles = data.documents.filter(
            (file) => file.size > 10 * 1024 * 1024,
        );
        const unsupportedFiles = data.documents.filter(
            (file) => file.type !== 'application/pdf',
        );

        if (unsupportedFiles.length > 0) {
            const errorObject: Record<string, string> = {};

            unsupportedFiles.forEach((file, index) => {
                errorObject[`documents.${index}`] =
                    `File "${file.name}" bukan berformat PDF.`;
            });

            setError(errorObject);
            return;
        }

        if (oversizedFiles.length > 0) {
            const errorObject: Record<string, string> = {};

            oversizedFiles.forEach((file, index) => {
                errorObject[`documents.${index}`] =
                    `File "${file.name}" melebihi batas ukuran 10MB.`;
            });

            setError(errorObject);
            return;
        }

        post(`/${userRole}/events/${event.public_id}/documents`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('documents');
            },
        });
    };

    const confirmDelete = () => {
        if (deleteId === null) return;
        setIsDeleting(true);

        router.delete(
            `/${userRole}/events/${event.public_id}/documents/${deleteId}`,
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
            <Head title={`Manajemen Dokumen - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Dasbor Event
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Manajemen Dokumen Juknis
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Unggah dan kelola petunjuk teknis (Juknis) serta
                            dokumen pendukung untuk{' '}
                            <strong>{event.event_name}</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* KOLOM KIRI: Form Upload */}
                    <div className="lg:col-span-5">
                        <form onSubmit={submitUpload}>
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/30">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <UploadCloud className="h-5 w-5 text-primary" />
                                        Unggah Dokumen
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih satu atau beberapa file PDF
                                        sekaligus. Maksimal 10MB per file.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <input
                                        type="file"
                                        multiple
                                        accept="application/pdf"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />

                                    <div
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 bg-muted/20 py-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                    >
                                        <div className="mb-3 rounded-full bg-primary/10 p-3">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                            Klik untuk memilih file PDF
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Hanya file berformat .pdf
                                        </p>
                                    </div>

                                    {/* Preview Antrean Upload */}
                                    {data.documents.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Antrean Unggahan
                                            </h4>
                                            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                                                {data.documents.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded-md border border-border/60 bg-card p-2.5 shadow-sm"
                                                        >
                                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                                <FileCode2 className="h-4 w-4 shrink-0 text-red-500" />
                                                                <span className="truncate text-xs font-medium text-foreground">
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                                                                onClick={() =>
                                                                    removeStagedFile(
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

                                    {/* Pesan Error (keseluruhan / per file) */}
                                    {Object.keys(errors).length > 0 && (
                                        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                            <ul className="list-disc space-y-1 pl-4">
                                                {Object.values(errors).map(
                                                    (err, i) => (
                                                        <li key={i}>
                                                            {err as string}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="border-t border-border/50 bg-muted/10 p-4">
                                    <Button
                                        type="submit"
                                        className="w-full gap-2"
                                        disabled={
                                            data.documents.length === 0 ||
                                            processing
                                        }
                                    >
                                        {processing ? (
                                            <Spinner className="h-4 w-4" />
                                        ) : (
                                            <UploadCloud className="h-4 w-4" />
                                        )}
                                        Mulai Unggah ({data.documents.length}{' '}
                                        File)
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>

                    {/* KOLOM KANAN: Daftar Dokumen */}
                    <div className="lg:col-span-7">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10 px-5 py-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Daftar Dokumen Tersedia
                                </CardTitle>
                                <CardDescription>
                                    Peserta publik dapat mengunduh
                                    dokumen-dokumen di bawah ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {documents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <FileCode2 className="mb-3 h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-sm font-medium text-foreground">
                                            Belum ada dokumen
                                        </p>
                                        <p className="mt-1 max-w-62.5 text-xs text-muted-foreground">
                                            Dokumen juknis yang Anda unggah akan
                                            muncul di daftar ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-125 divide-y divide-border/50 overflow-y-auto">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.document_id}
                                                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-muted/10 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-start gap-3 overflow-hidden">
                                                    <div className="shrink-0 rounded-lg bg-red-500/10 p-2">
                                                        <FileText className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div className="flex min-w-0 flex-col gap-1">
                                                        <p
                                                            className="truncate text-sm font-semibold text-foreground"
                                                            title={
                                                                doc.document_name
                                                            }
                                                        >
                                                            {doc.document_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                            <span>
                                                                Diunggah:{' '}
                                                                {formatDate(
                                                                    doc.created_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs"
                                                        onClick={() =>
                                                            setViewDocument({
                                                                name: doc.document_name,
                                                                url: `/storage/${doc.document_path}`,
                                                            })
                                                        }
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />{' '}
                                                        Lihat
                                                    </Button>
                                                    <a
                                                        href={`/storage/${doc.document_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download={
                                                            doc.document_name
                                                        }
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />{' '}
                                                            Unduh
                                                        </Button>
                                                    </a>
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
                                            </div>
                                        ))}
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
                    description="Dokumen ini akan dihapus secara permanen dari server dan peserta tidak akan bisa mengunduhnya lagi."
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
