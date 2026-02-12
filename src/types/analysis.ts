export interface AnalysisResult {
    totalFrames: number;
    durationSeconds: number;
    angles: Record<string, number>;
    phases: Phase[];
}

export interface Phase {
    name: string;
    startFrame: number;
    endFrame: number;
    durationMs?: number;
}

export interface Improvement {
    issue: string;
    currentValue?: number;
    idealRange?: number[];
    suggestion: string;
}