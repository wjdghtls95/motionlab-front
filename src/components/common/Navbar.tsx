'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useThemeStore } from '@/lib/store/theme.store';

const NAV_ITEMS = [
    { label: '홈', path: ROUTES.HOME },
    { label: '업로드', path: ROUTES.UPLOAD },
    { label: '내 분석', path: ROUTES.HISTORY },
] as const;

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 border-b ${isDark
                ? 'bg-slate-950/80 border-slate-800 backdrop-blur-md'
                : 'bg-white/80 border-gray-200 backdrop-blur-md'
                }`}
        >
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick}
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
                    <Menu className="w-5 h-5" />
                </button>
                <button onClick={() => router.push(ROUTES.HOME)}
                    className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Motion<span className="text-emerald-500">Lab</span>
                </button>
            </div>

            {/* Center: Nav links (desktop) */}
            <div className="hidden sm:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button key={item.path} onClick={() => router.push(item.path)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? isDark ? 'text-white bg-slate-800' : 'text-emerald-600 bg-emerald-50'
                                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}>
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Right: spacer */}
            <div className="w-10" />
        </nav>
    );
}
