import type { NavItem } from '@/types';
import {
    InfoIcon,
    Gavel,
    Edit,
    Star,
    DoorStairwell,
    FileText,
    UserGroup,
    NotebookPen,
    TriangleAlert,
    Trophy,
    CalendarCheck2,
    Medal,
    ListOrdered,
    Podium,
    Summary,
    ClipboardClock,
    Save,
    Timer,
    ClipboardCheck,
} from 'lucide-react';

export const getMasterDataInnerNav = (): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Daftar Event',
            href: '/events',
            icon: CalendarCheck2,
        },
        {
            title: 'Kategori Penilaian',
            href: `/admin/master-scorings`,
            icon: NotebookPen,
        },
        {
            title: 'Kategori Juara',
            href: `/admin/master-champion-categories`,
            icon: Trophy,
        },
        {
            title: 'Kategori Penalti',
            href: `/admin/master-penalties`,
            icon: TriangleAlert,
        },
    ];
    return items;
};

export const getEventInnerNav = (
    eventPublicId: string,
    role: string,
    position?: string,
): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Informasi Umum',
            href: `/${role}/events/${eventPublicId}/information`,
            icon: InfoIcon,
        },
    ];

    if (role === 'admin') {
        items.push(
            {
                title: 'Edit Lomba',
                href: `/${role}/events/${eventPublicId}/edit`,
                icon: Edit,
            },
            {
                title: 'Panitia Lomba',
                href: `/${role}/events/${eventPublicId}/committees`,
                icon: Star,
            },
        );
    }

    if (role === 'committee') {
        const normalizedPosition = position?.toLowerCase();
        if (normalizedPosition === 'administration') {
            items.push(
                {
                    title: 'Edit Lomba',
                    href: `/${role}/events/${eventPublicId}/edit`,
                    icon: Edit,
                },
                {
                    title: 'Panitia Lomba',
                    href: `/${role}/events/${eventPublicId}/committees`,
                    icon: Star,
                },
                {
                    title: 'Manajemen Jenjang',
                    href: `/${role}/events/${eventPublicId}/levels`,
                    icon: DoorStairwell,
                },
                {
                    title: 'Dokumen Lomba',
                    href: `/${role}/events/${eventPublicId}/documents`,
                    icon: FileText,
                },
                {
                    title: 'Manajemen Penilaian',
                    href: `/${role}/events/${eventPublicId}/scoring-categories`,
                    icon: NotebookPen,
                },
                {
                    title: 'Juri Lomba',
                    href: `/${role}/events/${eventPublicId}/judges`,
                    icon: Gavel,
                },
                {
                    title: 'Manajemen Juara',
                    href: `/${role}/events/${eventPublicId}/champions`,
                    icon: Trophy,
                },
                {
                    title: 'Manajemen Penalti',
                    href: `/${role}/events/${eventPublicId}/penalties`,
                    icon: TriangleAlert,
                },
                {
                    title: 'Ketentuan Juara',
                    href: `/${role}/events/${eventPublicId}/formulas`,
                    icon: Medal,
                },
                {
                    title: 'Peserta Lomba',
                    href: `/${role}/events/${eventPublicId}/participations`,
                    icon: UserGroup,
                },
                {
                    title: 'Urutan Tampil',
                    href: `/${role}/events/${eventPublicId}/participation-orders`,
                    icon: ListOrdered,
                },
                {
                    title: 'Hasil Perlombaan',
                    href: `/${role}/events/${eventPublicId}/leaderboard`,
                    icon: Podium,
                },
            );
        }

        // ---------------------------------------------------------------------
        // B. POSISI AUDITOR (Fokus Monitoring, Timer, Penalti, & Rekap)
        // ---------------------------------------------------------------------
        else if (normalizedPosition === 'auditor') {
            items.push(
                {
                    title: 'Urutan Tampil',
                    href: `/${role}/events/${eventPublicId}/participation-orders`,
                    icon: ClipboardCheck,
                },
                {
                    title: 'Hasil Perlombaan',
                    href: `/${role}/events/${eventPublicId}/leaderboard`,
                    icon: Podium,
                },
            );
        }

        // ---------------------------------------------------------------------
        // C. FALLBACK / POSISI LAINNYA (Tampilkan Semua Menu)
        // ---------------------------------------------------------------------
        else {
            items.push(
                {
                    title: 'Edit Lomba',
                    href: `/${role}/events/${eventPublicId}/edit`,
                    icon: Edit,
                },
                {
                    title: 'Panitia Lomba',
                    href: `/${role}/events/${eventPublicId}/committees`,
                    icon: Star,
                },
                {
                    title: 'Manajemen Jenjang',
                    href: `/${role}/events/${eventPublicId}/levels`,
                    icon: DoorStairwell,
                },
                {
                    title: 'Dokumen Lomba',
                    href: `/${role}/events/${eventPublicId}/documents`,
                    icon: FileText,
                },
                {
                    title: 'Manajemen Penilaian',
                    href: `/${role}/events/${eventPublicId}/scoring-categories`,
                    icon: NotebookPen,
                },
                {
                    title: 'Juri Lomba',
                    href: `/${role}/events/${eventPublicId}/judges`,
                    icon: Gavel,
                },
                {
                    title: 'Manajemen Juara',
                    href: `/${role}/events/${eventPublicId}/champions`,
                    icon: Trophy,
                },
                {
                    title: 'Manajemen Penalti',
                    href: `/${role}/events/${eventPublicId}/penalties`,
                    icon: TriangleAlert,
                },
                {
                    title: 'Ketentuan Juara',
                    href: `/${role}/events/${eventPublicId}/formulas`,
                    icon: Medal,
                },
                {
                    title: 'Peserta Lomba',
                    href: `/${role}/events/${eventPublicId}/participations`,
                    icon: UserGroup,
                },
                {
                    title: 'Urutan Tampil',
                    href: `/${role}/events/${eventPublicId}/participation-orders`,
                    icon: ListOrdered,
                },
                {
                    title: 'Hasil Perlombaan',
                    href: `/${role}/events/${eventPublicId}/leaderboard`,
                    icon: Podium,
                },
            );
        }
    }

    return items;
};

export const getParticipationInnerNav = (
    participationId: string,
    eventId: string,
): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Informasi Event',
            href: `/official_team/events/${eventId}/information`,
            icon: InfoIcon,
        },
        {
            title: 'Informasi Pendaftaran',
            href: `/official_team/events/${eventId}/participations/${participationId}/information`,
            icon: Save,
        },
        {
            title: 'Edit Pendaftaran',
            href: `/official_team/events/${eventId}/participations/${participationId}/edit`,
            icon: Edit,
        },
        {
            title: 'Dokumen Pendaftaran',
            href: `/official_team/events/${eventId}/participations/${participationId}/documents`,
            icon: FileText,
        },
        {
            title: 'Manajemen Pasukan',
            href: `/official_team/events/${eventId}/participations/${participationId}/members`,
            icon: UserGroup,
        },
        {
            title: 'Hasil Penilaian',
            href: `/official_team/events/${eventId}/participations/${participationId}/evaluation-result`,
            icon: NotebookPen,
        },
        {
            title: 'Rekap Penilaian',
            href: `/official_team/events/${eventId}/participations/${participationId}/my-recap`,
            icon: Summary,
        },
        {
            title: 'Log Penilaian',
            href: `/official_team/events/${eventId}/participations/${participationId}/audit-logs`,
            icon: ClipboardClock,
        },
        {
            title: 'Hasil Perlombaan',
            href: `/official_team/events/${eventId}/leaderboard`,
            icon: Podium,
        },
    ];
    return items;
};

export const getEvaluationInnerNav = (eventPublicId: string): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Daftar Peserta',
            href: `/judge/events/${eventPublicId}/participants`,
            icon: UserGroup,
        },
        {
            title: 'Preview Form Penilaian',
            href: `/judge/events/${eventPublicId}/form-previews`,
            icon: NotebookPen,
        },
    ];
    return items;
};
