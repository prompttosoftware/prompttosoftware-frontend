import { chromium, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../../.env.development.local` });

const AUTH_FILE = 'playwright/.auth/user.json';

async function globalSetupFunction() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const response = await page.request.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/e2e-login`, {
    data: {
      username: process.env.E2E_TEST_USERNAME,
      password: process.env.E2E_TEST_PASSWORD,
    },
  });

  const body = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(body).toHaveProperty('sessionToken');

  await page.context().storageState({ path: AUTH_FILE });
  console.log('Authentication successful and state saved.');

  await browser.close();
}

export default globalSetupFunction;
