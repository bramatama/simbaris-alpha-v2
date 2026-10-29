import LayoutTemplate from '@/layouts/evaluation-page/layout';

export default function EvaluationAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LayoutTemplate>
            {children}
        </LayoutTemplate>
    );
}