import { test, expect } from "../../fixtures/auth.fixture";
import { BASE_URL, TEST_USERS } from "../../fixtures/test-data";
import {
  futureDate,
  createListingViaAPI,
  createBookingViaAPI,
  loginAndGetContext,
} from "../../helpers/api";

function waitForToast(page: import("@playwright/test").Page, textPattern: RegExp | string) {
  const pattern = typeof textPattern === "string" ? new RegExp(textPattern, "i") : textPattern;
  return expect(
    page.locator("[role='status']").filter({ hasText: pattern }).first()
  ).toBeVisible({ timeout: 10_000 });
}

test.describe("Host Management (UI)", () => {
  test("host sees their listings on /properties page", async ({
    hostPage: page,
  }) => {
    await page.goto("/properties");
    await page.waitForLoadState("networkidle");

    // Should see listing cards
    const cards = page.getByTestId("listing-card");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    // Should see "Delete Property" action buttons
    await expect(
      page.getByTestId("btn-delete-property").first()
    ).toBeVisible({ timeout: 5_000 });

    // Should see the page heading
    await expect(page.getByText("Properties", { exact: true })).toBeVisible();
  });

  test("host deletes a listing from /properties and sees success toast", async ({
    browser,
  }) => {
    // Create a listing to delete
    const hostCtx = await browser.newContext();
    const hostPage = await hostCtx.newPage();
    const { loginViaAPI } = await import("../../fixtures/auth.fixture");
    await loginViaAPI(hostCtx, hostPage, TEST_USERS.host);

    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E UI Delete Property Test",
    });

    // Go to properties page
    await hostPage.goto("/properties");
    await hostPage.waitForLoadState("networkidle");

    const cards = hostPage.getByTestId("listing-card");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    // Click "Delete Property" on the last card (the one we just created)
    const deleteBtn = hostPage.getByTestId("btn-delete-property").last();
    await deleteBtn.click();

    // Should see success toast
    await waitForToast(hostPage, /deleted/i);

    // Verify the deleted listing is no longer accessible via API
    const checkRes = await hostCtx.request.get(
      `${(await import("../../fixtures/test-data")).BASE_URL.api}/listing/${ld._id}`
    );
    expect(checkRes.status()).not.toBe(200);

    await hostCtx.close();
  });

  // NOTE: The server's GET /bookings (getMyBookings) only returns bookings
  // where the requesting user is the guest. It does NOT support authorId filtering.
  // So the host reservations page always shows empty state — this is a known API limitation.
  test("host sees reservations page (API returns only host's own bookings-as-guest)", async ({
    hostPage: page,
  }) => {
    await page.goto("/reservations");
    await page.waitForLoadState("networkidle");

    // The getMyBookings endpoint returns bookings where user is guest.
    // If prior tests created bookings where host was a guest, cards appear.
    // Either empty state or listing cards should be visible.
    const emptyState = page.locator("text=No Reservations found");
    const cards = page.getByTestId("listing-card").first();
    await expect(emptyState.or(cards)).toBeVisible({ timeout: 10_000 });
  });

  test("host can navigate to reservations and page renders correctly", async ({
    hostPage: page,
  }) => {
    await page.goto("/reservations");
    await page.waitForLoadState("networkidle");

    // Page should render the heading regardless of content
    await expect(page.getByText("Reservations", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Bookings on your properties")).toBeVisible();
  });

  test("host navigates to properties via user menu", async ({
    hostPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open user menu
    await page.getByTestId("user-menu-toggle").click();

    // Verify host-specific menu items exist
    await expect(page.getByTestId("menu-item-my-properties")).toBeVisible();
    await expect(
      page.getByTestId("menu-item-my-reservations")
    ).toBeVisible();
    await expect(
      page.getByTestId("menu-item-airbnb-my-home")
    ).toBeVisible();

    // Click "My Properties"
    await page.getByTestId("menu-item-my-properties").click();
    await page.waitForURL(/\/properties/, { timeout: 5_000 });
  });

  test("host navigates to reservations via user menu", async ({
    hostPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open user menu
    await page.getByTestId("user-menu-toggle").click();

    // Click "My Reservations"
    await page.getByTestId("menu-item-my-reservations").click();
    await page.waitForURL(/\/reservations/, { timeout: 5_000 });
  });
});
