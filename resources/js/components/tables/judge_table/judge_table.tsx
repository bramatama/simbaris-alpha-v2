import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, UserX, Edit } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type MasterCategory = {
    master_category_id: number;
    category_name: string;
};

type EventLevel = {
    event_level_id: number;
    level?: {
        level_id: number;
        level_name: string;
    };
};

type ScoringCategory = {
    scoring_category_id: number;
    master_category?: MasterCategory;
    event_level?: EventLevel;
};

type JudgeExpertise = {
    judge_expertise_id: number;
    scoring_category?: ScoringCategory;
};

type EventJudge = {
    event_judge_id: number;
    judge?: {
        user?: {
            name: string;
            email: string;
        };
    };
    judge_expertises?: JudgeExpertise[];
};

type Expertise = {
    scoring_category_id: number;
    event_level_id: number;
    level_name: string;
    category_name: string;
};

interface JudgeTableProps {
    judges: EventJudge[];
    onDeleteClick: (id: number) => void;
    eventPublicId: string;
    userRole: string;
    allExpertises: Expertise[];
}

export default function JudgeTable({
    judges,
    onDeleteClick,
    eventPublicId,
    userRole,
    allExpertises = [],
}: JudgeTableProps) {
    // Hitung total jenjang yang tersedia untuk setiap kategori
    const totalLevelsPerCategory = allExpertises.reduce(
        (acc, exp) => {
            const catName = exp.category_name || 'Unknown';
            if (!acc[catName]) acc[catName] = new Set();
            acc[catName].add(exp.event_level_id);
            return acc;
        },
        {} as Record<string, Set<number>>,
    );

    return (
        <div className="w-full">
            {/* VIEW MOBILE: COMPACT CARD (Disembunyikan di layar MD ke atas) */}
            <div className="flex flex-col gap-3 md:hidden">
                {judges.length > 0 ? (
                    judges.map((eventJudge) => {
                        const judgeExpertises =
                            eventJudge.judge_expertises ?? [];

                        // Kelompokkan expertise milik juri ini berdasarkan Kategori
                        const judgeAssignedMap = judgeExpertises.reduce(
                            (acc, je) => {
                                const catName =
                                    je.scoring_category?.master_category
                                        ?.category_name || 'Kategori Lainnya';
                                const levelName =
                                    je.scoring_category?.event_level?.level
                                        ?.level_name || 'Jenjang Lainnya';
                                if (!acc[catName]) acc[catName] = [];
                                acc[catName].push(levelName);
                                return acc;
                            },
                            {} as Record<string, string[]>,
                        );

                        return (
                            <Card
                                key={eventJudge.event_judge_id}
                                className="overflow-hidden border-border/50 shadow-sm"
                            >
                                <CardContent className="space-y-4 p-4">
                                    <div>
                                        <div className="text-base font-semibold text-foreground">
                                            {eventJudge.judge?.user?.name ??
                                                '-'}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" />
                                            {eventJudge.judge?.user?.email ??
                                                '-'}
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t border-border/50 pt-3">
                                        <div className="text-xs font-medium text-muted-foreground">
                                            Kategori Penilaian
                                        </div>
                                        {Object.keys(judgeAssignedMap).length >
                                        0 ? (
                                            <div className="flex flex-col gap-2">
                                                {Object.entries(
                                                    judgeAssignedMap,
                                                ).map(([catName, levels]) => {
                                                    const totalAvailable =
                                                        totalLevelsPerCategory[
                                                            catName
                                                        ]?.size || 0;
                                                    const isSemuaJenjang =
                                                        levels.length ===
                                                            totalAvailable &&
                                                        totalAvailable > 0;
                                                    const levelText =
                                                        isSemuaJenjang
                                                            ? 'Semua Jenjang'
                                                            : levels.join(', ');

                                                    return (
                                                        <Badge
                                                            key={catName}
                                                            variant="secondary"
                                                            className="w-fit border-border/50 bg-muted/40 text-left whitespace-normal shadow-sm"
                                                        >
                                                            <span className="mr-1.5 font-bold text-foreground">
                                                                {catName}:
                                                            </span>
                                                            <span className="font-medium text-muted-foreground">
                                                                {levelText}
                                                            </span>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">
                                                Belum ada kategori yang
                                                ditetapkan
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                                        {userRole === 'committee' && (
                                            <Link
                                                href={`/${userRole}/events/${eventPublicId}/judges/${eventJudge.event_judge_id}/edit`}
                                                className="w-full"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    <Edit className="mr-1.5 h-4 w-4" />{' '}
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                onDeleteClick(
                                                    eventJudge.event_judge_id,
                                                )
                                            }
                                        >
                                            <UserX className="mr-1.5 h-4 w-4" />{' '}
                                            Remove
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        Belum ada juri yang ditugaskan.
                    </div>
                )}
            </div>

            {/* VIEW DESKTOP: SHADCN TABLE (Disembunyikan di layar kecil) */}
            <div className="hidden w-full overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm md:block">
                <Table className="min-w-max border-collapse">
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="border-b border-border/50 p-4 font-semibold">
                                Nama & Kontak
                            </TableHead>
                            <TableHead className="border-b border-border/50 p-4 font-semibold">
                                Kategori Penilaian (Expertise)
                            </TableHead>
                            <TableHead className="border-b border-border/50 p-4 text-right font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {judges.length > 0 ? (
                            judges.map((eventJudge) => {
                                const judgeExpertises =
                                    eventJudge.judge_expertises ?? [];

                                // Kelompokkan expertise milik juri ini berdasarkan Kategori
                                const judgeAssignedMap = judgeExpertises.reduce(
                                    (acc, je) => {
                                        const catName =
                                            je.scoring_category?.master_category
                                                ?.category_name ||
                                            'Kategori Lainnya';
                                        const levelName =
                                            je.scoring_category?.event_level
                                                ?.level?.level_name ||
                                            'Jenjang Lainnya';
                                        if (!acc[catName]) acc[catName] = [];
                                        acc[catName].push(levelName);
                                        return acc;
                                    },
                                    {} as Record<string, string[]>,
                                );

                                return (
                                    <TableRow
                                        key={eventJudge.event_judge_id}
                                        className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/10"
                                    >
                                        <TableCell className="p-4">
                                            <div className="text-base font-semibold">
                                                {eventJudge.judge?.user?.name ??
                                                    '-'}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" />
                                                {eventJudge.judge?.user
                                                    ?.email ?? '-'}
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-4">
                                            {Object.keys(judgeAssignedMap)
                                                .length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(
                                                        judgeAssignedMap,
                                                    ).map(
                                                        ([catName, levels]) => {
                                                            const totalAvailable =
                                                                totalLevelsPerCategory[
                                                                    catName
                                                                ]?.size || 0;
                                                            const isSemuaJenjang =
                                                                levels.length ===
                                                                    totalAvailable &&
                                                                totalAvailable >
                                                                    0;
                                                            const levelText =
                                                                isSemuaJenjang
                                                                    ? 'Semua Jenjang'
                                                                    : levels.join(
                                                                          ', ',
                                                                      );

                                                            return (
                                                                <Badge
                                                                    key={
                                                                        catName
                                                                    }
                                                                    variant="secondary"
                                                                    className="border-border/50 bg-muted/40 text-left whitespace-normal shadow-sm"
                                                                >
                                                                    <span className="mr-1.5 font-bold text-foreground">
                                                                        {
                                                                            catName
                                                                        }
                                                                        :
                                                                    </span>
                                                                    <span className="font-medium text-muted-foreground">
                                                                        {
                                                                            levelText
                                                                        }
                                                                    </span>
                                                                </Badge>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    Belum ada kategori yang
                                                    ditetapkan
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {userRole === 'committee' && (
                                                    <Link
                                                        href={`/${userRole}/events/${eventPublicId}/judges/${eventJudge.event_judge_id}/edit`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Edit className="mr-1.5 h-4 w-4" />{' '}
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}
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
                                            </div>
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
                                    Belum ada juri yang ditugaskan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
