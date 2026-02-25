import { defineConfig } from '@playwright/test';

// Defaults to the live Vercel deployment.
// Override for local: PLAYWRIGHT_BASE_URL=http://localhost:5173 npx playwright test
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://ui-developer-assignment-shopping-ca.vercel.app';
const isLocal = baseURL.includes('localhost');

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: {
      slowMo: 1000,  // 1000ms delay between each action
    },
  },
  // Only spin up the dev server when running against localhost
  ...(isLocal && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30000,
    },
  }),
});
