import { test, expect } from "../../fixtures/auth.fixture";

const PROTECTED_ROUTES = ["/trips", "/favorites", "/properties", "/reservations"];

test.describe("Protected Routes", () => {
  for (const route of PROTECTED_ROUTES) {
    test(`should redirect unauthenticated user from ${route} to home`, async ({
      loggedOutPage: page,
    }) => {
      await page.goto(route);

      // Should redirect to home page
      await page.waitForURL("/", { timeout: 10_000 });
      expect(page.url()).toMatch(/\/$/);
    });
  }

  test("should allow authenticated user to access /trips", async ({
    guestPage: page,
  }) => {
    // guestPage fixture already logged in and navigated
    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    // Should stay on trips page (not redirected)
    await expect(page).toHaveURL(/\/trips/);
  });

  test("should allow authenticated user to access /favorites", async ({
    guestPage: page,
  }) => {
    await page.goto("/favorites");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/favorites/);
  });
});
