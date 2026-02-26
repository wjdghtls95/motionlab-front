'use client';

import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/lib/store/toast.store';

const ICON_MAP = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
} as const;

const BG_MAP = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
} as const;

export default function Toast() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => {
                const Icon = ICON_MAP[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`${BG_MAP[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[400px] animate-slide-in`}
                    >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium flex-1">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
