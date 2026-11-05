import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { FileUploader } from '@/components/ui/file-uploader';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    FileText,
    CheckCircle2,
    ImagePlus,
    Trash2,
    AlertTriangle,
    AlertCircle,
} from 'lucide-react';

export default function OfficialTeamParticipationEdit({
    event,
    participation,
}: {
    event: any;
    participation: any;
}) {
    const { auth, errors: pageErrors } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const isApproved = participation.status === 'approved';

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'put',
        team_name: participation.team_name || '',
        pic_name: participation.pic_name || '',
        pic_phone_number: participation.pic_phone_number || '',
        temp_payment_proof_path: null as string | null,
        temp_team_logo_path: null as string | null,
    });

    // ==========================================
    // LOGIKA SCROLL TO ERROR (Metode 3)
    // ==========================================
    useEffect(() => {
        if (Object.keys(errors).length > 0 || pageErrors?.error) {
            const errorBanner = document.querySelector('.is-error-banner');
            if (errorBanner) {
                errorBanner.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            } else {
                const firstErrorKey = Object.keys(errors)[0];
                const targetElement =
                    document.getElementById(firstErrorKey) ||
                    document.querySelector(`[name="${firstErrorKey}"]`);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    targetElement.focus?.();
                }
            }
        }
    }, [errors, pageErrors]);

    const renderErrorBadge = (errorMsg?: string) => {
        if (!errorMsg) return null;
        return (
            <span
                className="flex animate-in cursor-help items-center gap-1 text-xs font-medium text-destructive duration-200 fade-in"
                title={errorMsg}
            >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Periksa Kolom</span>
            </span>
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/registration`,
            {
                preserveScroll: true,
            },
        );
    };

    const handleDeleteParticipation = () => {
        setIsDeleting(true);
        router.delete(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/delete`,
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setShowDeleteDialog(false);
                },
            },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getParticipationInnerNav(
                participation.public_id,
                event.public_id,
            )}
        >
            <Head title={`Edit Pendaftaran - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/events/${event.public_id}/participations/${participation.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Detail
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Data Umum & Berkas
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Perbarui informasi administratif pendaftaran tim
                            Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/${userRole}/events/${event.public_id}/participations/${participation.public_id}/documents`}
                        >
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" /> Kelola Dokumen
                                Juknis
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ERROR BANNER ATAS (Metode 3) */}
                {(Object.keys(errors).length > 0 || pageErrors?.error) && (
                    <div className="is-error-banner flex animate-in items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive shadow-sm duration-300 fade-in slide-in-from-top-2">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-sm font-bold">
                                Perubahan Belum Dapat Disimpan / Terjadi
                                Kesalahan:
                            </h4>
                            <ul className="list-disc space-y-1 pl-4 text-xs text-destructive/90">
                                {pageErrors?.error && (
                                    <li className="leading-relaxed">
                                        {pageErrors.error as string}
                                    </li>
                                )}
                                {Object.entries(errors).map(
                                    ([key, err], idx) => (
                                        <li
                                            key={idx}
                                            className="leading-relaxed"
                                        >
                                            {err as string}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-6 lg:col-span-4">
                            <Card className="sticky top-3 flex h-fit flex-col border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10">
                                    <CardTitle>Logo Tim</CardTitle>
                                    <CardDescription>
                                        Upload atau Perbarui Logo Tim Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center space-y-6">
                                    {participation.team_logo_path ? (
                                        <div className="flex aspect-square w-full shrink-0 overflow-hidden rounded-full border-4 border-muted bg-background shadow-sm">
                                            <img
                                                src={`/storage/${participation.team_logo_path}`}
                                                alt="Logo Tim Saat Ini"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex aspect-square w-full max-w-60 flex-col items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                                            <ImagePlus className="mb-3 h-12 w-12 opacity-40" />
                                            <span className="text-sm font-medium">
                                                Belum ada Logo
                                            </span>
                                        </div>
                                    )}

                                    <div className="w-full min-w-0 flex-1">
                                        <div className="mb-2 flex items-center justify-between">
                                            <Label requirement="optional">
                                                Logo Tim
                                            </Label>
                                            {renderErrorBadge(
                                                errors.temp_team_logo_path,
                                            )}
                                        </div>
                                        <FileUploader
                                            variant="image"
                                            endpoint="/upload-temp-file"
                                            maxSizeMB={2}
                                            multiple={false}
                                            onUploadSuccess={(fileId, path) => {
                                                setData(
                                                    'temp_team_logo_path',
                                                    path,
                                                );
                                                clearErrors(
                                                    'temp_team_logo_path',
                                                );
                                            }}
                                            onRemove={() =>
                                                setData(
                                                    'temp_team_logo_path',
                                                    null,
                                                )
                                            }
                                        />
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Format JPG/PNG, rasio 1:1, maks 2MB.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6 lg:col-span-8">
                            <Card className="h-fit border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10">
                                    <CardTitle>Profil Tim</CardTitle>
                                    <CardDescription>
                                        Ubah nama tim dan kontak penanggung
                                        jawab.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* NAMA TIM */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    requirement="required"
                                                    htmlFor="team_name"
                                                >
                                                    Nama Tim / Pangkalan
                                                </Label>
                                                {renderErrorBadge(
                                                    errors.team_name,
                                                )}
                                            </div>
                                            <Input
                                                id="team_name"
                                                value={data.team_name}
                                                onChange={(e) => {
                                                    setData(
                                                        'team_name',
                                                        e.target.value,
                                                    );
                                                    clearErrors('team_name');
                                                }}
                                                className={
                                                    errors.team_name
                                                        ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                        : ''
                                                }
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {/* NAMA PIC */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="pic_name"
                                                    >
                                                        Nama PIC
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.pic_name,
                                                    )}
                                                </div>
                                                <Input
                                                    id="pic_name"
                                                    value={data.pic_name}
                                                    onChange={(e) => {
                                                        setData(
                                                            'pic_name',
                                                            e.target.value,
                                                        );
                                                        clearErrors('pic_name');
                                                    }}
                                                    className={
                                                        errors.pic_name
                                                            ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                            : ''
                                                    }
                                                />
                                            </div>

                                            {/* NO HP PIC */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label
                                                        requirement="required"
                                                        htmlFor="pic_phone_number"
                                                    >
                                                        No. HP / WA
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.pic_phone_number,
                                                    )}
                                                </div>
                                                <Input
                                                    id="pic_phone_number"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    value={
                                                        data.pic_phone_number
                                                    }
                                                    onChange={(e) => {
                                                        setData(
                                                            'pic_phone_number',
                                                            e.target.value,
                                                        );
                                                        clearErrors(
                                                            'pic_phone_number',
                                                        );
                                                    }}
                                                    className={
                                                        errors.pic_phone_number
                                                            ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive'
                                                            : ''
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="h-fit border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10">
                                    <CardTitle>Bukti Pembayaran</CardTitle>
                                    <CardDescription>
                                        {isApproved
                                            ? 'Tim telah divalidasi. Bukti pembayaran dikunci.'
                                            : 'Perbarui bukti transfer jika gambar sebelumnya buram atau ditolak.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {participation.payment_proof_path && (
                                            <div className="col-span-1">
                                                <Label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Bukti Tersimpan
                                                </Label>
                                                <div className="aspect-3/4 w-full max-w-2xs overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                                    <img
                                                        src={`${route('participation-payment-proof.file', participation)}?t=${new Date().getTime()}`}
                                                        alt="Bukti Bayar Saat Ini"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {isApproved && (
                                            <div className="col-span-1 mt-6 flex h-fit items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm leading-tight text-emerald-700">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                                <p>
                                                    Pendaftaran telah disetujui
                                                    oleh panitia. Anda tidak
                                                    dapat mengubah bukti
                                                    pembayaran lagi.
                                                </p>
                                            </div>
                                        )}
                                        {participation.status ===
                                            'rejected' && (
                                            <div className="col-span-1 mt-6 h-fit rounded-md border border-orange-500/20 bg-orange-500/10 p-3 text-sm leading-tight text-orange-700">
                                                Status pendaftaran sebelumnya{' '}
                                                <strong>Ditolak</strong>.
                                                Menyimpan pembaruan akan
                                                mengubah status kembali menjadi{' '}
                                                <strong>Menunggu</strong>{' '}
                                                verifikasi.
                                            </div>
                                        )}
                                        {!isApproved && (
                                            <div className="col-span-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label requirement="optional">
                                                        Unggah Bukti Baru
                                                    </Label>
                                                    {renderErrorBadge(
                                                        errors.temp_payment_proof_path,
                                                    )}
                                                </div>
                                                <FileUploader
                                                    variant="image"
                                                    endpoint="/upload-temp-file"
                                                    maxSizeMB={2}
                                                    multiple={false}
                                                    onUploadSuccess={(
                                                        fileId,
                                                        path,
                                                    ) => {
                                                        setData(
                                                            'temp_payment_proof_path',
                                                            path,
                                                        );
                                                        clearErrors(
                                                            'temp_payment_proof_path',
                                                        );
                                                    }}
                                                    onRemove={() =>
                                                        setData(
                                                            'temp_payment_proof_path',
                                                            null,
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-3 border-t border-border/50 bg-muted/10 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="gap-2 px-8"
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Simpan Perubahan
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* DANGER ZONE OFFICIAL TEAM */}
                            <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                                <CardHeader className="border-b border-destructive/20 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base text-destructive">
                                        <AlertTriangle className="h-5 w-5" />{' '}
                                        Zona Bahaya
                                    </CardTitle>

                                    <CardDescription className="text-xs text-destructive/80">
                                        {isApproved
                                            ? 'Pendaftaran yang telah disetujui/terverifikasi oleh panitia tidak dapat dibatalkan atau dihapus secara mandiri.'
                                            : 'Batalkan keikutsertaan dan hapus seluruh berkas pendaftaran tim ini.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-foreground">
                                                Batalkan Pendaftaran
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Tindakan ini permanen dan tidak
                                                dapat dikembalikan.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={isApproved}
                                            onClick={() =>
                                                setShowDeleteDialog(true)
                                            }
                                            className="gap-2 font-semibold shadow-sm"
                                        >
                                            <Trash2 className="h-4 w-4" />{' '}
                                            Batalkan Pendaftaran
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>

                {/* CONFIRMATION DIALOG HAPUS OFFICIAL TEAM */}
                <ConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    title="Batalkan Pendaftaran Tim?"
                    description="Apakah Anda yakin ingin membatalkan keikutsertaan tim ini? Seluruh data pendaftaran dan berkas yang telah diunggah akan dihapus secara permanen."
                    variant="destructive"
                    confirmText="Ya, Batalkan Pendaftaran"
                    cancelText="Kembali"
                    isProcessing={isDeleting}
                    onConfirm={handleDeleteParticipation}
                />
            </div>
        </InnerAppLayout>
    );
}
