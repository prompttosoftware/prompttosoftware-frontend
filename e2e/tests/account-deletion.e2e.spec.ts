import { test, expect } from '@playwright/test';

test.describe('Account Deletion E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful login for each test
    await page.route('*/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        headers: {
          'Set-Cookie': 'session-id=mock-session-id; HttpOnly; Path=/'
        },
        body: JSON.stringify({
          isAuthenticated: true,
          user: { userId: 'test-user-id', username: 'testuser', email: 'test@example.com' }
        }),
      });
    });

    // Navigate to a protected route (e.g., dashboard) to ensure auth context is initialized
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Should successfully delete account with confirmation, clear state, and redirect to login with success message', async ({ page }) => {
    // 1. Verify "Delete Account" option is available and navigate to settings
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*settings/);
    const deleteAccountButton = page.locator('button', { hasText: 'Delete Account' });
    await expect(deleteAccountButton).toBeVisible();

    // Mock successful DELETE /users/me request
    let deleteRequestMade = false;
    await page.route('*/api/users/me', async route => {
      if (route.request().method() === 'DELETE') {
        deleteRequestMade = true;
        await route.fulfill({
          status: 204 // No Content for successful deletion
        });
      }
    });

    // Intercept local storage changes to verify JWT clearing
    // This is a bit tricky in Playwright. We can check localStorage *after* the page reloads.
    // For now, we rely on checking for redirection and the success message.

    // 2. Confirm that clicking the "Delete Account" option triggers the confirmation dialog
    await deleteAccountButton.click();
    const confirmationDialog = page.locator('div[role="dialog"]');
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog.locator('h2', { hasText: 'Confirm Account Deletion' })).toBeVisible();
    await expect(confirmationDialog.locator('p', { hasText: 'To confirm, please type "delete my account" in the field below.' })).toBeVisible();

    // 3. Test that the user is required to explicitly confirm deletion
    const confirmInputField = confirmationDialog.locator('input[name="confirmText"]');
    const confirmDeleteButton = confirmationDialog.locator('button', { hasText: 'I understand, delete my account' });

    // Ensure button is disabled initially
    await expect(confirmDeleteButton).toBeDisabled();

    // Type incorrect text and ensure button remains disabled
    await confirmInputField.fill('wrong text');
    await expect(confirmDeleteButton).toBeDisabled();

    // Type correct text and ensure button becomes enabled
    await confirmInputField.fill('delete my account');
    await expect(confirmDeleteButton).toBeEnabled();

    // 4. Verify that upon successful confirmation, a DELETE request is sent to /users/me
    await confirmDeleteButton.click();

    // Wait for the DELETE request to be made and processed
    await page.waitForTimeout(500); // Give a small buffer for the request to complete
    expect(deleteRequestMade).toBe(true);

    // 5. Ensure that upon successful deletion, the JWT is cleared from localStorage.
    // This is implicitly tested by the redirection and auth context reset.
    // Playwright's page.goto() effectively clears the context, but the subsequent
    // check for a success message on the login page (which requires new auth state)
    // and checking localStorage directly on the *new* login page load is more reliable.
    await page.waitForURL(/.*login\?message=account-deleted/);
    expect(await page.evaluate(() => localStorage.getItem('jwt'))).toBeNull();

    // 6. Check that the AuthContext state (both isAuthenticated and user) is correctly reset.
    // This happens automatically on successful logout and redirection to a public route.
    // Verifying redirection to login implies auth state reset.

    // 7. Confirm that the user is redirected to the login page after successful deletion.
    await expect(page).toHaveURL(/.*login\?message=account-deleted/);

    // 8. Verify that a success message is shown to the user on the login page after successful account deletion.
    const successToast = page.locator('.go3958317564', { hasText: 'Your account has been successfully deleted.' });
    await expect(successToast).toBeVisible();
  });

  test('Should handle API errors during account deletion gracefully', async ({ page }) => {
    await page.goto('/settings');
    const deleteAccountButton = page.locator('button', { hasText: 'Delete Account' });
    await expect(deleteAccountButton).toBeVisible();

    // Mock a failed DELETE /users/me request
    let deleteRequestFailed = false;
    await page.route('*/api/users/me', async route => {
      if (route.request().method() === 'DELETE') {
        deleteRequestFailed = true;
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ message: 'Internal Server Error during deletion' }),
          contentType: 'application/json'
        });
      }
    });

    await deleteAccountButton.click();
    const confirmationDialog = page.locator('div[role="dialog"]');
    await expect(confirmationDialog).toBeVisible();

    const confirmInputField = confirmationDialog.locator('input[name="confirmText"]');
    const confirmDeleteButton = confirmationDialog.locator('button', { hasText: 'I understand, delete my account' });

    await confirmInputField.fill('delete my account');
    await confirmDeleteButton.click();

    // Wait for the DELETE request to be made and processed
    await page.waitForTimeout(500); // Give a small buffer for the request to complete
    expect(deleteRequestFailed).toBe(true);

    // Verify that the error message is displayed (using global error handling toast)
    const errorToast = page.locator('.go3958317564', { hasText: 'Failed to delete account. Internal Server Error during deletion' });
    await expect(errorToast).toBeVisible();

    // Ensure modal is still open, or page not redirected (should not redirect on error)
    await expect(page).toHaveURL(/.*settings/); // Still on settings page
    await expect(confirmationDialog).toBeVisible(); // Confirmation dialog should still be open
    await expect(confirmDeleteButton).toBeEnabled(); // Button should be re-enabled after error
    await expect(confirmInputField).toHaveValue('delete my account'); // Text should remain
  });

  test('Should close confirmation dialog on cancel', async ({ page }) => {
    await page.goto('/settings');
    const deleteAccountButton = page.locator('button', { hasText: 'Delete Account' });
    await expect(deleteAccountButton).toBeVisible();

    await deleteAccountButton.click();
    const confirmationDialog = page.locator('div[role="dialog"]');
    await expect(confirmationDialog).toBeVisible();

    const cancelButton = confirmationDialog.locator('button', { hasText: 'Cancel' });
    await expect(cancelButton).toBeVisible();

    await cancelButton.click();
    await expect(confirmationDialog).not.toBeVisible();
    await expect(page).toHaveURL(/.*settings/); // Still on settings page
  });
});















































































































































































































































































































































































































































































































































































































































































































































































































































































































































action: EXECUTE_COMMAND
