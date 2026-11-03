import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    Clock,
    XCircle,
    ArrowLeft,
    CreditCard,
} from 'lucide-react';

interface LockStateProps {
    status: 'pending' | 'rejected' | string;
    statusMessage?: string | null;
    eventPublicId: string;
    participationPublicId: string;
    userRole: string;
    featureName?: string;
}

export function ParticipationLockState({
    status,
    statusMessage,
    eventPublicId,
    participationPublicId,
    userRole,
    featureName = 'Fitur ini',
}: LockStateProps) {
    const isPending = status === 'pending';

    return (
        <div className="mx-auto w-full max-w-4xl py-12">
            <Card className="border-2 border-dashed border-border/80 shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
                    {isPending ? (
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
                            <Clock className="h-8 w-8 animate-pulse" />
                        </div>
                    ) : (
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
                            <XCircle className="h-8 w-8" />
                        </div>
                    )}

                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        {isPending
                            ? 'Pendaftaran Menunggu Verifikasi'
                            : 'Pendaftaran Ditolak'}
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        {isPending ? (
                            <>
                                {featureName} belum dapat diakses karena
                                pendaftaran tim Anda masih dalam proses
                                verifikasi pembayaran oleh panitia.
                            </>
                        ) : (
                            <>
                                {featureName} dikunci karena pendaftaran tim
                                Anda ditolak oleh panitia.
                            </>
                        )}
                    </p>

                    {/* Alasan Penolakan jika Status Rejected */}
                    {!isPending && statusMessage && (
                        <div className="mt-4 flex w-full max-w-md items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                            <div className="text-sm">
                                <span className="font-semibold text-destructive">
                                    Catatan Panitia:
                                </span>
                                <p className="mt-0.5 text-muted-foreground">
                                    {statusMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild variant="outline" className="gap-2">
                            <Link
                                href={`/${userRole}/events/${eventPublicId}/participations/${participationPublicId}/information`}
                            >
                                <ArrowLeft className="h-4 w-4" /> Kembali ke
                                Informasi Tim
                            </Link>
                        </Button>

                        {!isPending && (
                            <Button asChild variant="default" className="gap-2">
                                <Link
                                    href={`/${userRole}/events/${eventPublicId}/participations/${participationPublicId}/edit`}
                                >
                                    <CreditCard className="h-4 w-4" /> Perbarui
                                    Pembayaran / Data
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
