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
        );
    }

    return items;
};

export const getParticipationInnerNav = (
    participationId: string,
): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Informasi Umum',
            href: `/official_team/participations/${participationId}/information`,
            icon: InfoIcon,
        },
        {
            title: 'Edit Pendaftaran',
            href: `/official_team/participations/${participationId}/edit`,
            icon: Edit,
        },
        {
            title: 'Dokumen Peserta',
            href: `/official_team/participations/${participationId}/documents`,
            icon: FileText,
        },
        {
            title: 'Manajemen Pasukan',
            href: `/official_team/participations/${participationId}/members`,
            icon: UserGroup,
        },
    ];
    return items;
};
