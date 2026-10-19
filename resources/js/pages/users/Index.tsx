import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { ConfirmationDialog } from '@/components/dialogs/confirmation-dialog';
import { Pagination } from '@/components/pagination';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';

import { Users, Filter, Trash2 } from 'lucide-react';

import UserTableHeaders from '../../components/tables/user_table/UserTableHeaders';
import UserTableRow, {
    User,
} from '../../components/tables/user_table/UserTableRow';

interface UsersResponse {
    data: User[];
    links: any[];
    meta: {
        last_page: number;
    };
}

type UserManagementPageProps = {
    users?: UsersResponse;
    filters?: {
        role?: string;
    };
};

export default function UserManagementIndex({
    users,
    filters,
}: UserManagementPageProps) {
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentRole, setCurrentRole] = useState(filters?.role || 'all');

    const tableLayoutRole = filters?.role || 'all';

    const handleRoleChange = (value: string) => {
        setCurrentRole(value);
        setIsLoading(true);
        setSelectedUserIds([]);

        router.get('/admin/users', value === 'all' ? {} : { role: value }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSelectUser = (userId: number, checked: boolean) => {
        setSelectedUserIds((current) => {
            const next = new Set(current);
            if (checked) {
                next.add(userId);
            } else {
                next.delete(userId);
            }
            return [...next];
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (!users?.data) return;
        if (checked) {
            setSelectedUserIds(users.data.map((user) => user.user_id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const isAllSelected =
        Boolean(
            users?.data &&
            users.data.length > 0 &&
            selectedUserIds.length === users.data.length,
        ) || false;

    const isIndeterminate =
        Boolean(
            users?.data &&
            users.data.length > 0 &&
            selectedUserIds.length > 0 &&
            selectedUserIds.length < users.data.length,
        ) || false;

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

    const handleBulkDelete = () => {
        if (selectedUserIds.length === 0) return;
        setIsDeleting(true);

        router.delete('/admin/users/bulk-delete', {
            data: {
                user_ids: selectedUserIds,
            },
            onFinish: () => {
                setIsDeleting(false);
                setIsBulkDeleteOpen(false);
                setSelectedUserIds([]);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6 lg:p-8">
                {/* Header & Filter */}
                <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
                            <Users className="h-7 w-7 text-primary md:h-8 md:w-8" />
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground md:text-base">
                            Manage system users, their roles, and specific
                            profiles.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {selectedUserIds.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={() => setIsBulkDeleteOpen(true)}
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedUserIds.length})
                            </Button>
                        )}

                        <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 p-1.5 sm:w-auto">
                            <Filter className="ml-2 h-4 w-4 text-muted-foreground" />

                            <Select
                                value={currentRole}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger className="w-full border-none bg-background shadow-sm sm:w-45">
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>

                                <SelectContent position="popper">
                                    <SelectItem value="all">
                                        All Roles
                                    </SelectItem>
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
                </div>

                {/* Users Table / List */}
                <div className="overflow-hidden rounded-md border bg-card shadow-sm">
                    <Table>
                        {/* Header Tabel hanya muncul di layar desktop (md+) */}
                        <div className="hidden md:table-header-group">
                            <UserTableHeaders
                                role={tableLayoutRole}
                                selectAllChecked={isAllSelected}
                                isIndeterminate={isIndeterminate}
                                onSelectAll={handleSelectAll}
                            />
                        </div>

                        <TableBody
                            className={`block transition-opacity duration-200 md:table-row-group ${
                                isLoading
                                    ? 'pointer-events-none opacity-40'
                                    : 'opacity-100'
                            }`}
                        >
                            {users?.data && users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <UserTableRow
                                        key={user.user_id}
                                        user={user}
                                        role={tableLayoutRole}
                                        onDelete={setDeleteUserId}
                                        isSelected={selectedUserIds.includes(
                                            user.user_id,
                                        )}
                                        onSelect={handleSelectUser}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                            <Users className="mb-2 h-8 w-8 text-muted-foreground/30" />
                                            <p className="text-sm">
                                                No users found for this filter.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <Pagination
                    links={users?.links}
                    lastPage={users?.meta?.last_page}
                />
            </div>

            {/* Dialog konfirmasi hapus */}
            <ConfirmationDialog
                open={deleteUserId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteUserId(null);
                    }
                }}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleDelete}
                isProcessing={isDeleting}
                confirmText="Delete"
                variant="destructive"
            />

            <ConfirmationDialog
                open={isBulkDeleteOpen}
                onOpenChange={setIsBulkDeleteOpen}
                title="Delete Selected Users"
                description={`Are you sure you want to delete ${selectedUserIds.length} selected user(s)? This action cannot be undone.`}
                onConfirm={handleBulkDelete}
                isProcessing={isDeleting}
                confirmText={`Delete ${selectedUserIds.length} User(s)`}
                variant="destructive"
            />
        </AppLayout>
    );
}
