import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
    committee?: { department: string };
}

interface UserTableRowProps {
    user: User;
    role: string;
    onDelete: (id: number) => void;
}

export default function UserTableRow({
    user,
    role,
    onDelete,
}: UserTableRowProps) {
    const ActionButtons = () => (
        <div className="flex justify-end">
            <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(user.user_id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );

    if (role === 'official_team') {
        return (
            <TableRow>
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

    if (role === 'committee') {
        return (
            <TableRow>
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
                <TableCell className="font-medium text-purple-600 capitalize">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-800`}
                    >
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

    return (
        <TableRow>
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
