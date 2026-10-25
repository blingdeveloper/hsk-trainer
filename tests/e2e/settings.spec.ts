import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

test('changing the exam date updates the countdown everywhere', async ({ page }) => {
  await page.goto('./#/settings');
  const future = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
  await page.getByTestId('exam-date').fill(future);
  await expect(page.getByTestId('exam-countdown')).toHaveText('10 days to go.');
  await page.getByRole('link', { name: /Today/ }).click();
  await expect(page.getByTestId('countdown')).toContainText('10');
  await page.reload();
  await expect(page.getByTestId('countdown')).toContainText('10');
});

test('pinyin default in Settings applies to exams', async ({ page }) => {
  await page.goto('./#/settings');
  await page.getByRole('switch', { name: 'Pinyin' }).click();
  await expect(page.getByRole('switch', { name: 'Pinyin' })).toHaveAttribute('aria-checked', 'false');
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Guided/ }).click();
  await expect(page.getByRole('switch', { name: 'Pinyin' })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('q-a-r2-1').getByText('Wǒ ( ) chīguo wǔfàn le.')).toHaveCount(0);
});

test('export a backup, lose progress, restore it', async ({ page }, testInfo) => {
  // Make some progress: one wrong answer.
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Guided/ }).click();
  const q = page.getByTestId('q-a-r2-1');
  await q.getByRole('radio', { name: 'A', exact: true }).click();
  await q.getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Save and leave' }).click();

  await page.goto('./#/settings');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export').click()]);
  expect(download.suggestedFilename()).toMatch(/^hsk-trainer-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const file = testInfo.outputPath('backup.json');
  await download.saveAs(file);
  expect(JSON.parse(readFileSync(file, 'utf8')).tables.attempts).toHaveLength(1);

  // Wipe everything, as if browser data had been cleared.
  await page.evaluate(() => new Promise((r) => { const req = indexedDB.deleteDatabase('hsk-trainer'); req.onsuccess = req.onerror = req.onblocked = r; }));
  await page.reload();
  await page.goto('./#/mistakes');
  await expect(page.getByTestId('no-mistakes')).toBeVisible();

  await page.goto('./#/settings');
  await page.getByTestId('import-file').setInputFiles(file);
  await expect(page.getByTestId('backup-summary')).toContainText('1answers');
  await page.getByTestId('confirm-restore').click();
  await expect(page.getByTestId('restore-done')).toBeVisible();

  await page.goto('./#/mistakes');
  await expect(page.getByTestId('mistake-a-r2-1')).toBeVisible();
  await page.goto('./#/practice');
  await expect(page.getByTestId('resume')).toContainText('Practice set A');
});

test('a file that is not a backup is rejected without changing anything', async ({ page }, testInfo) => {
  const file = testInfo.outputPath('not-a-backup.json');
  writeFileSync(file, JSON.stringify({ hello: 'world' }));
  await page.goto('./#/settings');
  await page.getByTestId('import-file').setInputFiles(file);
  await expect(page.getByTestId('restore-error')).toContainText("isn't an HSK Trainer backup");
  await expect(page.getByTestId('confirm-restore')).toHaveCount(0);
});

test('Sources & Licences is reachable from Settings', async ({ page }) => {
  await page.goto('./#/settings');
  await page.getByRole('link', { name: /Sources & Licences/ }).click();
  await expect(page.getByRole('heading', { name: 'Sources & Licences' })).toBeVisible();
});
