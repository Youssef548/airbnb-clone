import { test, expect } from "../../fixtures/auth.fixture";

test.describe("Logout Flow", () => {
  test("should logout and clear session", async ({ guestPage: page }) => {
    // guestPage fixture already navigated and logged in
    // Navigate fresh to get clean state
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify user is logged in
    await page.getByTestId("user-menu-toggle").click();
    await expect(page.getByTestId("menu-item-logout")).toBeVisible();

    // Click logout
    await page.getByTestId("menu-item-logout").click();

    // Wait for logout to process — the dropdown stays open but items change
    await page.waitForTimeout(1_000);

    // After logout, the menu should show logged-out items (Login, Sign up)
    // The dropdown may stay open or we may need to re-open it
    const dropdown = page.getByTestId("user-menu-dropdown");
    const isDropdownOpen = await dropdown.isVisible().catch(() => false);

    if (!isDropdownOpen) {
      await page.getByTestId("user-menu-toggle").click();
      await expect(dropdown).toBeVisible({ timeout: 5_000 });
    }

    await expect(page.getByTestId("menu-item-login")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("menu-item-sign-up")).toBeVisible();
  });

  test("should not access protected routes after logout", async ({
    guestPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Logout
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-logout").click();
    await page.waitForTimeout(500);

    // Try navigating to protected route
    await page.goto("/trips");

    // Should be redirected to home
    await page.waitForURL("/", { timeout: 5_000 });
    expect(page.url()).toMatch(/\/$/);
  });
});
