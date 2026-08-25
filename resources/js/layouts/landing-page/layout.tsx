import { AppContent } from '@/components/app-content';
import { LandingPageHeader } from '@/components/landing-page-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function LandingPageLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <LandingPageHeader/>
            <AppContent variant="header">{children}</AppContent>
        </AppShell>
    );
}
