import { expect, test, type Page } from '@playwright/test';
import { mockPapers } from '../../src/features/exam/papers';
import { waitForOfflineReady } from './helpers';

async function chooseLevel(page: Page, level: 1 | 2) {
  await page.goto('./#/settings');
  await page.getByTestId(`level-${level}`).click();
  await expect(page.getByTestId(`level-${level}`)).toHaveAttribute('aria-checked', 'true');
}

const pick = (page: Page, qid: string, key: string) =>
  page.getByTestId(`q-${qid}`).getByRole('radio', { name: new RegExp(`^${key}:`) }).click();

test('switching to HSK 1 changes the whole app, and is remembered', async ({ page, isMobile }) => {
  await chooseLevel(page, 1);

  await page.goto('./#/');
  await expect(page.getByRole('heading', { name: 'Up next for HSK 1' })).toBeVisible();
  await expect(page.getByTestId('next-paper')).toContainText('15 questions in the official HSK 1 format');
  // No writing in the HSK 1 exam, so practice comes before writing characters.
  await expect(page.getByTestId('next-paper')).toContainText('Step 1');
  if (!isMobile) await expect(page.getByText('HSK 1 exam in')).toBeVisible();

  await page.goto('./#/practice');
  await expect(page.getByRole('heading', { name: 'HSK 1 exam practice' })).toBeVisible();
  await expect(page.getByText('Listening 20 questions (~12 min), Reading 20 (20 min). No writing section.')).toBeVisible();
  await expect(page.getByTestId('set-summary')).toContainText('Reading Part 2 (5), Part 3 (5), Part 4 (5) in 15 min');
  await expect(page.getByTestId('mock-summary')).toContainText('Reading Part 2 (5), Part 3 (5), Part 4 (5) in 15 min');
  await expect(page.getByRole('radiogroup', { name: 'Practice set' }).getByRole('radio')).toHaveCount(3);

  await page.goto('./#/characters');
  await expect(page.getByTestId('hsk1-writing-note')).toBeVisible();

  await page.reload();
  await page.goto('./#/practice');
  await expect(page.getByRole('heading', { name: 'HSK 1 exam practice' })).toBeVisible();

  // The switch on the Practice page works too.
  await page.getByTestId('level-2').click();
  await expect(page.getByRole('heading', { name: 'HSK 2 exam practice' })).toBeVisible();
  await expect(page.getByTestId('set-summary')).toContainText('Writing Part 1 (5), Part 2 (5)');
});

for (const paper of mockPapers(1)) {
  test(`HSK 1 ${paper.title}: every answer right scores 15/15`, async ({ page }) => {
    await chooseLevel(page, 1);
    await page.goto('./#/practice');
    await page.getByRole('button', { name: new RegExp(`^${paper.title}`) }).click();
    await expect(page.getByRole('timer')).toHaveText(/^(15:00|14:5\d)$/);
    for (const q of paper.questions) await pick(page, q.id, q.correctAnswer);
    await expect(page.getByText(`${paper.title} · 15/15 answered`)).toBeVisible();
    // Only a reading section, so this is the last one.
    await expect(page.getByTestId('submit-section')).toHaveText('Finish and review');
    await page.getByTestId('submit-section').click();
    await expect(page.getByTestId('score')).toContainText('15 / 15');
    await expect(page.getByTestId('score')).not.toContainText('Writing');
    await page.getByRole('button', { name: 'Back to practice' }).click();
    await expect(page.getByTestId('history')).toContainText(`${paper.title} · timed`);
  });
}

test('each level keeps its own history and mistakes', async ({ page }) => {
  // One wrong answer in HSK 1…
  await chooseLevel(page, 1);
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Guided/ }).click();
  await pick(page, 'h1-a-p2-1', 'B');
  await page.getByTestId('q-h1-a-p2-1').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('q-h1-a-p2-1').getByTestId('feedback')).toContainText('Answer: A');
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await expect(page.getByTestId('open-mistakes')).toHaveText('1 to fix');
  await expect(page.getByTestId('history')).toContainText('Practice set A');

  await page.goto('./#/mistakes');
  await expect(page.getByRole('heading', { name: 'My mistakes · HSK 1' })).toBeVisible();
  await expect(page.getByTestId('mistake-h1-a-p2-1')).toBeVisible();

  // …doesn't show up for HSK 2.
  await page.getByTestId('level-2').click();
  await expect(page.getByTestId('no-mistakes')).toBeVisible();
  await page.goto('./#/practice');
  await expect(page.getByTestId('open-mistakes')).toHaveText('0 to fix');
  await expect(page.getByTestId('history')).toHaveCount(0);
  // The unfinished HSK 1 paper is still offered, labelled with its level.
  await expect(page.getByTestId('resume')).toContainText('Practice set A (HSK 1)');

  await page.goto('./#/');
  await expect(page.getByTestId('next-mistakes')).toHaveCount(0);
  await expect(page.getByTestId('next-resume')).toContainText('(HSK 1)');
});

test('redoing HSK 1 mistakes works and fixes them', async ({ page }) => {
  await chooseLevel(page, 1);
  await page.goto('./#/practice');
  await page.getByRole('radio', { name: 'Practice set B' }).click();
  await page.getByRole('button', { name: /^Guided/ }).click();
  await pick(page, 'h1-b-p3-4', 'A');
  await page.getByTestId('q-h1-b-p3-4').getByRole('button', { name: 'Check' }).click();
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await page.getByRole('button', { name: 'Discard' }).click();

  await page.goto('./#/mistakes');
  await page.getByTestId('redo-mistakes').click();
  await pick(page, 'h1-b-p3-4', 'F');
  await page.getByTestId('q-h1-b-p3-4').getByRole('button', { name: 'Check' }).click();
  await page.getByTestId('submit-section').click();
  await expect(page.getByTestId('score')).toContainText('1 / 1');
  await page.goto('./#/mistakes');
  await expect(page.getByTestId('no-mistakes')).toBeVisible();
});

test('HSK 1 practice works offline', async ({ page, context }) => {
  await chooseLevel(page, 1);
  await waitForOfflineReady(page);
  await context.setOffline(true);
  await page.goto('./#/practice');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'HSK 1 exam practice' })).toBeVisible();
  await page.getByRole('button', { name: /^Timed/ }).click();
  await pick(page, 'h1-a-p2-1', 'A');
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();
  await expect(page.getByTestId('score')).toContainText('1 / 15');
});
