import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Pagination } from '@/components/pagination'; // Import Pagination
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Users, Filter } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

// Import komponen partials yang baru kita buat
import UserTableHeaders from './partials/UserTableHeaders';
import UserTableRow, { User } from './partials/UserTableRow';

interface UsersResponse {
    data: User[];
    links: any[];
    meta: { last_page: number };
}

type UserManagementPageProps = {
    users?: UsersResponse;
    filters?: { role?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'User Management', href: '#' },
];

export default function UserManagementIndex({ users, filters }: UserManagementPageProps) {

    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentRole, setCurrentRole] = useState(filters?.role || 'all');

    const tableLayoutRole = filters?.role || 'all';

    const handleRoleChange = (value: string) => {
        setCurrentRole(value);
        setIsLoading(true);
        router.get('/admin/users', value === 'all' ? {} : { role: value }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDelete = () => {
        if (!deleteUserId) return;
        setIsDeleting(true);
        router.delete(`/admin/users/${deleteUserId}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteUserId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6 lg:p-8">
                {/* Header & Filter */}
                <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <Users className="h-8 w-8 text-primary" /> User
                            Management
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage system users, their roles, and specific
                            profiles.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-1.5">
                        <Filter className="ml-2 h-4 w-4 text-muted-foreground" />
                        <Select
                            value={currentRole}
                            onValueChange={handleRoleChange}
                        >
                            <SelectTrigger className="w-45 border-none bg-background shadow-sm">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="official_team">
                                    Official Team
                                </SelectItem>
                                <SelectItem value="committee">
                                    Committee
                                </SelectItem>
                                <SelectItem value="judge">Judge</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Users Table */}
                {/* Users Table */}
                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        {/* Panggil komponen Header */}
                        <UserTableHeaders role={tableLayoutRole} />

                        <TableBody
                            className={`transition-opacity duration-200 ${isLoading ? 'pointer-events-none opacity-40' : 'opacity-100'}`}
                        >
                            {users?.data && users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <UserTableRow
                                        key={user.user_id}
                                        user={user}
                                        role={tableLayoutRole}
                                        onDelete={setDeleteUserId}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Users className="mb-2 h-8 w-8 text-muted-foreground/30" />
                                            <p>
                                                No users found for this filter.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Panggil komponen Pagination global */}
                <Pagination
                    links={users?.links}
                    lastPage={users?.meta?.last_page}
                />
            </div>

            <ConfirmationDialog
                open={deleteUserId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteUserId(null);
                }}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleDelete}
                isProcessing={isDeleting}
                confirmText="Delete"
                variant="destructive"
            />
        </AppLayout>
    );
}
