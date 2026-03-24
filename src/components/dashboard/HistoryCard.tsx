'use client';

import { useThemeStore } from '@/lib/store/theme.store';
import { SCORE_RANGES } from '@/constants/score-ranges';
import type { MotionListItem } from '@/types/motion';
import { MESSAGES } from "@/constants/messages";

interface HistoryCardProps {
    motion: MotionListItem;
    onClick: () => void;
    microCopy?: string;
}

function getScoreColor(score: number | null): string {
    if (score === null) return 'text-slate-400';
    const ranges = Object.values(SCORE_RANGES).sort((a, b) => b.min - a.min);
    const range = ranges.find((r) => score >= r.min);
    return range?.color ?? 'text-slate-400';
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
}

function getMicroCopy(score: number | null): string {
    if (score === null) return '';
    if (score >= 80) return MESSAGES.MICRO_COPY.SCORE_HIGH;
    if (score >= 60) return MESSAGES.MICRO_COPY.SCORE_MID;
    return MESSAGES.MICRO_COPY.SCORE_LOW;
}

export default function HistoryCard({ motion, onClick, microCopy }: HistoryCardProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const score = motion.overallScore ?? null;
    const label = motion.subCategory || motion.sportType;
    const copy = microCopy || getMicroCopy(score);

    return (
        <button
            onClick={onClick}
            className={`w-full text-left rounded-xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99] ${isDark
                ? 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
        >
            {/* Top: label + score */}
            <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold tracking-wide ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    {label.toUpperCase()}
                </span>
                {score !== null && (
                    <span className={`text-2xl font-bold tabular-nums ${getScoreColor(score)}`}>
                        {score}
                    </span>
                )}
            </div>

            {/* Time */}
            <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                {timeAgo(motion.createAt)}
            </p>

            {/* Microcopy */}
            {copy && (
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {copy}
                </p>
            )}
        </button>
    );
}
