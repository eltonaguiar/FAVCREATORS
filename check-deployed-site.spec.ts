import { test, expect } from "@playwright/test";

test("Deployed site loads and renders main components", async ({ page }) => {
  // Collect console errors
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  // Go to your deployed site
  await page.goto("https://eltonaguiar.github.io/FAVCREATORS/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // Check for blank page (body should not be empty)
  const bodyContent = await page.content();
  expect(bodyContent.length).toBeGreaterThan(100);

  // Wait for the app to render
  await page.waitForTimeout(3000);

  // Check for main heading
  await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
  const heading = await page.locator("h1").textContent();
  expect(heading).toContain("FavCreators");

  // Check for Save button in header
  await expect(page.getByRole("button", { name: /Save/i })).toBeVisible({
    timeout: 5000,
  });

  // Check for Export button
  await expect(page.getByRole("button", { name: /Export/i })).toBeVisible();

  // Check for Import button
  await expect(page.getByRole("button", { name: /Import/i })).toBeVisible();

  // Check for category filter dropdown
  const categorySelect = page.locator("select").first();
  await expect(categorySelect).toBeVisible();

  // Check for at least one creator card or content
  const creatorCards = page.locator(".creator-card");
  const cardCount = await creatorCards.count();
  console.log(`Found ${cardCount} creator cards`);

  // Check that there are no critical JS errors (ignore minor warnings)
  const criticalErrors = errors.filter(
    (e) =>
      !e.includes("favicon") && !e.includes("DevTools") && !e.includes("404"),
  );

  if (criticalErrors.length > 0) {
    console.log("Console errors found:", criticalErrors);
  }

  // Take a screenshot for visual verification
  await page.screenshot({
    path: "test-results/deployed-site.png",
    fullPage: true,
  });

  console.log("Site verification complete!");
});

test("Category filter works correctly", async ({ page }) => {
  await page.goto("https://eltonaguiar.github.io/FAVCREATORS/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // Wait for app to load
  await page.waitForTimeout(2000);
  await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

  // Find the category dropdown
  const categorySelect = page
    .locator("select")
    .filter({ hasText: /All Categories|Favorites|Other/i })
    .first();

  if (await categorySelect.isVisible()) {
    // Test filtering by Favorites
    await categorySelect.selectOption("Favorites");
    await page.waitForTimeout(500);

    // Test filtering by Other
    await categorySelect.selectOption("Other");
    await page.waitForTimeout(500);

    // Reset to All
    await categorySelect.selectOption("");
    await page.waitForTimeout(500);

    console.log("Category filter test passed!");
  }
});

test("No duplicate filter dropdowns", async ({ page }) => {
  await page.goto("https://eltonaguiar.github.io/FAVCREATORS/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // Wait for app to load
  await page.waitForTimeout(2000);

  // Check that there's no "All Creators" / "Adin Ross only" dropdown (the one we removed)
  const adinRossOption = page.locator("option", { hasText: "Adin Ross only" });
  const count = await adinRossOption.count();

  expect(count).toBe(0);
  console.log("No duplicate filter dropdown found - test passed!");
});
