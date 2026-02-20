import type { Metadata } from 'next';
import { QueryProvider } from '@/lib/providers/query-provider';
import ThemeProvider from '@/lib/providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
    title: 'MotionLab',
    description: 'AI 스포츠 동작 분석 플랫폼',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className="antialiased">
                <ThemeProvider>
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
