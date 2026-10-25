import { expect, test } from '@playwright/test';

test('Today shows the countdown and next steps that follow your progress', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByTestId('countdown')).toContainText('days');
  await expect(page.getByTestId('next-characters')).toContainText('0 of 100');
  await expect(page.getByTestId('next-paper')).toContainText('Practice set A');
  await expect(page.getByTestId('next-mistakes')).toHaveCount(0);

  // Get one question wrong, leave the exam unfinished: both should show up.
  await page.getByTestId('next-paper').click();
  await page.getByRole('button', { name: /^Guided/ }).click();
  const q = page.getByTestId('q-a-r2-1');
  await q.getByRole('radio', { name: 'A', exact: true }).click();
  await q.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Save and leave' }).click();

  await page.getByRole('link', { name: /Today/ }).click();
  await expect(page.getByTestId('next-resume')).toContainText('Finish Practice set A');
  await expect(page.getByTestId('next-mistakes')).toContainText('Fix 1 mistake');
  await page.getByTestId('next-resume').click();
  await expect(page.getByTestId('q-a-r2-1').getByTestId('feedback')).toBeVisible();
});

test('pinyin switch hides reading pinyin, keeps writing prompts, and is remembered', async ({ page }) => {
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Guided/ }).click();
  const q = page.getByTestId('q-a-r2-1');
  await expect(q.getByText('Wǒ ( ) chīguo wǔfàn le.')).toBeVisible();

  const toggle = page.getByRole('switch', { name: 'Pinyin' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(q.getByText('Wǒ ( ) chīguo wǔfàn le.')).toHaveCount(0);

  // Wait until the setting is stored before reloading.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const open = indexedDB.open('hsk-trainer');
            open.onsuccess = () => {
              const req = open.result.transaction('settings').objectStore('settings').get('me');
              req.onsuccess = () => resolve(req.result?.showPinyin);
            };
          }),
      ),
    )
    .toBe(false);
  await page.reload();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('switch', { name: 'Pinyin' })).toHaveAttribute('aria-checked', 'false');
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();
  // Writing Part 2 prompts are pinyin, so they stay visible.
  await expect(page.getByText('Wǒmen (xué) xiào hěn dà.')).toBeVisible();
});
