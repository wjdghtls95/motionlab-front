import { MotionStatusType } from '@/constants/motion-status';
import { AnalysisResult, Improvement } from './analysis';

export interface MotionListItem {
    id: number;
    status: MotionStatusType;
    sportType: string;
    subCategory?: string;
    createAt: string;        // 백엔드 필드명: createAt (no 'd')
    completedAt: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    overallScore?: number | null;
    feedback?: string | null;
    improvements?: Improvement[] | null;
    sportId?: number;
}

export interface MotionDetail extends MotionListItem {
    sport?: { id: number; sportType: string };
    result?: AnalysisResult | null;
}