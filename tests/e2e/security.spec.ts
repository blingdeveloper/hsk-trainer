import { expect, test } from '@playwright/test';
import { drawStrokes, SHI } from './helpers';

test('the security headers are sent', async ({ page }) => {
  const res = await page.goto('./');
  const h = res!.headers();
  expect(h['content-security-policy']).toContain("script-src 'self'");
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toContain('camera=()');
});

test('the security policy blocks nothing the app needs', async ({ page }) => {
  // Records every request the policy blocks, on any page, before the app starts.
  await page.addInitScript(() => {
    (window as unknown as { blocked: string[] }).blocked = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      (window as unknown as { blocked: string[] }).blocked.push(`${e.violatedDirective} ${e.blockedURI}`),
    );
  });
  const blocked = () => page.evaluate(() => (window as unknown as { blocked: string[] }).blocked);

  // Handwriting (web worker + recogniser data) → dictionary entry with stroke animation.
  await page.goto('./#/write');
  await drawStrokes(page, SHI);
  await page.getByTestId('candidate').filter({ hasText: /^十$/ }).click();
  await expect(page.getByTestId('stroke-order').locator('svg')).toBeVisible();
  expect(await blocked()).toEqual([]);

  // Writing trainer (Hanzi Writer quiz).
  await page.goto('./#/characters/%E5%AD%A6');
  await page.waitForTimeout(800);
  expect(await blocked()).toEqual([]);

  // Practice, settings (backup download builds a file link), search.
  for (const route of ['#/practice', '#/settings', '#/']) {
    await page.goto(`./${route}`);
    await page.waitForTimeout(400);
    expect(await blocked(), route).toEqual([]);
  }
});

test('a badly encoded link opens a normal page, not a blank app', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./#/entry/%E0%A4%A');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.locator('main')).toContainText(/isn't in the offline dictionary|not in the offline/i);
  expect(errors).toEqual([]);
});
