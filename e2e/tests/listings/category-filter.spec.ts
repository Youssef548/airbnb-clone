import { test, expect, dismissModal } from "../../fixtures/auth.fixture";

test.describe("Category Filter", () => {
  test("should filter listings by category via URL params", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/?category=Beach&page=1");
    await dismissModal(page);

    await page.waitForLoadState("networkidle");

    // Either we see Beach listings or an empty state
    const listingCards = page.getByTestId("listing-card");
    const emptyState = page.locator("text=No exact matches");

    // One of these should be visible
    await expect(
      listingCards.first().or(emptyState)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should update URL when clicking a category", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);
    await page.waitForLoadState("networkidle");

    // Click the "Homes" category (first in the list)
    const homesCategory = page.locator("div").filter({ hasText: /^Homes$/ }).first();
    await homesCategory.click();

    // URL should contain category=Homes
    await expect(page).toHaveURL(/category=Homes/);
  });

  test("should clear category filter when clicking same category again", async ({
    loggedOutPage: page,
  }) => {
    // Start with a category filter
    await page.goto("/?category=Homes&page=1");
    await dismissModal(page);
    await page.waitForLoadState("networkidle");

    // Click the same category to toggle it off
    const homesCategory = page.locator("div").filter({ hasText: /^Homes$/ }).first();
    await homesCategory.click();

    // URL should not contain category
    await expect(page).not.toHaveURL(/category=/);
  });
});
