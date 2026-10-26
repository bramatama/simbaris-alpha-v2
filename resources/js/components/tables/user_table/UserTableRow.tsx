import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
    Trash2,
    Mail,
    Phone,
    Calendar,
    Building,
    MapPin,
    DoorStairwell,
} from 'lucide-react';

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

interface UserMobileCardProps {
    user: User;
    role: string;
    onDelete: (id: number) => void;
    isSelected: boolean;
    onSelect: (id: number, checked: boolean) => void;
}

const getRoleBadgeClass = (userRole: string) => {
    switch (userRole) {
        case 'admin':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
        case 'judge':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
        case 'committee':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
        default:
            return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
    }
};

const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return parsedDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getLocation = (user: User) => {
    if (!user.official_team?.city) {
        return '-';
    }

    return [
        user.official_team.city,
        user.official_team.province,
    ]
        .filter(Boolean)
        .join(', ');
};

/**
 * MOBILE CARD
 *
 * Render komponen ini di luar elemen Table.
 * Jangan letakkan di dalam TableBody.
 */
export function UserMobileCard({
    user,
    role,
    onDelete,
    isSelected,
    onSelect,
}: UserMobileCardProps) {
    return (
        <div className="border-b border-border/60 p-3 last:border-0 md:hidden">
            <Card
                className={`overflow-hidden shadow-sm transition-colors ${
                    isSelected
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/60'
                }`}
            >
                <CardContent className="space-y-3 p-4">
                    {/* Identitas pengguna */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <Checkbox
                                className="mt-0.5"
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                    onSelect(user.user_id, checked === true)
                                }
                                aria-label={`Pilih ${user.name}`}
                            />

                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold wrap-break-word text-foreground">
                                    {user.name}
                                </h3>

                                <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span className="break-all">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {role === 'all' && (
                            <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getRoleBadgeClass(user.role)}`}
                            >
                                {user.role.replace('_', ' ')}
                            </span>
                        )}
                    </div>

                    {/* Detail berdasarkan role */}
                    <div className="space-y-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                        {role === 'official_team' && (
                            <>
                                <div className="flex items-start gap-2">
                                    <Building className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                                    <span className="min-w-0">
                                        Institusi:{' '}
                                        <strong className="font-medium wrap-break-word text-foreground">
                                            {user.official_team?.institution ||
                                                '-'}
                                        </strong>
                                    </span>
                                </div>

                                <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                                    <span className="min-w-0 wrap-break-word">
                                        Lokasi: {getLocation(user)}
                                    </span>
                                </div>
                            </>
                        )}

                        {role === 'committee' && (
                            <div className="flex items-start gap-2">
                                <Building className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                                <span>
                                    Departemen:{' '}
                                    <strong className="font-medium text-foreground">
                                        {user.committee?.department || '-'}
                                    </strong>
                                </span>
                            </div>
                        )}

                        {role === 'all' && (
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                    Role:
                                </span>

                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getRoleBadgeClass(user.role)}`}
                                >
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                        )}

                        <div className="flex items-start gap-2">
                            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                            <span className="min-w-0 wrap-break-word">
                                Kontak: {user.contact_info || '-'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />

                            <span>
                                Terdaftar: {formatDate(user.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* Aksi */}
                    <div className="border-t border-border/50 pt-3">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-9 w-full gap-2"
                            onClick={() => onDelete(user.user_id)}
                            aria-label={`Hapus pengguna ${user.name}`}
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus Pengguna
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * DESKTOP TABLE ROW
 *
 * Render komponen ini hanya di dalam TableBody.
 */
export function UserTableRow({
    user,
    role,
    onDelete,
    isSelected,
    onSelect,
}: UserTableRowProps) {
    const nameAndEmail = (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="font-medium text-foreground">
                {user.name}
            </span>

            <span className="break-all text-xs text-muted-foreground">
                {user.email}
            </span>
        </div>
    );

    const deleteButton = (
        <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(user.user_id)}
            aria-label={`Hapus pengguna ${user.name}`}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );

    console.log(user.official_team)

    return (
        <TableRow
            className="hidden md:table-row"
            data-state={isSelected ? 'selected' : undefined}
        >
            {/* Checkbox */}
            <TableCell className="w-12">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                        onSelect(user.user_id, checked === true)
                    }
                    aria-label={`Pilih ${user.name}`}
                />
            </TableCell>

            {/* Nama dan email */}
            <TableCell className="min-w-50">
                {nameAndEmail}
            </TableCell>

            {/* Kolom khusus official team */}
            {role === 'official_team' && (
                <>
                    <TableCell className="min-w-37.5">
                        {user.official_team?.institution || '-'}
                    </TableCell>

                    <TableCell className="min-w-37.5 text-muted-foreground">
                        {getLocation(user)}
                    </TableCell>

                    <TableCell className="min-w-30">
                        {user.contact_info || '-'}
                    </TableCell>
                </>
            )}

            {/* Kolom khusus committee */}
            {role === 'committee' && (
                <>
                    <TableCell className="min-w-37.5">
                        {user.committee?.department || '-'}
                    </TableCell>

                    <TableCell>
                        <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${getRoleBadgeClass(user.role)}`}
                        >
                            {user.role.replace('_', ' ')}
                        </span>
                    </TableCell>

                    <TableCell className="min-w-30">
                        {user.contact_info || '-'}
                    </TableCell>
                </>
            )}

            {/* Kolom default: admin, judge, atau halaman semua pengguna */}
            {role !== 'official_team' && role !== 'committee' && (
                <>
                    <TableCell>
                        <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${getRoleBadgeClass(user.role)}`}
                        >
                            {user.role.replace('_', ' ')}
                        </span>
                    </TableCell>

                    <TableCell className="min-w-30">
                        {user.contact_info || '-'}
                    </TableCell>

                    <TableCell className="min-w-30 whitespace-nowrap text-muted-foreground">
                        {formatDate(user.created_at)}
                    </TableCell>
                </>
            )}

            {/* Aksi */}
            <TableCell className="w-20 text-right">
                <div className="flex justify-end">
                    {deleteButton}
                </div>
            </TableCell>
        </TableRow>
    );
}
