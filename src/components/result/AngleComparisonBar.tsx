'use client';

import { useThemeStore } from '@/lib/store/theme.store';
import { toKoreanAngleLabel } from '@/constants/labels';
import type { Improvement } from '@/types/analysis';
import {APP_CONFIG} from "@constants/config";

interface AngleComparisonBarProps {
    angles: Record<string, number>;
    improvements: Improvement[];
}

export default function AngleComparisonBar({ angles, improvements }: AngleComparisonBarProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // ideal_range 또는 valid_range가 있는 개선사항만 표시
    const comparisons = improvements.filter(
        (imp) => {
            const range = imp.ideal_range || imp.valid_range;
            return range && range.length === 2 && imp.current_value !== undefined;
        },
    );

    if (comparisons.length === 0 && Object.keys(angles).length === 0) return null;

    return (
        <div
            className={`rounded-xl p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'
                }`}
        >
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                각도 분석
            </h3>

            {/* Angle list */}
            <div className="space-y-4">
                {comparisons.map((item, i) => {
                    const range = (item.ideal_range || item.valid_range)!;
                    const idealMin = range[0];
                    const idealMax = range[1];
                    const current = item.current_value!;
                    const deviation = current < idealMin
                        ? idealMin - current
                        : current > idealMax ? current - idealMax : 0;
                    const inRange = deviation === 0;

                    // Bar: scale 0~180
                    const scale = APP_CONFIG.MAX_ANGLE_SCALE;
                    const idealStartPct = (idealMin / scale) * 100;
                    const idealWidthPct = ((idealMax - idealMin) / scale) * 100;
                    const currentPct = (current / scale) * 100;

                    return (
                        <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                                    {toKoreanAngleLabel(item.issue)}
                                </span>
                                <span className={`text-xs font-mono ${inRange ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {current.toFixed(1)}°
                                    {!inRange && ` (편차: ${deviation.toFixed(1)}°)`}
                                </span>
                            </div>

                            {/* Bar */}
                            <div className={`relative h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
                                {/* Ideal range */}
                                <div
                                    className="absolute h-full bg-emerald-500/20 rounded"
                                    style={{ left: `${idealStartPct}%`, width: `${idealWidthPct}%` }}
                                />
                                {/* Current mark */}
                                <div
                                    className={`absolute top-0 w-2.5 h-full rounded ${inRange ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ left: `${Math.min(currentPct, 98)}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-[10px] mt-0.5">
                                <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>{APP_CONFIG.LOW_ANGLE_SCALE}°</span>
                                <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>{idealMin}°~{idealMax}° (이상 범위)</span>
                                <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>{APP_CONFIG.MAX_ANGLE_SCALE}°</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
