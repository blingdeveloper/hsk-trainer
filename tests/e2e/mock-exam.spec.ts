import { expect, test, type Page } from '@playwright/test';
import { MOCK_PAPERS } from '../../src/features/exam/papers';
import type { Question } from '../../src/content/types';

/** Answers one question through the UI the way a person would. */
async function answer(page: Page, q: Question, value: string, number: number) {
  if (q.taskType === 'writing-2-character') {
    await page.getByLabel(`Answer for question ${number}`).fill(value);
  } else {
    // Answer buttons are named "B: 水果".
    await page.getByTestId(`q-${q.id}`).getByRole('radio', { name: new RegExp(`^${value}:`) }).click();
  }
}

/** Fast-forwards the saved exam so only `ms` is left on the current section's clock. */
async function setRemaining(page: Page, ms: number) {
  await page.evaluate(
    (left) =>
      new Promise<void>((resolve) => {
        const open = indexedDB.open('hsk-trainer');
        open.onsuccess = () => {
          const store = open.result.transaction('exam', 'readwrite').objectStore('exam');
          const get = store.get('current');
          get.onsuccess = () => {
            store.put({ ...get.result, remainingMs: left });
            store.transaction.oncomplete = () => resolve();
          };
        };
      }),
    ms,
  );
}

for (const paper of MOCK_PAPERS) {
  test(`${paper.title}: full sitting with every answer right scores 30/30`, async ({ page }) => {
    await page.goto('./#/practice');
    await page.getByRole('button', { name: new RegExp(`^${paper.title}`) }).click();

    // Reading: 20 questions, 20 minutes, numbered 1–20.
    await expect(page.getByRole('timer')).toHaveText(/^(20:00|19:5\d)$/);
    const reading = paper.questions.filter((q) => q.skill === 'reading');
    expect(reading).toHaveLength(20);
    for (const [i, q] of reading.entries()) await answer(page, q, q.correctAnswer, i + 1);
    await expect(page.getByText(`${paper.title} · 20/20 answered`)).toBeVisible();
    await expect(page.getByTestId('feedback')).toHaveCount(0); // no feedback in a timed paper
    await page.getByTestId('submit-section').click();
    await expect(page.getByTestId('confirm-finish')).toHaveCount(0); // nothing unanswered, no question asked

    // Writing: 10 questions, 10 minutes, numbered 21–30.
    await expect(page.getByRole('timer')).toHaveText(/^(10:00|9:5\d)$/);
    const writing = paper.questions.filter((q) => q.skill === 'writing');
    for (const [i, q] of writing.entries()) await answer(page, q, q.correctAnswer, 21 + i);
    await page.getByTestId('submit-section').click();

    await expect(page.getByTestId('score')).toContainText('30 / 30');
    await expect(page.getByTestId('score')).toContainText('Reading 阅读');
    await expect(page.getByTestId('score')).toContainText('20/20');
    await expect(page.getByTestId('score')).toContainText('10/10');
    // Review shows an explanation for every question.
    await expect(page.getByTestId('feedback')).toHaveCount(30);

    await page.getByRole('button', { name: 'Back to practice' }).click();
    await expect(page.getByTestId('history')).toContainText(`${paper.title} · timed`);
    await expect(page.getByTestId('history')).toContainText('30/30');
    await expect(page.getByTestId('open-mistakes')).toHaveText('0 to fix');
  });
}

test('mock exam with wrong and blank answers: scored correctly and sent to the notebook', async ({ page }) => {
  const paper = MOCK_PAPERS[0];
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Mock exam 1/ }).click();

  // Reading: first 10 right, next 5 wrong, last 5 blank.
  const reading = paper.questions.filter((q) => q.skill === 'reading');
  const wrongKey = (q: Question) => ['A', 'B', 'C', 'D', 'E', 'F'].find((k) => k !== q.correctAnswer && (q.options ?? paper.groups.find((g) => g.id === q.groupId)!.options!).some((o) => o.key === k))!;
  for (const [i, q] of reading.slice(0, 10).entries()) await answer(page, q, q.correctAnswer, i + 1);
  for (const [i, q] of reading.slice(10, 15).entries()) await answer(page, q, wrongKey(q), 11 + i);
  await page.getByTestId('submit-section').click();
  await expect(page.getByTestId('confirm-finish')).toContainText('5 questions unanswered');
  await page.getByTestId('confirm-submit').click();

  // Writing: Part 1 right, Part 2 one right, one wrong character, rest blank.
  const writing = paper.questions.filter((q) => q.skill === 'writing');
  for (const [i, q] of writing.slice(0, 5).entries()) await answer(page, q, q.correctAnswer, 21 + i);
  await answer(page, writing[5], writing[5].correctAnswer, 26);
  await answer(page, writing[6], '大', 27);
  await page.getByTestId('submit-section').click();
  await page.getByTestId('confirm-submit').click();

  // 10 + 5 + 1 = 16 right out of 30.
  await expect(page.getByTestId('score')).toContainText('16 / 30');
  await expect(page.getByTestId('score')).toContainText('10/20');
  await expect(page.getByTestId('score')).toContainText('6/10');

  // 5 wrong + 5 blank in reading, 1 wrong + 3 blank in writing = 14 mistakes.
  await page.getByRole('link', { name: /Go to my mistakes/ }).click();
  await expect(page.getByTestId('mistake-list').getByRole('listitem')).toHaveCount(14);
  await expect(page.getByTestId(`mistake-${writing[6].id}`)).toContainText('You chose 大');
});

test('when the timer runs out, the section ends and the next one starts', async ({ page }) => {
  await page.goto('./#/practice');
  await page.getByRole('button', { name: /^Mock exam 3/ }).click();
  await page.getByTestId(`q-${MOCK_PAPERS[2].questions[0].id}`).getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Save and leave' }).click();

  // Fast-forward: leave 2 seconds on the reading clock.
  await setRemaining(page, 2000);
  await page.reload();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('timer')).toHaveText(/^0:0[12]$/);

  // No confirmation when time is up: writing starts on its own with a fresh 10 minutes.
  await expect(page.getByText('Writing 书写').first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('confirm-finish')).toHaveCount(0);
  await expect(page.getByRole('timer')).toHaveText(/^(10:00|9:5\d)$/);
  // Reading can't be reopened.
  await expect(page.getByTestId(`q-${MOCK_PAPERS[2].questions[0].id}`)).toHaveCount(0);

  // Time runs out in Writing too: the exam ends and goes straight to the score.
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await setRemaining(page, 2000);
  await page.reload();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByTestId('score')).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('score')).toContainText('/ 30');
  await expect(page.getByTestId('resume')).toHaveCount(0);
});
