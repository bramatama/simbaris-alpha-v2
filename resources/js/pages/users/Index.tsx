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
import {
    UserTableRow,
    User,
    UserMobileCard,
} from '../../components/tables/user_table/UserTableRow';

interface UsersResponse {
    data: User[];
    links: any[];
    meta: {
        last_page: number;
    };
}

interface UserManagementPageProps {
    users?: UsersResponse;
    filters?: {
        role?: string;
    };
}

export default function UserManagementIndex({
    users,
    filters,
}: UserManagementPageProps) {
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const currentRole = filters?.role || 'all';
    const tableLayoutRole = currentRole;
    const userList = users?.data ?? [];

    const handleRoleChange = (value: string) => {
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
        if (checked) {
            setSelectedUserIds(userList.map((user) => user.user_id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const isAllSelected =
        userList.length > 0 &&
        userList.every((user) => selectedUserIds.includes(user.user_id));

    const isIndeterminate =
        userList.some((user) => selectedUserIds.includes(user.user_id)) &&
        !isAllSelected;

    const handleDelete = () => {
        if (deleteUserId === null) return;

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

    const emptyState = (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Users className="h-9 w-9 opacity-30" />

            <p className="text-sm">No users found for this filter.</p>
        </div>
    );

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6 lg:p-8">
                {/* Header dan filter */}
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

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
                            <Filter className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />

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

                {/* Daftar pengguna */}
                <div
                    className={`min-w-0 transition-opacity duration-200 ${
                        isLoading
                            ? 'pointer-events-none opacity-40'
                            : 'opacity-100'
                    }`}
                >
                    {userList.length > 0 ? (
                        <>
                            {/* ====================================== */}
                            {/* MOBILE: CARD, DI LUAR ELEMEN TABLE     */}
                            {/* ====================================== */}
                            <div className="overflow-hidden rounded-md border bg-card md:hidden">
                                {userList.map((user) => (
                                    <UserMobileCard
                                        key={user.user_id}
                                        user={user}
                                        role={tableLayoutRole}
                                        onDelete={setDeleteUserId}
                                        isSelected={selectedUserIds.includes(
                                            user.user_id,
                                        )}
                                        onSelect={handleSelectUser}
                                    />
                                ))}
                            </div>

                            {/* ====================================== */}
                            {/* DESKTOP: TABLE                        */}
                            {/* ====================================== */}
                            <div className="hidden min-w-0 overflow-hidden rounded-md border bg-card shadow-sm md:block">
                                <div className="w-full overflow-x-auto">
                                    <Table>
                                        <UserTableHeaders
                                            role={tableLayoutRole}
                                            selectAllChecked={isAllSelected}
                                            isIndeterminate={isIndeterminate}
                                            onSelectAll={handleSelectAll}
                                        />

                                        <TableBody>
                                            {userList.map((user) => (
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="overflow-hidden rounded-md border bg-card">
                            {emptyState}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    links={users?.links}
                    lastPage={users?.meta?.last_page}
                />
            </div>

            {/* Dialog konfirmasi hapus pengguna */}
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

            {/* Dialog konfirmasi hapus massal */}
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
