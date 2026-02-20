'use client';

import { MessageSquare } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';
import { ANGLE_LABELS } from '@/constants/labels';

interface AiFeedbackCardProps {
    feedback: string;
}

/**
 * 피드백 텍스트 내의 기술적 각도명을 한국어로 변환
 * e.g. "right_knee_angle: 165.9도" → "오른쪽 무릎 각도: 165.9도"
 */
function translateFeedback(text: string): string {
    let result = text;
    for (const [key, label] of Object.entries(ANGLE_LABELS)) {
        result = result.replaceAll(key, label);
    }
    // 파이프(|) 구분자를 줄바꿈으로 변환
    return result;
}

export default function AiFeedbackCard({ feedback }: AiFeedbackCardProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const translatedFeedback = translateFeedback(feedback);
    // 파이프로 구분된 문장들을 배열로 분리
    const sentences = translatedFeedback.split('|').map(s => s.trim()).filter(Boolean);

    return (
        <div
            className={`rounded-xl p-6 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'
                }`}
        >
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    AI 피드백
                </h3>
            </div>
            <div className="space-y-2">
                {sentences.map((sentence, i) => (
                    <p key={i} className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {sentence}
                    </p>
                ))}
            </div>
        </div>
    );
}
