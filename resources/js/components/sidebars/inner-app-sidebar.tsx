import { NavMain } from '@/components/sidebars/nav-main';
import { NavItem } from '@/types';

interface InnerSidebarProps {
    items: NavItem[];
}

export default function InnerSidebar({ items }: InnerSidebarProps) {
    if (!items || items.length === 0) return null;
    return (
        <aside className="sticky top-0 hidden h-fit w-48 shrink-0 lg:block">
            <nav className="flex flex-col space-y-1">
                <NavMain items={items} title="" />
            </nav>
        </aside>
    );
}
