import { expect, test, type Page } from '@playwright/test';
import { PICTURES_A } from '../../src/content/sets/pictures-a';
import { waitForOfflineReady } from './helpers';

const pick = (page: Page, qid: string, key: string) =>
  page.getByTestId(`q-${qid}`).getByRole('radio', { name: new RegExp(`^${key}:`) }).click();

async function openPictureSet(page: Page, mode: 'Guided' | 'Timed') {
  await page.goto('./#/practice');
  await page.getByRole('radio', { name: 'Picture set 1' }).click();
  await expect(page.getByTestId('set-summary')).toContainText('Reading Part 1 (5) in 5 min');
  await page.getByRole('button', { name: new RegExp(`^${mode}`) }).click();
}

async function expectPicturesLoaded(page: Page) {
  const imgs = page.getByTestId('picture-options').locator('img');
  await expect(imgs).toHaveCount(6);
  await expect.poll(() => imgs.evaluateAll((els) => els.filter((e) => (e as HTMLImageElement).naturalWidth > 0).length)).toBe(6);
}

test('Picture set 1: six photos, every answer right scores 5/5', async ({ page }) => {
  await openPictureSet(page, 'Timed');
  await expectPicturesLoaded(page);
  // Answer buttons say what each picture shows, for screen readers.
  await expect(page.getByTestId('q-p1a-r1-1').getByRole('radio', { name: /^C: picture of A woman drinking a glass of milk$/ })).toBeVisible();
  for (const q of PICTURES_A.questions) await pick(page, q.id, q.correctAnswer);
  await page.getByTestId('submit-section').click();
  await expect(page.getByTestId('score')).toContainText('5 / 5');
});

test('a wrong picture goes to the mistake notebook with both pictures shown', async ({ page }) => {
  await openPictureSet(page, 'Guided');
  await pick(page, 'p1a-r1-4', 'E');
  await page.getByTestId('q-p1a-r1-4').getByRole('button', { name: 'Check' }).click();
  await expect(page.getByTestId('q-p1a-r1-4').getByTestId('feedback')).toContainText('Answer: D');
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await page.goto('./#/mistakes');
  const card = page.getByTestId('mistake-p1a-r1-4');
  await expect(card).toContainText('Sentences and pictures');
  await expect(card.getByTestId('mistake-pictures').locator('img')).toHaveCount(2);
  await expect(card).toContainText('Your answer: E');
  await expect(card).toContainText('Answer: D');
});

test('photos work offline', async ({ page, context }) => {
  await waitForOfflineReady(page);
  await context.setOffline(true);
  await page.goto('./#/practice');
  await page.reload();
  await openPictureSet(page, 'Guided');
  await expectPicturesLoaded(page);
});

test('every photo is credited on Sources & Licences', async ({ page }) => {
  await page.goto('./#/licences');
  const credits = page.getByTestId('photo-credits').getByRole('listitem');
  await expect(credits).toHaveCount(6);
  await expect(page.getByTestId('photo-credits')).toContainText('Photo by engin akyurt on Unsplash');
  await expect(page.getByTestId('sources')).toContainText('SIL Open Font License 1.1');
});
