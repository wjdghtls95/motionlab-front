'use client';

import { useEffect, useCallback } from 'react';
import { useThemeStore } from '@/lib/store/theme.store';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
}

export default function ConfirmModal({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소',
    variant = 'default',
}: ConfirmModalProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        },
        [onCancel],
    );

    useEffect(() => {
        if (show) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [show, handleKeyDown]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onCancel}
            />

            {/* card */}
            <div
                className={`relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 shadow-xl ${isDark
                        ? 'bg-slate-900 border border-slate-800 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
            >
                <h3 className="text-lg font-bold">{title}</h3>
                <p
                    className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}
                >
                    {message}
                </p>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${isDark
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 h-10 rounded-xl text-sm font-medium text-white transition-colors ${variant === 'danger'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
