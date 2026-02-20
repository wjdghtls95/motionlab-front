'use client';

import { useRef, useState } from 'react';
import { Upload, X, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/lib/store/theme.store';
import { APP_CONFIG } from '@/constants/config';
import { MESSAGES } from '@/constants/messages';

interface FileUploadStepProps {
    file: File | null;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    onUpload: () => void;
    isUploading: boolean;
    error: string;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploadStep({
    file,
    onFileSelect,
    onFileRemove,
    onUpload,
    isUploading,
    error,
}: FileUploadStepProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const theme = useThemeStore((s) => s.theme);
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const validateAndSetFile = (f: File) => {
        // 형식 체크
        if (!(APP_CONFIG.ACCEPTED_VIDEO_TYPES as readonly string[]).includes(f.type)) {
            return;
        }
        // 크기 체크
        if (f.size > APP_CONFIG.MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            return;
        }
        onFileSelect(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) validateAndSetFile(f);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) validateAndSetFile(f);
    };

    return (
        <div className="space-y-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                영상 업로드
            </h2>

            {/* Drag & Drop area */}
            {!file && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragOver
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : isDark
                            ? 'border-slate-700 hover:border-slate-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <Upload className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        파일을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                        MP4, MOV, AVI ({APP_CONFIG.MAX_VIDEO_SIZE_MB}MB 이하)
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={APP_CONFIG.ACCEPTED_VIDEO_TYPES.join(',')}
                        onChange={handleInputChange}
                        className="hidden"
                    />
                </div>
            )}

            {/* Selected file info */}
            {file && (
                <div
                    className={`rounded-xl p-4 flex items-center gap-4 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'
                        }`}
                >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <FileVideo className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {file.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                            {formatFileSize(file.size)}
                        </p>
                    </div>
                    <button
                        onClick={onFileRemove}
                        className={`p-1 rounded transition-colors ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Upload button */}
            {file && !isUploading && (
                <Button
                    onClick={onUpload}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium"
                >
                    분석 시작
                </Button>
            )}
        </div>
    );
}
