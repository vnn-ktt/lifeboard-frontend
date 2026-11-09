import { test, expect } from '@playwright/test';

async function createDemoProfile(page: import('@playwright/test').Page) {
  await page.goto('/register');
  await page.locator('#register-name').fill('Demo Person');
  await page.locator('#register-email').fill('demo@example.test');
  await page.getByRole('button', { name: /Создать профиль|Create profile|Profil erstellen/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test('landing has a clear value proposition and accessible form', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator('#lb-auth-story-title')).toBeVisible();
  await expect(page.locator('#register-email')).toBeVisible();
  await expect(page.getByText(/Большие цели начинаются|Big goals start/i)).toBeVisible();
});

test('new profile can navigate to Notes', async ({ page }) => {
  await createDemoProfile(page);
  await page.goto('/notes');
  await expect(page.locator('.lb-notes-board')).toBeVisible();
  await expect(page.locator('.lb-note-card').first()).toBeVisible();
});

test('goal garden remains and Tree view is selectable', async ({ page }) => {
  await createDemoProfile(page);
  await page.goto('/life-goals');
  await expect(page.locator('.lb-growth')).toBeVisible();
  await page.locator('.lb-workflow-switch button').last().click();
  await expect(page.locator('.p-tree')).toBeVisible();
  await expect(page.locator('.lb-goal-tree-node').first()).toBeVisible();
});

test('Helper is a localized coming-soon placeholder', async ({ page }) => {
  await createDemoProfile(page);
  const launcher = page.locator('.lb-jakk-launcher');
  if (await launcher.count()) {
    await launcher.click();
    await expect(page.locator('.lb-in-develop')).toBeVisible();
    await expect(page.locator('.lb-in-develop')).toContainText('1.0.0');
  }
});

test('Notes remain usable when viewport is narrow', async ({ page }) => {
  await createDemoProfile(page);
  await page.goto('/notes');
  await expect(page.locator('.lb-notes-board')).toBeVisible();
  await expect(page.locator('.lb-note-card').first()).toBeVisible();
});

test('API toast outlet is mounted globally', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator('.p-toast')).toHaveCount(1);
});

test('goal hierarchy aligns status and progress on one trailing edge', async ({ page }) => {
  await createDemoProfile(page);
  await page.goto('/life-goals');
  await page.locator('.lb-workflow-switch button').last().click();
  const row = page.locator('.lb-goal-tree-node').first();
  await expect(row.locator('.lb-goal-tree-trailing')).toBeVisible();
  const bounds = await row.evaluate(element => {
    const details = element.querySelector('.lb-goal-tree-details')!.getBoundingClientRect();
    const trailing = element.querySelector('.lb-goal-tree-trailing')!.getBoundingClientRect();
    const outer = element.getBoundingClientRect();
    return { detailsRight: details.right, trailingLeft: trailing.left, trailingRight: trailing.right, outerRight: outer.right };
  });
  expect(bounds.trailingLeft).toBeGreaterThanOrEqual(bounds.detailsRight - 3);
  expect(bounds.trailingRight).toBeLessThanOrEqual(bounds.outerRight + 2);
});

test('weekly reflection has outcome cards and an accessible 1–10 mood slider', async ({ page }) => {
  await createDemoProfile(page);
  await page.goto('/life-review');
  const outcomes = page.locator('.lb-review-outcomes-feature');
  await expect(outcomes).toBeVisible();
  await expect(outcomes.locator('.lb-review-outcome-summary')).toHaveCSS('display', 'grid');
  if (page.viewportSize()!.width < 720) {
    await page.locator('.lb-review-mobile-actions button').first().click();
  }
  const slider = page.locator('.lb-mood-slider:visible');
  await expect(slider).toBeVisible();
  await expect(page.locator('.lb-mood-selected:visible')).toContainText('/ 10');
});

test('Overview focus quote uses the same quiet editorial skin as Review', async ({ page }) => {
  await createDemoProfile(page);
  await page.goto('/');
  const overview = page.locator('.lb-quote-spot');
  await expect(overview).toHaveClass(/lb-review-featured-quote/);
  const borderA = await overview.evaluate(node => getComputedStyle(node).borderLeftWidth);
  await page.goto('/life-review');
  const reflection = page.locator('.lb-quote-spot');
  await expect(reflection).toHaveClass(/lb-review-featured-quote/);
  const borderB = await reflection.evaluate(node => getComputedStyle(node).borderLeftWidth);
  expect(borderA).toBe(borderB);
});
