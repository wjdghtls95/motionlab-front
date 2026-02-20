'use client';

import { Dumbbell, Target } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';

interface CategoryStepProps {
    categories: string[];
    onSelect: (category: string) => void;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Target; label: string; description: string }> = {
    golf: { icon: Target, label: '골프', description: '드라이버, 아이언, 퍼팅 등' },
    weight: { icon: Dumbbell, label: '웨이트', description: '스쿼트, 데드리프트, 벤치프레스 등' },
};

export default function CategoryStep({ categories, onSelect }: CategoryStepProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className={`p-6 rounded-xl border text-left transition-colors cursor-pointer group ${isDark
                                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-500'
                                    : 'bg-white border-gray-200 hover:border-emerald-500'
                                }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                <Icon className="w-6 h-6 text-emerald-500" />
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
