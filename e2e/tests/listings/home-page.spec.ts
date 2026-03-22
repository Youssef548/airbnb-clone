import { test, expect, dismissModal } from "../../fixtures/auth.fixture";

test.describe("Home Page — Listings", () => {
  test("should display listing cards on the home page", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    // Wait for listings to load
    const listingCards = page.getByTestId("listing-card");
    await expect(listingCards.first()).toBeVisible({ timeout: 15_000 });

    // Should have at least the seeded listings
    const count = await listingCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should show listing price and location info", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    // Card should contain a price
    await expect(firstCard.locator("text=$")).toBeVisible();
  });

  test("should navigate to listing detail on card click", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    await firstCard.click();

    // URL should change to /listing/:id
    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/listing\/.+/);
  });
});
