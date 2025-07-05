import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from default ".env" file.
// This will load the environment variables from the .env file.
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/tests', // Point to the e2e tests directory
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json', // Path to the saved authentication state
      },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace always. */
    trace: 'on',
    // Add a default ignore strategy for requests often failing in CI
    ignoreHTTPSErrors: true, // Sometimes useful for local dev with self-signed certs
    // headless: process.env.CI || true, // Ensures headless mode on CI
  },

  globalSetup: require.resolve('./e2e/tests/auth.setup.ts'),

  // Global setup to start the dev server
  webServer: {
    command: 'npm run dev', // Or 'npm run start' if you want to test against production build
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  // To ensure E2E tests are disabled by default, comment out `testMatch`
  // testMatch: /a^/, // This regex will never match any file
});
