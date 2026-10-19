import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="w-full">
            {/* VIEW MOBILE: COMPACT CARD (Disembunyikan di layar MD ke atas) */}
            <div className="flex flex-col gap-3 md:hidden">
                {committees?.length > 0 ? (
                    committees.map((ec: any) => (
                        <Card
                            key={ec.event_committee_id}
                            className="overflow-hidden border-border/50 shadow-sm"
                        >
                            <CardContent className="space-y-4 p-4">
                                <div>
                                    <div className="text-base font-semibold text-foreground">
                                        {ec.committee?.user?.name}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        {ec.committee?.user?.email}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">
                                            Department
                                        </div>
                                        <div className="text-sm font-medium">
                                            {ec.committee?.department}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="text-xs text-muted-foreground">
                                            Position
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="bg-muted/40 text-[10px] tracking-wider uppercase"
                                        >
                                            {ec.position}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full text-foreground hover:bg-destructive/50"
                                    onClick={() =>
                                        onDeleteClick(ec.event_committee_id)
                                    }
                                >
                                    <UserX className="mr-1.5 h-4 w-4" /> Remove
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        No committee members assigned yet.
                    </div>
                )}
            </div>

            {/* VIEW DESKTOP: SHADCN TABLE (Disembunyikan di layar kecil) */}
            <div className="hidden w-full overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm md:block">
                <Table className="min-w-max">
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Name & Contact</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
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
                                            <Mail className="h-3.5 w-3.5" />{' '}
                                            {ec.committee?.user?.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {ec.committee?.department}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className="bg-muted/40 text-[10px] tracking-wider uppercase"
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
                                                onDeleteClick(
                                                    ec.event_committee_id,
                                                )
                                            }
                                        >
                                            <UserX className="mr-1.5 h-4 w-4" />{' '}
                                            Remove
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
            </div>
        </div>
    );
}
