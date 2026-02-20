'use client';

import { useThemeStore } from '@/lib/store/theme.store';
import type { Sport } from '@/lib/api/sport.api';

interface SportStepProps {
    sports: Sport[];
    onSelect: (sport: Sport) => void;
}

export default function SportStep({ sports, onSelect }: SportStepProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="space-y-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                세부 종목 선택
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                분석할 세부 종목을 선택하세요
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sports.map((sport) => (
                    <button
                        key={sport.id}
                        onClick={() => onSelect(sport)}
                        className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${isDark
                                ? 'bg-slate-900 border-slate-800 hover:border-emerald-500'
                                : 'bg-white border-gray-200 hover:border-emerald-500'
                            }`}
                    >
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {sport.subCategory}
                        </p>
                        {sport.description && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                {sport.description}
                            </p>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
