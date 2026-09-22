import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, UserX } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface CommitteeTableProps {
    committees: any[];
    onDeleteClick: (id: number) => void;
}

export default function CommitteeTable({
    committees,
    onDeleteClick,
}: CommitteeTableProps) {
    return (
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead>Name & Contact</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {committees?.length > 0 ? (
                    committees.map((ec: any) => (
                        <TableRow key={ec.event_committee_id}>
                            <TableCell>
                                <div className="text-base font-semibold">
                                    {ec.committee?.user?.name}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                                    <Mail className="h-3 w-3" />{' '}
                                    {ec.committee?.user?.email}
                                </div>
                            </TableCell>
                            <TableCell>{ec.committee?.department}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] tracking-wider uppercase"
                                >
                                    {ec.position}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-foreground hover:bg-destructive/50"
                                    onClick={() =>
                                        onDeleteClick(ec.event_committee_id)
                                    }
                                >
                                    <UserX className="mr-1.5 h-4 w-4" /> Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={4}
                            className="h-32 text-center text-muted-foreground"
                        >
                            No committee members assigned yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
