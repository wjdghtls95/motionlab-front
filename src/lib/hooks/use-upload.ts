'use client';

import { useMutation } from '@tanstack/react-query';
import { motionApi } from '@lib/api/motion.api';

interface UploadParams {
    sportId: number;
    file: File;
}

/**
 * 영상 업로드 훅
 */
export function useUpload() {
    return useMutation({
        mutationFn: async ({ sportId, file }: UploadParams) => {
            const formData = new FormData();
            formData.append('sportId', String(sportId));
            formData.append('video', file);

            const res = await motionApi.upload(formData);
            return res.data;
        },
    });
}
