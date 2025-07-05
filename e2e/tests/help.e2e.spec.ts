import { test, expect } from '@playwright/test';

test.describe('Help Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/main/help');
  });

  test('should load the help page and display default content', async ({ page }) => {
    // Debugging: Added timeout for visibility check
    await expect(page.getByRole('heading', { name: /About This Application/i })).toBeVisible({ timeout: 10000 });
    // Also log the page content if the above fails
    try {
      await expect(page.getByRole('heading', { name: /About This Application/i })).toBeVisible();
    } catch (error) {
      console.error('Help page heading not visible. Page content:', await page.content());
      await page.screenshot({ path: 'help-page-error.png' });
      throw error; // Re-throw to fail the test
    }
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should navigate to GitHub section when GitHub button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /GitHub/i }).click();
    await expect(page.getByRole('heading', { name: /Understanding GitHub & Its Use in Our Application/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /About This Application/i })).not.toBeVisible();
  });

  test('should navigate to Jira section when Jira button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Jira/i }).click();
    await expect(page.getByRole('heading', { name: /Understanding Jira & Its Use in Our Application/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /About This Application/i })).not.toBeVisible();
  });

  test('should navigate to Addons section when Addons button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Addons/i }).click();
    await expect(page.getByRole('heading', { name: /Project Addons and Cost/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /About This Application/i })).not.toBeVisible();
  });

  test('should navigate to Billing section when Billing button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Billing/i }).click();
    await expect(page.getByRole('heading', { name: /Understanding Project Billing/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /About This Application/i })).not.toBeVisible();
  });
});
