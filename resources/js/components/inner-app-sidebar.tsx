import { NavMain } from '@/components/nav-main';
import { NavItem } from '@/types';

interface InnerSidebarProps {
    items: NavItem[];
}

export default function InnerSidebar({ items }: InnerSidebarProps) {
    if (!items || items.length === 0) return null;
    return (
        <aside className="w-full max-w-lg lg:w-48">
            <nav className="flex flex-col space-y-1 space-x-0">
                <NavMain items={items} title="" />
            </nav>
        </aside>
    );
}
