import { expect, test } from '@playwright/test';

test('save words, see them on Lookup, open and remove them', async ({ page }) => {
  await page.goto('./#/write');
  await expect(page.getByTestId('saved-empty')).toBeVisible();

  // Save a character and a word.
  await page.goto('./#/entry/%E5%AD%A6'); // 学
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByTestId('saved-status')).toBeVisible();
  await page.goto('./#/entry/%E5%AD%A6%E6%A0%A1'); // 学校
  await page.getByRole('button', { name: 'Save' }).click();

  // Newest first, with pinyin, level and meaning.
  await page.goto('./#/write');
  const items = page.getByTestId('saved-item');
  await expect(items).toHaveCount(2);
  await expect(items.first()).toContainText('学校');
  await expect(items.first()).toContainText('xuéxiào');
  await expect(items.first()).toContainText('HSK 1');
  await expect(items.nth(1)).toContainText('学');

  // Opening one goes to its page; saved survives a reload.
  await items.first().getByRole('link').click();
  await expect(page.getByTestId('entry-headword')).toHaveText('学校');
  await page.reload();
  await expect(page.getByTestId('saved-status')).toBeVisible();

  // Remove from the word's page…
  await page.getByRole('button', { name: 'Remove from saved' }).click();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
  // …and from the list.
  await page.goto('./#/write');
  await expect(items).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove 学 from saved' }).click();
  await expect(page.getByTestId('saved-empty')).toBeVisible();
});
