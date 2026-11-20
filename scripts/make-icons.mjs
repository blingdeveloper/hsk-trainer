// Draws the PNG app icons from the same design as public/icon.svg, using Playwright's Chromium.
// Run: node scripts/make-icons.mjs  (writes into public/)
import { chromium } from '@playwright/test';

const BG = '#f6d9d9';
const INK = '#2b2326';
// rounded: browser/Android "any" icon. full: iPhone and maskable icons, which the device crops itself.
const svg = (size, { rounded, glyph }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="${BG}"/>
  <text x="32" y="${32 + glyph * 0.36}" font-size="${glyph}" text-anchor="middle" fill="${INK}"
    font-family="'Songti SC', 'Noto Serif CJK SC', 'Source Han Serif SC', serif">汉</text>
</svg>`;

const icons = [
  { file: 'icon-192.png', size: 192, rounded: true, glyph: 36 },
  { file: 'icon-512.png', size: 512, rounded: true, glyph: 36 },
  { file: 'icon-maskable-512.png', size: 512, rounded: false, glyph: 28 },
  { file: 'apple-touch-icon.png', size: 180, rounded: false, glyph: 34 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const icon of icons) {
  await page.setViewportSize({ width: icon.size, height: icon.size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(icon.size, icon)}</body></html>`);
  await page.screenshot({ path: `public/${icon.file}`, omitBackground: true, clip: { x: 0, y: 0, width: icon.size, height: icon.size } });
  console.log(`public/${icon.file}`);
}
await browser.close();
