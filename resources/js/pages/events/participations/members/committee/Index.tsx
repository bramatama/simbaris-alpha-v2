import { Head, Link, usePage } from '@inertiajs/react';
import InnerAppLayout from '@/layouts/app/inner-app-layout';
import { getParticipationInnerNav } from '@/config/inner_sidebar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageProps } from '@inertiajs/core';
import { ArrowLeft, ShieldAlert, Users, UserCheck, User } from 'lucide-react';

export default function CommitteeParticipationMembers({
    participation,
}: {
    participation: any;
}) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.role;

    const members = participation.team_members || [];

    // Kelompokkan anggota berdasarkan perannya
    const commanders = members.filter(
        (m: any) => m.member_role === 'commander',
    );
    const troops = members.filter((m: any) => m.member_role === 'member');
    const reserves = members.filter((m: any) => m.member_role === 'reserve');

    // Komponen kartu read-only untuk panitia
    const renderMemberCard = (member: any, fallbackPosition: string) => {
        return (
            <div
                key={member.team_member_id}
                className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30"
            >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="flex shrink-0 justify-center">
                        <div className="flex aspect-3/4 w-28 flex-col items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                            {member.member_photo_path ? (
                                <img
                                    src={`/storage/${member.member_photo_path}`}
                                    alt={member.member_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="p-2 text-center">
                                    <User className="mx-auto h-8 w-8 text-muted-foreground/30" />
                                    <span className="mt-1 block text-[10px] font-medium text-muted-foreground">
                                        Tanpa Foto
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-center space-y-2">
                        <div>
                            <h4 className="text-sm leading-tight font-semibold text-foreground">
                                {member.member_name}
                            </h4>
                            <Badge
                                variant="secondary"
                                className="mt-2 text-[10px] font-medium uppercase"
                            >
                                {member.member_position || fallbackPosition}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <InnerAppLayout
            sidebarNavItems={getParticipationInnerNav(participation.public_id)}
        >
            <Head title={`Data Anggota - ${participation.team_name}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={`/${userRole}/participations/${participation.public_id}/information`}
                            className="mb-2 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke
                            Detail Pendaftaran
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Data Anggota Tim
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Tinjauan formasi anggota{' '}
                            <strong>{participation.team_name}</strong>.
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* BAGIAN 1: KOMANDAN PASUKAN */}
                    <Card className="border-t-4 border-border/50 border-t-emerald-500 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-emerald-600">
                                <ShieldAlert className="h-5 w-5" /> Komandan
                                Pasukan
                            </CardTitle>
                            <CardDescription>
                                Pemimpin utama regu saat berada di arena lomba.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {commanders.map((member: any) =>
                                    renderMemberCard(member, 'Danton'),
                                )}
                            </div>
                            {commanders.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Tim belum mendaftarkan komandan.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* BAGIAN 2: PASUKAN INTI */}
                    <Card className="border-t-4 border-border/50 border-t-primary shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-primary">
                                <Users className="h-5 w-5" /> Pasukan Inti (
                                {troops.length} Orang)
                            </CardTitle>
                            <CardDescription>
                                Anggota pasukan yang terdaftar untuk bertanding.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-muted/5 p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {troops.map((member: any) =>
                                    renderMemberCard(member, 'Pasukan'),
                                )}
                            </div>
                            {troops.length === 0 && (
                                <div className="mt-2 rounded-xl border-2 border-dashed border-border/50 py-12 text-center text-sm text-muted-foreground">
                                    Tim belum melengkapi formasi pasukan inti.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* BAGIAN 3: PELATIH, OFFICIAL & CADANGAN */}
                    <Card className="border-t-4 border-border/50 border-t-orange-500 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg text-orange-600">
                                <UserCheck className="h-5 w-5" /> Pelatih &
                                Official
                            </CardTitle>
                            <CardDescription>
                                Tim pendamping di luar arena dan pasukan
                                cadangan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {reserves.map((member: any) =>
                                    renderMemberCard(member, 'Official'),
                                )}
                            </div>
                            {reserves.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Tim belum mendaftarkan pelatih atau official
                                    cadangan.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </InnerAppLayout>
    );
}
