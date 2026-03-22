import { test, expect, dismissModal } from "../../fixtures/auth.fixture";

test.describe("Create Booking", () => {
  test("should create a booking and redirect to trips", async ({
    guestPage: page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click on a listing
    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });

    // Wait for the reservation panel to load
    await expect(page.getByTestId("btn-reserve")).toBeVisible({
      timeout: 10_000,
    });

    // Select dates in the calendar
    const calendar = page.locator(".rdrCalendarWrapper");
    await expect(calendar).toBeVisible({ timeout: 5_000 });

    // Click on the next month button to ensure we pick future dates
    const nextMonthBtn = page.locator(".rdrNextPrevButton.rdrNextButton");
    await nextMonthBtn.click();

    // Select start date (first available day in next month)
    const availableDays = page.locator(
      ".rdrDay:not(.rdrDayPassive):not(.rdrDayDisabled)"
    );
    const dayCount = await availableDays.count();

    if (dayCount >= 2) {
      await availableDays.nth(0).click();
      const endDayIndex = Math.min(3, dayCount - 1);
      await availableDays.nth(endDayIndex).click();
    }

    // Click Reserve
    await page.getByTestId("btn-reserve").click();

    // Should redirect to trips page
    await page.waitForURL(/\/trips/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/trips/);
  });

  test("should prompt login for unauthenticated user trying to reserve", async ({
    loggedOutPage: page,
  }) => {
    await page.goto("/");
    await dismissModal(page);

    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await page.waitForURL(/\/listing\/.+/, { timeout: 10_000 });

    // The listing detail page makes a getReservation API call that returns 401
    // for unauthenticated users. The Axios 401 interceptor calls handleUnauthorized()
    // which opens the Login modal automatically.
    await expect(page.getByTestId("modal-title")).toHaveText("Login", {
      timeout: 10_000,
    });
  });
});
