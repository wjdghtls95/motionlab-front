'use client';

import { useThemeStore } from '@/lib/store/theme.store';

interface UploadProgressBarProps {
    progress: number; // 0-100
}

export default function UploadProgressBar({ progress }: UploadProgressBarProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>업로드 중...</span>
                <span className="text-emerald-500 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
