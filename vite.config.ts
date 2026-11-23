import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

// The security headers live in vercel.json (what the live site sends). The local preview, which the
// browser tests run against, sends the same ones, so a too-strict policy fails the tests, not the site.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const securityHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)')!.headers.map((h) => [h.key, h.value]),
);

// BASE is set to "/<repo-name>/" when deploying to GitHub Pages.
const base = process.env.BASE ?? '/';

export default defineConfig({
  base,
  preview: { headers: securityHeaders },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt': a new version waits until the person chooses to reload (never mid-exam).
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      workbox: {
        // Everything needed offline is precached on first visit (~7 MB), including photos in public/media/.
        globPatterns: ['**/*.{js,css,html,svg,json,txt,woff2,jpg}'],
        // Fonts: only the Latin and Latin Extended subsets are used (pinyin tone marks need Latin Extended).
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'HSK Trainer',
        short_name: 'HSK Trainer',
        description: 'Free HSK 1 and HSK 2 practice in the HSK 3.0 format: mock exams, writing practice and an offline dictionary.',
        id: './',
        start_url: './',
        scope: './',
        theme_color: '#fdf7f5',
        background_color: '#fdf7f5',
        display: 'standalone',
        // PNGs (made by scripts/make-icons.mjs) are what Android and install prompts use; the SVG is for desktop browsers.
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts?(x)'],
    setupFiles: ['tests/unit/setup.ts'],
  },
});
