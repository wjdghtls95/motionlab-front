'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'beta_banner_dismissed';

interface BetaBannerProps {
    onDismiss?: () => void;
}

/** 베타 서비스 안내 배너 (R-067). localStorage로 닫기 상태 유지. fixed top-0으로 Navbar 위에 표시. */
export default function BetaBanner({ onDismiss }: BetaBannerProps) {
    const [visible, setVisible] = useState(() => {
        if (typeof window === 'undefined') return true;
        return localStorage.getItem(STORAGE_KEY) !== 'true';
    });

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setVisible(false);
        onDismiss?.();
    };

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 w-full bg-emerald-500 text-white text-xs sm:text-sm px-4 py-2 flex items-center justify-between gap-2">
            <p className="flex-1 text-center font-medium">
                🚀 MotionLab은 현재 베타 서비스 중입니다. 분석 결과가 다소 부정확할 수 있으며, 피드백을 주시면 빠르게 개선하겠습니다.
            </p>
            <button
                onClick={dismiss}
                aria-label="배너 닫기"
                className="shrink-0 p-1 rounded hover:bg-emerald-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
