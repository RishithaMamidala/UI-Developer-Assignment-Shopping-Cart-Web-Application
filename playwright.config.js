import { defineConfig } from '@playwright/test';

// In CI the preview server runs on port 4173; locally the dev server uses 5173.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: {
      slowMo: 1000,  // 1000ms delay between each action
    },
  },
  webServer: {
    // Only start the dev server automatically when running locally.
    // In CI, the server is started manually before `npx playwright test`.
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
