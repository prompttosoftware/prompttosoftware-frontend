import { test, expect } from '@playwright/test';

test.describe('Add Funds E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that contains the "Add Payment" button, e.g., the main dashboard.
    await page.goto('/main/dashboard'); // Adjust this URL based on where the button is
    // Wait for the network to be idle, indicating the page has likely loaded all its resources.
    await page.waitForLoadState('networkidle');
    // Debug: Take a screenshot to see the page state
    await page.screenshot({ path: 'playwright-debug-screenshot.png' });
    console.log('Attempting to find add-payment-button...');
    // Pause to debug - allows manual inspection of the page in Playwright browser
    await page.pause();
    // Ensure the page is loaded and the button is visible
    await expect(page.locator('data-test-id=add-payment-button')).toBeVisible({ timeout: 10000 }); // Increased timeout for debugging
  });

  test('should successfully add funds', async ({ page }) => {
    // Click the "Add Payment" button
    await page.locator('data-test-id=add-payment-button').click();

    // Verify the payment modal opens
    await expect(page.locator('h2:has-text("Add Funds")')).toBeVisible();
    await expect(page.locator('data-testid=payment-modal')).toBeVisible();


    // Enter an amount
    // Assuming there's an input field for amount, replace with actual selector if different
    await page.fill('input[name="amount"]', '50.00');

    // Simulate Stripe Elements interaction
    // This is a simplified approach. In a real E2E test, you might use:
    // 1. Playwright's frame handling for iframes.
    // 2. Mocking Stripe API calls in the backend during E2E setup for predictable results.
    // 3. Using test Stripe card numbers (e.g., 4242...) if not mocking.

    // For this example, we'll assume the inputs are directly accessible or mocked.
    // If Stripe elements are in iframes, you would need to locate the iframe and then elements within it.
    // Example for iframe:
    // const cardFrame = page.frame({ url: /stripe\.com/ }); // or other suitable selector
    // await cardFrame.fill('[name="cardnumber"]', '4242424242424242');
    // await cardFrame.fill('[name="exp-date"]', '12/29');
    // await cardFrame.fill('[name="cvc']', '123');

    // For now, mocking the successful payment submission as we don't have direct Stripe iframe access in this context.
    // A more robust solution would involve mocking the Stripe API responses in the test environment.

    // Click the "Add Funds" button within the modal to submit payment
    await page.locator('button:has-text("Add Funds")').click();

    // Verify success message
    await expect(page.locator('data-testid=success-toast')).toBeVisible();
    await expect(page.locator('data-testid=success-toast')).toContainText('Funds added successfully!');

    // Verify modal closes
    await expect(page.locator('data-testid=payment-modal')).not.toBeVisible();

    // Verify balance update (assuming there's a balance display element)
    // This might require a page reload or waiting for a WebSocket update.
    // For simplicity, we'll check for a text update.
    await expect(page.locator('data-testid=balance-display')).toContainText('$50.00'); // Adjust expected balance

    // Optional: Wait for any async updates to settle
    await page.waitForTimeout(1000);
  });
});
