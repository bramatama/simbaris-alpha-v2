import { Link, usePage } from '@inertiajs/react';
import { Calendar, Home, Info, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { Button } from '@/components/ui/button';
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
        title: 'Beranda',
        href: '/',
        icon: Home,
    },
    {
        title: 'Tentang',
        href: '/#about',
        icon: Info,
    },
    {
        title: 'Event',
        href: '/#events',
        icon: Calendar,
    },
];

const activeItemStyles =
    'bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary dark:bg-primary/20 dark:hover:bg-primary/25';

export function LandingPageHeader({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { props, url } = usePage<PageProps>();

    const isMobileDevice = props.isMobileDevice;
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Inisialisasi bagian aktif berdasarkan URL dan hash saat halaman dimuat.
    const [activeSection, setActiveSection] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            if (url === '/events' || url.startsWith('/events/')) {
                return '/#events';
            }

            if (url === '/' && window.location.hash) {
                return `/${window.location.hash}`;
            }
        }

        return url;
    });

    const [isScrolled, setIsScrolled] = useState(false);

    // Sinkronisasi ketika URL atau hash berubah.
    useEffect(() => {
        if (url === '/') {
            const currentHash = window.location.hash;
            setActiveSection(currentHash ? `/${currentHash}` : '/');
        } else if (url === '/events' || url.startsWith('/events/')) {
            setActiveSection('/#events');
        } else {
            setActiveSection(url);
        }
    }, [url]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);

            if (window.location.pathname === '/') {
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

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleAnchorClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        e.currentTarget.blur();

        if (href.includes('#')) {
            const targetId = href.split('#')[1];

            if (window.location.pathname === '/') {
                e.preventDefault();

                const element = document.getElementById(targetId);

                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });

                    window.history.pushState(null, '', href);
                    setActiveSection(href);
                }
            } else {
                setActiveSection(href);
            }
        } else if (href === '/') {
            if (window.location.pathname === '/') {
                e.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });

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
                    ? 'top-3 mx-auto w-[calc(100%-2rem)] max-w-7xl rounded-2xl border-border bg-background/80 shadow-md backdrop-blur-xl dark:border-primary/20 dark:bg-background/85'
                    : 'top-0 w-full max-w-full rounded-none border-transparent bg-background/95 backdrop-blur-sm',
            )}
        >
            <div className="w-full">
                <div className="mx-auto flex h-16 w-full items-center justify-between px-4">
                    {/* BAGIAN KIRI: Logo dan Menu Mobile */}
                    <div className="flex flex-1 items-center justify-start">
                        <div className="lg:hidden">
                            <Drawer direction="top">
                                <DrawerTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mr-2 h-8.5 w-8.5 text-muted-foreground hover:text-foreground"
                                        aria-label="Buka menu navigasi"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </DrawerTrigger>

                                <DrawerContent className="top-0 mt-0 flex h-auto flex-col rounded-t-none rounded-b-2xl border-b border-border bg-background px-4 pt-4 pb-8 shadow-xl">
                                    <DrawerTitle className="sr-only">
                                        Menu navigasi
                                    </DrawerTitle>

                                    <DrawerHeader className="flex flex-row items-center justify-between px-0 text-left">
                                        <AppLogo variants="horizontal" />

                                        <DrawerClose asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                aria-label="Tutup menu"
                                            >
                                                <X className="h-5 w-5" />
                                                <span className="sr-only">
                                                    Tutup
                                                </span>
                                            </Button>
                                        </DrawerClose>
                                    </DrawerHeader>

                                    <div className="mt-6 flex flex-col space-y-6">
                                        <div className="flex flex-col space-y-2">
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
                                                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                                                        activeSection ===
                                                            item.href
                                                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon
                                                            className={cn(
                                                                'h-5 w-5',
                                                                activeSection ===
                                                                    item.href
                                                                    ? 'text-primary'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        />
                                                    )}

                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}

                                            <div className="mt-2 border-t border-border pt-4">
                                                <AppearanceToggle />
                                            </div>
                                        </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        </div>

                        <Link
                            href="/"
                            prefetch
                            className="flex items-center space-x-2 transition-opacity hover:opacity-90"
                        >
                            {isMobileDevice ? (
                                <AppLogo variants="icon" />
                            ) : (
                                <AppLogo variants="horizontal" />
                            )}
                        </Link>
                    </div>

                    {/* BAGIAN TENGAH: Navigasi Desktop */}
                    <div className="hidden shrink-0 items-center justify-center lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-1">
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
                                                'h-9 cursor-pointer gap-2 rounded-md bg-transparent px-4 text-sm font-medium transition-colors',
                                                activeSection === item.href
                                                    ? activeItemStyles
                                                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon
                                                    className={cn(
                                                        'h-4 w-4 transition-colors',
                                                        activeSection ===
                                                            item.href
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground/70 group-hover:text-foreground',
                                                    )}
                                                />
                                            )}

                                            {item.title}
                                        </Link>

                                        {/* Indikator bagian yang sedang aktif */}
                                        <div
                                            className={cn(
                                                'absolute -bottom-3 left-1/2 h-0.5 w-full -translate-x-1/2 rounded-t-full bg-primary transition-all duration-300',
                                                activeSection === item.href
                                                    ? 'scale-x-100 opacity-100'
                                                    : 'scale-x-0 opacity-0',
                                            )}
                                        />
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* BAGIAN KANAN: Tombol Akun */}
                    <div className="flex flex-1 items-center justify-end gap-2">
                        <nav className="flex items-center justify-end gap-3 md:gap-4">
                            <div className="hidden items-center md:flex">
                                <AppearanceToggle />
                            </div>

                            {props.auth.user ? (
                                <Link href={dashboard()}>
                                    <Button
                                        variant="default"
                                        className="h-9 gap-2 rounded-md px-4 font-medium shadow-sm transition-transform active:scale-95"
                                    >
                                        Dasbor
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    >
                                        Masuk
                                    </Link>

                                    {canRegister && (
                                        <Link href={register()}>
                                            <Button
                                                variant="default"
                                                className="h-9 rounded-md px-4 font-medium shadow-sm transition-transform active:scale-95"
                                            >
                                                Daftar
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
