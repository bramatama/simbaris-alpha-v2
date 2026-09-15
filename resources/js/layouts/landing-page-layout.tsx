import LandingPageLayoutTemplate from '@/layouts/landing-page/layout';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LandingPageLayoutTemplate>
            {children}
        </LandingPageLayoutTemplate>
    );
}
