import type { Metadata } from 'next';
import { QueryProvider } from '@lib/providers/query-provider';
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
        <html lang="ko">
        <body>
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}
