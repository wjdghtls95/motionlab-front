'use client';

import { useRouter, usePathname } from 'next/navigation';
import { X, Home, Upload, BarChart3, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useThemeStore } from '@/lib/store/theme.store';
import { ROUTES } from '@/constants/routes';
import { useSports } from '@/lib/hooks/use-sports';
import { toKoreanSportLabel, toKoreanSubCategoryLabel } from '@/constants/labels';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAIN_NAV = [
    { label: '홈', path: ROUTES.HOME, icon: Home },
    { label: '업로드', path: ROUTES.UPLOAD, icon: Upload },
    { label: '내 분석', path: ROUTES.HISTORY, icon: BarChart3 },
] as const;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const { data: sports, isLoading: sportsLoading } = useSports();

    // 서버 데이터를 트리 구조로 변환
    const sportTrees = useMemo(() => {
        if (!sports) return [];
        const grouped: Record<string, {
            sportType: string;
            label: string;
            children: { key: string; label: string; subCategory: string }[];
        }> = {};

        for (const sport of sports) {
            if (!grouped[sport.sportType]) {
                grouped[sport.sportType] = {
                    sportType: sport.sportType,
                    label: toKoreanSportLabel(sport.sportType),
                    children: [],
                };
            }
            grouped[sport.sportType].children.push({
                key: sport.subCategory.toLowerCase(),
                label: toKoreanSubCategoryLabel(sport.subCategory),
                subCategory: sport.subCategory,
            });
        }
        return Object.values(grouped);
    }, [sports]);

    // 첫 번째 스포츠를 자동으로 열기
    const [expanded, setExpanded] = useState<string[]>([]);

    const toggle = (label: string) =>
        setExpanded((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);

    const navigate = (path: string) => {
        router.push(path);
        onClose();
    };

    const handleLogout = () => {
        clearAuth();
        router.push(ROUTES.LOGIN);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className={`fixed top-0 left-0 z-50 w-64 h-full flex flex-col shadow-2xl transition-transform ${isDark ? 'bg-slate-950 border-r border-slate-800' : 'bg-white border-r border-gray-200'
            }`}>

                {/* Close */}
                <div className="flex items-center justify-between px-4 py-4">
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Motion<span className="text-emerald-500">Lab</span>
                    </span>
                    <button onClick={onClose}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main nav */}
                <nav className="px-3 py-2 space-y-0.5">
                    {MAIN_NAV.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <button key={item.path} onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : isDark ? 'text-slate-400 hover:bg-slate-800/60' : 'text-gray-600 hover:bg-gray-100'
                                    }`}>
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className={`mx-4 my-2 border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`} />

                {/* Sport tree */}
                <div className="px-3 flex-1 overflow-y-auto space-y-0.5">
                    {sportsLoading ? (
                        <div className={`text-sm px-4 py-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                            종목 불러오는 중...
                        </div>
                    ) : sportTrees.length === 0 ? (
                        <div className={`text-sm px-4 py-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                            등록된 종목이 없습니다
                        </div>
                    ) : (
                        sportTrees.map((sport) => {
                            const isExp = expanded.includes(sport.label);
                            return (
                                <div key={sport.sportType}>
                                    <button onClick={() => toggle(sport.label)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-gray-700 hover:bg-gray-100'}`}>
                                        <span className="flex-1 text-left">{sport.label}</span>
                                        {isExp ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                                    </button>
                                    {isExp && (
                                        <div className={`ml-5 pl-3 border-l space-y-0.5 mt-0.5 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                                            {sport.children.map((c) => (
                                                <button key={c.key} onClick={() => navigate(`${ROUTES.HISTORY}?sport=${sport.sportType}&sub=${c.key}`)}
                                                        className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom: profile + settings + logout */}
                <div className={`px-3 py-3 border-t space-y-0.5 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                    <div className={`px-3 py-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {user?.name || '사용자'}
                    </div>
                    <button onClick={() => navigate(ROUTES.SETTINGS)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800/60' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Settings className="w-4 h-4" />
                        설정
                    </button>
                    <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 rounded-lg transition-colors hover:bg-red-500/10">
                        <LogOut className="w-4 h-4" />
                        로그아웃
                    </button>
                </div>
            </div>
        </>
    );
}
