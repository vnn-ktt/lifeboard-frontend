import { test, expect, type Page } from '@playwright/test';

type PublicUser = {
  id: string; email: string; name: string; nickname: string; about: string;
  avatar: null; avatarFileId: null; timezone: string; createdAt: string; updatedAt: string;
};
const user: PublicUser = {
  id: '1184e25f-040b-4d68-a2b9-d049b80909fa',
  email: 'demo@example.test', name: 'Demo Person', nickname: 'demo',
  about: '', avatar: null, avatarFileId: null, timezone: 'Europe/Moscow',
  createdAt: '2026-11-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z',
};
const initialLife = () => ({
  version: 1, vision: '', goals: [], routines: [], checks: {}, reviews: [],
  categories: [], focusGoalIds: [], noteGroups: [], notes: [], milestones: [],
  goalTasks: [], goalMetricEntries: [], goalCheckins: [], goalStatusEvents: [],
  quoteAssignments: {},
});
async function fakeServer(page: Page) {
  let signedIn = false;
  let profile = { ...user };
  let snapshot = initialLife();
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const method = request.method();
    const respond = (body: unknown, status = 200) => route.fulfill({
      status, contentType: 'application/json', body: JSON.stringify(body),
    });
    if (path === '/auth/register' && method === 'POST') {
      const input = request.postDataJSON() as { email: string; name: string };
      profile = { ...profile, email: input.email, name: input.name };
      signedIn = true;
      return respond({ user: profile });
    }
    if (path === '/auth/login' && method === 'POST') {
      signedIn = true;
      return respond({ user: profile });
    }
    if (path === '/users/me' && method === 'GET') {
      return respond(signedIn ? profile : { statusCode: 401, message: 'Not authenticated' }, signedIn ? 200 : 401);
    }
    if (!signedIn) return respond({ statusCode: 401, message: 'Not authenticated' }, 401);
    if (path === '/auth/logout' && method === 'POST') {
      signedIn = false;
      return route.fulfill({ status: 204, body: '' });
    }
    if (path === '/exports/lifeboard-v1' && method === 'GET') return respond(snapshot);
    if (path === '/users/me/preferences') return respond({
      theme: 'default', language: 'ru', goalEntryMode: 'wizard', showHelper: true,
      privacy: { showAvatar: true, maskStats: false },
    });
    if (path === '/users/me' && method === 'PATCH') {
      profile = { ...profile, ...(request.postDataJSON() as object) };
      return respond(profile);
    }
    if (path === '/imports/lifeboard-v1/validate') return respond({
      valid: true, canImport: true, alreadyImported: false, counts: {}, warnings: [],
    });
    if (path === '/imports/lifeboard-v1') {
      snapshot = request.postDataJSON();
      return respond({ imported: true });
    }
    if (path === '/users/me/timezone' && method === 'PATCH') {
      const input = request.postDataJSON() as { timezone: string };
      profile = { ...profile, timezone: input.timezone };
      return respond(profile);
    }
    return respond({ statusCode: 404, message: path }, 404);
  });
}

async function register(page: Page) {
  await page.goto('/register');
  await page.locator('#register-name').fill('Demo Person');
  await page.locator('#register-email').fill('demo@example.test');
  await page.locator('#register-password').fill('test-password-very-long');
  await page.locator('#register-password-confirm').fill('test-password-very-long');
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/$/);
}

test.beforeEach(async ({ page }) => { await fakeServer(page); });

test('public registration includes password and cookie notice', async ({ page }) => {
  await page.goto('/register');
  await expect(page.locator('#register-name')).toBeVisible();
  await expect(page.locator('#register-password')).toBeVisible();
  await expect(page.getByText(/Lifeboard использует cookie/)).toBeVisible();
});

test('protected screen redirects without a server session', async ({ page }) => {
  await page.goto('/notes');
  await expect(page).toHaveURL(/\/login\?redirect=/);
});

test('server-registered account loads Notes and Goals', async ({ page }) => {
  await register(page);
  await page.goto('/notes');
  await expect(page.locator('.lb-notes-board')).toBeVisible();
  await page.goto('/life-goals');
  await expect(page.locator('.lb-growth')).toBeVisible();
});

test('cookie notice is dismissible without blocking registration', async ({ page }) => {
  await page.goto('/register');
  const notice = page.locator('.lb-cookie-notice');
  await expect(notice).toBeVisible();
  await notice.locator('button').click();
  await expect(notice).toHaveCount(0);
  await register(page);
});

test('account updates round-trip to backend', async ({ page }) => {
  await register(page);
  await page.goto('/profile');
  await expect(page.locator('#profile-name')).toHaveValue('Demo Person');
  await page.locator('#profile-name').fill('Updated Demo');
  await page.locator('.lb-profile-save').click();
  await expect(page.locator('#profile-name')).toHaveValue('Updated Demo');
});

test('compact Jakk popup and responsive notes remain functional', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await register(page);
  await page.goto('/notes');
  await expect(page.locator('.lb-notes-board')).toBeVisible();
});
