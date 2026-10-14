import { NavMain } from '@/components/sidebars/nav-main';
import { NavItem } from '@/types';

interface InnerSidebarProps {
    items: NavItem[];
}

export default function InnerSidebar({ items }: InnerSidebarProps) {
    if (!items || items.length === 0) return null;
    return (
        <aside className="w-full shrink-0 lg:sticky lg:top-0 lg:h-fit lg:w-48">
            <nav className="flex flex-col space-y-1">
                <NavMain items={items} title="" />
            </nav>
        </aside>
    );
}
