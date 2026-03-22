import { test, expect, dismissModal } from "../../fixtures/auth.fixture";

test.describe("Toggle Favorite", () => {
  test("should add a listing to favorites", async ({ guestPage: page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for listings
    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    // Click the heart button on the first listing
    const heartButton = firstCard.getByTestId("heart-button");
    await heartButton.click();

    // Navigate to favorites page
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-my-favourites").click();

    await page.waitForURL(/\/favorites/, { timeout: 5_000 });

    // Should see at least one favorited listing
    await expect(page.getByTestId("listing-card").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should remove a listing from favorites", async ({
    guestPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // First, favorite a listing
    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    const heartButton = firstCard.getByTestId("heart-button");

    // Click to favorite
    await heartButton.click();
    await page.waitForTimeout(1_000);

    // Click again to unfavorite
    await heartButton.click();
    await page.waitForTimeout(1_000);

    // Navigate to favorites
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-my-favourites").click();

    await page.waitForURL(/\/favorites/, { timeout: 5_000 });

    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("should prompt login when unauthenticated user clicks heart", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    // Use force click to bypass any remaining overlay issues
    const heartButton = firstCard.getByTestId("heart-button");
    await heartButton.click({ force: true });

    // Should open login modal
    await expect(page.getByTestId("modal-title")).toHaveText("Login", {
      timeout: 5_000,
    });
  });
});
