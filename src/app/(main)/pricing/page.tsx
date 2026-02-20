'use client';

import { Check } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    name: string;
    price: string;
    period: string;
    features: PlanFeature[];
    isCurrent?: boolean;
    isPopular?: boolean;
}

const PLANS: Plan[] = [
    {
        name: 'Free',
        price: '₩0',
        period: '무료',
        isCurrent: true,
        features: [
            { text: '점수 + AI 피드백 1줄', included: true },
            { text: '월 3회 분석', included: true },
            { text: '상세 각도 분석', included: false },
            { text: '성장 차트', included: false },
            { text: '팀 기능', included: false },
        ],
    },
    {
        name: 'Pro',
        price: '₩9,900',
        period: '/월',
        isPopular: true,
        features: [
            { text: '무제한 분석', included: true },
            { text: '상세 각도 분석', included: true },
            { text: '이상 자세 비교', included: true },
            { text: '성장 차트', included: true },
            { text: '결과 공유', included: true },
        ],
    },
    {
        name: 'Team',
        price: '₩49,900',
        period: '/월',
        features: [
            { text: 'Pro 전체 기능', included: true },
            { text: '팀원 5명', included: true },
            { text: '코치 대시보드', included: true },
            { text: '팀 비교 분석', included: true },
            { text: '우선 지원', included: true },
        ],
    },
];

export default function PricingPage() {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            <div className="text-center">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    요금제
                </h1>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    나에게 맞는 플랜을 선택하세요
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`rounded-2xl p-6 border relative ${plan.isPopular
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                                : isDark
                                    ? 'bg-slate-900 border-slate-800'
                                    : 'bg-white border-gray-200'
                            } ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    >
                        {plan.isPopular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                                인기
                            </span>
                        )}

                        {plan.isCurrent && (
                            <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                현재
                            </span>
                        )}

                        <h3 className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {plan.name}
                        </h3>

                        <div className="mt-3 flex items-baseline gap-1">
                            <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {plan.price}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {plan.period}
                            </span>
                        </div>

                        <ul className="mt-6 space-y-3">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className={`w-4 h-4 shrink-0 ${f.included ? 'text-emerald-500' : isDark ? 'text-slate-700' : 'text-gray-300'
                                        }`} />
                                    <span className={
                                        f.included
                                            ? isDark ? 'text-slate-300' : 'text-gray-700'
                                            : isDark ? 'text-slate-600 line-through' : 'text-gray-400 line-through'
                                    }>
                                        {f.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full mt-6 h-10 rounded-xl text-sm font-medium transition-colors ${plan.isPopular
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : plan.isCurrent
                                        ? isDark
                                            ? 'bg-slate-800 text-slate-400 cursor-default'
                                            : 'bg-gray-100 text-gray-400 cursor-default'
                                        : isDark
                                            ? 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            disabled={plan.isCurrent}
                        >
                            {plan.isCurrent ? '현재 요금제' : '시작하기'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
