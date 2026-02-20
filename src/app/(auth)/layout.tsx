'use client';

import { useThemeStore } from '@/lib/store/theme.store';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div
            className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-slate-950' : 'bg-gray-50'
                }`}
        >
            {children}
        </div>
    );
}
