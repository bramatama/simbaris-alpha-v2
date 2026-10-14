import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    UploadCloud,
    Image as ImageIcon,
    FileText,
    CheckCircle2,
} from 'lucide-react';
import { useRef, useState } from 'react';

export default function OfficialTeamParticipationEdit({
    participation,
}: {
    participation: any;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const isApproved = participation.status === 'approved';

    const [paymentPreview, setPaymentPreview] = useState<string | null>(
        participation.payment_proof_path
            ? `/storage/${participation.payment_proof_path}`
            : null,
    );

    const form = useForm({
        _method: 'put',
        team_name: participation.team_name || '',
        pic_name: participation.pic_name || '',
        pic_phone_number: participation.pic_phone_number || '',
        payment_proof_path: null as File | null,
    });

    const paymentInputRef = useRef<HTMLInputElement>(null);

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('payment_proof_path', file);
            setPaymentPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.post(
            `/${userRole}/participations/${participation.public_id}/registration`,
            {
                preserveScroll: true,
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
                            Data Umum & Pembayaran
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Perbarui informasi administratif pendaftaran tim
                            Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Tombol pintasan ke halaman dokumen */}
                        <Link
                            href={`/${userRole}/participations/${participation.public_id}/documents`}
                        >
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Kelola Dokumen Tim
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/10">
                            <CardTitle>Informasi Administratif</CardTitle>
                            <CardDescription>
                                Ubah nama tim, kontak penanggung jawab, dan
                                perbarui bukti transfer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="team_name">
                                        Nama Tim / Pangkalan{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="team_name"
                                        value={form.data.team_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'team_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.team_name}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="pic_name">
                                            Nama PIC{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="pic_name"
                                            value={form.data.pic_name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'pic_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.pic_name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pic_phone_number">
                                            No. HP / WA{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="pic_phone_number"
                                            value={form.data.pic_phone_number}
                                            onChange={(e) =>
                                                form.setData(
                                                    'pic_phone_number',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                form.errors.pic_phone_number
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-border/50 pt-4">
                                <div>
                                    <Label className="text-base">
                                        Bukti Pembayaran
                                    </Label>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {isApproved
                                            ? 'Tim telah divalidasi. Bukti pembayaran dikunci.'
                                            : 'Unggah ulang jika bukti sebelumnya buram atau ditolak.'}
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="hidden"
                                        ref={paymentInputRef}
                                        onChange={handlePaymentChange}
                                        disabled={isApproved}
                                    />
                                    <div
                                        className={`relative flex aspect-video w-48 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border/70 bg-muted/20 transition-colors ${isApproved ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50'}`}
                                        onClick={() =>
                                            !isApproved &&
                                            paymentInputRef.current?.click()
                                        }
                                    >
                                        {paymentPreview ? (
                                            <img
                                                src={paymentPreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover opacity-80"
                                            />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                        )}
                                        {!isApproved && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 opacity-0 backdrop-blur-[2px] transition-opacity hover:opacity-100">
                                                <UploadCloud className="mb-1 h-6 w-6 text-primary" />
                                                <span className="text-[10px] font-semibold">
                                                    Ganti Gambar
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2 pt-2">
                                        {isApproved && (
                                            <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs leading-tight text-emerald-700">
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
                                            <div className="rounded-md border border-orange-500/20 bg-orange-500/10 p-2.5 text-xs leading-tight text-orange-700">
                                                Status pendaftaran sebelumnya{' '}
                                                <strong>Ditolak</strong>.
                                                Menyimpan pembaruan akan
                                                mengubah status kembali menjadi{' '}
                                                <strong>Menunggu</strong>.
                                            </div>
                                        )}
                                        <InputError
                                            message={
                                                form.errors.payment_proof_path
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 border-t border-border/50 bg-muted/10 p-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="gap-2"
                            >
                                {form.processing ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Simpan Data
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </InnerAppLayout>
    );
}
