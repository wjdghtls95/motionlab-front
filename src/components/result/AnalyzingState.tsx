'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Check, Lightbulb } from 'lucide-react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useThemeStore } from '@/lib/store/theme.store';
import { APP_CONFIG } from '@/constants/config';
import { MESSAGES } from '@/constants/messages';

interface AnalyzingStateProps {
    status: string;
    onLeave: () => void;
    sportType?: string;
}

const ANALYSIS_STEPS = [
    { key: 'recognition', label: '동작 인식 완료' },
    { key: 'analysis', label: 'AI 분석 중' },
    { key: 'feedback', label: '맞춤 피드백 생성 중' },
] as const;

export default function AnalyzingState({ status, onLeave, sportType }: AnalyzingStateProps) {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const [tipFade, setTipFade] = useState(true);

    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 현재 진행 단계
    const currentStepIndex = status === 'pending' ? 0 : status === 'processing' ? 1 : 2;

    // 종목별 팁 선택 (없으면 GENERAL)
    const tips = useMemo(() => {
        const sportTips = sportType
            ? MESSAGES.TIPS[sportType as keyof typeof MESSAGES.TIPS]
            : null;
        return sportTips && Array.isArray(sportTips)
            ? [...sportTips, ...MESSAGES.TIPS.GENERAL]
            : MESSAGES.TIPS.GENERAL;
    }, [sportType]);

    // 경과 시간
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 팁 로테이션 (페이드 아웃 → 변경 → 페이드 인)
    useEffect(() => {
        const timer = setInterval(() => {
            setTipFade(false);
            setTimeout(() => {
                setTipIndex((prev) => (prev + 1) % tips.length);
                setTipFade(true);
            }, 300);
        }, APP_CONFIG.TIP_ROTATION_INTERVAL);
        return () => clearInterval(timer);
    }, [tips.length]);

    // 가짜 프로그레스 (0~90%까지 서서히, completed면 100%)
    const estimatedSeconds = APP_CONFIG.ANALYSIS_ESTIMATED_SECONDS;
    const rawProgress = Math.min((elapsedSeconds / estimatedSeconds) * 90, 90);
    const progress = status === 'completed' ? 100 : Math.round(rawProgress);
    const remainingSeconds = Math.max(0, estimatedSeconds - elapsedSeconds);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />

            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                영상 분석 중...
            </h2>

            {/* Steps */}
            <div className="mt-8 space-y-4 w-full max-w-xs">
                {ANALYSIS_STEPS.map((step, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                        <div key={step.key} className="flex items-center gap-3">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : isCurrent
                                        ? 'bg-emerald-500/20 text-emerald-500 ring-2 ring-emerald-500/40'
                                        : isDark
                                            ? 'bg-slate-800 text-slate-500'
                                            : 'bg-gray-200 text-gray-400'
                                }`}
                            >
                                {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                            </div>
                            <span
                                className={`text-sm ${isCompleted || isCurrent
                                    ? isDark ? 'text-white' : 'text-gray-900'
                                    : isDark ? 'text-slate-500' : 'text-gray-400'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 프로그레스 바 */}
            <div className="w-full max-w-xs mt-8">
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        {progress}%
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        {remainingSeconds > 0 ? `약 ${remainingSeconds}초 남음` : '거의 완료...'}
                    </span>
                </div>
            </div>

            {/* 팁 카드 */}
            <div className={`w-full max-w-xs mt-6 rounded-xl p-4 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        알고 계셨나요?
                    </span>
                </div>
                <p
                    className={`text-sm leading-relaxed transition-opacity duration-300 ${tipFade ? 'opacity-100' : 'opacity-0'} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
                >
                    {tips[tipIndex]}
                </p>
                {/* Dot indicator */}
                <div className="flex items-center gap-1.5 mt-3">
                    {tips.map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-300 ${i === tipIndex
                                ? 'w-4 h-1.5 bg-emerald-500'
                                : `w-1.5 h-1.5 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Timeout warning */}
            {elapsedSeconds >= APP_CONFIG.ANALYSIS_WARNING_SECONDS && (
                <p className="text-xs text-yellow-500 mt-4">
                    분석이 평소보다 오래 걸리고 있습니다. 잠시만 기다려주세요.
                </p>
            )}

            {/* Leave button */}
            <button
                onClick={() => setShowLeaveModal(true)}
                className={`text-sm mt-6 ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-gray-400 hover:text-gray-600'}`}
            >
                나가기
            </button>

            <ConfirmModal
                show={showLeaveModal}
                title="분석 중단"
                message="페이지를 나가면 분석이 중단될 수 있습니다. 정말 나가시겠습니까?"
                onConfirm={() => {
                    setShowLeaveModal(false);
                    onLeave();
                }}
                onCancel={() => setShowLeaveModal(false)}
                confirmText="나가기"
                cancelText="계속 분석"
                variant="danger"
            />
        </div>
    );
}
