import { Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/config/date_datetime';
import { Eye, Edit3, Settings2, ShieldAlert } from 'lucide-react';

interface ParticipationTableProps {
    participations: any[];
    userRole: 'committee' | 'official_team' | string;
    myOfficialTeamId?: string | null;
}

export function ParticipationTable({
    participations,
    userRole,
    myOfficialTeamId,
}: ParticipationTableProps) {
    const isCommittee = userRole === 'committee';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-none hover:bg-emerald-500/20">
                        Disetujui
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="border-destructive/20 bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20">
                        Ditolak
                    </Badge>
                );
            default:
                return (
                    <Badge className="border-orange-500/20 bg-orange-500/10 text-orange-600 shadow-none hover:bg-orange-500/20">
                        Menunggu
                    </Badge>
                );
        }
    };

    if (!participations || participations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">
                    Tidak ada pendaftaran ditemukan.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Coba sesuaikan kata kunci atau filter pencarian.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* VIEW MOBILE: COMPACT CARD (Disembunyikan di ukuran MD ke atas) */}
            <div className="flex flex-col gap-3 md:hidden">
                {participations.map((p) => {
                    const isMyTeam = myOfficialTeamId === p.official_team_id;

                    return (
                        <Card
                            key={p.participation_id}
                            className={`overflow-hidden border-border/50 shadow-sm transition-colors ${
                                isMyTeam ? 'border-primary/20 bg-primary/5' : ''
                            }`}
                        >
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {p.team_name}
                                            </h3>
                                            {!isCommittee && isMyTeam && (
                                                <Badge
                                                    variant="default"
                                                    className="h-4 px-1.5 py-0 text-[9px]"
                                                >
                                                    Tim Anda
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {p.event_level?.level?.level_name}
                                        </p>
                                    </div>
                                    {(isCommittee || isMyTeam) && (
                                        <div className="shrink-0">
                                            {getStatusBadge(p.status)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 border-t border-border/50 pt-3 sm:flex-row sm:justify-between">
                                    {isCommittee && (
                                        <div className="space-y-0.5">
                                            <p className="text-xs text-muted-foreground">
                                                PIC & Kontak
                                            </p>
                                            <p className="text-sm font-medium">
                                                {p.pic_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {p.pic_phone_number}
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-0.5 sm:text-right">
                                        <p className="text-xs text-muted-foreground">
                                            Waktu Daftar
                                        </p>
                                        <p className="text-sm font-medium">
                                            {formatDate(p.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {isCommittee ? (
                                        <Link
                                            href={`/${userRole}/participations/${p.public_id}/information`}
                                            className="block w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-1.5 text-xs"
                                            >
                                                <Eye className="h-3.5 w-3.5" />{' '}
                                                Lihat Detail
                                            </Button>
                                        </Link>
                                    ) : (
                                        <>
                                            {isMyTeam ? (
                                                <Link
                                                    href={`/${userRole}/participations/${p.public_id}/information`}
                                                    className="block w-full"
                                                >
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="w-full gap-1.5 text-xs"
                                                    >
                                                        <Settings2 className="h-3.5 w-3.5" />{' '}
                                                        Kelola Tim
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <div className="rounded-md border border-border/50 bg-muted/30 py-2 text-center text-[11px] text-muted-foreground/60 italic">
                                                    Privasi Terjaga
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* VIEW DESKTOP: SHADCN TABLE (Disembunyikan di layar kecil) */}
            <div className="hidden w-full overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm md:block">
                <Table className="min-w-max border-collapse">
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="border-b border-border/50 p-4 font-semibold">
                                {isCommittee
                                    ? 'Tim & Jenjang'
                                    : 'Nama Tim / Pangkalan'}
                            </TableHead>

                            {isCommittee ? (
                                <TableHead className="border-b border-border/50 p-4 font-semibold">
                                    PIC & Kontak
                                </TableHead>
                            ) : (
                                <TableHead className="border-b border-border/50 p-4 font-semibold">
                                    Jenjang
                                </TableHead>
                            )}

                            <TableHead className="border-b border-border/50 p-4 font-semibold">
                                Waktu Daftar
                            </TableHead>
                            {isCommittee || myOfficialTeamId ? (
                                <TableHead className="border-b border-border/50 p-4 font-semibold">
                                    Status
                                </TableHead>
                            ) : null}
                            <TableHead className="border-b border-border/50 p-4 text-right font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participations.map((p) => {
                            const isMyTeam =
                                myOfficialTeamId === p.official_team_id;

                            return (
                                <TableRow
                                    key={p.participation_id}
                                    className={`border-b border-border/50 transition-colors last:border-0 ${
                                        isMyTeam
                                            ? 'bg-primary/5 hover:bg-primary/10'
                                            : 'hover:bg-muted/10'
                                    }`}
                                >
                                    <TableCell className="p-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {p.team_name}
                                                </span>
                                                {!isCommittee && isMyTeam && (
                                                    <Badge
                                                        variant="default"
                                                        className="h-4 px-1.5 py-0 text-[9px]"
                                                    >
                                                        Tim Anda
                                                    </Badge>
                                                )}
                                            </div>
                                            {isCommittee && (
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        p.event_level?.level
                                                            ?.level_name
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {isCommittee ? (
                                        <TableCell className="p-4">
                                            <p className="text-xs font-medium text-foreground">
                                                {p.pic_name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {p.pic_phone_number}
                                            </p>
                                        </TableCell>
                                    ) : (
                                        <TableCell className="p-4 text-xs font-medium">
                                            {p.event_level?.level?.level_name}
                                        </TableCell>
                                    )}

                                    <TableCell className="p-4 text-xs text-muted-foreground">
                                        {formatDate(p.created_at)}
                                    </TableCell>

                                    {isCommittee || isMyTeam ? (
                                        <TableCell className="p-4">
                                            {getStatusBadge(p.status)}
                                        </TableCell>
                                    ) : null}
                                    <TableCell className="p-4 text-right">
                                        {isCommittee ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/${userRole}/participations/${p.public_id}/information`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />{' '}
                                                        Lihat
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                {isMyTeam ? (
                                                    <Link
                                                        href={`/${userRole}/participations/${p.public_id}/information`}
                                                    >
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs"
                                                        >
                                                            <Settings2 className="h-3.5 w-3.5" />{' '}
                                                            Kelola Tim
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground/50 italic">
                                                        Privasi Terjaga
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
