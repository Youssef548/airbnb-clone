import { test, expect, dismissModal } from "../../fixtures/auth.fixture";
import { TEST_USERS } from "../../fixtures/test-data";

test.describe("Login Flow", () => {
  test("should login via modal with valid credentials", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    // Open user menu and click login
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-login").click();

    // Verify login modal is open
    await expect(page.getByTestId("modal-title")).toHaveText("Login");

    // Fill in credentials
    const guest = TEST_USERS.guest;
    await page.getByTestId("input-email").fill(guest.email);
    await page.getByTestId("input-password").fill(guest.password);

    // Submit
    await page.getByTestId("btn-continue").click();

    // Wait for modal to close (login success)
    await expect(page.getByTestId("modal-title")).not.toBeVisible({
      timeout: 10_000,
    });

    // Reload to ensure Zustand picks up the user from localStorage cleanly
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Verify user is logged in by checking menu
    await page.getByTestId("user-menu-toggle").click();
    await expect(page.getByTestId("user-menu-dropdown")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByTestId("menu-item-logout")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("should show error for invalid credentials", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-login").click();

    await page.getByTestId("input-email").fill("wrong@email.com");
    await page.getByTestId("input-password").fill("WrongPass123!");

    await page.getByTestId("btn-continue").click();

    // Modal should remain open
    await expect(page.getByTestId("modal-title")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("should toggle to register modal", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-login").click();

    await expect(page.getByTestId("modal-title")).toHaveText("Login");

    // Click "Create an account" link
    await page.getByText("Create an account").click();

    await expect(page.getByTestId("modal-title")).toHaveText("Register");
  });
});
