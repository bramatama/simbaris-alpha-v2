import { Head, Link, useForm, usePage } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getEventInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, UserCheck, ShieldAlert } from 'lucide-react';
import type { PageProps } from '@inertiajs/core';
import type { Auth } from '@/types';

type Expertise = {
    scoring_category_id: number;
    event_level_id: number;
    level_name: string;
    category_name: string;
};

type JudgeExpertise = {
    judge_expertise_id: number;
    scoring_category_id?: number;
};

type EventJudge = {
    event_judge_id: number;
    judge?: {
        judge_id: number;
        user?: {
            name: string;
            email: string;
        };
    };
    judge_expertises?: JudgeExpertise[];
    judgeExpertises?: JudgeExpertise[];
};

type EventData = {
    public_id: string;
    event_name: string;
};

type EditJudgeProps = {
    event: EventData;
    eventJudge: EventJudge;
    expertises: Expertise[];
};

export default function EditJudge({
    event,
    eventJudge,
    expertises = [],
}: EditJudgeProps) {
    const { auth } = usePage<PageProps & { auth: Auth }>().props;
    const userRole = auth.user.role;

    const currentExpertiseIds = (
        eventJudge.judge_expertises ||
        eventJudge.judgeExpertises ||
        []
    )
        .map((exp: JudgeExpertise) => exp.scoring_category_id)
        .filter((id): id is number => id !== undefined);

    const { data, setData, put, processing, errors } = useForm({
        expertise_ids: currentExpertiseIds as number[],
    });

    // Kelompokkan kategori berdasarkan Kategori Induk (Expertise), BUKAN Jenjang
    const expertisesByCategory = expertises.reduce<Record<string, Expertise[]>>(
        (groups, exp) => {
            const catName = exp.category_name || 'Kategori Lainnya';
            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(exp);
            return groups;
        },
        {},
    );

    const toggleExpertise = (categoryId: number, checked: boolean) => {
        if (checked) {
            setData('expertise_ids', [...data.expertise_ids, categoryId]);
        } else {
            setData(
                'expertise_ids',
                data.expertise_ids.filter((id) => id !== categoryId),
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/${userRole}/events/${event.public_id}/judges/${eventJudge.event_judge_id}`,
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getEventInnerNav(event.public_id, userRole)}
        >
            <Head title={`Edit Penugasan Juri - ${event.event_name}`} />

            <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <Link
                        href={`/${userRole}/events/${event.public_id}/judges`}
                        className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" /> Kembali ke Daftar
                        Juri
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Edit Penugasan Juri
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Perbarui nama dan penugasan kategori penilaian juri
                        untuk acara <strong>{event.event_name}</strong>.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Menggunakan grid untuk layout Kiri (Info) & Kanan (Penugasan) */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                        {/* =======================
                            KOLOM KIRI (Info Akun & Tombol Aksi Desktop) 
                            ======================= */}
                        <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:col-span-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <UserCheck className="h-5 w-5 text-primary" />{' '}
                                        Informasi Akun Juri
                                    </CardTitle>
                                    <p className='text-xs text-muted-foreground'>Hanya Akun Juri Terkait yang dapat mengganti Nama dan Email pribadinya</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Nama Lengkap Juri
                                        </Label>
                                        <Input
                                            id="name"
                                            value={
                                                eventJudge.judge?.user?.name ||
                                                ''
                                            }
                                            disabled
                                            className="cursor-not-allowed bg-muted opacity-75"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email (Permanen)
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={
                                                eventJudge.judge?.user?.email ||
                                                ''
                                            }
                                            disabled
                                            className="cursor-not-allowed bg-muted opacity-75"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* TOMBOL AKSI: Muncul di bawah Info Akun HANYA untuk Desktop (lg:flex) */}
                            <div className="hidden flex-col gap-3 lg:flex">
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.expertise_ids.length === 0
                                    }
                                    className="w-full gap-2"
                                    size="lg"
                                >
                                    <Save className="h-4 w-4" />{' '}
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </Button>
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/judges`}
                                    className="w-full"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        size="lg"
                                    >
                                        Batal
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* =======================
                            KOLOM KANAN (Penugasan Penilaian) 
                            ======================= */}
                        <div className="flex flex-col gap-6 lg:col-span-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Penugasan Kategori Penilaian
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih jenjang untuk masing-masing
                                        kategori yang ditangani oleh juri ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputError
                                        message={errors.expertise_ids}
                                    />

                                    {Object.keys(expertisesByCategory).length >
                                    0 ? (
                                        <div className="grid gap-5 rounded-xl border bg-muted/10 p-2 sm:p-4">
                                            {Object.entries(
                                                expertisesByCategory,
                                            ).map(([catName, levels]) => {
                                                const levelIds = levels.map(
                                                    (l) =>
                                                        l.scoring_category_id,
                                                );
                                                const isAllSelected =
                                                    levelIds.every((id) =>
                                                        data.expertise_ids.includes(
                                                            id,
                                                        ),
                                                    );

                                                const toggleAll = () => {
                                                    if (isAllSelected) {
                                                        setData(
                                                            'expertise_ids',
                                                            data.expertise_ids.filter(
                                                                (id) =>
                                                                    !levelIds.includes(
                                                                        id,
                                                                    ),
                                                            ),
                                                        );
                                                    } else {
                                                        setData(
                                                            'expertise_ids',
                                                            [
                                                                ...new Set([
                                                                    ...data.expertise_ids,
                                                                    ...levelIds,
                                                                ]),
                                                            ],
                                                        );
                                                    }
                                                };

                                                return (
                                                    <div
                                                        key={catName}
                                                        className="space-y-3 rounded-lg border bg-card p-4 shadow-sm"
                                                    >
                                                        <div className="flex flex-col gap-3 border-b border-border/50 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-2">
                                                            <h4 className="text-sm font-bold text-foreground">
                                                                {catName}
                                                            </h4>
                                                            <Button
                                                                type="button"
                                                                variant={
                                                                    isAllSelected
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                                }
                                                                size="sm"
                                                                onClick={
                                                                    toggleAll
                                                                }
                                                                className="h-8 w-full px-3 text-xs sm:h-7 sm:w-auto sm:px-2.5"
                                                            >
                                                                {isAllSelected
                                                                    ? 'Batalkan Semua'
                                                                    : 'Pilih Semua Jenjang'}
                                                            </Button>
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {levels.map(
                                                                (category) => {
                                                                    const isChecked =
                                                                        data.expertise_ids.includes(
                                                                            category.scoring_category_id,
                                                                        );
                                                                    return (
                                                                        <Label
                                                                            key={
                                                                                category.scoring_category_id
                                                                            }
                                                                            className={`flex cursor-pointer items-center space-x-3 rounded-md border p-3 transition-colors ${isChecked ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50'}`}
                                                                        >
                                                                            <Checkbox
                                                                                checked={
                                                                                    isChecked
                                                                                }
                                                                                onCheckedChange={(
                                                                                    checked,
                                                                                ) =>
                                                                                    toggleExpertise(
                                                                                        category.scoring_category_id,
                                                                                        checked as boolean,
                                                                                    )
                                                                                }
                                                                            />
                                                                            <span className="flex-1 text-sm leading-none font-medium">
                                                                                {
                                                                                    category.level_name
                                                                                }
                                                                            </span>
                                                                        </Label>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600">
                                            <ShieldAlert className="h-5 w-5 shrink-0" />
                                            <span className="text-sm">
                                                Belum ada kategori penilaian.
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* TOMBOL AKSI: Muncul di bawah Penugasan HANYA untuk Mobile/Tablet (< lg) */}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end lg:hidden">
                                <Link
                                    href={`/${userRole}/events/${event.public_id}/judges`}
                                    className="w-full sm:w-auto"
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Batal
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.expertise_ids.length === 0
                                    }
                                    className="w-full gap-2 sm:w-auto"
                                >
                                    <Save className="h-4 w-4" />{' '}
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </InnerAppLayout>
    );
}
