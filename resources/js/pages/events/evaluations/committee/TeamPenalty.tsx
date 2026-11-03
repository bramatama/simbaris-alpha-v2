import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Trash2,
    Gavel,
    AlertTriangle,
    Scale,
    Ban,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';

/* =========================================================
   TYPES
========================================================= */
interface PenaltyProps {
    event: any;
    participation: any;
    availablePenalties: {
        event_penalty_id: number;
        penalty_value: number;
        calculation_type: string;
        penalty_action: string;
        master_penalty: { penalty_name: string } | null;
        masterPenalty?: { penalty_name: string };
    }[];
    teamPenalties: {
        team_penalty_id: number;
        occurrence_count: number;
        penalty_value: number;
        penalty_action: string;
        reason: string;
        event_penalty?: {
            master_penalty?: { penalty_name: string };
            masterPenalty?: { penalty_name: string };
        };
        eventPenalty?: {
            master_penalty?: { penalty_name: string };
            masterPenalty?: { penalty_name: string };
        };
        committee: { user: { name: string } };
    }[];
}

/* =========================================================
   COMPONENT
========================================================= */
export default function TeamPenalty({
    event,
    participation,
    availablePenalties,
    teamPenalties,
}: PenaltyProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;
    const committeePosition = auth.user.committee_position;

    const [selectedPenaltyId, setSelectedPenaltyId] = useState<number | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        event_penalty_id: '',
        occurrence_count: 1,
        reason: '',
    });

    const selectedPenalty = availablePenalties.find(
        (p) => p.event_penalty_id.toString() === data.event_penalty_id,
    );
    const isDisqualification =
        selectedPenalty?.penalty_action === 'disqualification';

    const isTeamDisqualified = teamPenalties.some(
        (pen) => pen.penalty_action === 'disqualification',
    );

    const submitUrl = `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/penalties`;
    const handleBack = () => {
        window.history.back();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(submitUrl, {
            preserveScroll: true,
            onSuccess: () =>
                reset('event_penalty_id', 'occurrence_count', 'reason'),
        });
    };

    const confirmDeletePenalty = () => {
        if (!selectedPenaltyId) return;
        setIsDeleting(true);
        router.delete(
            `/${userRole}/events/${event.public_id}/participations/${participation.public_id}/penalties/${selectedPenaltyId}`,
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsDeleting(false);
                    setSelectedPenaltyId(null);
                },
            },
        );
    };

    const totalDeductions = teamPenalties.reduce((sum, item) => {
        if (item.penalty_action === 'disqualification') return sum;
        return sum + item.penalty_value * item.occurrence_count;
    }, 0);

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(
                event.public_id,
                userRole,
                committeePosition || undefined,
            )}
        >
            <Head title={`Kelola Penalti - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                {/* HEADER INFO TIM */}
                <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col">
                        <Link
                            onClick={handleBack}
                            className="mb-3 inline-flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />{' '}
                            Kembali
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                            Kelola Penalti Peserta
                        </h1>
                        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {participation.team_name}
                            </span>
                            <span className="mx-2 text-border">|</span>
                            No. Urut:{' '}
                            <span className="font-semibold text-foreground">
                                {participation.appearance_order ?? '?'}
                            </span>
                        </p>
                    </div>

                    {/* STATUS PENALTI KESELURUHAN TIM */}
                    <div
                        className={`flex flex-col rounded-lg border px-4 py-3 sm:items-end ${isTeamDisqualified ? 'border-destructive bg-destructive/10' : 'border-destructive/20 bg-destructive/5'}`}
                    >
                        <span
                            className={`mb-1 text-[11px] font-bold tracking-wider uppercase ${isTeamDisqualified ? 'text-destructive' : 'text-destructive/80'}`}
                        >
                            {isTeamDisqualified
                                ? 'Status Akhir Tim'
                                : 'Total Akumulasi Potongan'}
                        </span>
                        <div className="text-2xl font-black text-destructive">
                            {isTeamDisqualified ? (
                                <span className="flex items-center gap-2">
                                    <Ban className="h-6 w-6" /> DISKUALIFIKASI
                                </span>
                            ) : (
                                <>
                                    - {totalDeductions}{' '}
                                    <span className="text-sm font-bold">
                                        Poin
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRID 2 KOLOM */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* KOLOM KIRI: FORM INPUT */}
                    <div className="lg:col-span-4">
                        <Card className="overflow-hidden border-t-4 border-t-destructive shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/20 pt-5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                                    <Gavel className="h-5 w-5" /> Penjatuhan
                                    Penalti
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                    Pilih jenis pelanggaran dan masukkan rincian
                                    kejadian.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="event_penalty_id"
                                            className="text-xs font-bold text-muted-foreground uppercase"
                                        >
                                            Jenis Pelanggaran{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.event_penalty_id}
                                            onValueChange={(val) => {
                                                setData(
                                                    'event_penalty_id',
                                                    val,
                                                );
                                                const sel =
                                                    availablePenalties.find(
                                                        (p) =>
                                                            p.event_penalty_id.toString() ===
                                                            val,
                                                    );
                                                if (
                                                    sel?.penalty_action ===
                                                    'disqualification'
                                                ) {
                                                    setData(
                                                        'occurrence_count',
                                                        1,
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger
                                                className={`h-10 w-full bg-background text-left [&>span]:truncate [&>span]:pr-2 ${errors.event_penalty_id ? 'border-destructive ring-destructive/20' : ''}`}
                                            >
                                                <SelectValue placeholder="-- Pilih Aturan Penalti --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availablePenalties.map(
                                                    (pen) => {
                                                        const name =
                                                            pen.master_penalty
                                                                ?.penalty_name ||
                                                            pen.masterPenalty
                                                                ?.penalty_name;
                                                        const isDisq =
                                                            pen.penalty_action ===
                                                            'disqualification';
                                                        return (
                                                            <SelectItem
                                                                key={
                                                                    pen.event_penalty_id
                                                                }
                                                                value={pen.event_penalty_id.toString()}
                                                            >
                                                                <span
                                                                    className={
                                                                        isDisq
                                                                            ? 'font-bold text-destructive'
                                                                            : ''
                                                                    }
                                                                >
                                                                    {name}{' '}
                                                                    {isDisq
                                                                        ? ' [DISKUALIFIKASI]'
                                                                        : ` (Potongan: -${pen.penalty_value})`}
                                                                </span>
                                                            </SelectItem>
                                                        );
                                                    },
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.event_penalty_id && (
                                            <p className="text-xs font-medium text-destructive">
                                                {errors.event_penalty_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="occurrence_count"
                                            className="text-xs font-bold text-muted-foreground uppercase"
                                        >
                                            Frekuensi / Durasi{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="occurrence_count"
                                                type="number"
                                                disabled={isDisqualification}
                                                placeholder="Min. 1"
                                                value={data.occurrence_count}
                                                onChange={(e) =>
                                                    setData(
                                                        'occurrence_count',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className={`h-10 w-24 bg-background text-center font-bold ${errors.occurrence_count ? 'border-destructive ring-destructive/20' : ''} ${isDisqualification ? 'cursor-not-allowed bg-muted opacity-70' : ''}`}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {isDisqualification
                                                    ? 'Otomatis 1x (Bersifat Mutlak)'
                                                    : 'x (Kali / Detik)'}
                                            </span>
                                        </div>
                                        {errors.occurrence_count && (
                                            <p className="text-xs font-medium text-destructive">
                                                {errors.occurrence_count}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="reason"
                                            className="text-xs font-bold text-muted-foreground uppercase"
                                        >
                                            Catatan Khusus{' '}
                                            {isDisqualification ? (
                                                <span className="text-destructive">
                                                    * (Wajib)
                                                </span>
                                            ) : (
                                                <span className="font-normal normal-case">
                                                    (Opsional)
                                                </span>
                                            )}
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            placeholder={
                                                isDisqualification
                                                    ? 'Wajib tuliskan alasan diskualifikasi di sini...'
                                                    : 'Tulis alasan atau kronologi kejadian (jika ada)...'
                                            }
                                            value={data.reason}
                                            onChange={(e) =>
                                                setData(
                                                    'reason',
                                                    e.target.value,
                                                )
                                            }
                                            className={`min-h-25 resize-y bg-background text-sm ${errors.reason ? 'border-destructive ring-destructive/20' : ''}`}
                                        />
                                        {errors.reason && (
                                            <p className="text-xs font-medium text-destructive">
                                                {errors.reason}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="lg"
                                        className="mt-2 w-full gap-2 font-bold shadow-md hover:bg-destructive/90"
                                        disabled={processing}
                                    >
                                        <Gavel className="h-4 w-4" />
                                        {processing
                                            ? 'Memproses...'
                                            : 'Jatuhkan Penalti'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* KOLOM KANAN: RIWAYAT PENALTI */}
                    <div className="lg:col-span-8">
                        <Card className="h-full shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/10 pt-5 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                    <Scale className="h-5 w-5 text-primary" />{' '}
                                    Riwayat Penalti Tim
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs">
                                    Daftar penalti yang telah diberikan ke tim
                                    ini beserta catatan auditor.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="w-full overflow-x-auto">
                                    <Table className="w-full min-w-137.5">
                                        <TableHeader className="border-b border-border/60 bg-muted/40">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-14 text-center font-bold text-foreground">
                                                    No
                                                </TableHead>
                                                <TableHead className="font-bold text-foreground">
                                                    Rincian Pelanggaran
                                                </TableHead>
                                                <TableHead className="w-40 text-center font-bold text-foreground">
                                                    Efek / Potongan
                                                </TableHead>
                                                <TableHead className="w-16 text-center font-bold text-foreground">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-border/60">
                                            {teamPenalties.length > 0 ? (
                                                teamPenalties.map(
                                                    (pen, idx) => {
                                                        const penaltyName =
                                                            pen.eventPenalty
                                                                ?.masterPenalty
                                                                ?.penalty_name ||
                                                            pen.eventPenalty
                                                                ?.master_penalty
                                                                ?.penalty_name ||
                                                            pen.event_penalty
                                                                ?.master_penalty
                                                                ?.penalty_name ||
                                                            'Penalti';
                                                        const isRowDisq =
                                                            pen.penalty_action ===
                                                            'disqualification';
                                                        const totalDeduction =
                                                            pen.penalty_value *
                                                            pen.occurrence_count;

                                                        return (
                                                            <TableRow
                                                                key={
                                                                    pen.team_penalty_id
                                                                }
                                                                className={`transition-colors ${isRowDisq ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/20'}`}
                                                            >
                                                                <TableCell className="py-3 text-center font-medium text-muted-foreground">
                                                                    {idx + 1}
                                                                </TableCell>
                                                                <TableCell className="py-3">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <span
                                                                            className={`font-bold ${isRowDisq ? 'text-destructive' : 'text-foreground'}`}
                                                                        >
                                                                            {
                                                                                penaltyName
                                                                            }
                                                                        </span>
                                                                        {pen.reason && (
                                                                            <span
                                                                                className={`rounded-md border px-2.5 py-1.5 text-xs italic ${isRowDisq ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-border/50 bg-background text-muted-foreground'}`}
                                                                            >
                                                                                "
                                                                                {
                                                                                    pen.reason
                                                                                }

                                                                                "
                                                                            </span>
                                                                        )}
                                                                        <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                                                                            Auditor:{' '}
                                                                            <span className="text-foreground">
                                                                                {
                                                                                    pen
                                                                                        .committee
                                                                                        ?.user
                                                                                        ?.name
                                                                                }
                                                                            </span>{' '}
                                                                            {isRowDisq
                                                                                ? ''
                                                                                : `• (Pengali: ${pen.occurrence_count}x)`}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-3 text-center">
                                                                    {isRowDisq ? (
                                                                        <Badge
                                                                            variant="destructive"
                                                                            className="font-bold tracking-widest uppercase shadow-sm"
                                                                        >
                                                                            Diskualifikasi
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="border-destructive/30 bg-destructive/10 px-2.5 py-1 text-sm font-bold text-destructive"
                                                                        >
                                                                            -{' '}
                                                                            {
                                                                                totalDeduction
                                                                            }
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-3 text-center">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                                                                        onClick={() =>
                                                                            setSelectedPenaltyId(
                                                                                pen.team_penalty_id,
                                                                            )
                                                                        }
                                                                        title="Batal / Hapus Penalti"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="h-40 text-center text-muted-foreground"
                                                    >
                                                        <div className="flex flex-col items-center justify-center gap-3">
                                                            <div className="rounded-full bg-muted/50 p-3">
                                                                <AlertTriangle className="h-6 w-6 text-muted-foreground/70" />
                                                            </div>
                                                            <p className="text-sm font-medium">
                                                                Tim ini bersih
                                                                dari penalti
                                                                pelanggaran.
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION DIALOG FOR DELETE PENALTY */}
            <ConfirmationDialog
                open={!!selectedPenaltyId}
                onOpenChange={(open) => !open && setSelectedPenaltyId(null)}
                title="Hapus Penalti Peserta?"
                description="Apakah Anda yakin ingin membatalkan/menghapus penalti ini? Potongan nilai poin atau status diskualifikasi tim ini akan dikembalikan."
                variant="destructive"
                confirmText="Ya, Hapus Penalti"
                cancelText="Batal"
                isProcessing={isDeleting}
                onConfirm={confirmDeletePenalty}
            />
        </InnerAppLayout>
    );
}
