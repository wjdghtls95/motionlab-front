'use client';

import { AlertTriangle } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';
import { toKoreanAngleLabel } from '@/constants/labels';
import type { Improvement } from '@/types/analysis';

interface ImprovementCardProps {
    improvements: Improvement[];
}

export default function ImprovementCard({ improvements }: ImprovementCardProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (improvements.length === 0) return null;

    return (
        <div
            className={`rounded-xl p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'
                }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    개선사항
                </h3>
            </div>

            <div className="space-y-4">
                {improvements.map((item, i) => {
                    const range = item.ideal_range || item.valid_range;
                    return (
                        <div
                            key={i}
                            className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}
                        >
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {toKoreanAngleLabel(item.issue)}
                            </p>
                            {range && item.current_value !== undefined && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                    현재: {item.current_value.toFixed(1)}° → 이상: {range[0]}°~{range[1]}°
                                </p>
                            )}
                            <p className={`text-sm mt-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                                {item.suggestion}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
