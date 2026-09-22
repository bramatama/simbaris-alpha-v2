import { Separator } from '@/components/ui/separator';
import AppLayout from '../app-layout';
import InnerSidebar from '@/components/inner-app-sidebar';
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
            <div>
                <div className="flex flex-col lg:flex-row">
                    <InnerSidebar items={sidebarNavItems} />
                    <Separator className="my-6 lg:hidden" />
                    <div className="flex-1">{children}</div>
                </div>
            </div>
        </AppLayout>
    );
}
