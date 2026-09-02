import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from '@/components/ui/drawer';

import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import type { Auth, BreadcrumbItem, NavItem } from '@/types';

type PageProps = {
    auth: Auth;
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

export function LandingPageHeader({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { props } = usePage();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    const isMobileDevice = props.isMobileDevice;
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Scroll state tracking
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-50 flex w-full flex-col border transition-all duration-300 ease-in-out md:mx-auto',
                isScrolled
                    ? 'top-4 mx-auto w-[calc(100%-2rem)] max-w-7xl rounded-2xl border-sidebar-border/80 bg-background/60 shadow-md backdrop-blur-md'
                    : 'top-0 w-full max-w-full rounded-none border-transparent bg-background shadow-none backdrop-blur-none',
            )}
        >
            <div className="w-full">
                <div className="mx-auto flex h-16 w-full items-center justify-between px-4">
                    <div className="flex flex-1 items-center justify-start">
                        <div className="lg:hidden">
                            <Drawer direction="top">
                                <DrawerTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mr-2 h-8.5 w-8.5"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent className="top-0 mt-0 flex h-auto flex-col rounded-t-none rounded-b-2xl border-b bg-sidebar px-4 pt-4 pb-8">
                                    <DrawerTitle className="sr-only">
                                        Navigation menu
                                    </DrawerTitle>
                                    <DrawerHeader className="flex flex-row items-center justify-between px-0 text-left">
                                        <AppLogo variants="horizontal" />
                                        <DrawerClose asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <X className="h-5 w-5" />
                                                <span className="sr-only">
                                                    Close
                                                </span>
                                            </Button>
                                        </DrawerClose>
                                    </DrawerHeader>
                                    <div className="mt-6 flex flex-col space-y-6">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                            <AppearanceToggle />
                                        </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        </div>

                        <Link
                            href={'/'}
                            prefetch
                            className="flex items-center space-x-2"
                        >
                            {isMobileDevice ? (
                                <AppLogo variants="icon" />
                            ) : (
                                <AppLogo variants="horizontal" />
                            )}
                        </Link>
                    </div>

                    {/* BAGIAN TENGAH: Desktop Navigation (di-tengah) */}
                    <div className="hidden shrink-0 items-center justify-center lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* BAGIAN KANAN: Login & Register */}
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <nav className="flex items-center justify-end gap-4">
                            <AppearanceToggle />

                            {props.auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild></DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                            ></DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
