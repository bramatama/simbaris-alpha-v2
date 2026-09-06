import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

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

    // Hapus satu user
    onDelete: (id: number) => void;

    // Multiple selection
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
    const SelectionCheckbox = () => (
        <TableCell className="w-12">
            <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                    onSelect(user.user_id, checked === true)
                }
                aria-label={`Select ${user.name}`}
            />
        </TableCell>
    );

    const ActionButtons = () => (
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
    );

    // ==========================
    // OFFICIAL TEAM
    // ==========================
    if (role === 'official_team') {
        return (
            <TableRow>
                {/* Checkbox */}
                <SelectionCheckbox />

                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                </TableCell>

                <TableCell>{user.official_team?.institution || '-'}</TableCell>

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
                    <ActionButtons />
                </TableCell>
            </TableRow>
        );
    }

    // ==========================
    // COMMITTEE
    // ==========================
    if (role === 'committee') {
        return (
            <TableRow>
                {/* Checkbox */}
                <SelectionCheckbox />

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
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-800 uppercase">
                        {user.role.replace('_', ' ')}
                    </span>
                </TableCell>

                <TableCell>{user.contact_info || '-'}</TableCell>

                <TableCell className="text-right">
                    <ActionButtons />
                </TableCell>
            </TableRow>
        );
    }

    // ==========================
    // ALL / ADMIN / JUDGE
    // ==========================
    return (
        <TableRow>
            {/* Checkbox */}
            <SelectionCheckbox />

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
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'judge'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'committee'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                    }`}
                >
                    {user.role.replace('_', ' ')}
                </span>
            </TableCell>

            <TableCell>{user.contact_info || '-'}</TableCell>

            <TableCell className="text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </TableCell>

            <TableCell className="text-right">
                <ActionButtons />
            </TableCell>
        </TableRow>
    );
}
