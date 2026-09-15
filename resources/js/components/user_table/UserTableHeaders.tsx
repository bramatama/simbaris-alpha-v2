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

                    <TableHead>Name & Email</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
        );
    }

    if (role === 'committee') {
        return (
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <SelectAllCheckbox />

                    <TableHead>Name & Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
        );
    }

    return (
        <TableHeader className="bg-muted/50">
            <TableRow>
                <SelectAllCheckbox />

                <TableHead>Name & Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined Date</TableHead>

                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
    );
}
