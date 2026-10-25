import { expect, test, type Page } from '@playwright/test';
import { waitForOfflineReady } from './helpers';

async function startSet(page: Page, set: 'A' | 'B' | 'C', mode: 'Guided' | 'Timed') {
  await page.goto('./#/practice');
  await page.getByRole('radio', { name: `Practice set ${set}` }).click();
  await page.getByRole('button', { name: new RegExp(`^${mode}`) }).click();
}

const pick = (page: Page, qid: string, key: string) => page.getByTestId(`q-${qid}`).getByRole('radio', { name: new RegExp(`^${key}:`) }).click();

test('guided mode: check shows explanation and locks the answer', async ({ page }) => {
  await startSet(page, 'A', 'Guided');
  await expect(page.getByText('Original practice').first()).toBeVisible();
  const q = page.getByTestId('q-a-r2-1');
  await pick(page, 'a-r2-1', 'C');
  await q.getByRole('button', { name: 'Check' }).click();
  await expect(q.getByTestId('feedback')).toContainText('Correct');
  await expect(q.getByRole('button', { name: 'Check' })).toHaveCount(0);
  await expect(q.getByRole('radio', { name: /^A:/ })).toBeDisabled();

  const wrong = page.getByTestId('q-a-r2-2');
  await pick(page, 'a-r2-2', 'F');
  await wrong.getByRole('button', { name: 'Check' }).click();
  await expect(wrong.getByTestId('feedback')).toContainText('Answer: A');
});

test('timed exam: confirm unanswered, score, review and history, offline', async ({ page, context }) => {
  await waitForOfflineReady(page);
  await context.setOffline(true);
  await startSet(page, 'A', 'Timed');
  await expect(page.getByRole('timer')).toHaveText(/1[45]:\d\d/);

  await pick(page, 'a-r2-1', 'C');
  await pick(page, 'a-r3-1', 'B');
  await expect(page.getByTestId('feedback')).toHaveCount(0);

  // Finishing with unanswered questions asks first.
  await page.getByTestId('submit-section').click();
  await expect(page.getByTestId('confirm-finish')).toContainText('13 questions unanswered');
  await page.getByRole('button', { name: 'Keep working' }).click();
  await expect(page.getByText('Reading 阅读').first()).toBeVisible();
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').dblclick(); // a double click must not skip writing or double-save

  await expect(page.getByText('Writing 书写').first()).toBeVisible();
  await page.getByLabel('Answer for question 21').fill('学');
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();

  await expect(page.getByTestId('score')).toContainText('3 / 25');
  await expect(page.getByTestId('feedback').first()).toBeVisible();

  await page.reload();
  await page.goto('./#/practice');
  await expect(page.getByTestId('history')).toContainText('3/25');
  await expect(page.getByTestId('resume')).toHaveCount(0);
});

test('answers survive leaving the page and a reload; Resume restores them', async ({ page }) => {
  await startSet(page, 'B', 'Guided');
  await pick(page, 'b-r2-1', 'F');
  await pick(page, 'b-r2-2', 'C');

  await page.goto('./#/write');
  await page.goto('./#/practice');
  await expect(page.getByTestId('resume')).toContainText('Practice set B');
  await expect(page.getByTestId('resume')).toContainText('2/25 answered');

  await page.reload();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByTestId('q-b-r2-1').getByRole('radio', { name: /^F:/ })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('q-b-r2-2').getByRole('radio', { name: /^C:/ })).toHaveAttribute('aria-checked', 'true');
});

test('timed exam timer pauses while away and continues after resume', async ({ page }) => {
  await startSet(page, 'C', 'Timed');
  await expect(page.getByRole('timer')).toHaveText('15:00');
  await page.waitForTimeout(2200);
  await page.reload();
  await page.waitForTimeout(1500); // time away should not count
  await page.getByRole('button', { name: 'Resume' }).click();
  const shown = await page.getByRole('timer').textContent();
  expect(shown).toMatch(/^14:5[5-8]$/);
});

test('starting another paper asks before discarding the unfinished one', async ({ page }) => {
  await startSet(page, 'A', 'Guided');
  await pick(page, 'a-r2-1', 'C');
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await page.getByRole('button', { name: /^Mock exam 1/ }).click();
  await expect(page.getByRole('alertdialog', { name: 'Replace unfinished exam' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByTestId('resume')).toContainText('Practice set A');
});

test('writing answers: Latin letters are rejected with a hint', async ({ page }) => {
  await startSet(page, 'A', 'Guided');
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();
  const box = page.getByLabel('Answer for question 21');
  await box.fill('xue');
  await expect(page.getByText('Type a Chinese character')).toBeVisible();
  await box.fill('学');
  await expect(page.getByText('Type a Chinese character')).toHaveCount(0);
  await expect(box).toHaveValue('学');
});

test('mock exam: official order, 20 reading + 10 writing, timed', async ({ page }) => {
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Mock exam 2/ }).click();
  await expect(page.getByRole('timer')).toHaveText('20:00');
  await expect(page.getByText('Mock exam 2 · 0/20 answered')).toBeVisible();
  await expect(page.getByText('Reading Part 3')).toHaveCount(2);
  await expect(page.getByRole('radiogroup', { name: 'Options for question 20' })).toBeVisible();
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();
  await expect(page.getByRole('timer')).toHaveText('10:00');
  await expect(page.getByLabel('Answer for question 26')).toBeVisible();
});

test('can switch practice sets; each set has its own questions', async ({ page }) => {
  await startSet(page, 'C', 'Guided');
  await expect(page.getByText('Practice set C ·')).toBeVisible();
  const q = page.getByTestId('q-c-r2-1');
  await pick(page, 'c-r2-1', 'B');
  await q.getByRole('button', { name: 'Check' }).click();
  await expect(q.getByTestId('feedback')).toContainText('Correct');
});
