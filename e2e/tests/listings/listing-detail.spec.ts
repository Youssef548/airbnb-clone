import { test, expect } from "../../fixtures/auth.fixture";

test.describe("Listing Detail Page", () => {
  test("should display listing details when navigating from home", async ({
    guestPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for listings to load and click the first one
    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });

    // Listing detail should show the title text
    await expect(page.locator("h1, .text-2xl, .text-xl").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should show reservation calendar on listing detail", async ({
    guestPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });

    // The reservation component should be visible with a "Reserve" button
    await expect(page.getByTestId("btn-reserve")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should show listing info (rooms, guests, bathrooms)", async ({
    guestPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });

    // Should display guest/room/bathroom info
    await expect(page.getByText(/guest/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/room/i).first()).toBeVisible();
  });
});
