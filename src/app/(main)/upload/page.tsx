'use client';

import {useState, useRef, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Label } from '@components/ui/label';
import { useSports } from '@lib/hooks/use-sports';
import { useUpload } from '@lib/hooks/use-upload';
import { useAuthStore } from '@lib/store/auth.store';
import { ROUTES } from '@constants/routes';
import { MESSAGES } from '@constants/messages';
import { APP_CONFIG } from '@constants/config';

export default function UploadPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [isReady, setIsReady] = useState(false);


    const { data: sports, isLoading: sportsLoading } = useSports();
    const upload = useUpload();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    // persist 복원 대기 + 미인증 리다이렉트
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!useAuthStore.getState().isAuthenticated) {
                router.push(ROUTES.LOGIN);
            } else {
                setIsReady(true);
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [router]);

    if (!isReady) {
        return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
    }

    // 미인증 시 로그인으로
    if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 파일 타입 체크
        const validTypes: string[] = [...APP_CONFIG.ACCEPTED_VIDEO_TYPES];

        if (!validTypes.includes(file.type)) {
            setError(MESSAGES.UPLOAD.INVALID_TYPE);
            return;
        }

        // 파일 크기 체크
        const maxSize = APP_CONFIG.MAX_VIDEO_SIZE_MB * 1024 * 1024;
        if (file.size > maxSize) {
            setError(MESSAGES.UPLOAD.SIZE_EXCEEDED);
            return;
        }

        setError('');
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedSportId || !selectedFile) {
            setError(MESSAGES.UPLOAD.SELECT_REQUIRED);
            return;
        }

        setError('');

        try {
            const result = await upload.mutateAsync({
                sportId: selectedSportId,
                file: selectedFile,
            });

            // 업로드 성공 → 결과 페이지로 이동 (폴링 시작)
            router.push(ROUTES.RESULT(result.motionId));
        } catch {
            setError(MESSAGES.UPLOAD.UPLOAD_FAILED);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">영상 업로드</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* 종목 선택 */}
                    <div className="space-y-2">
                        <Label>종목 선택</Label>
                        {sportsLoading ? (
                            <p className="text-sm text-gray-500">종목 불러오는 중...</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {sports?.map((sport) => (
                                    <button
                                        key={sport.id}
                                        type="button"
                                        onClick={() => setSelectedSportId(sport.id)}
                                        className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                                            selectedSportId === sport.id
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-medium">{sport.sportType}</div>
                                        <div className="text-xs text-gray-500">{sport.subCategory}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 영상 선택 */}
                    <div className="space-y-2">
                        <Label>영상 파일</Label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/quicktime,video/x-msvideo"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? selectedFile.name : '영상 파일 선택'}
                        </Button>
                        {selectedFile && (
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                        )}
                    </div>

                    {/* 에러 메시지 */}
                    {error && <p className="text-sm text-red-500">{error}</p>}

                    {/* 업로드 버튼 */}
                    <Button
                        className="w-full"
                        onClick={handleUpload}
                        disabled={!selectedSportId || !selectedFile || upload.isPending}
                    >
                        {upload.isPending ? '업로드 중...' : '분석 시작'}
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}
