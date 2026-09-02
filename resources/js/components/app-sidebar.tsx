import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarCheckIcon, CalendarClockIcon, FolderGit2, LayoutGrid, Moon } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';

const getMainNavItems = (userRole?: string): NavItem[] => {
    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Add User Management only for admin users
    if (userRole === 'admin') {
        items.push({
            title: 'User Management',
            href: '/admin/users',
            icon: FolderGit2,
        });
        items.push({
            title: 'Event Management',
            href: '/events',
            icon: CalendarCheckIcon,
        });
    }

    if (userRole == 'committee') {
        items.push({
            title: 'Hosted Events',
            href: '/my-events',
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
            title: 'My Events',
            href: '/my-events',
            icon: CalendarClockIcon,
        });
    }
    return items;
};

export function AppSidebar() {
    const { props } = usePage();
    const userRole = props.auth?.user?.role;
    const mainNavItems = getMainNavItems(userRole);
    const { appearance, updateAppearance } = useAppearance();

    const footerNavItems = [
        {
            title: 'Dark Theme',
            icon: Moon,
            isSwitch: true,
            switchChecked: appearance === 'dark',
            onClick: () =>
                updateAppearance(appearance === 'dark' ? 'light' : 'dark'),
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo variants='horizontal' />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
