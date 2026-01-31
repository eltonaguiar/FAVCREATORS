import { test, expect } from '@playwright/test';

test('Deployed site loads and renders main components', async ({ page }) => {
  // Go to your deployed site
  await page.goto('https://eltonaguiar.github.io/FAVCREATORS/', { waitUntil: 'networkidle' });

  // Check for blank page (body should not be empty)
  const bodyContent = await page.content();
  expect(bodyContent.length).toBeGreaterThan(100);

  // Check for main root element
  await expect(page.locator('#root')).toBeVisible();

  // Check for any console errors
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Wait a bit for any errors to show up
  await page.waitForTimeout(2000);

  // Fail the test if there are any errors
  expect(errors).toEqual([]);
});
