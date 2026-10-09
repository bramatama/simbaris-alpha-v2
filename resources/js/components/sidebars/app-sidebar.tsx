import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheckIcon,
    CalendarClockIcon,
    FolderGit2,
    LayoutGrid,
    Moon,
    Sun,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/sidebars/nav-footer';
import { NavMain } from '@/components/sidebars/nav-main';
import { NavUser } from '@/components/sidebars/nav-user';
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
import { getMainNavItems } from '@/config/sidebar';

export function AppSidebar() {
    const { props } = usePage();
    const userRole = (props as { auth?: { user?: { role?: string } } }).auth
        ?.user?.role;
    const mainNavItems = getMainNavItems(userRole);
    const { appearance, updateAppearance } = useAppearance();
    const footerNavItems = [
        {
            title: 'Dark Theme',
            icon: appearance === 'dark' ? Moon : Sun,
            isSwitch: true,
            switchChecked: appearance === 'dark',
            onClick: () => {
                updateAppearance(appearance === 'dark' ? 'light' : 'dark');
            },
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo variants="horizontal" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={mainNavItems}
                    title={userRole?.toUpperCase() ?? ''}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
