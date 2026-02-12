export const MOTION_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    RETRYING: 'retrying',
} as const;

export type MotionStatusType = typeof MOTION_STATUS[keyof typeof MOTION_STATUS];
