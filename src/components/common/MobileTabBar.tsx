'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Upload, BarChart3, Settings } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useThemeStore } from '@/lib/store/theme.store';

const TAB_ITEMS = [
    { label: '홈', path: ROUTES.HOME, icon: Home },
    { label: '업로드', path: ROUTES.UPLOAD, icon: Upload },
    { label: '내 분석', path: ROUTES.HISTORY, icon: BarChart3 },
    { label: '설정', path: ROUTES.SETTINGS, icon: Settings },
] as const;

export default function MobileTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 z-40 h-16 sm:hidden flex items-center justify-around border-t ${isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-white border-gray-200'
                }`}
        >
            {TAB_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive
                                ? 'text-emerald-500'
                                : isDark
                                    ? 'text-slate-500 hover:text-slate-400'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
