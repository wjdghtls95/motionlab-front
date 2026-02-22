'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadSkeleton from '@/components/upload/UploadSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';
import CategoryStep from '@/components/upload/CategoryStep';
import SportStep from '@/components/upload/SportStep';
import FileUploadStep from '@/components/upload/FileUploadStep';
import UploadProgressBar from '@/components/upload/UploadProgressBar';
import { useSports } from '@/lib/hooks/use-sports';
import { useUpload } from '@/lib/hooks/use-upload';
import { useThemeStore } from '@/lib/store/theme.store';
import { useToastStore } from '@/lib/store/toast.store';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';
import { MESSAGES } from '@/constants/messages';
import type { Sport } from '@/lib/api/sport.api';

type UploadStep = 'category' | 'sport' | 'file';

export default function UploadPage() {
    const router = useRouter();
    const addToast = useToastStore((s) => s.addToast);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const { data: sports, isLoading: sportsLoading } = useSports();
    const uploadMutation = useUpload();

    const [step, setStep] = useState<UploadStep>('category');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');

    // sportType 기준 그룹핑 → 카테고리 목록 추출
    const categories = sports
        ? Array.from(new Set(sports.map((s) => s.sportType)))
        : [];

    // 선택된 카테고리의 세부 종목
    const filteredSports = sports?.filter((s) => s.sportType === selectedCategory) || [];

    // 파일 유효성 에러 메시지
    const getFileError = (f: File): string => {
        if (!(APP_CONFIG.ACCEPTED_VIDEO_TYPES as readonly string[]).includes(f.type)) {
            return MESSAGES.UPLOAD.INVALID_TYPE;
        }
        if (f.size > APP_CONFIG.MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            return MESSAGES.UPLOAD.SIZE_EXCEEDED;
        }
        return '';
    };

    const handleFileSelect = (f: File) => {
        const err = getFileError(f);
        if (err) {
            setUploadError(err);
            return;
        }
        setUploadError('');
        setFile(f);
    };

    const handleUpload = async () => {
        if (!selectedSport || !file) return;
        setUploadError('');
        setUploadProgress(0);

        try {
            const result = await uploadMutation.mutateAsync({
                sportId: selectedSport.id,
                file,
            });
            // 백엔드 응답이 { id } 또는 { motionId } 일 수 있음
            const motionId = result?.id ?? result?.motionId;
            if (!motionId) {
                console.error('Upload response missing id:', result);
                setUploadError(MESSAGES.UPLOAD.UPLOAD_FAILED);
                return;
            }
            router.push(ROUTES.RESULT(motionId));
        } catch {
            setUploadError(MESSAGES.UPLOAD.UPLOAD_FAILED);
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        {
            label: '카테고리',
            onClick: step !== 'category' ? () => {
                setStep('category');
                setSelectedCategory(null);
                setSelectedSport(null);
                setFile(null);
            } : undefined,
        },
        ...(selectedCategory ? [{
            label: selectedCategory === 'golf' ? '골프' : selectedCategory === 'weight' ? '웨이트' : selectedCategory,
            onClick: step === 'file' ? () => {
                setStep('sport');
                setSelectedSport(null);
                setFile(null);
            } : undefined,
        }] : []),
        ...(selectedSport ? [{
            label: selectedSport.subCategory,
        }] : []),
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Loading */}
            {sportsLoading && <UploadSkeleton />}

            {/* Step 1: Category */}
            {!sportsLoading && step === 'category' && (
                <CategoryStep
                    categories={categories}
                    onSelect={(cat) => {
                        setSelectedCategory(cat);
                        setStep('sport');
                    }}
                />
            )}

            {/* Step 2: Sport */}
            {step === 'sport' && (
                <SportStep
                    sports={filteredSports}
                    onSelect={(sport) => {
                        setSelectedSport(sport);
                        setStep('file');
                    }}
                />
            )}

            {/* Step 3: File */}
            {step === 'file' && (
                <>
                    <FileUploadStep
                        file={file}
                        onFileSelect={handleFileSelect}
                        onFileRemove={() => {
                            setFile(null);
                            setUploadError('');
                        }}
                        onUpload={handleUpload}
                        isUploading={uploadMutation.isPending}
                        error={uploadError}
                    />

                    {uploadMutation.isPending && (
                        <UploadProgressBar progress={uploadProgress} />
                    )}
                </>
            )}
        </div>
    );
}
