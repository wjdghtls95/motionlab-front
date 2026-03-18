import { test, expect } from '@playwright/test';

/**
 * E. 히스토리 테스트 (3개)
 * project: user (auth-state.json 사용)
 * 히스토리 페이지 URL: /history, 페이지 타이틀: "내 분석"
 */

test.describe('E. 히스토리', () => {
  test('E-01 분석 기록 목록 표시', async ({ page }) => {
    await page.goto('/history');
    await expect(page).not.toHaveURL(/\/login/);
    // 빈 상태("아직 분석 기록이 없어요") 또는 목록 중 하나가 렌더링되어야 함
    // 스켈레톤 로딩이 끝나거나 빈 상태 텍스트가 나타날 때까지 대기
    await expect(
      page.locator('h1, h2').filter({ hasText: '내 분석' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('E-02 기록 클릭 → 상세 페이지 이동', async ({ page }) => {
    await page.goto('/history');
    await expect(page).not.toHaveURL(/\/login/);

    // 분석 카드 클릭 (data-testid 또는 링크)
    const card = page.locator('[data-testid="motion-card"], [data-testid="history-item"], a[href*="/result"]').first();
    const count = await card.count();
    test.skip(count === 0, '분석 기록 없음 — 스킵');

    await card.click();
    await expect(page).toHaveURL(/\/result\//);
  });

  test('E-03 기록 삭제 → 목록에서 제거', async ({ page }) => {
    await page.goto('/history');
    await expect(page).not.toHaveURL(/\/login/);

    const deleteBtn = page.locator('[data-testid="delete-button"], button[aria-label*="삭제"]').first();
    const count = await deleteBtn.count();
    test.skip(count === 0, '삭제 가능한 기록 없음 — 스킵');

    const cards = page.locator('[data-testid="motion-card"], [data-testid="history-item"], a[href*="/result"]');
    const countBefore = await cards.count();

    await deleteBtn.click();
    // 확인 다이얼로그
    const confirmBtn = page.getByRole('button', { name: /확인|삭제|delete/i });
    if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    await expect(cards).toHaveCount(countBefore - 1, { timeout: 10_000 });
  });
});
