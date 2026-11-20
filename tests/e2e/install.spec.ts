import { expect, test, type Page } from '@playwright/test';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** Pretends the browser has offered installation, the way Chrome does with `beforeinstallprompt`. */
async function offerInstall(page: Page, outcome: 'accepted' | 'dismissed') {
  await page.evaluate((outcome) => {
    const e = new Event('beforeinstallprompt', { cancelable: true }) as Event & Record<string, unknown>;
    (window as unknown as { prompted: number }).prompted = 0;
    e.prompt = async () => void ((window as unknown as { prompted: number }).prompted += 1);
    e.userChoice = Promise.resolve({ outcome });
    window.dispatchEvent(e);
  }, outcome);
}

test('no Install card until the browser allows installing', async ({ page }) => {
  await page.goto('./#/');
  await expect(page.getByTestId('about')).toBeVisible();
  await expect(page.getByTestId('install-card')).toHaveCount(0);
});

test('Install app opens the browser’s install dialog; the card goes once installed', async ({ page }) => {
  await page.goto('./#/');
  await offerInstall(page, 'accepted');
  await expect(page.getByTestId('install-button')).toBeVisible();
  await page.getByTestId('install-button').click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { prompted: number }).prompted)).toBe(1);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByTestId('install-card')).toHaveCount(0);
  await page.goto('./#/settings');
  await expect(page.getByTestId('install-card')).toHaveCount(0);
});

test('the button is in Settings too', async ({ page }) => {
  await page.goto('./#/settings');
  await offerInstall(page, 'dismissed');
  await expect(page.getByTestId('install-button')).toBeVisible();
  // Settings always keeps it: no "Not now".
  await expect(page.getByTestId('install-hide')).toHaveCount(0);
});

test.describe('iPhone', () => {
  test.use({ userAgent: IPHONE, hasTouch: true });

  test('shows Share → Add to Home Screen; Not now hides it on Home but not in Settings', async ({ page }) => {
    await page.goto('./#/');
    await expect(page.getByTestId('install-ios-steps')).toContainText('Add to Home Screen');
    await expect(page.getByTestId('install-button')).toHaveCount(0);
    await page.getByTestId('install-hide').click();
    await expect(page.getByTestId('install-card')).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId('about')).toBeVisible();
    await expect(page.getByTestId('install-card')).toHaveCount(0);
    await page.goto('./#/settings');
    await expect(page.getByTestId('install-ios-steps')).toBeVisible();
  });

  test('nothing to install when opened from the home screen', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }));
    await page.goto('./#/');
    await expect(page.getByTestId('about')).toBeVisible();
    await expect(page.getByTestId('install-card')).toHaveCount(0);
  });
});

test('the app manifest and iPhone icon are served', async ({ page, request }) => {
  await page.goto('./#/');
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await request.get(new URL(manifestHref!, page.url()).href)).json();
  expect(manifest.name).toBe('HSK Trainer');
  expect(manifest.display).toBe('standalone');
  const pngs = manifest.icons.filter((i: { type: string }) => i.type === 'image/png');
  expect(pngs.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(manifest.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true);
  const iconUrls = [...pngs.map((i: { src: string }) => new URL(i.src, page.url()).href), new URL((await page.locator('link[rel="apple-touch-icon"]').getAttribute('href'))!, page.url()).href];
  for (const url of iconUrls) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(res.headers()['content-type'], url).toContain('image/png');
  }
});
