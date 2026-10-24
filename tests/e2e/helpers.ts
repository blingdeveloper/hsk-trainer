import { expect, type Page } from '@playwright/test';

/** Draws strokes given in 0–1 coordinates on the handwriting canvas. */
export async function drawStrokes(page: Page, strokes: [number, number][][]) {
  const canvas = page.getByTestId('handwriting-canvas');
  const box = (await canvas.boundingBox())!;
  for (const stroke of strokes) {
    const [x0, y0] = stroke[0];
    await page.mouse.move(box.x + x0 * box.width, box.y + y0 * box.height);
    await page.mouse.down();
    for (const [x, y] of stroke.slice(1)) {
      await page.mouse.move(box.x + x * box.width, box.y + y * box.height, { steps: 8 });
    }
    await page.mouse.up();
  }
}

// 十: a horizontal stroke, then a vertical one.
export const SHI: [number, number][][] = [
  [[0.15, 0.45], [0.85, 0.45]],
  [[0.5, 0.12], [0.5, 0.9]],
];

/** Waits until the service worker controls the page, so everything is cached. */
export async function waitForOfflineReady(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('offline-status')).toContainText('Ready offline', { timeout: 30_000 });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
}
