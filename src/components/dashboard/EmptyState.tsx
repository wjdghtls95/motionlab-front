'use client';

import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useThemeStore } from '@/lib/store/theme.store';

export default function EmptyState() {
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-slate-800' : 'bg-gray-100'
                    }`}
            >
                <Upload className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>

            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                아직 분석 기록이 없어요
            </h2>
            <p className={`text-sm mt-2 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                첫 영상을 업로드하고 AI 코치의 피드백을 받아보세요
            </p>

            <Button
                onClick={() => router.push(ROUTES.UPLOAD)}
                className="mt-8 h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium"
            >
                첫 영상 업로드하기
            </Button>

            {/* Sample preview (transparent to show it's a sample) */}
            <div
                className={`mt-8 w-full max-w-xs rounded-xl p-4 opacity-40 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-100 border border-gray-200'
                    }`}
            >
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>샘플 미리보기</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">85</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    좋은 자세입니다! 백스윙 각도를 조금 더 개선해보세요.
                </p>
            </div>
        </div>
    );
}
