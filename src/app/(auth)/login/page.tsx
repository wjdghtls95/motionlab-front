'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/common/PasswordInput';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useThemeStore } from '@/lib/store/theme.store';
import { useToastStore } from '@/lib/store/toast.store';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const addToast = useToastStore((s) => s.addToast);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 필드별 에러 초기화
        setEmailError('');
        setPasswordError('');
        setServerError('');

        // 필드별 유효성 검사
        let hasError = false;
        if (!email.trim()) {
            setEmailError(MESSAGES.AUTH.EMAIL_REQUIRED);
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError(MESSAGES.AUTH.PASSWORD_REQUIRED);
            hasError = true;
        }
        if (hasError) return;

        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });
            // 백엔드 응답: { accessToken, refreshToken, userId, email, name }
            const { accessToken, userId, email: userEmail, name: userName } = response.data;

            setAuth(accessToken, { id: userId, email: userEmail, name: userName });
            addToast(MESSAGES.AUTH.LOGIN_SUCCESS, 'success');
            router.push(ROUTES.HOME);
        } catch {
            setServerError(MESSAGES.AUTH.LOGIN_FAILED);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className={`w-full max-w-sm rounded-2xl p-8 ${isDark
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border border-gray-200 shadow-sm'
                }`}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Motion<span className="text-emerald-500">Lab</span>
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    AI 스포츠 동작 분석
                </p>
            </div>

            {/* Server error banner */}
            {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{serverError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        className={isDark ? 'text-slate-300' : 'text-gray-700'}
                    >
                        이메일
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                        }}
                        placeholder="이메일을 입력하세요"
                        className={`${emailError ? 'border-red-500' : ''} ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : ''
                            }`}
                    />
                    {emailError && (
                        <p className="text-xs text-red-500">{emailError}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <Label
                        htmlFor="password"
                        className={isDark ? 'text-slate-300' : 'text-gray-700'}
                    >
                        비밀번호
                    </Label>
                    <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError('');
                        }}
                        placeholder="비밀번호를 입력하세요"
                        error={!!passwordError}
                    />
                    {passwordError && (
                        <p className="text-xs text-red-500">{passwordError}</p>
                    )}
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            로그인 중...
                        </span>
                    ) : (
                        '로그인'
                    )}
                </Button>
            </form>

            {/* Register link */}
            <p
                className={`text-center text-sm mt-6 ${isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
            >
                계정이 없으신가요?{' '}
                <Link
                    href={ROUTES.REGISTER}
                    className="text-emerald-500 hover:text-emerald-400 font-medium"
                >
                    회원가입
                </Link>
            </p>
        </div>
    );
}