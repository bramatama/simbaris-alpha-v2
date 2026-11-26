import type { PageProps } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import InnerSidebar from '@/components/sidebars/inner-app-sidebar';
import type { NavItem } from '@/types';
import AppLayout from '../app-layout';

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
