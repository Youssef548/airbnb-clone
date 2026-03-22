import { test, expect } from "../../fixtures/auth.fixture";

test.describe("View Properties (Host)", () => {
  test("should show host's listings on the properties page", async ({
    hostPage: page,
  }) => {
    await page.goto("/properties");

    // Wait for listings to load
    const listingCards = page.getByTestId("listing-card");
    await expect(listingCards.first()).toBeVisible({ timeout: 15_000 });

    // Host should see their seeded listings
    const count = await listingCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should navigate to properties via menu", async ({
    hostPage: page,
  }) => {
    await page.goto("/");

    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-my-properties").click();

    await page.waitForURL(/\/properties/, { timeout: 5_000 });

    // Should show listing cards
    await expect(page.getByTestId("listing-card").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
