'use client';

import { useThemeStore } from '@/lib/store/theme.store';
import { SCORE_RANGES } from '@/constants/score-ranges';

interface ScoreGaugeProps {
    score: number;
}

function getScoreRange(score: number) {
    if (score >= SCORE_RANGES.EXCELLENT.min) return SCORE_RANGES.EXCELLENT;
    if (score >= SCORE_RANGES.GOOD.min) return SCORE_RANGES.GOOD;
    if (score >= SCORE_RANGES.FAIR.min) return SCORE_RANGES.FAIR;
    if (score >= SCORE_RANGES.POOR.min) return SCORE_RANGES.POOR;
    return SCORE_RANGES.BAD;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const range = getScoreRange(score);
    const hex = range.hex;

    // SVG circle
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const dashoffset = circumference - progress;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isDark ? '#1e293b' : '#e5e7eb'}
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={hex}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Score + Label (overlaid in center) */}
            <div className="-mt-[110px] flex flex-col items-center mb-6">
                <p className={`text-5xl font-bold ${range.color}`}>{score}</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {range.label}
                </p>
            </div>
        </div>
    );
}
