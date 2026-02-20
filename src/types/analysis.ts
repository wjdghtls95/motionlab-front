export interface AnalysisResult {
    total_frames: number;
    duration_seconds: number;
    angles: Record<string, number>;
    phases: Phase[];
    keypoints_sample?: unknown[];
}

export interface Phase {
    name: string;
    start_frame: number;
    end_frame: number;
    duration_ms?: number;
}

export interface Improvement {
    issue: string;
    current_value?: number;
    ideal_range?: number[];
    valid_range?: number[];
    suggestion: string;
}