'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOTION_STATUS } from '@/constants/motion-status';
import { ROUTES } from '@/constants/routes';
import { useThemeStore } from '@/lib/store/theme.store';
import {useMotionPolling} from "@lib/hooks/use-motion-polling";
import {toKoreanSportLabel} from "@constants/labels";

import AnalyzingState from '@/components/result/AnalyzingState';
import ResultSkeleton from '@/components/result/ResultSkeleton';
import ResultFailed from '@/components/result/ResultFailed';
import ScoreGauge from '@/components/result/ScoreGauge';
import AiFeedbackCard from '@/components/result/AiFeedbackCard';
import ImprovementCard from '@/components/result/ImprovementCard';
import AngleComparisonBar from '@/components/result/AngleComparisonBar';


interface PageProps {
    params: Promise<{ motionId: string }>;
}

// 파일 상단, export default 위에 선언
function TopNav({ onBack, onHome, isDark }: {
    onBack: () => void;
    onHome: () => void;
    isDark: boolean;
}) {
    return (
        <div className="flex items-center justify-between mb-6">
            <button
                onClick={onBack}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                    isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                }`}
            >
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
            </button>
            <div className="flex gap-2">
                <button
                    onClick={onHome}
                    className={`p-2 rounded-lg transition-colors ${
                        isDark
                            ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                    }`}
                    title="홈으로"
                >
                    <Home className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function ResultPage({ params }: PageProps) {
    const { motionId } = use(params);
    const router = useRouter();
    const theme = useThemeStore((s) => s.theme);
    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

    const numericId = Number(motionId);
    const { data: motion, isLoading } = useMotionPolling(numericId);

    // 초기 로딩과 분석 중을 분리
    const isAnalyzing =
        motion?.status === MOTION_STATUS.PENDING ||
        motion?.status === MOTION_STATUS.PROCESSING ||
        motion?.status === MOTION_STATUS.RETRYING;

    const isFailed = motion?.status === MOTION_STATUS.FAILED;
    const isCompleted = motion?.status === MOTION_STATUS.COMPLETED;

    // ① 초기 데이터 로딩 → ResultSkeleton
    if (isLoading || !motion) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
                <TopNav
                    onBack={() => router.back()}
                    onHome={() => router.push(ROUTES.HOME)}
                    isDark={isDark}
                />
                <ResultSkeleton />
            </div>
        );
    }

    // ② 실제 AI 분석 중 → AnalyzingState
    if (isAnalyzing) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
                <TopNav
                    onBack={() => router.back()}
                    onHome={() => router.push(ROUTES.HOME)}
                    isDark={isDark}
                />
                <AnalyzingState
                    status={motion.status}
                    onLeave={() => router.push(ROUTES.HOME)}
                    sportType={motion?.sportType}
                />
            </div>
        );
    }

    // ③ 실패
    if (isFailed) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
                <TopNav
                    onBack={() => router.back()}
                    onHome={() => router.push(ROUTES.HOME)}
                    isDark={isDark}
                />
                <ResultFailed errorMessage={motion?.errorMessage} />
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        onClick={() => router.push(ROUTES.HOME)}
                        variant="outline"
                        className={`flex-1 h-11 rounded-xl text-sm ${
                            isDark ? 'border-slate-700' : ''
                        }`}
                    >
                        <Home className="w-4 h-4 mr-1.5" />
                        홈으로
                    </Button>
                    <Button
                        onClick={() => router.push(ROUTES.UPLOAD)}
                        className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm"
                    >
                        <Upload className="w-4 h-4 mr-1.5" />
                        다시 분석하기
                    </Button>
                </div>
            </div>
        );
    }

    // ④ 성공
    if (isCompleted && motion) {
        const sportLabel = toKoreanSportLabel(motion.sportType);
        const subLabel = motion.subCategory;

        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                <TopNav
                    onBack={() => router.back()}
                    onHome={() => router.push(ROUTES.HOME)}
                    isDark={isDark}
                />

                {/* Score */}
                {motion.overallScore != null && (
                    <div className="flex justify-center">
                        <ScoreGauge score={motion.overallScore} />
                    </div>
                )}

                {/* Sport info */}
                <div className="text-center">
                    <p
                        className={`text-sm ${
                            isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}
                    >
                        {sportLabel}
                        {subLabel ? ` · ${subLabel}` : ''}
                    </p>
                </div>

                {/* AI Feedback */}
                {motion.feedback && <AiFeedbackCard feedback={motion.feedback} />}

                {/* Improvements */}
                {motion.improvements && motion.improvements.length > 0 && (
                    <ImprovementCard improvements={motion.improvements} />
                )}

                {/* Angle comparison */}
                {motion.result?.angles && motion.improvements && (
                    <AngleComparisonBar
                        angles={motion.result.angles}
                        improvements={motion.improvements}
                    />
                )}

                {/* Bottom navigation */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        onClick={() => router.push(ROUTES.HOME)}
                        variant="outline"
                        className={`flex-1 h-12 rounded-xl text-sm ${
                            isDark ? 'border-slate-700' : ''
                        }`}
                    >
                        <Home className="w-4 h-4 mr-1.5" />
                        홈으로
                    </Button>
                    <Button
                        onClick={() => router.push(ROUTES.UPLOAD)}
                        className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm"
                    >
                        <Upload className="w-4 h-4 mr-1.5" />
                        새 영상 분석하기
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
