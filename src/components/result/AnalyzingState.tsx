'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useThemeStore } from '@/lib/store/theme.store';
import { APP_CONFIG } from "@constants/config";

interface AnalyzingStateProps {
    status: string;
    onLeave: () => void;
}

const ANALYSIS_STEPS = [
    { key: 'recognition', label: '동작 인식 완료' },
    { key: 'analysis', label: 'AI 분석 중' },
    { key: 'feedback', label: '맞춤 피드백 생성 중' },
] as const;

export default function AnalyzingState({ status, onLeave }: AnalyzingStateProps) {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 현재 진행 단계
    const currentStepIndex = status === 'pending' ? 0 : status === 'processing' ? 1 : 2;

    // 경과 시간
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
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

            {/* Elapsed time */}
            <p className={`text-xs mt-6 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                경과 시간: {elapsedSeconds}초
            </p>

            {/* Timeout warning */}
            {elapsedSeconds >= APP_CONFIG.ANALYSIS_WARNING_SECONDS && (
                <p className="text-xs text-yellow-500 mt-2">
                    분석이 평소보다 오래 걸리고 있습니다. 잠시만 기다려주세요.
                </p>
            )}

            {/* Leave button */}
            <button
                onClick={() => setShowLeaveModal(true)}
                className={`text-sm mt-8 ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-gray-400 hover:text-gray-600'}`}
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
