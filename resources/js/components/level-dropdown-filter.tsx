import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface EventLevel {
    event_level_id: number;
    level: {
        level_name: string;
    };
}

interface LevelDropdownFilterProps {
    eventLevels: EventLevel[];
    activeLevelId: number | null;
    onLevelChange: (levelIdStr: string) => void;
    placeholder?: string;
    className?: string;
}

export function LevelDropdownFilter({
    eventLevels = [],
    activeLevelId,
    onLevelChange,
    placeholder = 'Pilih jenjang perlombaan...',
    className = 'w-full sm:w-64',
}: LevelDropdownFilterProps) {
    if (eventLevels.length === 0) return null;

    return (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:hidden">
                Filter Jenjang:
            </span>
            <div className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-1.5 sm:w-fit">
                <Filter className="mr-2 h-4 w-4 shrink-0 text-muted-foreground sm:mr-0 sm:ml-2" />
                <Select
                    value={activeLevelId?.toString() || ''}
                    onValueChange={onLevelChange}
                >
                    <SelectTrigger
                        className={`border-none bg-background shadow-sm ${className}`}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {eventLevels.map((level) => (
                            <SelectItem
                                key={level.event_level_id}
                                value={level.event_level_id.toString()}
                            >
                                {level.level.level_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
