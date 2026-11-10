import { Checkbox } from '@/components/ui/checkbox';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserTableHeadersProps {
    role: string;
    selectAllChecked: boolean;
    isIndeterminate: boolean;
    onSelectAll: (checked: boolean) => void;
}

export default function UserTableHeaders({
    role,
    selectAllChecked,
    isIndeterminate,
    onSelectAll,
}: UserTableHeadersProps) {
    const SelectAllCheckbox = () => (
        <TableHead className="w-12">
            <Checkbox
                checked={
                    selectAllChecked
                        ? true
                        : isIndeterminate
                          ? 'indeterminate'
                          : false
                }
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Select all users"
            />
        </TableHead>
    );

    if (role === 'official_team') {
        return (
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <SelectAllCheckbox />

                    <TableHead>Nama & Email</TableHead>
                    <TableHead>Instansi</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Kontak</TableHead>

                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
        );
    }

    if (role === 'committee') {
        return (
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <SelectAllCheckbox />

                    <TableHead>Nama & Email</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Kontak</TableHead>

                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
        );
    }

    return (
        <TableHeader className="bg-muted/50">
            <TableRow>
                <SelectAllCheckbox />

                <TableHead>Nama & Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Tanggal Bergabung</TableHead>

                <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
        </TableHeader>
    );
}
