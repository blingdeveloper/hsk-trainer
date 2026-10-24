import { defineConfig, devices } from '@playwright/test';

// Set BASE=/repo-name/ to test the GitHub Pages build under its sub-path.
const base = process.env.BASE ?? '/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: `http://localhost:4173${base}`, serviceWorkers: 'allow' },
  webServer: {
    command: 'npm run build && npm run preview',
    url: `http://localhost:4173${base}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
  ],
});
