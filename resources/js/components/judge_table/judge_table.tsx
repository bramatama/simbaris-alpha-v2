import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, UserX } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mendefinisikan tipe data khusus untuk tabel
type Expertise = {
    expertise_id: number;
    expertise_name: string;
};

type EventJudge = {
    event_judge_id: number;
    judge?: {
        user?: {
            name: string;
            email: string;
        };
    };
    judge_expertises?: {
        judge_expertise_id: number;
        expertise?: Expertise;
    }[];
};

interface JudgeTableProps {
    judges: EventJudge[];
    onDeleteClick: (id: number) => void;
}

export default function JudgeTable({ judges, onDeleteClick }: JudgeTableProps) {
    return (
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead>Name & Contact</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {judges && judges.length > 0 ? (
                    judges.map((eventJudge) => {
                        const judgeExpertises =
                            eventJudge.judge_expertises ?? [];

                        return (
                            <TableRow key={eventJudge.event_judge_id}>
                                <TableCell>
                                    <div className="text-base font-semibold">
                                        {eventJudge.judge?.user?.name ?? '-'}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {eventJudge.judge?.user?.email ?? '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {judgeExpertises.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {judgeExpertises.map(
                                                (judgeExpertise) => (
                                                    <Badge
                                                        key={
                                                            judgeExpertise.judge_expertise_id
                                                        }
                                                        variant="secondary"
                                                    >
                                                        {judgeExpertise
                                                            .expertise
                                                            ?.expertise_name ??
                                                            'Unknown'}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            No expertise assigned
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            onDeleteClick(
                                                eventJudge.event_judge_id,
                                            )
                                        }
                                    >
                                        <UserX className="mr-1.5 h-4 w-4" />{' '}
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={3}
                            className="h-32 text-center text-muted-foreground"
                        >
                            No judges assigned yet.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
