import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
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
import InputError from '@/components/input-error';
import { FileUploader } from '@/components/ui/file-uploader'; // <-- Import FileUploader
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    FileText,
    CheckCircle2,
    ImagePlus,
} from 'lucide-react';

export default function OfficialTeamParticipationEdit({
    participation,
}: {
    participation: any;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const isApproved = participation.status === 'approved';

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'put',
        team_name: participation.team_name || '',
        pic_name: participation.pic_name || '',
        pic_phone_number: participation.pic_phone_number || '',
        temp_payment_proof_path: null as string | null,
        temp_team_logo_path: null as string | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(
            `/${userRole}/participations/${participation.public_id}/registration`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getParticipationInnerNav(participation.public_id)}
        >
            <Head title={`Edit Pendaftaran - ${participation.team_name}`} />

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
                            Data Umum & Berkas
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Perbarui informasi administratif pendaftaran tim
                            Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/${userRole}/participations/${participation.public_id}/documents`}
                        >
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Kelola Dokumen Juknis
                            </Button>
                        </Link>
                    </div>
                </div>

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
                                    {/* Area Upload Logo */}
                                    {/* Tampilkan logo saat ini jika tidak ada unggahan baru */}
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
                                        <Label
                                            requirement="optional"
                                            className="mb-2"
                                        >
                                            Logo Tim
                                        </Label>
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
                                        <InputError
                                            message={errors.temp_team_logo_path}
                                            className="mt-1"
                                        />
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
                                    {/* Input Teks */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label
                                                requirement="required"
                                                htmlFor="team_name"
                                            >
                                                Nama Tim / Pangkalan
                                            </Label>
                                            <Input
                                                id="team_name"
                                                value={data.team_name}
                                                onChange={(e) =>
                                                    setData(
                                                        'team_name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.team_name}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    requirement="required"
                                                    htmlFor="pic_name"
                                                >
                                                    Nama PIC
                                                </Label>
                                                <Input
                                                    id="pic_name"
                                                    value={data.pic_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'pic_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.pic_name}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    requirement="required"
                                                    htmlFor="pic_phone_number"
                                                >
                                                    No. HP / WA
                                                </Label>
                                                <Input
                                                    id="pic_phone_number"
                                                    value={
                                                        data.pic_phone_number
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'pic_phone_number',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors.pic_phone_number
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
                                    {/* Tampilkan bukti saat ini jika belum diubah */}
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {participation.payment_proof_path && (
                                            <div className="col-span-1">
                                                <Label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Bukti Tersimpan
                                                </Label>
                                                <div className="aspect-3/4 w-full max-w-2xs overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                                    <img
                                                        src={route(
                                                            'participation-payment-proof.file',
                                                            participation,
                                                        )}
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

                                        {/* Uploader Bukti Bayar */}
                                        {!isApproved && (
                                            <div className="col-span-1 space-y-2">
                                                <Label requirement="optional">
                                                    Unggah Bukti Baru
                                                </Label>
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
                                                <InputError
                                                    message={
                                                        errors.temp_payment_proof_path
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
                        </div>
                    </div>
                </form>
            </div>
        </InnerAppLayout>
    );
}
