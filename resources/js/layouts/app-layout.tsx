import { router } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // router.on('success') akan memantau setiap kali request Inertia (seperti form submit) selesai dan berhasil
        const unsubscribe = router.on('success', (event) => {
            // Ambil data flash langsung dari payload event Inertia
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
            {children}
            <Toaster richColors position="bottom-right" />
        </AppLayoutTemplate>
    );
}
