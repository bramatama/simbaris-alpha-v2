import type { NavItem } from '@/types';
import { InfoIcon, Gavel, Edit, Star } from 'lucide-react';

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
        {
            title: 'Panitia Lomba',
            href: `/${role}/events/${eventPublicId}/committees`,
            icon: Star,
        },
        {
            title: 'Juri Lomba',
            href: `/${role}/events/${eventPublicId}/judges`,
            icon: Gavel,
        },
    ];

    if (role === 'committee' || 'admin') {
        items.splice(1, 0, {
            title: 'Edit Lomba',
            href: `/${role}/events/${eventPublicId}/edit`,
            icon: Edit,
        });
    }
    
    return items;
};
