import { Link, usePage } from '@inertiajs/react';
import { NavItem } from '@/types';
import { ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { NavMain } from '@/components/sidebars/nav-main';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toUrl } from '@/lib/utils';

interface InnerSidebarProps {
    items: NavItem[];
    role?: string;
    position?: string;
}

export default function InnerSidebar({
    items,
    role,
    position,
}: InnerSidebarProps) {
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    if (!items || items.length === 0) return null;

    const formatText = (text?: string) => {
        if (!text) return '';
        return text
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedRole = formatText(role);
    const formattedPosition = formatText(position);

    const getHeaderTitle = () => {
        if (!formattedPosition) return formattedRole;
        if (formattedRole.toLowerCase() === 'committee') {
            return `Panitia - ${formattedPosition}`;
        }
        return `${formattedRole} - ${formattedPosition}`;
    };

    const headerTitle = getHeaderTitle();

    const getStringUrl = (href: any): string => {
        if (typeof href === 'string') return href;
        if (href && typeof href === 'object' && 'url' in href) return href.url;
        return toUrl(href);
    };

    const activeItem =
        items.find((item) => url.startsWith(getStringUrl(item.href))) ||
        items[0];

    const ActiveIcon = activeItem?.icon;

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <aside
            className={`w-full shrink-0 lg:sticky ${isScrolled ? 'lg:top-2' : 'lg:top-20'} lg:h-fit lg:w-52 transition-all duration-100 ease-in-out`}
        >
            {/* TAMPILAN MOBILE: Drawer Trigger (< lg) */}
            <div className="p-3 lg:hidden">
                <Drawer open={open} onOpenChange={setOpen} direction="bottom">
                    <DrawerTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex h-12 w-full items-center justify-between rounded-md border-border/80 bg-card px-4 shadow-xs hover:bg-muted"
                        >
                            <div className="flex items-center gap-2.5 truncate">
                                {ActiveIcon && (
                                    <ActiveIcon className="h-4 w-4 shrink-0 text-primary" />
                                )}
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                        Navigasi Event
                                    </span>
                                    <span className="truncate text-xs font-bold text-foreground">
                                        {activeItem?.title}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="px-4 pt-2 pb-6">
                        <DrawerHeader className="px-0 pb-3 text-left">
                            <DrawerTitle className="flex items-center gap-2 text-sm font-bold">
                                {headerTitle && (
                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {headerTitle}
                                    </span>
                                )}
                            </DrawerTitle>
                        </DrawerHeader>

                        {/* List Menu di dalam Drawer */}
                        <div className="flex flex-col space-y-1">
                            {items.map((item) => {
                                const itemHrefString = getStringUrl(item.href);
                                const isActive = url.startsWith(itemHrefString);
                                const Icon = item.icon;

                                return (
                                    <DrawerClose asChild key={item.title}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold transition-colors ${
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {Icon && (
                                                    <Icon
                                                        className={`h-4 w-4 ${
                                                            isActive
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    />
                                                )}
                                                <span>{item.title}</span>
                                            </div>
                                            {isActive && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </Link>
                                    </DrawerClose>
                                );
                            })}
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* TAMPILAN DESKTOP: Sidebar Vertikal (>= lg) */}
            <div className="hidden lg:block">
                <nav className="flex flex-col space-y-1">
                    <NavMain items={items} title={headerTitle} />
                </nav>
            </div>
        </aside>
    );
}
