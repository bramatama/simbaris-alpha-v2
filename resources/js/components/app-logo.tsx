import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

type AppLogoProps = {
    variants?: 'horizontal' | 'vertical' | 'icon';
    className?: string;
};

export default function AppLogo({
    variants = 'icon',
    className,
}: AppLogoProps) {
    const { props } = usePage();
    const appName = props.name;

    if (variants === 'icon') {
        return (
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground transition-all ease-in-out dark:bg-sidebar-primary">
                <AppLogoIcon
                    className={cn(
                        'size-8 fill-current text-black dark:size-5 dark:text-white',
                        className
                    )}
                />
            </div>
        );
    }

    if (variants === 'horizontal') {
        return (
            <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground dark:bg-sidebar-primary">
                    <AppLogoIcon
                        className={cn(
                            'size-8 fill-current text-black dark:size-5 dark:text-white',
                            className,
                        )}
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
                <AppLogoIcon
                    className={cn(
                        'size-8 fill-current text-black dark:size-5 dark:text-white',
                        className,
                    )}
                />
            </div>

            <span className="max-w-32 truncate text-center text-sm font-semibold">
                {appName}
            </span>
        </div>
    );
}
