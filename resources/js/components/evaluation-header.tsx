import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { User, Clock, ClipboardPenLine } from 'lucide-react';

export function EvaluationHeader() {
    const { props } = usePage<any>();
    const userName = props.auth?.user?.name || 'Juri';

    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }),
            );
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 px-4 py-2.5 shadow-xs backdrop-blur-md">
            <div className="mx-auto grid max-w-7xl grid-cols-2 items-center md:grid-cols-3">
                {/* SISI KIRI: Informasi Juri */}
                <div className="flex items-center justify-start text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span className="max-w-30 truncate sm:max-w-none">
                            Juri:{' '}
                            <strong className="font-semibold">
                                {userName}
                            </strong>
                        </span>
                    </div>
                </div>

                {/* BAGIAN TENGAH: Teks "Formulir Penilaian" (Hidden di Mobile, Muncul di Desktop/MD ke atas) */}
                <div className="hidden items-center justify-center text-sm font-bold tracking-wide text-foreground md:flex">
                    <div className="flex items-center gap-2">
                        <ClipboardPenLine className="h-4 w-4 text-primary" />
                        <span>Formulir Penilaian</span>
                    </div>
                </div>

                {/* SISI KANAN: Jam Real-time */}
                <div className="flex items-center justify-end text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/40 px-3 py-1 font-mono font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                        <span>{currentTime || '--:--:--'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
