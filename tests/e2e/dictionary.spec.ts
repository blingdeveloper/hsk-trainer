import { expect, test } from '@playwright/test';

test('traditional characters open the simplified entry with a note', async ({ page }) => {
  await page.goto('./#/entry/%E5%AD%B8'); // 學
  await expect(page.getByTestId('traditional-note')).toContainText('traditional form');
  await expect(page.getByTestId('entry-headword')).toHaveText('学');
  await expect(page.getByTestId('entry-pinyin').first()).toHaveText('xué');
});

test('unknown text has no Save button', async ({ page }) => {
  await page.goto('./#/entry/abc');
  await expect(page.getByTestId('no-entry')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
});

test('characters show their HSK reading first', async ({ page }) => {
  await page.goto('./#/characters/%E4%B9%88'); // 么
  await expect(page.getByTestId('char-gloss')).toContainText('me');
  await expect(page.getByTestId('char-gloss')).not.toContainText('má');
  await page.goto('./#/characters/%E8%A6%81'); // 要
  await expect(page.getByTestId('char-gloss')).toContainText('yào');
});
