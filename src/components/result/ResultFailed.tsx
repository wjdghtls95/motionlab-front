'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/lib/store/theme.store';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';

interface ResultFailedProps {
    errorMessage?: string | null;
}

export default function ResultFailed({ errorMessage }: ResultFailedProps) {
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                분석에 실패했습니다
            </h2>

            <p className={`text-sm mt-2 text-center max-w-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {errorMessage || MESSAGES.ANALYSIS.FAILED}
            </p>

            <Button
                onClick={() => router.push(ROUTES.UPLOAD)}
                className="mt-8 h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium"
            >
                다시 업로드하기
            </Button>
        </div>
    );
}
