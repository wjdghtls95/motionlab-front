'use client';

import { Dumbbell, Target } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';
import { useToastStore } from '@/lib/store/toast.store';

interface CategoryStepProps {
    categories: string[];
    onSelect: (category: string) => void;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Target; label: string; description: string }> = {
    golf: { icon: Target, label: '골프', description: '드라이버, 아이언, 퍼팅 등' },
    weight: { icon: Dumbbell, label: '웨이트', description: '스쿼트, 데드리프트, 벤치프레스 등' },
};

// 아직 분석 파이프라인이 준비되지 않은 카테고리
const COMING_SOON = new Set(['weight']);

export default function CategoryStep({ categories, onSelect }: CategoryStepProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const addToast = useToastStore((s) => s.addToast);

    const handleSelect = (cat: string) => {
        if (COMING_SOON.has(cat)) {
            addToast('현재 준비 중인 서비스입니다. 곧 만나보실 수 있어요!', 'info');
            return;
        }
        onSelect(cat);
    };

    return (
        <div className="space-y-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                카테고리 선택
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                분석할 운동 종목의 카테고리를 선택하세요
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                    const config = CATEGORY_CONFIG[cat] || { icon: Target, label: cat, description: '' };
                    const Icon = config.icon;
                    const isComingSoon = COMING_SOON.has(cat);
                    return (
                        <button
                            key={cat}
                            onClick={() => handleSelect(cat)}
                            className={`relative p-6 rounded-xl border text-left transition-colors ${
                                isComingSoon
                                    ? `cursor-not-allowed ${isDark ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'}`
                                    : `cursor-pointer group ${isDark ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-500'}`
                            }`}
                        >
                            {isComingSoon && (
                                <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">
                                    준비중
                                </span>
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isComingSoon ? 'bg-slate-500/10' : 'bg-emerald-500/10'}`}>
                                <Icon className={`w-6 h-6 ${isComingSoon ? 'text-slate-400' : 'text-emerald-500'}`} />
                            </div>
                            <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {config.label}
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {config.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
