'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useThemeStore } from '@/lib/store/theme.store';

interface HeroCardProps {
    name: string;
}

export default function HeroCard({ name }: HeroCardProps) {
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div
            className={`rounded-2xl p-6 sm:p-8 ${isDark
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800'
                : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                }`}
        >
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                안녕하세요, {name}님
            </h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                새로운 영상을 업로드하고 AI 분석을 받아보세요
            </p>
            <Button
                onClick={() => router.push(ROUTES.UPLOAD)}
                className="mt-6 h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium"
            >
                새 영상 분석하기
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    );
}
