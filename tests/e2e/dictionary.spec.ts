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

test('word pinyin is joined and measure words are readable', async ({ page }) => {
  await page.goto('./#/entry/%E7%94%B5%E8%84%91'); // 电脑
  await expect(page.getByTestId('entry-pinyin').first()).toHaveText('diànnǎo');
  await expect(page.getByTestId('measure-words')).toContainText('Measure word:');
  await expect(page.getByTestId('measure-words')).toContainText('台 tái');
  await expect(page.locator('main')).not.toContainText('CL:');
  await expect(page.locator('main')).not.toContainText('[tai2]');

  await page.goto('./#/entry/%E4%B8%80%E4%BC%9A%E5%84%BF'); // 一会儿
  await expect(page.getByTestId('entry-pinyin').first()).toHaveText('yíhuìr');
  await expect(page.locator('main')).toContainText('also pronounced yī huǐ r');
});

test('references inside definitions link to their entries', async ({ page }) => {
  await page.goto('./#/entry/%E5%A4%A7%E5%AD%A6'); // 大学: "one of the Four Books 四书"
  await page.getByRole('link', { name: /四书 Sìshū/ }).click();
  await expect(page.getByTestId('entry-headword')).toHaveText('四书');
});

test('Back returns to where you came from', async ({ page }) => {
  await page.goto('./#/entry/%E5%AD%A6'); // opened directly: no in-app history
  await expect(page.getByRole('link', { name: '← Look up a character' })).toBeVisible();
  await page.getByTestId('compound-list').getByRole('link').first().click();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByTestId('entry-headword')).toHaveText('学');
});
