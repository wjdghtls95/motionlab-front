import { describe, it, expect } from 'vitest';
import type { MotionListItem, MotionUploadResponse, MotionDetail } from '@/types/motion';

// 런타임 타입 계약 테스트 — createdAt 필드명 오타(R-024) 수정 후
// 서버 반환 필드명이 createdAt임을 보장하는 fixture 검증

const mockMotionListItem: MotionListItem = {
    id: 1,
    status: 'COMPLETED',
    sportType: 'GOLF',
    subCategory: 'DRIVER',
    createdAt: '2026-03-16T10:00:00.000Z',
    completedAt: '2026-03-16T10:05:00.000Z',
    errorCode: null,
    errorMessage: null,
    overallScore: 85,
    feedback: '스윙이 안정적입니다.',
    improvements: [],
    sportId: 1,
};

const mockUploadResponse: MotionUploadResponse = {
    motionId: 42,
    status: 'PENDING',
    createdAt: '2026-03-16T10:00:00.000Z',
};

describe('MotionListItem 타입 계약', () => {
    it('createdAt 필드가 ISO 문자열로 존재한다', () => {
        expect(mockMotionListItem.createdAt).toBe('2026-03-16T10:00:00.000Z');
    });

    it('createdAt으로 Date 객체 생성이 유효하다', () => {
        const date = new Date(mockMotionListItem.createdAt);
        expect(date.getFullYear()).toBe(2026);
        expect(isNaN(date.getTime())).toBe(false);
    });

    it('createdAt에서 날짜 부분(T 앞)을 split으로 추출할 수 있다', () => {
        const datePart = mockMotionListItem.createdAt.split('T')[0];
        expect(datePart).toBe('2026-03-16');
    });

    it('createdAt 기준 정렬이 올바르게 동작한다', () => {
        const items: MotionListItem[] = [
            { ...mockMotionListItem, id: 1, createdAt: '2026-03-14T10:00:00.000Z' },
            { ...mockMotionListItem, id: 2, createdAt: '2026-03-16T10:00:00.000Z' },
            { ...mockMotionListItem, id: 3, createdAt: '2026-03-15T10:00:00.000Z' },
        ];

        // 최신순 정렬
        const newestFirst = [...items].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        expect(newestFirst.map((m) => m.id)).toEqual([2, 3, 1]);

        // 오래된순 정렬
        const oldestFirst = [...items].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        expect(oldestFirst.map((m) => m.id)).toEqual([1, 3, 2]);
    });
});

describe('MotionUploadResponse 타입 계약', () => {
    it('createdAt 필드가 존재하고 유효한 ISO 문자열이다', () => {
        expect(mockUploadResponse.createdAt).toBe('2026-03-16T10:00:00.000Z');
        expect(new Date(mockUploadResponse.createdAt).getTime()).not.toBeNaN();
    });
});

describe('MotionDetail 타입 계약', () => {
    it('MotionListItem을 상속하므로 createdAt 필드를 포함한다', () => {
        const detail: MotionDetail = {
            ...mockMotionListItem,
            sport: { id: 1, sportType: 'GOLF' },
            result: null,
        };
        expect(detail.createdAt).toBe('2026-03-16T10:00:00.000Z');
    });
});
