import React from 'react';
import { Calendar } from 'lucide-react';

export interface EventData {
    event_id: number;
    public_id: string;
    event_name: string;
    status: string;
    start_time: string;
    end_time: string;
    poster_path?: string | null;
}

interface EventCardProps {
    event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
    const formatDate = (start: string, end?: string): string => {
        if (!start) return '-';
        const startDate = new Date(start).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });
        const endDate = end
            ? new Date(end).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
              })
            : null;

        return startDate === endDate || !endDate
            ? startDate
            : `${startDate} - ${endDate}`;
    };

    const getStatusColor = (currentStatus: string) => {
        switch (currentStatus) {
            case 'registration_open':
                return 'bg-success text-success-foreground';
            case 'active':
                return 'bg-info text-info-foreground';
            case 'finished':
                return 'bg-muted text-muted-foreground';
            default:
                return 'bg-warning text-warning-foreground';
        }
    };


    return (
        // max-w-[200px] untuk membatasi ukuran card agar lebih kecil
        <div className="group mx-auto flex w-full max-w-50 flex-col overflow-hidden rounded-(--radius) border border-border bg-card font-sans text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            {/* --- Bagian Poster & Status --- */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                <img
                    src={`/storage/${event.poster_path}`}
                    alt={event.event_name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {event.status && (
                    // Badge lebih kecil, margin lebih rapat
                    <div
                        className={`absolute top-2 left-2 rounded px-2 py-0.5 text-[9px] font-bold tracking-wide capitalize shadow-sm ${getStatusColor(event.status)}`}
                    >
                        {event.status.replace(/_/g, ' ')}
                    </div>
                )}
            </div>

            {/* --- Bagian Informasi Utama --- */}
            {/* Padding dikurangi (p-3) */}
            <div className="flex flex-1 flex-col gap-2 bg-card p-3">
                {/* Judul lebih kecil (text-sm) tapi tetap bold dan uppercase */}
                <h3
                    className="line-clamp-2 text-sm leading-tight font-bold text-foreground uppercase"
                    title={event.event_name}
                >
                    {event.event_name}
                </h3>

                <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                            {formatDate(event.start_time, event.end_time)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
