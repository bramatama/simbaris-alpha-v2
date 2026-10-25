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
                title: 'User Management',
                href: '/admin/users',
                icon: FolderGit2,
            },
            {
                title: 'Event Management',
                href: '/events',
                icon: CalendarCheckIcon,
            },
            {
                title: 'Profile',
                href: '/profile',
                icon: User,
            },
        );
    }

    if (userRole == 'committee') {
        items.push({
            title: 'Hosted Events',
            href: '/committee/my-events',
            icon: CalendarClockIcon,
        });
    }

    if (userRole == 'official_team') {
        items.push({
            title: 'Events',
            href: '/events',
            icon: CalendarCheckIcon,
        });
        items.push({
            title: 'My Participations',
            href: '/official_team/my-participations',
            icon: CalendarClockIcon,
        });
    }
    return items;
};
