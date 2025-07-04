import { test, expect } from '@playwright/test';

test.describe('New Project GitHub Repository Management UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/new-project');
  });

  test('should display "Add New Repository" and "Add Existing Repository" buttons', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: 'Add New Repository' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Existing Repository' })).toBeVisible();
  });

  test('should dynamically add new repository input fields', async ({ page }) => {
    // Verify initial state: Empty State Note is visible
    await expect(page.getByTestId('empty-repo-note')).toBeVisible();

    // Add New Repository
    await page.getByRole('button', { name: 'Add New Repository' }).click();
    // Check specific input fields or labels within the repo-block-0 for "New" type
    await expect(page.locator('div[data-testid="repo-block-0"]')).toBeVisible();
    await expect(page.locator('div[data-testid="repo-block-0"]')).toContainText('New');
    await expect(
      page.locator('div[data-testid="repo-block-0"] [data-testid="repo-name-input-0"]'),
    ).toBeVisible();
    await expect(
      page.locator('div[data-testid="repo-block-0"] [data-testid="repo-org-input-0"]'),
    ).toBeVisible();
    await expect(page.locator('div[data-testid="repo-block-0"]')).toContainText(
      'Private Repository',
    );
    await expect(page.getByTestId('empty-repo-note')).not.toBeVisible();

    // Add another New Repository
    await page.getByRole('button', { name: 'Add New Repository' }).click();
    await expect(page.locator('div[data-testid="repo-block-1"]')).toBeVisible();
    await expect(page.locator('div[data-testid="repo-block-1"]')).toContainText('New');

    // Add Existing Repository
    await page.getByRole('button', { name: 'Add Existing Repository' }).click();
    // Check specific input fields or labels within the repo-block-2 for "Existing" type
    await expect(page.locator('div[data-testid="repo-block-2"]')).toBeVisible();
    await expect(page.locator('div[data-testid="repo-block-2"]')).toContainText('Existing');
    await expect(
      page.locator('div[data-testid="repo-block-2"] [data-testid="repo-url-input-2"]'),
    ).toBeVisible();
  });

  test('should delete repository blocks', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Repository' }).click();
    await page.getByRole('button', { name: 'Add Existing Repository' }).click();
    await page.getByRole('button', { name: 'Add New Repository' }).click();

    // Ensure initial state has 3 blocks
    await expect(page.locator('div[data-testid^="repo-block-"]')).toHaveCount(3);

    // Delete the second block (Originally index 1)
    await page.locator('div[data-testid="repo-block-1"] button', { hasText: 'Delete' }).click();
    // After deleting one, there should be 2 blocks remaining, and they will re-index
    await expect(page.locator('div[data-testid^="repo-block-"]')).toHaveCount(2);

    // Delete the remaining blocks one by one and verify count
    await page.locator('div[data-testid="repo-block-0"] button', { hasText: 'Delete' }).click();
    await expect(page.locator('div[data-testid^="repo-block-"]')).toHaveCount(1); // One block remaining

    await page.locator('div[data-testid="repo-block-0"] button', { hasText: 'Delete' }).click();
    await expect(page.locator('div[data-testid^="repo-block-"]')).toHaveCount(0); // Zero blocks remaining

    // Verify empty state note reappears
    await expect(page.getByTestId('empty-repo-note')).toBeVisible();
  });

  test('should enforce client-side validation for new repository name', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Repository' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByText('Repository name cannot be empty')).toBeVisible();
  });

  test('should enforce client-side validation for existing repository URL', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Existing Repository' }).click();
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByText('GitHub repository URL cannot be empty')).toBeVisible();

    await page.locator('input[placeholder="GitHub Repository URL"]').fill('invalid-url');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByText('Please enter a valid GitHub repository URL')).toBeVisible();

    // Test valid URL
    await page
      .locator('input[placeholder="GitHub Repository URL"]')
      .fill('https://github.com/test/repo');
    await page.getByRole('button', { name: 'Start' }).click();
    // Expect validation message to disappear and form to proceed (or show other errors if any)
    await expect(page.getByText('Please enter a valid GitHub repository URL')).not.toBeVisible();
  });

  test('should capture form data correctly upon submission for new and existing repos', async ({
    page,
  }) => {
    await page.route('**/api/v1/new-project', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      expect(postData.githubRepositories).toBeInstanceOf(Array);
      expect(postData.githubRepositories.length).toBe(2);

      // New Repository
      expect(postData.githubRepositories[0].type).toBe('NEW');
      expect(postData.githubRepositories[0].name).toBe('my-new-repo');
      expect(postData.githubRepositories[0].organization).toBe('my-org');
      expect(postData.githubRepositories[0].isPrivate).toBe(false); // Default as per requirements

      // Existing Repository
      expect(postData.githubRepositories[1].type).toBe('EXISTING');
      expect(postData.githubRepositories[1].url).toBe('https://github.com/existing/repo');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ projectId: 'test-project-id' }),
      });
    });

    await page.getByRole('button', { name: 'Add New Repository' }).click();
    await page.locator('input[placeholder="Repository Name"]').fill('my-new-repo');
    await page.locator('input[placeholder="Organization Name"]').fill('my-org');

    await page.getByRole('button', { name: 'Add Existing Repository' }).click();
    await page
      .locator('input[placeholder="GitHub Repository URL"]')
      .fill('https://github.com/existing/repo');

    await page.getByRole('button', { name: 'Start' }).click();
  });

  test('should default isPrivate to false for new repositories', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Repository' }).click();
    const privateCheckbox = page.locator('div[data-testid="repo-block-0"] input[type="checkbox"]');
    await expect(privateCheckbox).not.toBeChecked(); // Should be unchecked by default
  });
});
