import { test, expect, dismissModal } from "../../fixtures/auth.fixture";

test.describe("Navigation & Access Control (UI)", () => {
  test.describe("Logged-out user", () => {
    test("home page loads and shows listings", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await dismissModal(page);

      // Listings should be visible
      const cards = page.getByTestId("listing-card");
      await expect(cards.first()).toBeVisible({ timeout: 15_000 });

      // Should have multiple listings
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test("clicking listing card navigates to detail page", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await dismissModal(page);

      const firstCard = page.getByTestId("listing-card").first();
      await expect(firstCard).toBeVisible({ timeout: 15_000 });
      await firstCard.click();

      await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });
    });

    test("/trips redirects to home (protected route)", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/trips");
      await page.waitForLoadState("networkidle");

      // Should redirect to home
      await expect(page).toHaveURL("/", { timeout: 10_000 });
    });

    test("/favorites redirects to home (protected route)", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/favorites");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL("/", { timeout: 10_000 });
    });

    test("/properties redirects to home (protected route)", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/properties");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL("/", { timeout: 10_000 });
    });

    test("/reservations redirects to home (protected route)", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/reservations");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL("/", { timeout: 10_000 });
    });

    test("user menu shows Login and Sign up options", async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await dismissModal(page);

      await page.getByTestId("user-menu-toggle").click();

      await expect(page.getByTestId("menu-item-login")).toBeVisible();
      await expect(page.getByTestId("menu-item-sign-up")).toBeVisible();
    });

    test('clicking "Login" menu item opens login modal', async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await dismissModal(page);

      await page.getByTestId("user-menu-toggle").click();
      await page.getByTestId("menu-item-login").click();

      await expect(page.getByTestId("modal-title")).toHaveText("Login", {
        timeout: 5_000,
      });
    });

    test('clicking "Sign up" menu item opens register modal', async ({
      loggedOutPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await dismissModal(page);

      await page.getByTestId("user-menu-toggle").click();
      await page.getByTestId("menu-item-sign-up").click();

      await expect(page.getByTestId("modal-title")).toHaveText("Register", {
        timeout: 5_000,
      });
    });

    test("invalid URL shows 404 page", async ({ loggedOutPage: page }) => {
      await page.goto("/some-nonexistent-page-xyz");
      await page.waitForLoadState("networkidle");

      await expect(page.locator("text=404")).toBeVisible({ timeout: 5_000 });
    });
  });

  test.describe("Logged-in guest", () => {
    test("user menu shows trips, favourites but NOT properties/reservations", async ({
      guestPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByTestId("user-menu-toggle").click();

      // Guest should see these
      await expect(page.getByTestId("menu-item-my-trips")).toBeVisible();
      await expect(
        page.getByTestId("menu-item-my-favourites")
      ).toBeVisible();
      await expect(page.getByTestId("menu-item-logout")).toBeVisible();

      // Guest should NOT see host-only items
      await expect(
        page.getByTestId("menu-item-my-properties")
      ).not.toBeVisible();
      await expect(
        page.getByTestId("menu-item-my-reservations")
      ).not.toBeVisible();
    });

    test("guest can navigate to /trips via menu", async ({
      guestPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByTestId("user-menu-toggle").click();
      await page.getByTestId("menu-item-my-trips").click();

      await page.waitForURL(/\/trips/, { timeout: 5_000 });
    });

    test("guest can access /favorites directly", async ({
      guestPage: page,
    }) => {
      await page.goto("/favorites");
      await page.waitForLoadState("networkidle");

      // Should NOT redirect — page loads (even if empty)
      expect(page.url()).toMatch(/\/favorites/);
    });
  });

  test.describe("Logged-in host", () => {
    test("host menu shows all items including properties, reservations, airbnb my home", async ({
      hostPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByTestId("user-menu-toggle").click();

      await expect(page.getByTestId("menu-item-my-trips")).toBeVisible();
      await expect(
        page.getByTestId("menu-item-my-favourites")
      ).toBeVisible();
      await expect(
        page.getByTestId("menu-item-my-reservations")
      ).toBeVisible();
      await expect(
        page.getByTestId("menu-item-my-properties")
      ).toBeVisible();
      await expect(
        page.getByTestId("menu-item-airbnb-my-home")
      ).toBeVisible();
      await expect(page.getByTestId("menu-item-logout")).toBeVisible();
    });

    test("clicking 'Airbnb my home' opens rent modal", async ({
      hostPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await page.getByTestId("user-menu-toggle").click();
      await page.getByTestId("menu-item-airbnb-my-home").click();

      await expect(page.getByTestId("modal-title")).toHaveText(
        "Airbnb your home!",
        { timeout: 5_000 }
      );
    });
  });

  test.describe("Logout flow", () => {
    test("guest logs out via menu and is redirected", async ({
      guestPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Open menu and click Logout
      await page.getByTestId("user-menu-toggle").click();
      await page.getByTestId("menu-item-logout").click();

      // Reload to get a clean state (logout clears Zustand + localStorage)
      await page.waitForTimeout(500);
      await page.reload({ waitUntil: "networkidle" });

      // Dismiss any login modal that may auto-open from 401 interceptor
      await dismissModal(page);

      // After logout, menu should show Login/Sign up again
      await page.getByTestId("user-menu-toggle").click();
      await expect(page.getByTestId("menu-item-login")).toBeVisible({
        timeout: 5_000,
      });
    });

    test("after logout, /trips redirects to home", async ({
      guestPage: page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Logout
      await page.getByTestId("user-menu-toggle").click();
      await page.getByTestId("menu-item-logout").click();
      await page.waitForTimeout(1000);

      // Try accessing protected route
      await page.goto("/trips");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL("/", { timeout: 10_000 });
    });
  });
});
