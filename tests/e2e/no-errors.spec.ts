import { expect, test } from '@playwright/test';

const ROUTES = [
  '#/',
  '#/practice',
  '#/mistakes',
  '#/characters',
  '#/characters/%E5%AD%A6', // 学
  '#/characters/%E5%AD%B8', // 學: no stroke data bundled
  '#/characters/%F0%9F%98%80', // not a character at all
  '#/write',
  '#/entry/%E5%AD%A6',
  '#/entry/%E5%AD%B8',
  '#/entry/xyz',
  '#/entry/',
  '#/settings',
  '#/licences',
  '#/no-such-page',
];

test('every screen loads without console errors or uncaught exceptions', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`exception: ${e.message}`));

  for (const route of ROUTES) {
    await page.goto(`./${route}`);
    await expect(page.locator('main')).not.toBeEmpty();
    await page.waitForTimeout(400);
  }
  // Interactive bits that load data on demand.
  await page.goto('./#/characters/%E5%AD%B8');
  await page.getByRole('tab', { name: 'Trace' }).click();
  await page.getByRole('tab', { name: 'Watch' }).click();
  await page.goto('./#/entry/%E5%AD%A6');
  await page.getByRole('button', { name: /Play stroke order/ }).click();
  await page.waitForTimeout(500);

  expect(problems).toEqual([]);
});

test('unknown character pages explain themselves', async ({ page }) => {
  await page.goto('./#/characters/%F0%9F%98%80');
  await expect(page.getByText('Not in the offline dictionary.')).toBeVisible();
  await expect(page.getByText(/No stroke data for/)).toBeVisible();
});
