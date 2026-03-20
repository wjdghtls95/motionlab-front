/**
 * R-030/R-031: admin.api 단위 테스트
 * - updateUserRole, getUsers, createSport, updateSport, deactivateSport
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

const mockClearAuth = vi.fn();
vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: {
        getState: vi.fn(() => ({
            accessToken: 'admin-token',
            refreshToken: null,
            clearAuth: mockClearAuth,
        })),
    },
}));
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@constants/config', () => ({ APP_CONFIG: { API_TIMEOUT: 5000 } }));

// window.location.href 설정 가능하도록
const locationMock = { href: '' };
Object.defineProperty(window, 'location', { value: locationMock, writable: true });

describe('adminApi', () => {
    let apiClientMock: MockAdapter;
    let adminApi: typeof import('@/lib/api/admin.api').adminApi;

    beforeEach(async () => {
        vi.resetModules();
        locationMock.href = '';
        mockClearAuth.mockReset();
        const clientModule = await import('@/lib/api/client');
        apiClientMock = new MockAdapter(clientModule.default);
        const adminModule = await import('@/lib/api/admin.api');
        adminApi = adminModule.adminApi;
    });

    afterEach(() => {
        apiClientMock.restore();
    });

    describe('updateUserRole', () => {
        it('PATCH /admin/users/:id/role을 호출한다', async () => {
            apiClientMock.onPatch('/admin/users/5/role').reply(200, { data: null });

            await expect(adminApi.updateUserRole(5, 'ADMIN')).resolves.toBeDefined();
            expect(apiClientMock.history.patch).toHaveLength(1);
            expect(JSON.parse(apiClientMock.history.patch[0].data)).toEqual({ role: 'ADMIN' });
        });

        it('서버 에러(403) 시 reject된다', async () => {
            apiClientMock.onPatch('/admin/users/5/role').reply(403);

            await expect(adminApi.updateUserRole(5, 'ADMIN')).rejects.toMatchObject({
                response: { status: 403 },
            });
        });
    });

    describe('getUsers', () => {
        it('GET /users를 호출하고 사용자 목록을 반환한다', async () => {
            const mockUsers = [
                { id: 1, email: 'user@test.com', name: '유저', role: 'USER' },
            ];
            apiClientMock.onGet('/users').reply(200, { data: mockUsers });

            const res = await adminApi.getUsers();
            expect(res.data).toEqual(mockUsers);
            expect(apiClientMock.history.get).toHaveLength(1);
            expect(apiClientMock.history.get[0].url).toBe('/users');
        });

        it('서버 에러(401) 시 reject된다', async () => {
            apiClientMock.onGet('/users').reply(401);
            await expect(adminApi.getUsers()).rejects.toMatchObject({
                response: { status: 401 },
            });
        });
    });

    describe('createSport', () => {
        it('POST /sports를 올바른 payload로 호출한다', async () => {
            apiClientMock.onPost('/sports').reply(201, { data: { id: 10, sportType: 'tennis' } });

            await expect(adminApi.createSport('tennis', 'Description')).resolves.toBeDefined();
            expect(apiClientMock.history.post).toHaveLength(1);
            expect(JSON.parse(apiClientMock.history.post[0].data)).toEqual({
                sportType: 'tennis',
                description: 'Description',
            });
        });

        it('description이 undefined이면 payload에 포함한다 (서버가 무시)', async () => {
            apiClientMock.onPost('/sports').reply(201, { data: {} });

            await adminApi.createSport('golf', undefined);
            const body = JSON.parse(apiClientMock.history.post[0].data);
            expect(body.sportType).toBe('golf');
        });
    });

    describe('updateSport', () => {
        it('PATCH /sports/:id를 description payload로 호출한다', async () => {
            apiClientMock.onPatch('/sports/3').reply(200, { data: { id: 3, description: '수정됨' } });

            await adminApi.updateSport(3, '수정됨');
            expect(apiClientMock.history.patch).toHaveLength(1);
            expect(JSON.parse(apiClientMock.history.patch[0].data)).toEqual({ description: '수정됨' });
        });

        it('서버 에러(404) 시 reject된다', async () => {
            apiClientMock.onPatch('/sports/99').reply(404);
            await expect(adminApi.updateSport(99, 'test')).rejects.toMatchObject({
                response: { status: 404 },
            });
        });
    });

    describe('deactivateSport', () => {
        it('DELETE /sports/:id를 호출한다', async () => {
            apiClientMock.onDelete('/sports/5').reply(200, { data: {} });

            await adminApi.deactivateSport(5);
            expect(apiClientMock.history.delete).toHaveLength(1);
            expect(apiClientMock.history.delete[0].url).toBe('/sports/5');
        });

        it('서버 에러(403) 시 reject된다', async () => {
            apiClientMock.onDelete('/sports/5').reply(403);
            await expect(adminApi.deactivateSport(5)).rejects.toMatchObject({
                response: { status: 403 },
            });
        });
    });
});
