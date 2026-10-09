import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/sidebars/app-sidebar';
import { AppSidebarHeader } from '@/components/sidebars/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-clip">
                <AppSidebarHeader />
                {children}
            </AppContent>
        </AppShell>
    );
}
