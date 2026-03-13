'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import Toast from '@/components/common/Toast';
import { useAuthStore } from '@/lib/store/auth.store';
import { useThemeStore } from '@/lib/store/theme.store';
import { ROUTES } from '@/constants/routes';

/**
 * Admin 라우트 그룹 레이아웃.
 * hydration 완료 후 인증되지 않았거나 role이 ADMIN이 아니면 redirect한다.
 * - 비로그인: /login
 * - USER role: / (홈)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore((s) => ({
        isAuthenticated: s.isAuthenticated,
        user: s.user,
    }));
    const theme = useThemeStore((s) => s.theme);
    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const [hydrated, setHydrated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
        if (useAuthStore.persist.hasHydrated()) {
            queueMicrotask(() => setHydrated(true));
        }
        return () => { unsub(); };
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated) {
            router.push(ROUTES.LOGIN);
            return;
        }
        if (user?.role !== 'ADMIN') {
            router.push(ROUTES.HOME);
        }
    }, [hydrated, isAuthenticated, user, router]);

    if (!hydrated || !isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div
                className={`min-h-screen flex items-center justify-center ${
                    isDark ? 'bg-slate-950' : 'bg-gray-50'
                }`}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        로딩 중...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}
        >
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="pt-14 pb-6">{children}</main>
            <Toast />
        </div>
    );
}
