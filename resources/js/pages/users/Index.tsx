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

import { Table, TableBody } from '@/components/ui/table';
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
            <p className="text-sm">
                Tidak ada pengguna yang ditemukan untuk filter ini.
            </p>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Manajemen Pengguna" />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6 lg:p-8">
                {/* Header dan filter */}
                <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
                            <Users className="h-7 w-7 text-primary md:h-8 md:w-8" />
                            Manajemen Pengguna
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground md:text-base">
                            Kelola pengguna sistem, peran, dan profil
                            masing-masing pengguna.
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
                                Hapus yang Dipilih ({selectedUserIds.length})
                            </Button>
                        )}

                        <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 p-1.5 sm:w-auto">
                            <Filter className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />

                            <Select
                                value={currentRole}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger className="w-full border-none bg-background shadow-sm sm:w-45">
                                    <SelectValue placeholder="Filter berdasarkan peran" />
                                </SelectTrigger>

                                <SelectContent position="popper">
                                    <SelectItem value="all">
                                        Semua Peran
                                    </SelectItem>

                                    <SelectItem value="official_team">
                                        Tim Peserta
                                    </SelectItem>

                                    <SelectItem value="committee">
                                        Panitia
                                    </SelectItem>

                                    <SelectItem value="judge">Juri</SelectItem>

                                    <SelectItem value="admin">
                                        Administrator
                                    </SelectItem>
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
                            {/* Tampilan mobile: kartu, di luar elemen tabel */}
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

                            {/* Tampilan desktop: tabel */}
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

            {/* Dialog konfirmasi penghapusan pengguna */}
            <ConfirmationDialog
                open={deleteUserId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteUserId(null);
                    }
                }}
                title="Hapus Pengguna"
                description="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={handleDelete}
                isProcessing={isDeleting}
                confirmText="Hapus"
                variant="destructive"
            />

            {/* Dialog konfirmasi penghapusan massal */}
            <ConfirmationDialog
                open={isBulkDeleteOpen}
                onOpenChange={setIsBulkDeleteOpen}
                title="Hapus Pengguna Terpilih"
                description={`Apakah Anda yakin ingin menghapus ${selectedUserIds.length} pengguna yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
                onConfirm={handleBulkDelete}
                isProcessing={isDeleting}
                confirmText={`Hapus ${selectedUserIds.length} Pengguna`}
                variant="destructive"
            />
        </AppLayout>
    );
}
