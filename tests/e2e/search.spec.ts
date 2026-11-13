import { expect, test } from '@playwright/test';
import { waitForOfflineReady } from './helpers';

const results = (page: import('@playwright/test').Page, kind: 'pinyin' | 'english') => page.getByTestId(`search-${kind}`).getByTestId('search-result');

test('pinyin search lists matching words, HSK words first, and opens the entry', async ({ page }) => {
  await page.goto('./#/write');
  await expect(page.getByRole('heading', { name: 'Lookup', exact: true })).toBeVisible();
  await page.getByTestId('search-input').fill('xie');
  const first = results(page, 'pinyin').first();
  await expect(first).toContainText('些');
  await expect(first).toContainText('xiē');
  await expect(first).toContainText('HSK 1');
  await expect(results(page, 'pinyin').filter({ hasText: /^写 / })).toContainText('write');

  // A character gets its level from the HSK word it's in.
  await page.getByTestId('search-input').fill('ma');
  await expect(results(page, 'pinyin').filter({ hasText: /^妈 / })).toContainText('in 妈妈');

  await page.getByTestId('search-input').fill('ni3hao3');
  await expect(results(page, 'pinyin').first()).toContainText('你好');
  await expect(results(page, 'pinyin').first()).toContainText('nǐhǎo');
  await results(page, 'pinyin').first().click();
  await expect(page).toHaveURL(/#\/entry\//);
  await expect(page.getByTestId('entry-headword')).toHaveText('你好');

  // Going back keeps the search.
  await page.goBack();
  await expect(page.getByTestId('search-input')).toHaveValue('ni3hao3');
  await expect(results(page, 'pinyin').first()).toContainText('你好');
});

test('English search finds the word with that meaning', async ({ page }) => {
  await page.goto('./#/write');
  await page.getByTestId('search-input').fill('write');
  await expect(page.getByTestId('search-pinyin')).toHaveCount(0);
  await expect(results(page, 'english').first()).toContainText('写');
  await expect(results(page, 'english').first()).toContainText('xiě');

  // "big" reads as English first, though "bi g…" could start some pinyin.
  await page.getByTestId('search-input').fill('big');
  const groups = page.locator('[data-testid="search-english"], [data-testid="search-pinyin"]');
  await expect(groups.first()).toHaveAttribute('data-testid', 'search-english');
  await expect(results(page, 'english').first()).toContainText('大');
});

test('words that are both pinyin and English show both groups', async ({ page }) => {
  await page.goto('./#/write');
  await page.getByTestId('search-input').fill('you');
  await expect(results(page, 'pinyin').first()).toContainText('有');
  await expect(results(page, 'english').first()).toContainText('你');
});

test('the level you study changes the order', async ({ page }) => {
  await page.goto('./#/write');
  await page.getByTestId('level-1').click();
  await page.getByTestId('search-input').fill('you');
  await expect(results(page, 'pinyin').nth(5)).not.toContainText('游泳');
  const hsk1 = await results(page, 'pinyin').allTextContents();
  await page.getByTestId('level-2').click();
  await expect.poll(async () => (await results(page, 'pinyin').allTextContents()).findIndex((t) => t.startsWith('游泳')))
    .toBeLessThan(hsk1.findIndex((t) => t.startsWith('游泳')));
});

test('Chinese characters open directly; nonsense says nothing was found; Show more adds results', async ({ page }) => {
  await page.goto('./#/write');
  await page.getByTestId('search-input').fill('學');
  await page.getByTestId('search-direct').click();
  await expect(page.getByTestId('entry-headword')).toHaveText('学');

  await page.goto('./#/write');
  await page.getByTestId('search-input').fill('qqqq');
  await expect(page.getByTestId('search-empty')).toContainText('Nothing found');

  await page.getByTestId('search-input').fill('shi');
  await expect(results(page, 'pinyin')).toHaveCount(20);
  await page.getByRole('button', { name: 'Show more' }).first().click();
  await expect(results(page, 'pinyin')).toHaveCount(40);
});

test('search works offline', async ({ page, context }) => {
  await waitForOfflineReady(page);
  await context.setOffline(true);
  await page.goto('./#/write');
  await page.reload();
  await page.getByTestId('search-input').fill('mother');
  await expect(results(page, 'english').first()).toContainText('妈');
});
