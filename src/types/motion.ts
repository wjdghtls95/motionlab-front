import { MotionStatusType } from '@/constants/motion-status';
import { AnalysisResult, Improvement } from './analysis';

export interface MotionListItem {
    id: number;
    status: MotionStatusType;
    sportType: string;
    subCategory: string;
    createdAt: string;
}

export interface MotionDetail extends MotionListItem {
    result: AnalysisResult | null;
    feedback: string | null;
    overallScore: number | null;
    improvements: Improvement[] | null;
    promptVersion: string | null;
}