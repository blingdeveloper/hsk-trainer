import { expect, test } from '@playwright/test';

test('wrong answers land in the notebook; redoing them correctly fixes them', async ({ page }) => {
  await page.goto('./#/mistakes');
  await expect(page.getByTestId('no-mistakes')).toBeVisible();

  // Get two questions wrong in guided mode.
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Guided/ }).click();
  for (const [qid, key] of [['a-r2-1', 'A'], ['a-r3-1', 'C']]) {
    const q = page.getByTestId(`q-${qid}`);
    await q.getByRole('radio', { name: key, exact: true }).click();
    await q.getByRole('button', { name: 'Check' }).click();
  }
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await expect(page.getByTestId('open-mistakes')).toHaveText('2 to fix');

  await page.goto('./#/mistakes');
  await expect(page.getByTestId('mistake-list').getByRole('listitem')).toHaveCount(2);
  await expect(page.getByTestId('mistake-a-r2-1')).toContainText('Your answer: A');
  await expect(page.getByTestId('mistake-a-r2-1')).toContainText('Vocabulary & grammar in context');

  // Filter by category.
  await page.getByRole('radio', { name: /Dialogue responses/ }).click();
  await expect(page.getByTestId('mistake-list').getByRole('listitem')).toHaveCount(1);
  await page.getByRole('radio', { name: /^All/ }).click();

  // Redo both, answer one correctly.
  await page.getByTestId('redo-mistakes').click();
  await expect(page.getByText('My mistakes · 0/2 answered')).toBeVisible();
  const q = page.getByTestId('q-a-r2-1');
  await q.getByRole('radio', { name: 'C', exact: true }).click();
  await q.getByRole('button', { name: 'Check' }).click();
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();
  await expect(page.getByTestId('score')).toContainText('1 / 2');

  await page.goto('./#/mistakes');
  await expect(page.getByTestId('mistake-list').getByRole('listitem')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show fixed (1)' }).click();
  await expect(page.getByTestId('mistake-a-r2-1')).toContainText('Fixed');
});
