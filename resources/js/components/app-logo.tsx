import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

type AppLogoProps = {
    variants?: 'horizontal' | 'vertical' | 'icon';
};

export default function AppLogo({ variants = 'icon' }: AppLogoProps) {
    const { name } = usePage<{ name: string }>().props;


    if (variants === 'icon') {
        return (
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img src="assets/img/logo_simbaris_icon.png" alt="Logo" className="size-5 fill-current text-white dark:text-black" />
            </div>
        );
    }

    if (variants === 'horizontal') {
        return (
            <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <img
                        src="assets/img/logo_simbaris_icon.png"
                        alt="Logo"
                        className="size-5 fill-current text-white dark:text-black"
                    />
                </div>

                <div className="grid text-left text-sm">
                    <span className="truncate leading-tight font-semibold">
                        {name}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img
                    src="assets/img/logo_simbaris_icon.png"
                    alt="Logo"
                    className="size-5 fill-current text-white dark:text-black"
                />
            </div>

            <span className="max-w-32 truncate text-center text-sm font-semibold">
                {name}
            </span>
        </div>
    );
}
