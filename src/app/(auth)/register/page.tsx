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
import { useThemeStore } from '@/lib/store/theme.store';
import { useToastStore } from '@/lib/store/toast.store';
import { ROUTES } from '@/constants/routes';
import { MESSAGES } from '@/constants/messages';

type PasswordStrength = 'weak' | 'medium' | 'strong' | null;

function getPasswordStrength(pw: string): PasswordStrength {
    if (pw.length === 0) return null;
    if (pw.length < 8) return 'weak';

    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);

    if (hasLetter && hasNumber && hasSpecial) return 'strong';
    return 'medium';
}

const STRENGTH_CONFIG = {
    weak: { label: '약함', width: '33%', color: 'bg-red-500', textColor: 'text-red-500' },
    medium: { label: '보통', width: '66%', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
    strong: { label: '강함', width: '100%', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
} as const;

export default function RegisterPage() {
    const router = useRouter();
    const addToast = useToastStore((s) => s.addToast);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [agree, setAgree] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 에러 상태
    const [emailError, setEmailError] = useState('');
    const [serverError, setServerError] = useState('');

    // 파생 상태
    const strength = getPasswordStrength(password);
    const passwordsMatch = passwordConfirm.length > 0 && password === passwordConfirm;
    const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

    const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const canSubmit =
        name.trim() !== '' &&
        email.trim() !== '' &&
        isEmailValid(email) &&
        password.length >= 8 &&
        (strength === 'medium' || strength === 'strong') &&
        passwordsMatch &&
        agree &&
        !isLoading;

    const handleEmailBlur = () => {
        if (email.trim() && !isEmailValid(email)) {
            setEmailError(MESSAGES.AUTH.EMAIL_INVALID);
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setServerError('');
        setIsLoading(true);

        try {
            await authApi.register({ email, password, name });
            addToast(MESSAGES.AUTH.REGISTER_SUCCESS, 'success');
            router.push(ROUTES.LOGIN);
        } catch {
            setServerError(MESSAGES.AUTH.REGISTER_FAILED);
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
                    회원가입
                </h1>
            </div>

            {/* Server error */}
            {serverError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{serverError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이름 */}
                <div className="space-y-2">
                    <Label htmlFor="name" className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                        이름
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        className={isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : ''}
                    />
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                    <Label htmlFor="email" className={isDark ? 'text-slate-300' : 'text-gray-700'}>
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
                        onBlur={handleEmailBlur}
                        placeholder="이메일을 입력하세요"
                        className={`${emailError ? 'border-red-500' : ''} ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : ''
                            }`}
                    />
                    {emailError && (
                        <p className="text-xs text-red-500">{emailError}</p>
                    )}
                </div>

                {/* 비밀번호 */}
                <div className="space-y-2">
                    <Label htmlFor="password" className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                        비밀번호
                    </Label>
                    <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                    />

                    {/* 강도 바 */}
                    {strength && (
                        <div className="space-y-1">
                            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${STRENGTH_CONFIG[strength].color}`}
                                    style={{ width: STRENGTH_CONFIG[strength].width }}
                                />
                            </div>
                            <p className={`text-xs ${STRENGTH_CONFIG[strength].textColor}`}>
                                {STRENGTH_CONFIG[strength].label}
                            </p>
                        </div>
                    )}

                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        8자 이상, 영문+숫자+특수문자 포함
                    </p>
                </div>

                {/* 비밀번호 확인 */}
                <div className="space-y-2">
                    <Label htmlFor="passwordConfirm" className={isDark ? 'text-slate-300' : 'text-gray-700'}>
                        비밀번호 확인
                    </Label>
                    <PasswordInput
                        id="passwordConfirm"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        error={passwordsMismatch}
                    />
                    {passwordsMatch && (
                        <p className="text-xs text-emerald-500">✓ {MESSAGES.AUTH.PASSWORD_MATCH}</p>
                    )}
                    {passwordsMismatch && (
                        <p className="text-xs text-red-500">{MESSAGES.AUTH.PASSWORD_MISMATCH}</p>
                    )}
                </div>

                {/* 이용약관 동의 */}
                <label className="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        이용약관 및 개인정보처리방침에 동의합니다
                    </span>
                </label>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                    disabled={!canSubmit}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            회원가입 중...
                        </span>
                    ) : (
                        '회원가입'
                    )}
                </Button>
            </form>

            {/* Login link */}
            <p
                className={`text-center text-sm mt-6 ${isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}
            >
                이미 계정이 있으신가요?{' '}
                <Link
                    href={ROUTES.LOGIN}
                    className="text-emerald-500 hover:text-emerald-400 font-medium"
                >
                    로그인
                </Link>
            </p>
        </div>
    );
}
