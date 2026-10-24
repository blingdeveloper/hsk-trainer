import { expect, test, type Page } from '@playwright/test';
import { waitForOfflineReady } from './helpers';

/** Draws 一 (one horizontal stroke) on the Hanzi Writer quiz. */
async function writeYi(page: Page) {
  const box = (await page.getByTestId('writing-quiz').boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.12, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.88, box.y + box.height * 0.5, { steps: 15 });
  await page.mouse.up();
}

test('all 100 official writing characters are listed', async ({ page }) => {
  await page.goto('./#/characters');
  await expect(page.getByRole('list', { name: 'Writing characters' }).getByRole('link')).toHaveCount(100);
  await expect(page.getByTestId('writing-summary')).toContainText('0 learned');
});

test('trace then write from memory updates progress, offline', async ({ page, context }) => {
  await waitForOfflineReady(page);
  await context.setOffline(true);

  await page.goto('./#/characters/%E4%B8%80');
  await expect(page.getByTestId('char-gloss')).toContainText('yī');

  await page.getByRole('tab', { name: 'Trace' }).click();
  await writeYi(page);
  await expect(page.getByTestId('quiz-status')).toContainText('Done');

  for (let i = 0; i < 2; i++) {
    await page.getByRole('tab', { name: 'From memory' }).click();
    await page.getByRole('button', { name: /Restart/ }).click();
    await writeYi(page);
    await expect(page.getByTestId('quiz-status')).toContainText('Done');
  }
  await expect(page.getByText('Recalls: 2/2')).toBeVisible();

  await page.getByRole('link', { name: /All writing characters/ }).click();
  await expect(page.getByRole('link', { name: '一, learned' })).toBeVisible();
  await expect(page.getByTestId('writing-summary')).toContainText('1 learned');

  await page.reload();
  await expect(page.getByTestId('writing-summary')).toContainText('1 learned');
});

test('a session walks through 10 characters and shows a summary', async ({ page }) => {
  await page.goto('./#/characters');
  await page.getByRole('button', { name: 'Practise next 10' }).click();
  await expect(page.getByText('Character 1 / 10')).toBeVisible();
  for (let i = 0; i < 10; i++) await page.getByTestId('session-next').click();
  await expect(page.getByTestId('session-summary')).toContainText('0 / 10');
});
