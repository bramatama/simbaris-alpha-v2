import type { Auth } from '@/types/auth';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    // Kita menimpa tipe bawaan Inertia agar sesuai dengan Middleware Laravel kamu
    export interface PageProps extends InertiaPageProps {
        name: string;
        auth: Auth;
        sidebarOpen: boolean;
        isMobileDevice: boolean;
    }
}
