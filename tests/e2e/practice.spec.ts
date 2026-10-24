import { expect, test } from '@playwright/test';
import { waitForOfflineReady } from './helpers';

test('guided mode: check shows explanation and locks the answer', async ({ page }) => {
  await page.goto('./#/practice');
  await expect(page.getByText('Original practice').first()).toBeVisible();
  await page.getByRole('button', { name: /Guided/ }).click();

  const q = page.getByTestId('q-a-r2-1');
  await q.getByRole('radio', { name: 'C' }).click();
  await q.getByRole('button', { name: 'Check' }).click();
  await expect(q.getByTestId('feedback')).toContainText('Correct');
  await expect(q.getByRole('button', { name: 'Check' })).toHaveCount(0);
  await expect(q.getByRole('radio', { name: 'A' })).toBeDisabled();

  const wrong = page.getByTestId('q-a-r2-2');
  await wrong.getByRole('radio', { name: 'F' }).click();
  await wrong.getByRole('button', { name: 'Check' }).click();
  await expect(wrong.getByTestId('feedback')).toContainText('Answer: A');
});

test('timed exam: score, review and history survive a reload, offline', async ({ page, context }) => {
  await waitForOfflineReady(page);
  await context.setOffline(true);
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /Timed exam/ }).click();
  await expect(page.getByRole('timer')).toHaveText(/1[45]:\d\d/);

  // Reading: answer 2 correctly, leave the rest blank. No feedback while timed.
  await page.getByTestId('q-a-r2-1').getByRole('radio', { name: 'C' }).click();
  await page.getByTestId('q-a-r3-1').getByRole('radio', { name: 'B' }).click();
  await expect(page.getByTestId('feedback')).toHaveCount(0);
  await page.getByTestId('submit-section').dblclick(); // double submission must not skip writing or double-save

  await expect(page.getByText('Writing 书写').first()).toBeVisible();
  await page.getByLabel('Answer for question 1').fill('学');
  await page.getByTestId('submit-section').click();

  await expect(page.getByTestId('score')).toContainText('3 / 25');
  await expect(page.getByTestId('feedback').first()).toBeVisible();

  await page.reload();
  await page.goto('./#/practice');
  await expect(page.getByTestId('history')).toContainText('3/25');
});

test('can switch practice sets; each set has its own questions', async ({ page }) => {
  await page.goto('./#/practice');
  await page.getByRole('radio', { name: 'Practice set C' }).click();
  await page.getByRole('button', { name: /Guided/ }).click();
  await expect(page.getByText('Practice set C ·')).toBeVisible();
  const q = page.getByTestId('q-c-r2-1');
  await q.getByRole('radio', { name: 'B' }).click();
  await q.getByRole('button', { name: 'Check' }).click();
  await expect(q.getByTestId('feedback')).toContainText('Correct');
});
