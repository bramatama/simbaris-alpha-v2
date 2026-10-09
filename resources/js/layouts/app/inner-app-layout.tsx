import { Separator } from '@/components/ui/separator';
import AppLayout from '../app-layout';
import InnerSidebar from '@/components/sidebars/inner-app-sidebar';
import { PropsWithChildren, useEffect } from 'react';
import { NavItem } from '@/types';
import { useSidebar } from '@/components/ui/sidebar';

type InnerAppLayoutProps = PropsWithChildren<{
    sidebarNavItems: NavItem[];
    title?: string;
    description?: string;
}>;

export default function InnerAppLayout({
    children,
    sidebarNavItems,
}: InnerAppLayoutProps) {
    return (
        <AppLayout isInnerLayout={true}>
            <div className="flex items-start gap-8">
                <InnerSidebar items={sidebarNavItems} />
                <Separator className="my-6 lg:hidden" />
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </AppLayout>
    );
}
