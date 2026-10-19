import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Mail, Phone, Calendar, Building, MapPin } from 'lucide-react';

export interface User {
    user_id: number;
    public_id: string;
    name: string;
    email: string;
    role: 'admin' | 'official_team' | 'judge' | 'committee';
    contact_info?: string;
    created_at: string;

    official_team?: {
        institution: string;
        level: string;
        city: string;
        province: string;
    };

    committee?: {
        department: string;
    };
}

interface UserTableRowProps {
    user: User;
    role: string;
    onDelete: (id: number) => void;
    isSelected: boolean;
    onSelect: (id: number, checked: boolean) => void;
}

export default function UserTableRow({
    user,
    role,
    onDelete,
    isSelected,
    onSelect,
}: UserTableRowProps) {
    // Badge warna role
    const getRoleBadgeClass = (userRole: string) => {
        switch (userRole) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'judge':
                return 'bg-blue-100 text-blue-800';
            case 'committee':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const formattedDate = new Date(user.created_at).toLocaleDateString(
        'id-ID',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );

    return (
        <>
            {/* ========================================================= */}
            {/* 1. TAMPILAN MOBILE: CARD (Hanya tampil di layar kecil) */}
            {/* ========================================================= */}
            <div className="border-b border-border/60 bg-card p-3 last:border-0 md:hidden">
                <Card
                    className={`overflow-hidden border-border/50 shadow-sm transition-colors ${isSelected ? 'border-primary/40 bg-primary/5' : ''}`}
                >
                    <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                        onSelect(user.user_id, checked === true)
                                    }
                                    aria-label={`Select ${user.name}`}
                                />
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {user.name}
                                    </h3>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>

                            {/* Badge Role jika di halaman 'all' */}
                            {role === 'all' && (
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${getRoleBadgeClass(
                                        user.role,
                                    )}`}
                                >
                                    {user.role.replace('_', ' ')}
                                </span>
                            )}
                        </div>

                        {/* Detail tambahan berdasarkan role */}
                        <div className="grid grid-cols-1 gap-1.5 border-t border-border/40 pt-2 text-xs text-muted-foreground">
                            {role === 'official_team' && (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <Building className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span>
                                            Institusi:{' '}
                                            <strong className="text-foreground">
                                                {user.official_team
                                                    ?.institution || '-'}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="capitalize">
                                            Jenjang:{' '}
                                            <strong className="text-foreground">
                                                {user.official_team?.level ||
                                                    '-'}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span>
                                            Lokasi:{' '}
                                            {user.official_team?.city
                                                ? `${user.official_team.city}, ${user.official_team.province}`
                                                : '-'}
                                        </span>
                                    </div>
                                </>
                            )}

                            {role === 'committee' && (
                                <div className="flex items-center gap-1.5">
                                    <span>
                                        Departemen:{' '}
                                        <strong className="text-foreground">
                                            {user.committee?.department || '-'}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                                <span>Kontak: {user.contact_info || '-'}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                                <span>Terdaftar: {formattedDate}</span>
                            </div>
                        </div>

                        {/* Tombol Aksi Hapus */}
                        <div className="flex justify-end border-t border-border/40 pt-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-full gap-1.5 text-xs sm:w-auto"
                                onClick={() => onDelete(user.user_id)}
                                aria-label={`Delete ${user.name}`}
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                                Pengguna
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ========================================================= */}
            {/* 2. TAMPILAN DESKTOP: TABLE ROW (Hanya tampil di layar MD+) */}
            {/* ========================================================= */}
            {role === 'official_team' ? (
                <TableRow className="hidden md:table-row">
                    <TableCell className="w-12">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                                onSelect(user.user_id, checked === true)
                            }
                            aria-label={`Select ${user.name}`}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        {user.official_team?.institution || '-'}
                    </TableCell>
                    <TableCell className="capitalize">
                        {user.official_team?.level || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                        {user.official_team?.city
                            ? `${user.official_team.city}, ${user.official_team.province}`
                            : '-'}
                    </TableCell>
                    <TableCell>{user.contact_info || '-'}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDelete(user.user_id)}
                                aria-label={`Delete ${user.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ) : role === 'committee' ? (
                <TableRow className="hidden md:table-row">
                    <TableCell className="w-12">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                                onSelect(user.user_id, checked === true)
                            }
                            aria-label={`Select ${user.name}`}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">
                        {user.committee?.department || '-'}
                    </TableCell>
                    <TableCell className="font-medium capitalize">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getRoleBadgeClass(user.role)}`}
                        >
                            {user.role.replace('_', ' ')}
                        </span>
                    </TableCell>
                    <TableCell>{user.contact_info || '-'}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDelete(user.user_id)}
                                aria-label={`Delete ${user.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ) : (
                <TableRow className="hidden md:table-row">
                    <TableCell className="w-12">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                                onSelect(user.user_id, checked === true)
                            }
                            aria-label={`Select ${user.name}`}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getRoleBadgeClass(user.role)}`}
                        >
                            {user.role.replace('_', ' ')}
                        </span>
                    </TableCell>
                    <TableCell>{user.contact_info || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                        {formattedDate}
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDelete(user.user_id)}
                                aria-label={`Delete ${user.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
