'use client';

import { ChevronRight } from 'lucide-react';
import { useThemeStore } from '@/lib/store/theme.store';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <nav className="flex items-center gap-1 text-sm">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={i} className="flex items-center gap-1">
                        {i > 0 && (
                            <ChevronRight className={`w-3 h-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                        )}
                        {item.onClick && !isLast ? (
                            <button
                                onClick={item.onClick}
                                className="text-emerald-500 hover:text-emerald-400 font-medium"
                            >
                                {item.label}
                            </button>
                        ) : (
                            <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                                {item.label}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
