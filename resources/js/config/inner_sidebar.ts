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
} from 'lucide-react';

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

    if (role === 'committee' || role === 'admin') {
        items.splice(
            1,
            0,
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
                title: 'Peserta Lomba',
                href: `/${role}/events/${eventPublicId}/participations`,
                icon: UserGroup,
            },
            {
                title: 'Juri Lomba',
                href: `/${role}/events/${eventPublicId}/judges`,
                icon: Gavel,
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
