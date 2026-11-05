import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { FileUploader } from '@/components/ui/file-uploader';
import { PageProps } from '@inertiajs/core';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    CreditCard,
    QrCode,
    Wallet,
    Building2,
} from 'lucide-react';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ZoomIn } from 'lucide-react';

interface BankOption {
    code: string;
    name: string;
}

interface PaymentMethodForm {
    payment_method_id: number | null;
    type: 'bank_transfer' | 'qris';
    bank_name: string;
    account_number: string;
    account_holder: string;
    temp_qris_path: string | null;
    qris_preview_url: string | null;
    is_active: boolean;
}

export default function CommitteePaymentMethodsIndex({
    event,
    paymentMethods,
}: {
    event: any;
    paymentMethods: any[];
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role;
    const committeePosition = auth.user.committee_position;

    // State untuk data API Bank Publik
    const [bankList, setBankList] = useState<BankOption[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);

    const [previewImage, setPreviewImage] = useState<{
        url: string;
        title: string;
    } | null>(null);

    const [bankSearchQueries, setBankSearchQueries] = useState<{
        [key: number]: string;
    }>({});

    // Fetch daftar bank dari API Publik
    useEffect(() => {
        axios
            .get('https://indonesian-banks-openapi.vercel.app/api/banks')
            .then((res) => {
                const data = res.data?.data || res.data || [];
                const formatted = data.map((b: any) => ({
                    code: b.code || b.id || '',
                    name: b.name || b.bank_name || '',
                }));
                setBankList(formatted);
            })
            .catch(() => {
                // Fallback daftar bank utama jika API publik mengalami gangguan
                setBankList([
                    { code: '014', name: 'Bank BCA' },
                    { code: '008', name: 'Bank Mandiri' },
                    { code: '009', name: 'Bank BNI' },
                    { code: '002', name: 'Bank BRI' },
                    { code: '200', name: 'Bank BTN' },
                    { code: '451', name: 'Bank Syariah Indonesia (BSI)' },
                    { code: '022', name: 'Bank CIMB Niaga' },
                    { code: '011', name: 'Bank Danamon' },
                    { code: '013', name: 'Bank Permata' },
                    { code: '542', name: 'Bank Jago' },
                    { code: '535', name: 'Seabank Indonesia' },
                ]);
            })
            .finally(() => {
                setIsLoadingBanks(false);
            });
    }, []);

    const initialMethods: PaymentMethodForm[] =
        paymentMethods?.map((pm: any) => ({
            payment_method_id: pm.payment_method_id,
            type: pm.type,
            bank_name: pm.bank_name || '',
            account_number: pm.account_number || '',
            account_holder: pm.account_holder || '',
            temp_qris_path: null,
            qris_preview_url: pm.qris_image_path
                ? `/storage/${pm.qris_image_path}`
                : null,
            is_active: Boolean(pm.is_active),
        })) ?? [];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        methods: initialMethods,
    });

    const addMethod = (type: 'bank_transfer' | 'qris') => {
        setData('methods', [
            ...data.methods,
            {
                payment_method_id: null,
                type,
                bank_name: type === 'bank_transfer' ? 'Bank BCA' : '',
                account_number: '',
                account_holder: '',
                temp_qris_path: null,
                qris_preview_url: null,
                is_active: true,
            },
        ]);
    };

    const removeMethod = (index: number) => {
        const updated = [...data.methods];
        updated.splice(index, 1);
        setData('methods', updated);
    };

    const updateField = (
        index: number,
        field: keyof PaymentMethodForm,
        value: any,
    ) => {
        const updated = [...data.methods];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setData('methods', updated);
    };

    // Fungsi pembantu untuk memfilter daftar bank sesuai ketikan user
    const getFilteredBanks = (index: number) => {
        const query = (bankSearchQueries[index] || '').toLowerCase().trim();
        if (!query) return bankList;
        return bankList.filter(
            (b) =>
                b.name.toLowerCase().includes(query) ||
                b.code.toLowerCase().includes(query),
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/${userRole}/events/${event.public_id}/payment-methods`, {
            preserveScroll: false,
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    const bankCount = data.methods.filter(
        (method) => method.type === 'bank_transfer',
    ).length;

    const qrisCount = data.methods.filter(
        (method) => method.type === 'qris',
    ).length;

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Metode Pembayaran - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href={`/${userRole}/events/${event.public_id}/information`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Dasbor
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Metode Pembayaran
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                Kelola rekening bank dan QRIS yang akan
                                digunakan peserta untuk melakukan pembayaran
                                pendaftaran event.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border bg-muted/30 px-3 py-2">
                            <Wallet className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">
                                {data.methods.length} Metode
                            </span>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-bold tabular-nums">
                                {bankCount}
                            </p>
                            <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                Bank Transfer
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-bold tabular-nums">
                                {qrisCount}
                            </p>
                            <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                QRIS
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Payment Methods */}
                    {data.methods.map((method, index) => (
                        <Card
                            key={method.payment_method_id ?? `new-${index}`}
                            className="overflow-hidden border-border/70 shadow-sm"
                        >
                            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-muted/20 px-4 py-4 sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {method.type === 'bank_transfer' ? (
                                            <CreditCard className="h-5 w-5" />
                                        ) : (
                                            <QrCode className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                        <CardTitle className="text-sm font-semibold sm:text-base">
                                            {method.type === 'bank_transfer'
                                                ? `Bank Transfer #${index + 1}`
                                                : `QRIS Pembayaran #${index + 1}`}
                                        </CardTitle>

                                        <p className="text-xs text-muted-foreground">
                                            {method.type === 'bank_transfer'
                                                ? 'Informasi rekening tujuan transfer'
                                                : 'Gambar kode QR pembayaran'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => removeMethod(index)}
                                    title="Hapus metode pembayaran"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6">
                                {method.type === 'bank_transfer' ? (
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label requirement="required">
                                                Nama Bank
                                            </Label>
                                            <Combobox
                                                value={method.bank_name}
                                                onValueChange={(val) => {
                                                    const selectedValue =
                                                        val ?? '';
                                                    updateField(
                                                        index,
                                                        'bank_name',
                                                        selectedValue,
                                                    );
                                                    setBankSearchQueries(
                                                        (prev) => ({
                                                            ...prev,
                                                            [index]:
                                                                selectedValue,
                                                        }),
                                                    );
                                                }}
                                            >
                                                <ComboboxInput
                                                    placeholder={
                                                        isLoadingBanks
                                                            ? 'Memuat daftar bank...'
                                                            : 'Cari atau pilih bank...'
                                                    }
                                                    className="w-full"
                                                    value={
                                                        bankSearchQueries[
                                                            index
                                                        ] ?? method.bank_name
                                                    }
                                                    onChange={(e) => {
                                                        const query =
                                                            e.target.value;
                                                        setBankSearchQueries(
                                                            (prev) => ({
                                                                ...prev,
                                                                [index]: query,
                                                            }),
                                                        );
                                                        updateField(
                                                            index,
                                                            'bank_name',
                                                            query,
                                                        );
                                                    }}
                                                    showClear={true}
                                                />
                                                <ComboboxContent>
                                                    <ComboboxList>
                                                        {getFilteredBanks(
                                                            index,
                                                        ).map((bank) => (
                                                            <ComboboxItem
                                                                key={`${bank.code}-${bank.name}`}
                                                                value={
                                                                    bank.name
                                                                }
                                                            >
                                                                {bank.name}
                                                            </ComboboxItem>
                                                        ))}
                                                        {getFilteredBanks(index)
                                                            .length === 0 && (
                                                            <ComboboxEmpty className="py-3 text-xs text-muted-foreground">
                                                                Bank tidak
                                                                ditemukan. Anda
                                                                dapat
                                                                melanjutkan
                                                                dengan nama bank
                                                                ini.
                                                            </ComboboxEmpty>
                                                        )}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            <InputError
                                                message={
                                                    (errors as any)[
                                                        `methods.${index}.bank_name`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label requirement="required">
                                                Nomor Rekening
                                            </Label>
                                            <Input
                                                placeholder="Masukkan nomor rekening"
                                                type="number"
                                                value={method.account_number}
                                                onChange={(e) =>
                                                    updateField(
                                                        index,
                                                        'account_number',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    (errors as any)[
                                                        `methods.${index}.account_number`
                                                    ]
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label requirement="required">
                                                Atas Nama (A.N)
                                            </Label>
                                            <Input
                                                placeholder="Contoh: Panitia Event"
                                                value={method.account_holder}
                                                onChange={(e) =>
                                                    updateField(
                                                        index,
                                                        'account_holder',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    (errors as any)[
                                                        `methods.${index}.account_holder`
                                                    ]
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <Label requirement="required">
                                                Gambar QRIS
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Unggah gambar QRIS dengan format
                                                gambar dan ukuran maksimal 2 MB.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[160px_minmax(0,1fr)]">
                                            {/* QRIS Preview */}
                                            <div className="group relative flex aspect-square w-full max-w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-muted/20 p-3 transition-all hover:border-primary/50">
                                                {method.qris_preview_url ? (
                                                    <>
                                                        <img
                                                            src={
                                                                method.qris_preview_url
                                                            }
                                                            alt="QRIS Preview"
                                                            className="h-full w-full object-contain"
                                                        />
                                                        {/* Overlay Hover untuk Perbesar */}
                                                        <div
                                                            onClick={() =>
                                                                setPreviewImage(
                                                                    {
                                                                        url: method.qris_preview_url!,
                                                                        title: `QRIS Pembayaran #${index + 1}`,
                                                                    },
                                                                )
                                                            }
                                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <ZoomIn className="h-6 w-6 text-white" />
                                                            <span className="mt-1 text-[11px] font-medium text-white">
                                                                Klik untuk
                                                                Perbesar
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* Blank state jika belum ada gambar */
                                                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                                        <QrCode className="h-10 w-10 opacity-40" />
                                                        <span className="text-xs">
                                                            Belum ada gambar
                                                            QRIS
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload */}
                                            <div className="min-w-0 space-y-2">
                                                <FileUploader
                                                    variant="image"
                                                    endpoint="/upload-temp-file"
                                                    maxSizeMB={2}
                                                    multiple={false}
                                                    onUploadSuccess={(
                                                        _,
                                                        path,
                                                    ) => {
                                                        updateField(
                                                            index,
                                                            'temp_qris_path',
                                                            path,
                                                        );
                                                    }}
                                                    onRemove={() => {
                                                        updateField(
                                                            index,
                                                            'temp_qris_path',
                                                            null,
                                                        );
                                                    }}
                                                />

                                                <p className="text-xs leading-relaxed text-muted-foreground">
                                                    Pastikan kode QR terlihat
                                                    jelas dan dapat dipindai
                                                    oleh peserta.
                                                </p>

                                                <InputError
                                                    message={
                                                        (errors as any)[
                                                            `methods.${index}.temp_qris_path`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {data.methods.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 px-5 py-14 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <Wallet className="h-7 w-7 text-muted-foreground" />
                            </div>

                            <h3 className="font-semibold">
                                Belum Ada Metode Pembayaran
                            </h3>

                            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                                Tambahkan rekening bank atau QRIS agar peserta
                                dapat melakukan pembayaran pendaftaran event.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold">
                                Tambahkan Metode Pembayaran
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Pilih jenis metode pembayaran yang ingin
                                ditambahkan.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 justify-start gap-2"
                                onClick={() => addMethod('bank_transfer')}
                            >
                                <Plus className="h-4 w-4" />
                                <CreditCard className="h-4 w-4" />
                                Tambah Bank Transfer
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 justify-start gap-2"
                                onClick={() => addMethod('qris')}
                            >
                                <Plus className="h-4 w-4" />
                                <QrCode className="h-4 w-4" />
                                Tambah QRIS
                            </Button>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                                Pastikan seluruh informasi sudah benar sebelum
                                menyimpan.
                            </p>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full gap-2 sm:w-auto"
                            >
                                {processing ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            <Dialog
                open={!!previewImage}
                onOpenChange={(open) => !open && setPreviewImage(null)}
            >
                <DialogContent className="max-w-xl sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {previewImage?.title || 'Preview QRIS'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-2">
                        {previewImage && (
                            <img
                                src={previewImage.url}
                                alt="QRIS Full Preview"
                                className="max-h-[70vh] w-auto rounded-lg border object-contain shadow-md"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </InnerAppLayout>
    );
}
