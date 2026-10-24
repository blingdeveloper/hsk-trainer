import { expect, test } from '@playwright/test';
import { drawStrokes, SHI, waitForOfflineReady } from './helpers';

test('draw a character → choose candidate → dictionary entry', async ({ page }) => {
  await page.goto('./#/write');
  await expect(page.getByText('Draw a character.')).toBeVisible();
  await drawStrokes(page, SHI);
  const candidate = page.getByTestId('candidate').filter({ hasText: /^十$/ });
  await expect(candidate).toBeVisible();
  await candidate.click();

  await expect(page).toHaveURL(/#\/entry\//);
  await expect(page.getByTestId('entry-headword')).toHaveText('十');
  await expect(page.getByTestId('entry-pinyin').first()).toHaveText('shí');
  await expect(page.getByText('ten').first()).toBeVisible();
  await expect(page.getByTestId('stroke-order').locator('svg')).toBeVisible();

  // Compound words are real entries and open their own page.
  const compound = page.getByTestId('compound-list').getByRole('link').first();
  const word = (await compound.locator('.han').textContent())!;
  await compound.click();
  await expect(page.getByTestId('entry-headword')).toHaveText(word);
});

test('clear and undo work', async ({ page }) => {
  await page.goto('./#/write');
  await drawStrokes(page, SHI);
  await expect(page.getByTestId('candidate').first()).toBeVisible();
  await page.getByRole('button', { name: 'Undo stroke' }).click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByTestId('candidate')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear' })).toBeDisabled();
});

test('handwriting → dictionary → stroke order works with the network OFF', async ({ page, context }) => {
  await waitForOfflineReady(page);
  await context.setOffline(true);

  await page.goto('./#/write');
  await page.reload(); // a full reload while offline proves the app shell is cached
  await drawStrokes(page, SHI);
  await page.getByTestId('candidate').filter({ hasText: /^十$/ }).click();
  await expect(page.getByTestId('entry-headword')).toHaveText('十');
  await expect(page.getByTestId('entry-pinyin').first()).toHaveText('shí');
  await expect(page.getByTestId('stroke-order').locator('svg')).toBeVisible();
  await page.getByRole('button', { name: /Play stroke order/ }).click();
  await expect(page.getByText('No stroke-order data')).toHaveCount(0);
});
