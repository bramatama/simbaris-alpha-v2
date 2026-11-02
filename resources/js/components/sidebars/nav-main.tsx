import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { ShieldCheck } from 'lucide-react';

interface NavMainProps {
    items: Array<NavItem>;
    title: string;
}

export function NavMain({ items, title }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="mt-2 gap-2 px-2 py-0">
            <SidebarGroupLabel>
                <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 w-full text-xs font-bold text-primary shadow-2xs">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    <span className="">{title}</span>
                </div>
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
