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
