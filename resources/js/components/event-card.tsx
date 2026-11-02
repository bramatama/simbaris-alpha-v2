import React, { useState } from 'react';
import { Calendar, ImageOff, MapPin } from 'lucide-react';

export interface EventData {
    event_id: number;
    public_id: string;
    event_name: string;
    location: string;
    status: string;
    start_time: string;
    end_time: string;
    poster_path?: string | null;
}

interface EventCardProps {
    event: EventData;
}

export default function EventCard({ event }: EventCardProps) {
    const [imageError, setImageError] = useState(false);

    const hasPoster = Boolean(event.poster_path) && !imageError;

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
                return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
            case 'active':
            case 'ongoing':
                return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
            case 'finished':
                return 'bg-muted text-muted-foreground border border-border';
            default:
                return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
        }
    };

    return (
        /* PERBAIKAN: Tambahkan h-full agar semua kartu berukuran sama tinggi */
        <div className="group flex h-full w-full max-w-60 flex-col overflow-hidden rounded-xl border border-border/70 bg-card font-sans text-card-foreground shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
            {/* POSTER & STATUS */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                {hasPoster ? (
                    <img
                        src={`/storage/${event.poster_path}`}
                        alt={event.event_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-800 via-slate-900 to-black p-4 text-center">
                        <div className="pointer-events-none absolute inset-0 opacity-10">
                            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full border-20 border-white" />
                            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full border-20 border-white" />
                            <div className="absolute top-1/2 left-0 h-px w-full bg-white/50" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-lg">
                                <ImageOff className="h-6 w-6" />
                            </div>

                            <div className="space-y-1">
                                <span className="block text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">
                                    Poster Event
                                </span>
                                <span className="block text-[9px] font-medium text-white/40">
                                    Belum Tersedia
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATUS BADGE */}
                {event.status && (
                    <div
                        className={`absolute top-2.5 left-2.5 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide shadow-xs backdrop-blur-md ${getStatusColor(event.status)}`}
                    >
                        {event.status === 'registration_open'
                            ? 'Pendaftaran'
                            : event.status === 'active' ||
                                event.status === 'ongoing'
                              ? 'Berlangsung'
                              : event.status === 'finished'
                                ? 'Selesai'
                                : 'Draft'}
                    </div>
                )}
            </div>

            {/* EVENT INFORMATION (Flex-1 & mt-auto menjaga judul & footer rata) */}

            {/* EVENT INFORMATION */}
            <div className="flex flex-1 flex-col justify-between p-3">
                <h3
                    className="line-clamp-2 text-xs leading-snug font-bold tracking-tight text-foreground uppercase sm:text-sm"
                    title={event.event_name}
                >
                    {event.event_name}
                </h3>

                <div className="mt-3 space-y-2 border-t border-border/40 pt-2 text-xs text-muted-foreground">
                    {/* Tanggal Event */}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate text-[11px] font-medium">
                            {formatDate(event.start_time, event.end_time)}
                        </span>
                    </div>

                    {/* Lokasi Event */}
                    <div className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span
                            className="line-clamp-2 text-[11px] leading-relaxed font-medium"
                            title={event.location}
                        >
                            {event.location || 'Lokasi belum ditentukan'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
