import { test, expect, dismissModal } from "../../fixtures/auth.fixture";
import { TEST_USERS } from "../../fixtures/test-data";
import { createListingViaAPI, loginAndGetContext } from "../../helpers/api";

test.describe("Listing Detail Page (UI)", () => {
  let listingId: string;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.host);
    const { data } = await createListingViaAPI(ctx.request, {
      title: "E2E UI Detail Page Test Listing",
      description: "A beautiful test listing for UI verification",
      price: 150,
      roomCount: 3,
      bathRoomCount: 2,
      guestCount: 6,
    });
    listingId = data._id;
    await ctx.close();
  });

  test("listing detail shows title, price, and reservation panel", async ({
    guestPage: page,
  }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    // Title should be visible
    await expect(
      page.locator("text=E2E UI Detail Page Test Listing")
    ).toBeVisible({ timeout: 10_000 });

    // Price per night should be visible (use .first() since price appears in both price-per-night and total sections)
    await expect(page.locator("text=$ 150").first()).toBeVisible();
    await expect(page.locator("text=night").first()).toBeVisible();

    // Reserve button should be visible
    await expect(page.getByTestId("btn-reserve")).toBeVisible();

    // Calendar should be visible
    const calendar = page.locator(".rdrCalendarWrapper");
    await expect(calendar).toBeVisible();

    // Total price should be visible
    await expect(page.locator("text=Total")).toBeVisible();
  });

  test("listing detail shows room/guest/bathroom counts", async ({
    guestPage: page,
  }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    // Check for guest, room, bathroom info
    await expect(page.locator("text=6 guests")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("text=3 bedrooms")).toBeVisible();
    await expect(page.locator("text=2 bathrooms")).toBeVisible();
  });

  test("listing detail shows description", async ({ guestPage: page }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator("text=A beautiful test listing for UI verification")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("listing detail shows map", async ({ guestPage: page }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    // Leaflet map container should be visible
    const map = page.locator(".leaflet-container");
    await expect(map).toBeVisible({ timeout: 10_000 });
  });

  test("listing detail shows host info", async ({ guestPage: page }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    // Should show "Hosted by" text
    await expect(page.locator("text=Hosted by")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("listing detail has heart button for favoriting", async ({
    guestPage: page,
  }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    // Heart button should exist on the listing head image
    const heartBtn = page.getByTestId("heart-button").first();
    await expect(heartBtn).toBeVisible({ timeout: 10_000 });

    // Click to favorite
    await heartBtn.click();
    await page.waitForTimeout(1000);

    // Click again to unfavorite
    await heartBtn.click();
  });

  test("selecting dates updates total price display", async ({
    guestPage: page,
  }) => {
    await page.goto(`/listing/${listingId}`);
    await page.waitForLoadState("networkidle");

    // Price per night should be visible
    await expect(page.locator("text=$ 150").first()).toBeVisible({
      timeout: 10_000,
    });

    // Navigate calendar to a future month using dropdowns or next button
    const calendar = page.locator(".rdrCalendarWrapper");
    await expect(calendar).toBeVisible({ timeout: 5_000 });

    // Calculate a target month 3 months ahead
    const target = new Date();
    target.setMonth(target.getMonth() + 3);
    const targetMonth = target.toLocaleString("en-US", { month: "long" });
    const targetYear = target.getFullYear().toString();

    // Try dropdown selectors first
    const monthSelect = calendar.locator("select").first();
    const hasDropdowns = await monthSelect.isVisible().catch(() => false);
    if (hasDropdowns) {
      await monthSelect.selectOption({ label: targetMonth });
      const yearSelect = calendar.locator("select").last();
      await yearSelect.selectOption({ label: targetYear });
      await page.waitForTimeout(300);
    } else {
      const nextMonthBtn = page.locator(".rdrNextPrevButton.rdrNextButton");
      for (let i = 0; i < 3; i++) {
        await nextMonthBtn.click();
        await page.waitForTimeout(200);
      }
    }

    // Click day 10 and day 14 using react-date-range's DOM structure
    // The days render as: button.rdrDay > span.rdrDayNumber > span (text)
    const daySpans = calendar.locator(".rdrDayNumber span");
    const day10 = daySpans.filter({ hasText: /^10$/ }).first();
    await day10.click();
    await page.waitForTimeout(500);

    const day14 = daySpans.filter({ hasText: /^14$/ }).first();
    await day14.click();
    await page.waitForTimeout(500);

    // Total should now be 4 * 150 = 600
    await expect(page.locator("text=$ 600")).toBeVisible({ timeout: 5_000 });
  });

  test("non-existent listing shows 404 or error", async ({
    guestPage: page,
  }) => {
    await page.goto("/listing/507f1f77bcf86cd799439011");
    await page.waitForLoadState("networkidle");

    // Should show some error state — either a toast, empty page, or error boundary
    await page.waitForTimeout(3000);

    // The page should not show the reservation panel
    const reserveBtn = page.getByTestId("btn-reserve");
    const isReserveVisible = await reserveBtn.isVisible().catch(() => false);
    expect(isReserveVisible).toBe(false);
  });
});
