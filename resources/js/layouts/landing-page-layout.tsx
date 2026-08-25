import LandingPageLayoutTemplate from '@/layouts/landing-page/layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <LandingPageLayoutTemplate>
            {children}
        </LandingPageLayoutTemplate>
    );
}
