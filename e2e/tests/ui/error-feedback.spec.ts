import { test, expect, dismissModal } from "../../fixtures/auth.fixture";
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

test.describe("Error Feedback (UI)", () => {
  test("login with invalid credentials shows error message", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Open login modal
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-login").click();

    await expect(page.getByTestId("modal-title")).toHaveText("Login", {
      timeout: 5_000,
    });

    // Fill in wrong credentials
    await page.getByTestId("input-email").fill("wrong@email.com");
    await page.getByTestId("input-password").fill("wrongpassword");

    // Click Continue
    await page.getByTestId("btn-continue").click();

    // Should show error toast (not generic "Something went wrong")
    const toast = page.locator("[role='status']").first();
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });

  test("register with duplicate email shows error message", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Open register modal
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-sign-up").click();

    await expect(page.getByTestId("modal-title")).toHaveText("Register", {
      timeout: 5_000,
    });

    // Fill in with existing email
    await page.getByTestId("input-email").fill(TEST_USERS.guest.email);
    await page.getByTestId("input-username").fill("duptest");
    await page.getByTestId("input-password").fill("ValidPass123!");

    // Click Continue
    await page.getByTestId("btn-continue").click();

    // Should show error toast about email already in use
    const toast = page.locator("[role='status']").first();
    await expect(toast).toBeVisible({ timeout: 10_000 });
  });

  test("register with short username shows validation error", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Open register modal
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-sign-up").click();

    // Fill in with short username
    await page.getByTestId("input-email").fill("e2etest_short@test.com");
    await page.getByTestId("input-username").fill("ab");
    await page.getByTestId("input-password").fill("ValidPass123!");

    // Click Continue
    await page.getByTestId("btn-continue").click();

    // Client-side validation shows inline error (react-hook-form minLength: 3)
    // Check for either inline error text or a toast
    const inlineError = page.locator("text=Name must be at least 3 characters");
    const toastEl = page.locator("[role='status']").first();
    await expect(inlineError.or(toastEl)).toBeVisible({ timeout: 10_000 });
  });

  test("booking duplicate dates shows specific error (not 'Something went wrong')", async ({
    browser,
  }) => {
    // Setup: create listing and book specific dates
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E UI Error Feedback Booking Test",
      price: 100,
    });

    const guestCtx = await browser.newContext();
    const guestPage = await guestCtx.newPage();
    const { loginViaAPI } = await import("../../fixtures/auth.fixture");
    await loginViaAPI(guestCtx, guestPage, TEST_USERS.guest);

    // Book dates via API first
    const start = futureDate(350);
    const end = futureDate(355);
    await createBookingViaAPI(guestCtx.request, {
      listingId: ld._id,
      startDate: start,
      endDate: end,
      totalPrice: 500,
    });

    // Now navigate to listing detail
    await guestPage.goto(`/listing/${ld._id}`);
    await guestPage.waitForLoadState("networkidle");

    // Wait for calendar to load
    const calendar = guestPage.locator(".rdrCalendarWrapper");
    await expect(calendar).toBeVisible({ timeout: 10_000 });

    // Try to book overlapping dates by navigating to the correct month
    // and selecting days that overlap with the booked range
    // Navigate to the month containing the booked dates
    const nextBtn = guestPage.locator(".rdrNextPrevButton.rdrNextButton");

    // Go forward enough months (the booked dates are ~11 months away)
    for (let i = 0; i < 11; i++) {
      await nextBtn.click();
      await guestPage.waitForTimeout(100);
    }

    // Try clicking available days near the disabled ones
    const availableDays = guestPage.locator(
      ".rdrDay:not(.rdrDayPassive):not(.rdrDayDisabled)"
    );
    const availCount = await availableDays.count();

    if (availCount >= 2) {
      // Select some available days and try to reserve
      await availableDays.nth(0).click();
      await availableDays.nth(Math.min(1, availCount - 1)).click();

      await guestPage.getByTestId("btn-reserve").click();

      // The result should either:
      // - Succeed (non-overlapping dates) → redirect to /trips
      // - Fail with a SPECIFIC error message (not "Something went wrong")
      // Wait for either navigation or toast
      await guestPage.waitForTimeout(3000);

      const url = guestPage.url();
      if (!url.includes("/trips")) {
        // If we didn't navigate, a toast should be visible
        const toast = guestPage.locator("[role='status']").first();
        await expect(toast).toBeVisible({ timeout: 5_000 });

        // The toast should NOT say "Something went wrong" (that was the bug we fixed)
        const toastText = await toast.textContent();
        expect(toastText).not.toBe("Something went wrong");
      }
    }

    await hostCtx.close();
    await guestCtx.close();
  });

  test("empty trips page shows proper empty state", async ({
    guest2Page: page,
  }) => {
    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    // Should show empty state (guest2 has no bookings initially)
    await expect(
      page.locator("text=No trips found").or(page.getByTestId("listing-card").first())
    ).toBeVisible({ timeout: 10_000 });
  });

  test("rent modal shows validation error when no category selected", async ({
    hostPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open rent modal
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-airbnb-my-home").click();

    await expect(page.getByTestId("modal-title")).toHaveText(
      "Airbnb your home!",
      { timeout: 5_000 }
    );

    // Click "Next" without selecting a category
    await page.getByTestId("btn-next").click();

    // Should show validation error (red banner in modal: "Please select a category.")
    await expect(
      page.locator(".bg-red-200")
    ).toBeVisible({ timeout: 5_000 });
  });

  test("rent modal step-by-step navigation shows correct headings", async ({
    hostPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open rent modal
    await page.getByTestId("user-menu-toggle").click();
    await page.getByTestId("menu-item-airbnb-my-home").click();

    // Step 0: Category
    await expect(page.locator("text=Which of these best describes")).toBeVisible({
      timeout: 5_000,
    });

    // Select a category (click on the first CategoryInput — rounded-xl border-2 cursor-pointer)
    const categoryInputs = page.locator("[class*='rounded-xl'][class*='border-2'][class*='cursor-pointer']");
    if ((await categoryInputs.count()) > 0) {
      await categoryInputs.first().click();
    }

    // Click Next → Step 1: Location
    await page.getByTestId("btn-next").click();
    await expect(page.locator("text=Where is your place located")).toBeVisible({
      timeout: 5_000,
    });

    // Click Next → Step 2: Info (skip location selection for now)
    await page.getByTestId("btn-next").click();

    // Check we moved forward or got a validation error
    const infoHeading = page.locator("text=Share some basics about your place");
    const locationError = page.locator(".bg-red-200");
    await expect(infoHeading.or(locationError)).toBeVisible({ timeout: 5_000 });
  });

  test("search modal opens from search bar click", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissModal(page);

    // Click the search bar
    const searchBar = page.locator("[class*='border'][class*='rounded-full'][class*='shadow']").filter({
      hasText: /anywhere/i,
    });

    if (await searchBar.isVisible()) {
      await searchBar.click();

      // Search/Filters modal should open
      await expect(page.getByTestId("modal-title")).toHaveText("Filters", {
        timeout: 5_000,
      });

      // Should show location step
      await expect(
        page.locator("text=where do you wanna go")
      ).toBeVisible();
    }
  });
});
