import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UserTableHeaders({ role }: { role: string }) {
    if (role === 'official_team') {
        return (
            <TableHeader className="bg-muted/50">
                <TableRow>
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
                <TableHead>Name & Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
    );
}
