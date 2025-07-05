import { test, expect } from '@playwright/test';

test.describe('Tutorial Overlay E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Clear local storage within the test to ensure the tutorial runs
    await page.evaluate(() => {
  console.log('Current URL in page.evaluate:', window.location.href);
  console.log('Current Origin in page.evaluate:', window.origin);
  localStorage.clear();
});
    await page.goto('/main/dashboard', { waitUntil: 'domcontentloaded' }); // Ensure DOM is loaded before interacting with localStorage
  });

  test('should display the tutorial on first visit', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Welcome to Prompt2Code/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Next/i })).toBeVisible();
  });

  test('should advance through tutorial steps', async ({ page }) => {
    // Step 1
    await expect(page.getByRole('heading', { name: /Welcome to Prompt2Code/i })).toBeVisible();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2
    await expect(page.getByRole('heading', { name: /How it Works/i })).toBeVisible();
    await page.getByRole('button', { name: /Next/i }).click();
    
    // Step 3
    await expect(page.getByRole('heading', { name: /Project Creation and Management/i })).toBeVisible();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4
    await expect(page.getByRole('heading', { name: /Prompting for Code/i })).toBeVisible();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 5
    await expect(page.getByRole('heading', { name: /Review and Download/i })).toBeVisible();
    await page.getByRole('button', { name: /Next/i }).click();

    // GitHub Familiarity Prompt
    await expect(page.getByText(/Are you familiar with GitHub?/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Yes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /No/i })).toBeVisible();
  });

  test('should navigate to GitHub info if "Yes" is chosen for GitHub familiarity', async ({ page }) => {
    // Advance to GitHub prompt
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    
    // Choose Yes
    await page.getByRole('button', { name: /Yes/i }).click();
    await expect(page.getByRole('heading', { name: /GitHub Information/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('should complete tutorial and open payment modal after "Add funds" is clicked (via "Yes" path)', async ({ page }) => {
    // Advance to GitHub prompt
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Choose Yes, then Continue
    await page.getByRole('button', { name: /Yes/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Tutorial Complete screen
    await expect(page.getByRole('heading', { name: /Tutorial Complete!/i })).toBeVisible();
    const addFundsButton = await page.getByRole('button', { name: /Add funds/i });
    await expect(addFundsButton).toBeVisible();

    // Spy on the openModal function of the payment modal store
    // Playwright cannot directly mock module functions in the browser context.
    // Instead, we assert on the side effect (the modal becoming visible).
    await addFundsButton.click();
    await expect(page.getByRole('heading', { name: /Add funds to your account/i })).toBeVisible();

    // Verify tutorial is marked complete in localStorage
    const tutorialCompleted = await page.evaluate(() => localStorage.getItem('prompt2code_tutorial_completed'));
    expect(tutorialCompleted).toBe('true');
  });

  test('should complete tutorial and open payment modal after "Add funds" is clicked (via "No" path)', async ({ page }) => {
    // Advance to GitHub prompt
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    
    // Choose No
    await page.getByRole('button', { name: /No/i }).click();

    // Tutorial Complete screen
    await expect(page.getByRole('heading', { name: /Tutorial Complete!/i })).toBeVisible();
    const addFundsButton = await page.getByRole('button', { name: /Add funds/i });
    await expect(addFundsButton).toBeVisible();
    
    await addFundsButton.click();
    await expect(page.getByRole('heading', { name: /Add funds to your account/i })).toBeVisible();

    // Verify tutorial is marked complete in localStorage
    const tutorialCompleted = await page.evaluate(() => localStorage.getItem('prompt2code_tutorial_completed'));
    expect(tutorialCompleted).toBe('true');
  });

  test('should not display tutorial after it has been completed', async ({ page }) => {
    // Complete the tutorial first
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /No/i }).click(); // Choose 'No' to quick complete
    await page.getByRole('button', { name: /Add funds/i }).click();

    // Wait for the payment modal to potentially show up, then navigate away and back
    await page.waitForSelector('h2:has-text("Add funds to your account")', { state: 'visible' });
    await page.goto('/main/dashboard'); // Navigate back to trigger condition
    
    // Check that the tutorial overlay is not visible
    await expect(page.getByRole('heading', { name: /Welcome to Prompt2Code/i })).not.toBeVisible();
  });
});
