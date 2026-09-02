import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';

export function AppearanceToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    // Jika tema aktif saat ini adalah dark, klik akan mengubahnya ke light, begitu pula sebaliknya
    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center cursor-pointer rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
            title="Ganti Tema"
        >
            {resolvedAppearance === 'dark' ? (
                <Moon className="h-5 w-5 text-indigo-400" />
            ) : (
                <Sun className="h-5 w-5 text-amber-500" />
            )}
        </button>
    );
}
