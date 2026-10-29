import { Link, usePage } from '@inertiajs/react';
import { Calendar, Home, Info, Menu, X } from 'lucide-react';
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

import { cn, toUrl } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import type { Auth, NavItem } from '@/types';
import { PageProps } from '@inertiajs/core';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/',
        icon: Home,
    },
    {
        title: 'About',
        href: '/#about',
        icon: Info,
    },
    {
        title: 'Events',
        href: '/#events',
        icon: Calendar,
    },
];

const activeItemStyles = 'dark:text-neutral-100 text-neutral-900';

export function LandingPageHeader({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { props, url } = usePage<PageProps>();

    const isMobileDevice = props.isMobileDevice;
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const [activeSection, setActiveSection] = useState<string>('/');

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (url === '/') {
            setActiveSection(
                window.location.hash ? `/${window.location.hash}` : '/',
            );
        } else {
            setActiveSection(url);
        }
    }, [url]);

    useEffect(() => {
        const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);

            if (window.location.pathname === '/') {
                // Ambil semua item navigasi yang berupa anchor/hash
                const hashItems = mainNavItems
                    .filter((item) => toUrl(item.href).includes('#'))
                    .map((item) => toUrl(item.href).split('#')[1]);

                let current = '/';

                for (const id of hashItems) {
                    const el = document.getElementById(id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top <= window.innerHeight / 2) {
                            current = `/#${id}`;
                        }
                    }
                }

                setActiveSection(current);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAnchorClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        e.currentTarget.blur();
        if (href.includes('#')) {
            const targetId = href.split('#')[1];
            const element = document.getElementById(targetId);

            if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, '', href);
                setActiveSection(href);
            }
        } else if (href === '/') {
            if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/');
                setActiveSection('/');
            }
        }
    };

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
                                                    onClick={(e) =>
                                                        handleAnchorClick(
                                                            e as React.MouseEvent<HTMLAnchorElement>,
                                                            toUrl(item.href),
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex items-center space-x-2 font-medium transition-colors',
                                                        activeSection ===
                                                            item.href
                                                            ? activeItemStyles
                                                            : 'text-muted-foreground hover:text-foreground',
                                                    )}
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
                                            onClick={(e) =>
                                                handleAnchorClick(
                                                    e as React.MouseEvent<HTMLAnchorElement>,
                                                    toUrl(item.href),
                                                )
                                            }
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                activeSection === item.href
                                                    ? activeItemStyles
                                                    : 'text-muted-foreground',
                                                '',
                                                isScrolled
                                                    ? 'h-9 cursor-pointer bg-background/60 px-3 backdrop-blur-md transition-colors'
                                                    : 'h-9 cursor-pointer bg-background px-3 backdrop-blur-none transition-colors',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        <div
                                            className={cn(
                                                'absolute bottom-0 left-0 h-0.5 w-full origin-center translate-y-px bg-neutral-900 transition-all duration-300 ease-in-out dark:bg-neutral-100',
                                                activeSection === item.href
                                                    ? 'scale-x-100 opacity-100'
                                                    : 'scale-x-0 opacity-0',
                                            )}
                                        ></div>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* BAGIAN KANAN: Login & Register */}
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        <nav className="flex items-center justify-end gap-2 md:gap-4">
                            <div className="hidden items-center md:flex">
                                <AppearanceToggle />
                            </div>

                            {props.auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-sm border border-neutral-400 px-3 py-1.5 text-sm leading-normal text-neutral-900 hover:border-neutral-900 md:px-5 dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-neutral-100"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-sm border border-transparent px-3 py-1.5 text-sm leading-normal text-neutral-900 hover:border-neutral-900 md:px-5 dark:text-neutral-100 dark:hover:border-neutral-100"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-neutral-400 px-3 py-1.5 text-sm leading-normal text-neutral-900 hover:border-neutral-900 md:px-5 dark:border-neutral-700 dark:text-[#EDEDEC] dark:hover:border-neutral-100"
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
