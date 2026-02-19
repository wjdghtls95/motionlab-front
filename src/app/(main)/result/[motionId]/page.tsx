'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMotionPolling } from '@lib/hooks/use-motion-polling';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { MOTION_STATUS } from '@constants/motion-status';
import { MESSAGES } from '@constants/messages';
import { ROUTES } from '@constants/routes';

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();
    const motionId = Number(params.motionId);

    const { data: motion, isLoading } = useMotionPolling(motionId);

    if (isLoading || !motion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">불러오는 중...</p>
            </div>
        );
    }

    // 분석 중
    if (motion.status === MOTION_STATUS.PROCESSING || motion.status === MOTION_STATUS.PENDING) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="py-12 text-center space-y-4">
                        <div className="text-4xl animate-spin">⏳</div>
                        <p className="text-lg font-medium">{MESSAGES.ANALYSIS.PROCESSING}</p>
                        <p className="text-sm text-gray-500">상태: {motion.status}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 분석 실패
    if (motion.status === MOTION_STATUS.FAILED) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="py-12 text-center space-y-4">
                        <div className="text-4xl">❌</div>
                        <p className="text-lg font-medium">{MESSAGES.ANALYSIS.FAILED}</p>
                        {motion.errorMessage && (
                            <p className="text-sm text-red-500">{motion.errorMessage}</p>
                        )}
                        <Button onClick={() => router.push(ROUTES.UPLOAD)}>다시 업로드</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 분석 완료
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">분석 결과</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* 점수 */}
                    {motion.overallScore !== null && motion.overallScore !== undefined && (
                        <div className="text-center">
                            <p className="text-sm text-gray-500">종합 점수</p>
                            <p className="text-5xl font-bold mt-1">{motion.overallScore}</p>
                        </div>
                    )}

                    {/* 피드백 */}
                    {motion.feedback && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">피드백</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{motion.feedback}</p>
                        </div>
                    )}

                    {/* 개선사항 */}
                    {motion.improvements && motion.improvements.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">개선사항</h3>
                            <div className="space-y-2">
                                {motion.improvements.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-yellow-50 p-3 rounded-lg">
                                        <p className="font-medium">{item.angle || item.name}</p>
                                        <p className="text-sm text-gray-600">{item.suggestion || item.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 각도 데이터 */}
                    {motion.result?.angles && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">각도 분석</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(motion.result.angles).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500">{key}</p>
                                        <p className="font-medium">{String(value)}°</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 프롬프트 버전 */}
                    {motion.promptVersion && (
                        <p className="text-xs text-gray-400 text-right">prompt: {motion.promptVersion}</p>
                    )}

                    {/* 다시 업로드 */}
                    <Button className="w-full" onClick={() => router.push(ROUTES.UPLOAD)}>
                        새 영상 분석하기
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}
