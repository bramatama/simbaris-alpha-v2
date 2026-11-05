import { NavItem } from '@/types';
import { dashboard } from '@/routes';
import {
    FolderGit2,
    CalendarCheckIcon,
    LayoutGrid,
    CalendarClockIcon,
    User,
} from 'lucide-react';

export const getMainNavItems = (userRole?: string): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (userRole === 'admin') {
        items.push(
            {
                title: 'Manajemen Pengguna',
                href: '/admin/users',
                icon: FolderGit2,
            },
            {
                title: 'Manajemen Event',
                href: '/events',
                icon: CalendarCheckIcon,
            },
        );
    }

    if (userRole == 'committee') {
        items.push({
            title: 'Event Saya',
            href: '/committee/my-events',
            icon: CalendarClockIcon,
        });
    }

    if (userRole == 'official_team') {
        items.push(
            {
                title: 'Event',
                href: '/events',
                icon: CalendarCheckIcon,
            },
            {
                title: 'Partisipasi Saya',
                href: '/official_team/my-participations',
                icon: CalendarClockIcon,
            },
        );
    }

    if (userRole == 'judge') {
        items.push({
            title: 'Event Penugasan',
            href: '/judge/assigned-events',
            icon: CalendarClockIcon,
        });
    }
    return items;
};
