'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Sun, Moon, Monitor, ChevronRight } from 'lucide-react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useAuthStore } from '@/lib/store/auth.store';
import { useThemeStore } from '@/lib/store/theme.store';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';

type Theme = 'dark' | 'light' | 'system';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'dark', label: '다크', icon: Moon },
    { value: 'light', label: '라이트', icon: Sun },
    { value: 'system', label: '시스템', icon: Monitor },
];

export default function SettingsPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const { theme, setTheme } = useThemeStore();
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        clearAuth();
        router.push(ROUTES.LOGIN);
    };

    const sectionClass = `rounded-xl p-5 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'}`;
    const labelClass = `text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`;

    return (
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                설정
            </h1>

            {/* Profile */}
            <div className={sectionClass}>
                <p className={labelClass}>프로필</p>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>이름</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user?.name || '-'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>이메일</span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user?.email || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Theme */}
            <div className={sectionClass}>
                <p className={labelClass}>테마</p>
                <div className="flex gap-2">
                    {THEME_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.value;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setTheme(opt.value)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-emerald-500 text-white'
                                    : isDark
                                        ? 'text-slate-400 hover:bg-slate-800'
                                        : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Links */}
            <div className={sectionClass}>
                <p className={labelClass}>정보</p>
                <div className="space-y-1">
                    <a
                        href="#"
                        className={`flex items-center justify-between py-2.5 text-sm ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                    >
                        이용약관
                        <ChevronRight className="w-4 h-4" />
                    </a>
                    <a
                        href="#"
                        className={`flex items-center justify-between py-2.5 text-sm ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                    >
                        개인정보처리방침
                        <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Version */}
            <div className="text-center">
                <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>
                    MotionLab v0.1.0
                </p>
            </div>

            {/* Logout */}
            <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
            >
                <LogOut className="w-4 h-4" />
                로그아웃
            </button>

            <ConfirmModal
                show={showLogoutModal}
                title={MESSAGES.AUTH.LOGOUT_CONFIRM_TITLE}
                message={MESSAGES.AUTH.LOGOUT_CONFIRM_MESSAGE}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
                confirmText="로그아웃"
                cancelText="취소"
                variant="danger"
            />
        </div>
    );
}
