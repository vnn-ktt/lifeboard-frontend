/** Reproducible product screenshots using only seeded demo data. */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const origin = 'http://127.0.0.1:8080';
const dir = 'docs/screenshots';
await mkdir(dir, { recursive: true });
const server = spawn('bun', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '8080', '--strictPort'], { stdio: 'pipe' });
server.stderr.on('data', data => process.stderr.write(data));
server.stdout.on('data', data => process.stdout.write(data));
let browser;
try {
  let healthy = false;
  for (let i = 0; i < 70; i++) {
    await new Promise(resolve => setTimeout(resolve, 350));
    try { const response = await fetch(origin + '/login'); if (response.ok) { healthy = true; break; } } catch { /* server starts */ }
  }
  if (!healthy) throw new Error('Preview server did not start');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(origin + '/register', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${dir}/auth-desktop.png`, fullPage: true, animations: 'disabled' });
  await page.locator('#register-name').fill('Demo Person');
  await page.locator('#register-email').fill('demo@example.test');
  await page.locator('.lb-auth-submit').click();
  await page.waitForURL('**/');
  await page.goto(origin + '/life-goals', { waitUntil: 'networkidle' });
  await page.locator('.lb-growth').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${dir}/goals-garden.png`, fullPage: true, animations: 'disabled' });
  await page.locator('.lb-workflow-switch button').last().click();
  await page.locator('.p-tree').waitFor();
  await page.screenshot({ path: `${dir}/goals-tree.png`, fullPage: true, animations: 'disabled' });
  await page.goto(origin + '/life-review', { waitUntil: 'networkidle' });
  await page.locator('.lb-review-outcomes-feature').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${dir}/review-desktop.png`, fullPage: true, animations: 'disabled' });
  await page.goto(origin + '/notes', { waitUntil: 'networkidle' });
  await page.locator('.lb-notes-board').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${dir}/notes-light.png`, fullPage: true, animations: 'disabled' });
  await page.evaluate(() => {
    document.documentElement.classList.remove('app-theme-forest', 'app-theme-orange');
    document.documentElement.classList.add('app-theme-dark');
  });
  await page.screenshot({ path: `${dir}/notes-dark.png`, fullPage: true, animations: 'disabled' });
  await page.evaluate(() => {
    document.documentElement.classList.remove('app-theme-dark');
    document.documentElement.classList.add('app-theme-forest');
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${dir}/notes-mobile.png`, fullPage: true, animations: 'disabled' });
  await page.goto(origin + '/life-review', { waitUntil: 'networkidle' });
  await page.locator('.lb-review-outcomes-feature').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${dir}/review-mobile.png`, fullPage: true, animations: 'disabled' });
  // Catch a navigation fallback accidentally photographed as several different pages.
  const uniquePages = ['goals-garden.png', 'notes-light.png', 'review-desktop.png'];
  const digests = await Promise.all(uniquePages.map(async file => createHash('sha256').update(await readFile(`${dir}/${file}`)).digest('hex')));
  if (new Set(digests).size !== digests.length) throw new Error('Several product screenshots are identical: route did not finish loading');
  console.log(`Captured Lifeboard demo screenshots to ${dir}`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
