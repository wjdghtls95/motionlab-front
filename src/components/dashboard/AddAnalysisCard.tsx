'use client';

import { Plus } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';

interface AddAnalysisCardProps {
    onClick: () => void;
}

export default function AddAnalysisCard({ onClick }: AddAnalysisCardProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <button
            onClick={onClick}
            className={`w-full rounded-xl p-6 border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[140px] transition-colors cursor-pointer ${isDark
                    ? 'border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500'
                    : 'border-gray-300 text-gray-400 hover:border-emerald-500 hover:text-emerald-500'
                }`}
        >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">새 영상 분석하기</span>
        </button>
    );
}
