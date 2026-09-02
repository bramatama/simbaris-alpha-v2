import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

type AppLogoProps = {
    variants?: 'horizontal' | 'vertical' | 'icon';
};

export default function AppLogo({ variants = 'icon' }: AppLogoProps) {
    const { props } = usePage();
    const appName = props.name;


    if (variants === 'icon') {
        return (
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground dark:bg-sidebar-primary transition-all ease-in-out">
                <img
                    src="assets/img/logo_simbaris_icon.png"
                    alt="Logo"
                    className="size-8 fill-current text-black dark:size-5 dark:text-white"
                />
            </div>
        );
    }

    if (variants === 'horizontal') {
        return (
            <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground dark:bg-sidebar-primary">
                    <img
                        src="assets/img/logo_simbaris_icon.png"
                        alt="Logo"
                        className="size-8 fill-current text-black dark:size-5 dark:text-white"
                    />
                </div>

                <div className="grid text-left text-sm">
                    <span className="truncate leading-tight font-semibold">
                        {appName}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <img
                    src="assets/img/logo_simbaris_icon.png"
                    alt="Logo"
                    className="size-5 fill-current text-black dark:text-white"
                />
            </div>

            <span className="max-w-32 truncate text-center text-sm font-semibold">
                {appName}
            </span>
        </div>
    );
}
