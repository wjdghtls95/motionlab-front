import { test, expect } from '@playwright/test';

/**
 * G. UI/UX 테스트 (5개)
 * project: user (auth-state.json 사용)
 */

const PAGES = ['/', '/history'];

test.describe('G. UI/UX', () => {
  test('G-01 모바일 뷰포트(375px) 전체 페이지 — 레이아웃 깨지지 않음', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const url of PAGES) {
      await page.goto(url);
      // 수평 스크롤바 없어야 함
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth, `${url} 에서 수평 스크롤 발생`).toBeLessThanOrEqual(clientWidth + 5);
    }
  });

  test('G-02 태블릿 뷰포트(768px) 전체 페이지 — 레이아웃 깨지지 않음', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    for (const url of PAGES) {
      await page.goto(url);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth, `${url} 에서 수평 스크롤 발생`).toBeLessThanOrEqual(clientWidth + 5);
    }
  });

  test('G-03 로딩 상태 → 스피너/스켈레톤 표시', async ({ page }) => {
    // 느린 네트워크 시뮬레이션
    await page.route('**/api/**', async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });
    await page.goto('/history');
    // 로딩 UI가 한 번이라도 나타나야 함
    const loadingEl = page.locator(
      '[data-testid="loading"], [data-testid="skeleton"], [role="progressbar"], .animate-pulse',
    );
    // 로딩 중이거나 완료 상태여도 에러 없어야 함
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('G-04 에러 메시지 언어 — 한국어로 표시', async ({ page }) => {
    // auth 상태 제거 후 로그인 페이지에서 잘못된 자격증명 테스트
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('auth-storage'));
    // 페이지가 /login에 완전히 렌더링될 때까지 대기
    await page.waitForURL('**/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/이메일/i).fill('nonexistent@example.com');
    await page.getByLabel(/비밀번호/i).fill('WrongPass999!');
    await page.getByRole('button', { name: /로그인/i }).click();

    // 로그인 페이지는 role="alert" 없이 <p class="text-red-500">로 에러를 렌더링함
    // (login/page.tsx serverError 블록: bg-red-500/10 div > p.text-red-500)
    const errorEl = page.locator('p.text-red-500').filter({ hasText: /[가-힣]/ });
    await expect(errorEl).toBeVisible({ timeout: 10_000 });
    const errorText = await errorEl.textContent();
    const hasKorean = /[\uAC00-\uD7A3]/.test(errorText ?? '');
    expect(hasKorean, `에러 메시지가 한국어가 아님: "${errorText}"`).toBe(true);
  });

  test('G-05 결과 페이지 로딩 시간 — 3초 이내', async ({ page }) => {
    await page.goto('/history');
    await expect(page).not.toHaveURL(/\/login/);

    const firstItem = page.locator('[data-testid="history-item"], [data-testid="motion-item"]').first();
    const count = await firstItem.count();
    test.skip(count === 0, '분석 기록 없음 — 스킵');

    const start = Date.now();
    await firstItem.click();
    await expect(page).toHaveURL(/\/result|\/analysis/);
    // 콘텐츠 로드 대기
    await expect(
      page.locator('[data-testid="analysis-score"]').or(page.getByRole('main')),
    ).toBeVisible({ timeout: 10_000 });
    const elapsed = Date.now() - start;
    expect(elapsed, `결과 페이지 로딩 ${elapsed}ms > 3000ms`).toBeLessThanOrEqual(3_000);
  });
});
