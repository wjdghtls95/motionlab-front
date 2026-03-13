/**
 * R-030: admin.api — patchUserRole 단위 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

vi.mock('@/lib/store/auth.store', () => ({
    useAuthStore: { getState: vi.fn(() => ({ accessToken: 'admin-token' })) },
}));
vi.mock('@/constants/env', () => ({ ENV: { API_URL: 'http://localhost:3000' } }));
vi.mock('@constants/config', () => ({ APP_CONFIG: { API_TIMEOUT: 5000 } }));

describe('adminApi', () => {
    let apiClientMock: MockAdapter;
    let adminApi: typeof import('./admin.api').adminApi;

    beforeEach(async () => {
        vi.resetModules();
        const clientModule = await import('./client');
        apiClientMock = new MockAdapter(clientModule.default);
        const adminModule = await import('./admin.api');
        adminApi = adminModule.adminApi;
    });

    afterEach(() => {
        apiClientMock.restore();
    });

    it('updateUserRole은 PATCH /admin/users/:id/role을 호출한다', async () => {
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
