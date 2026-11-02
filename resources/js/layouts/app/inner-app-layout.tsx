import { usePage } from '@inertiajs/react';
import AppLayout from '../app-layout';
import InnerSidebar from '@/components/sidebars/inner-app-sidebar';
import { PropsWithChildren } from 'react';
import { NavItem } from '@/types';
import { PageProps } from '@inertiajs/core';

type InnerAppLayoutProps = PropsWithChildren<{
    sidebarNavItems: NavItem[];
    title?: string;
    description?: string;
}>;

export default function InnerAppLayout({
    children,
    sidebarNavItems,
}: InnerAppLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth?.user?.role || '';
    const committeePosition = auth?.user?.committee_position;
    return (
        <AppLayout isInnerLayout={true}>
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
                <InnerSidebar
                    items={sidebarNavItems}
                    role={userRole}
                    position={committeePosition || undefined}
                />
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </AppLayout>
    );
}
