import { expect, test } from '@playwright/test';

test('Home offers HSK 1 and HSK 2, each with Practice, Characters and Lookup', async ({ page }) => {
  await page.goto('./');
  for (const level of [1, 2]) {
    const card = page.getByTestId(`level-card-${level}`);
    await expect(card).toContainText(`HSK ${level}`);
    for (const section of ['Practice', 'Characters', 'Lookup']) {
      await expect(card.getByRole('button', { name: new RegExp(`^HSK ${level} ${section}`) })).toBeVisible();
    }
  }
  // HSK 2 is the default level.
  await expect(page.getByTestId('level-card-2')).toContainText('Your level');
  await expect(page.getByTestId('level-summary-1')).toContainText('3 practice sets · 3 mock exams · 0/95 characters learned');
  await expect(page.getByTestId('level-summary-2')).toContainText('3 practice sets · 3 mock exams · 0/100 characters learned');
});

test('choosing a section on a level card switches to that level', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /^HSK 1 Practice/ }).click();
  await expect(page.getByRole('heading', { name: 'HSK 1 exam practice' })).toBeVisible();

  await page.goto('./');
  await expect(page.getByTestId('level-card-1')).toContainText('Your level');
  await expect(page.getByRole('heading', { name: 'Up next for HSK 1' })).toBeVisible();

  await page.getByRole('button', { name: /^HSK 1 Characters/ }).click();
  await expect(page.getByRole('heading', { name: 'HSK 1 characters' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Writing characters' }).getByRole('link')).toHaveCount(95);
  // 比 is an HSK 2 character, so it's not in the HSK 1 list.
  await expect(page.getByRole('link', { name: /^比,/ })).toHaveCount(0);

  await page.goto('./');
  await page.getByRole('button', { name: /^HSK 2 Characters/ }).click();
  await expect(page.getByRole('heading', { name: 'HSK 2 characters' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Writing characters' }).getByRole('link')).toHaveCount(100);

  await page.goto('./');
  await page.getByRole('button', { name: /^HSK 1 Lookup/ }).click();
  await expect(page.getByRole('heading', { name: 'Handwriting lookup' })).toBeVisible();
  await expect(page.getByTestId('level-1')).toHaveAttribute('aria-checked', 'true');
});

test('Lookup marks words above your level', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /^HSK 1 Lookup/ }).click();
  await page.goto('./#/entry/%E5%B7%B2%E7%BB%8F'); // 已经: an HSK 2 word
  await expect(page.locator('main')).toContainText('HSK 2 · above HSK 1');
  await page.goto('./#/entry/%E5%AD%A6%E6%A0%A1'); // 学校: HSK 1
  await expect(page.locator('main')).not.toContainText('above HSK 1');
});
