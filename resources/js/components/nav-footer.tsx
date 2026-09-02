import type { ComponentPropsWithoutRef } from 'react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: (Omit<NavItem, 'href'> & {
        href?: string;
        onClick?: () => void;
        isSwitch?: boolean;
        switchChecked?: boolean;
    })[];
}) {
    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="cursor-pointer text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                onClick={item.onClick}
                            >
                                {item.href ? (
                                    <a
                                        href={toUrl(item.href)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item.icon && (
                                            <item.icon className="h-5 w-5" />
                                        )}
                                        <span>{item.title}</span>
                                    </a>
                                ) : item.isSwitch ? (
                                    <div className="flex w-full items-center">
                                        {item.icon && (
                                            <item.icon className="h-5 w-5" />
                                        )}
                                        <span className="flex-1 text-left">
                                            {item.title}
                                        </span>
                                        <Switch
                                            checked={item.switchChecked}
                                            className="pointer-events-none shrink-0"
                                        />
                                    </div>
                                ) : (
                                    <button className="w-full text-left">
                                        {item.icon && (
                                            <item.icon className="h-5 w-5" />
                                        )}
                                        <span>{item.title}</span>
                                    </button>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
