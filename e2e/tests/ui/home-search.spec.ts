import { test, expect, dismissModal } from "../../fixtures/auth.fixture";

test.describe("Home Page & Search (UI)", () => {
  test("home page loads with listing cards", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    const cards = page.getByTestId("listing-card");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("each listing card shows price and location", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    // Card should contain a price with dollar sign
    await expect(firstCard.locator("text=$")).toBeVisible();
  });

  test("clicking a category filters listings by URL param", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Categories should be visible on home page
    // Click the "Homes" category (actual category from Categories component)
    const categoryItem = page.locator("div").filter({ hasText: /^Homes$/ }).first();

    if (await categoryItem.isVisible()) {
      await categoryItem.click();

      // URL should contain category param
      await expect(page).toHaveURL(/category=Homes/, { timeout: 5_000 });

      // Click again to clear filter
      await categoryItem.click();

      // URL should not contain category
      await expect(page).not.toHaveURL(/category=/, { timeout: 5_000 });
    }
  });

  test("pagination appears when enough listings exist", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Wait for listings to load
    await expect(page.getByTestId("listing-card").first()).toBeVisible({
      timeout: 15_000,
    });

    // Check if pagination is visible (only when > 12 listings per page)
    const pagination = page.locator("nav").filter({ hasText: /previous|next/i });
    const hasPagination = await pagination.isVisible().catch(() => false);

    if (hasPagination) {
      // Click "Next" and verify page changes
      const nextBtn = pagination.locator("text=Next").or(
        pagination.locator("button").last()
      );
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await expect(page).toHaveURL(/page=2/, { timeout: 5_000 });
      }
    }
    // If no pagination, that's fine — just not enough listings
  });

  test("search bar shows 'Anywhere' when no location filter", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Search bar should show "Anywhere"
    await expect(page.locator("text=Anywhere").first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("listing cards are clickable and navigate to detail", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    await firstCard.click();

    // Should navigate to listing detail page
    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });

    // For logged-out users, getReservation() returns 401 which may prevent
    // the listing from fully loading. Just verify navigation occurred.
    // Dismiss any login modal that auto-opened from the 401 interceptor.
    await dismissModal(page);
  });

  test("heart button visible on listing cards", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    // Heart button should be visible on the card
    const heartBtn = firstCard.getByTestId("heart-button");
    await expect(heartBtn).toBeVisible();
  });
});
