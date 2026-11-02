import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Home,
    ShieldAlert,
    SearchX,
    ClockAlert,
    ServerCrash,
    Wrench,
} from 'lucide-react';

const errorConfig: Record<
    number,
    { title: string; description: string; icon: typeof ShieldAlert }
> = {
    403: {
        title: 'Akses Ditolak',
        description:
            'Maaf, kamu tidak memiliki izin untuk mengakses halaman ini.',
        icon: ShieldAlert,
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description:
            'Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.',
        icon: SearchX,
    },
    419: {
        title: 'Sesi Telah Berakhir',
        description:
            'Sesi kamu telah berakhir. Silakan muat ulang halaman atau login kembali.',
        icon: ClockAlert,
    },
    500: {
        title: 'Terjadi Kesalahan',
        description:
            'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
        icon: ServerCrash,
    },
    503: {
        title: 'Sedang Dalam Pemeliharaan',
        description:
            'Sistem sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.',
        icon: Wrench,
    },
};

export default function ErrorPage({ status = 500 }) {
    const error = errorConfig[status] ?? {
        title: 'Terjadi Kesalahan',
        description: 'Terjadi kesalahan yang tidak terduga.',
        icon: ServerCrash,
    };

    const Icon = error.icon;

    return (
        <>
            <Head title={`${status} - ${error.title}`} />

            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="rounded-2xl bg-primary/10 p-6">
                            <Icon className="h-14 w-14 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-7xl font-bold tracking-tight text-primary">
                            {status}
                        </p>

                        <h1 className="text-2xl font-bold">{error.title}</h1>

                        <p className="text-muted-foreground">
                            {error.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </button>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            <Home className="h-4 w-4" />
                            Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
