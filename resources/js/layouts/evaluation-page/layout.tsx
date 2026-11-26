import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { EvaluationHeader } from '@/components/evaluation-header';
import type { AppLayoutProps } from '@/types';

export default function LandingPageLayout({ children }: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <EvaluationHeader />
            <AppContent variant="header">{children}</AppContent>
        </AppShell>
    );
}
