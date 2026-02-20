'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useThemeStore } from '@/lib/store/theme.store';

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: boolean;
    className?: string;
}

export default function PasswordInput({
    id,
    value,
    onChange,
    placeholder = '비밀번호를 입력하세요',
    error = false,
    className = '',
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="relative">
            <Input
                id={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`pr-10 ${error ? 'border-red-500' : ''} ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : ''
                    } ${className}`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                    } transition-colors`}
                tabIndex={-1}
            >
                {visible ? (
                    <EyeOff className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
