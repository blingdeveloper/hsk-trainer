import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE is set to "/<repo-name>/" when deploying to GitHub Pages.
const base = process.env.BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        // Everything needed offline is precached on first visit (~6 MB).
        globPatterns: ['**/*.{js,css,html,svg,json,txt,woff2}'],
        // Fonts: only the Latin and Latin Extended subsets are used (pinyin tone marks need Latin Extended).
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'HSK Sentence & Exam Trainer',
        short_name: 'HSK Trainer',
        description: 'Offline HSK 3.0 practice, handwriting lookup and dictionary.',
        theme_color: '#fdf7f5',
        background_color: '#fdf7f5',
        display: 'standalone',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts?(x)'],
    setupFiles: ['tests/unit/setup.ts'],
  },
});
