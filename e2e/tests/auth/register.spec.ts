import { test, expect, dismissModal } from "../../fixtures/auth.fixture";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Register Flow", () => {
  test("should open register modal from menu and create account", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    // Open user menu
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-sign-up").click();

    // Verify register modal is open
    await expect(page.getByTestId("modal-title")).toHaveText("Register");

    // Fill in registration form with a unique email to avoid duplicate errors
    const uniqueEmail = `e2enew_${Date.now()}@test.com`;
    const newUser = TEST_USERS.newUser;
    await page.getByTestId("input-email").fill(uniqueEmail);
    await page.getByTestId("input-username").fill(newUser.username);
    await page.getByTestId("input-password").fill(newUser.password);

    // Submit
    await page.getByTestId("btn-continue").click();

    // Wait for success — modal should close and user menu should show logged-in state
    await expect(page.getByTestId("modal-title")).not.toBeVisible({
      timeout: 10_000,
    });

    // Reload to ensure Zustand picks up the user from localStorage cleanly
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Verify user is logged in by checking the menu
    await page.getByTestId("user-menu-toggle").click();
    await expect(page.getByTestId("user-menu-dropdown")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("menu-item-logout")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("should show error for duplicate email", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-sign-up").click();

    // Try registering with an existing email
    const existingUser = TEST_USERS.guest;
    await page.getByTestId("input-email").fill(existingUser.email);
    await page.getByTestId("input-username").fill("anotheruser");
    await page.getByTestId("input-password").fill(existingUser.password);

    await page.getByTestId("btn-continue").click();

    // Modal should remain open since registration failed
    await expect(page.getByTestId("modal-title")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("should toggle to login modal", async ({ loggedOutPage: page }) => {
    await page.goto("/");
    await dismissModal(page);

    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-sign-up").click();

    await expect(page.getByTestId("modal-title")).toHaveText("Register");

    // Click "Log in" link
    await page.getByText("Log in").click();

    await expect(page.getByTestId("modal-title")).toHaveText("Login");
  });
});
