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
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow >
                    <TableHead className="p-4 font-semibold">
                        {isCommittee ? 'Tim & Jenjang' : 'Nama Tim / Pangkalan'}
                    </TableHead>

                    {isCommittee ? (
                        <TableHead className="p-4 font-semibold">
                            PIC & Kontak
                        </TableHead>
                    ) : (
                        <TableHead className="p-4   font-semibold">Jenjang</TableHead>
                    )}

                    <TableHead className="p-4 font-semibold">
                        Waktu Daftar
                    </TableHead>
                    {isCommittee || myOfficialTeamId ? (
                        <TableHead className="p-4 font-semibold">Status</TableHead>
                    ) : null}
                    <TableHead className="p-4 text-right font-semibold">
                        Aksi
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {participations.map((p) => {
                    const isMyTeam = myOfficialTeamId === p.official_team_id;

                    return (
                        <TableRow
                            key={p.participation_id}
                            className={`transition-colors ${isMyTeam ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/20'}`}
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
                                            {p.event_level?.level?.level_name}
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
    );
}
