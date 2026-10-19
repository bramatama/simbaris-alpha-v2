import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav, getParticipationInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PdfViewerDialog } from '@/components/dialogs/pdf-viewer-dialog';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Building2,
    UserCircle,
    Phone,
    Banknote,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Edit3,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Save } from 'lucide-react';

export default function ParticipationShow({
    participation,
}: {
    participation: any;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    // State untuk PDF Viewer Dokumen Persyaratan
    const [viewDocument, setViewDocument] = useState<{
        name: string;
        url: string;
    } | null>(null);

    const { data, setData, patch, processing, errors } = useForm({
        status: participation.status || 'pending',
        status_message: participation.status_message || '',
    });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/${userRole}/participations/${participation.public_id}/status`, {
            preserveScroll: true,
        });
    };

    // Helper untuk warna status
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    text: 'Disetujui',
                };
            case 'rejected':
                return {
                    color: 'bg-destructive/10 text-destructive border-destructive/20',
                    icon: <XCircle className="h-4 w-4" />,
                    text: 'Ditolak',
                };
            default:
                return {
                    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
                    icon: <Clock className="h-4 w-4" />,
                    text: 'Menunggu Verifikasi',
                };
        }
    };

    const statusConfig = getStatusConfig(participation.status);

    return (
        <InnerAppLayout
            sidebarNavItems={userRole=== 'committee'?getEventInnerNav(
                participation.event.public_id,
                userRole,
            ): getParticipationInnerNav(participation.public_id)}
        >
            <Head title={`Detail Tim - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header Navigasi */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={
                                userRole === 'official_team'
                                    ? `/${userRole}/my-participations`
                                    : `/${userRole}/events/${participation.event.public_id}/participations`
                            }
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            {userRole === 'official_team'
                                ? 'Kembali ke Pendaftaran Saya'
                                : 'Kembali ke Daftar Peserta'}
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {participation.team_name}
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                            {participation.event.event_name} • Jenjang{' '}
                            {participation.event_level?.level?.level_name}
                        </p>
                    </div>

                    {userRole === 'official_team' && (
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/${userRole}/participations/${participation.public_id}/edit`}
                            >
                                <Button variant="outline" className="gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Edit Pendaftaran
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Status Alert jika Ditolak */}
                {participation.status === 'rejected' &&
                    participation.status_message && (
                        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                            <div>
                                <h4 className="text-sm font-bold text-destructive">
                                    Pendaftaran Ditolak
                                </h4>
                                <p className="mt-1 text-sm text-destructive/90">
                                    {participation.status_message}
                                </p>
                            </div>
                        </div>
                    )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* KOLOM KIRI: Informasi Utama */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        Informasi Pendaftaran
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className={`gap-1.5 border px-3 py-1 text-xs font-medium ${statusConfig.color}`}
                                    >
                                        {statusConfig.icon}
                                        {statusConfig.text}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Building2 className="h-4 w-4" />{' '}
                                            Nama Tim / Pangkalan
                                        </dt>
                                        <dd className="text-sm font-semibold">
                                            {participation.team_name}
                                        </dd>
                                    </div>
                                    <div className="space-y-1.5">
                                        <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <UserCircle className="h-4 w-4" />{' '}
                                            Penanggung Jawab (PIC)
                                        </dt>
                                        <dd className="text-sm font-semibold">
                                            {participation.pic_name}
                                        </dd>
                                    </div>
                                    <div className="space-y-1.5">
                                        <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Phone className="h-4 w-4" /> Nomor
                                            HP / WhatsApp
                                        </dt>
                                        <dd className="text-sm font-semibold">
                                            {participation.pic_phone_number}
                                        </dd>
                                    </div>
                                    <div className="space-y-1.5">
                                        <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Banknote className="h-4 w-4" />{' '}
                                            Tagihan Biaya
                                        </dt>
                                        <dd className="text-sm font-semibold text-emerald-600">
                                            Rp{' '}
                                            {Number(
                                                participation.billed_amount,
                                            ).toLocaleString('id-ID')}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Dokumen Persyaratan */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="text-lg">
                                    Dokumen Persyaratan
                                </CardTitle>
                                <CardDescription>
                                    Berkas persyaratan administrasi lomba yang
                                    diunggah oleh peserta.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {participation.participation_documents &&
                                participation.participation_documents.length >
                                    0 ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {participation.participation_documents.map(
                                            (doc: any) => (
                                                <div
                                                    key={doc.document_id}
                                                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 p-3 transition-colors hover:bg-muted/30"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="shrink-0 rounded-md bg-red-500/10 p-2">
                                                            <FileText className="h-4 w-4 text-red-500" />
                                                        </div>
                                                        <span
                                                            className="truncate text-sm font-medium"
                                                            title={
                                                                doc.document_name
                                                            }
                                                        >
                                                            {doc.document_name}
                                                        </span>
                                                    </div>
                                                    <div className="ml-2 flex shrink-0 items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={() =>
                                                                setViewDocument(
                                                                    {
                                                                        name: doc.document_name,
                                                                        url: `/storage/${doc.document_path}`,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border-2 border-dashed border-border/50 bg-muted/20 py-6 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Peserta belum mengunggah dokumen
                                            administrasi apapun.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* KOLOM KANAN: Bukti Pembayaran & Form Verifikasi (Panitia) */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="text-base">
                                    Bukti Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {participation.payment_proof_path ? (
                                    <div className="space-y-3">
                                        <div className="overflow-hidden rounded-lg border border-border/50 bg-muted/20">
                                            <img
                                                src={`/storage/${participation.payment_proof_path}`}
                                                alt="Bukti Transfer"
                                                className="max-h-75 w-full object-contain"
                                            />
                                        </div>
                                        <a
                                            href={`/storage/${participation.payment_proof_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                            >
                                                <Eye className="h-4 w-4" />{' '}
                                                Lihat Gambar Penuh
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-border/50 bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                                        Belum ada bukti pembayaran
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* FORM VERIFIKASI (Hanya muncul jika Role = Committee) */}
                        {userRole === 'committee' && (
                            <form onSubmit={submitStatus}>
                                <Card className="border-primary/20 shadow-md">
                                    <CardHeader className="border-b border-border/50 bg-primary/5 pb-4">
                                        <CardTitle className="text-base text-primary">
                                            Verifikasi Panitia
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Ubah status kelayakan tim ini.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-5">
                                        <RadioGroup
                                            value={data.status}
                                            onValueChange={(value) => {
                                                setData('status', value);
                                                if (value === 'approved')
                                                    setData(
                                                        'status_message',
                                                        '',
                                                    );
                                            }}
                                            className="flex flex-col gap-2"
                                        >
                                            <Label
                                                htmlFor="pending"
                                                className="flex cursor-pointer items-center gap-3 rounded-md border border-muted bg-transparent p-3 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 hover:bg-muted has-data-[state=checked]:border-orange-500 has-data-[state=checked]:bg-orange-500/10"
                                            >
                                                <RadioGroupItem
                                                    value="pending"
                                                    id="pending"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        Menunggu
                                                    </span>
                                                </div>
                                            </Label>

                                            <Label
                                                htmlFor="approved"
                                                className="flex cursor-pointer items-center gap-3 rounded-md border border-muted bg-transparent p-3 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/10 hover:bg-muted has-data-[state=checked]:border-emerald-500 has-data-[state=checked]:bg-emerald-500/10"
                                            >
                                                <RadioGroupItem
                                                    value="approved"
                                                    id="approved"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        Disetujui
                                                    </span>
                                                </div>
                                            </Label>

                                            <Label
                                                htmlFor="rejected"
                                                className="flex cursor-pointer items-center gap-3 rounded-md border border-muted bg-transparent p-3 peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 hover:bg-muted has-data-[state=checked]:border-destructive has-data-[state=checked]:bg-destructive/10"
                                            >
                                                <RadioGroupItem
                                                    value="rejected"
                                                    id="rejected"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        Ditolak
                                                    </span>
                                                </div>
                                            </Label>
                                        </RadioGroup>
                                        <InputError message={errors.status} />

                                        {data.status === 'rejected' && (
                                            <div className="animate-in space-y-2 pt-2 fade-in slide-in-from-top-2">
                                                <Label
                                                    htmlFor="status_message"
                                                    className="text-xs text-destructive"
                                                >
                                                    Alasan Penolakan (Wajib)
                                                </Label>
                                                <Textarea
                                                    id="status_message"
                                                    placeholder="Beritahu peserta apa yang salah..."
                                                    value={data.status_message}
                                                    onChange={(e) =>
                                                        setData(
                                                            'status_message',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="min-h-20 border-destructive/50 text-xs focus-visible:ring-destructive"
                                                />
                                                <InputError
                                                    message={
                                                        errors.status_message
                                                    }
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="border-t border-border/50 bg-muted/10 p-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full gap-2"
                                        >
                                            {processing ? (
                                                <Spinner className="h-4 w-4" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Simpan Perubahan
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        )}
                    </div>
                </div>

                {/* Komponen Reusable PDF Viewer */}
                <PdfViewerDialog
                    document={viewDocument}
                    onClose={() => setViewDocument(null)}
                />
            </div>
        </InnerAppLayout>
    );
}
