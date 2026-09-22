import { router } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useSidebar } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function SidebarStateManager({ isInnerLayout }: { isInnerLayout: boolean }) {
    const { setOpen } = useSidebar();
    const { url } = usePage(); 
    const prevUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (prevUrlRef.current !== url) {
            setOpen(!isInnerLayout);
            prevUrlRef.current = url; 
        }
    }, [url, isInnerLayout, setOpen]);

    return null;
}

export default function AppLayout({
    children,
    isInnerLayout = false,
}: {
    children: React.ReactNode;
    isInnerLayout?: boolean;
}) {
    useEffect(() => {
        const unsubscribe = router.on('success', (event) => {
            const flash = event.detail.page.props.flash as any;

            if (flash?.success) {
                toast.success('Berhasil', {
                    description: flash.success,
                });
            }

            if (flash?.error) {
                toast.error('Terjadi Kesalahan', {
                    description: flash.error,
                });
            }

            if (flash?.message) {
                toast.message('Informasi', {
                    description: flash.message,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AppLayoutTemplate>
            <SidebarStateManager isInnerLayout={isInnerLayout} />
            {children}
            <Toaster richColors position="bottom-right" />
        </AppLayoutTemplate>
    );
}
