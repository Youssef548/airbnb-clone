import { test, expect } from "../../fixtures/auth.fixture";
import { BASE_URL, TEST_USERS } from "../../fixtures/test-data";
import {
  futureDate,
  getListingIds,
  createBookingViaAPI,
  createListingViaAPI,
  loginAndGetContext,
} from "../../helpers/api";

test.describe("Concurrent Bookings & Edge Cases", () => {
  let listingId: string;

  test.beforeAll(async ({ browser }) => {
    // Get a listing ID for tests
    const ctx = await browser.newContext();
    const ids = await getListingIds(ctx.request);
    listingId = ids[0];
    await ctx.close();
  });

  test("two guests booking same dates simultaneously — race condition", async ({
    browser,
  }) => {
    // Create two separate authenticated contexts for guest and guest2
    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);

    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    // Create a fresh listing so we don't conflict with other tests
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: listingData } = await createListingViaAPI(
      hostCtx.request,
      { title: "E2E Race Condition Test Listing" }
    );
    const freshListingId = listingData._id;

    const startDate = futureDate(30);
    const endDate = futureDate(35);
    const payload = {
      listingId: freshListingId,
      startDate,
      endDate,
      totalPrice: 750,
    };

    // Fire both bookings simultaneously
    const [result1, result2] = await Promise.all([
      createBookingViaAPI(guest1Ctx.request, payload),
      createBookingViaAPI(guest2Ctx.request, payload),
    ]);

    // KNOWN ISSUE: No MongoDB transactions means both may succeed (race condition)
    // Document this — at least one should succeed
    const statuses = [
      result1.response.status(),
      result2.response.status(),
    ].sort();

    // At least one booking succeeds
    expect(statuses).toContain(201);

    // If both succeed, that's the documented race condition
    if (statuses[0] === 201 && statuses[1] === 201) {
      // eslint-disable-next-line no-console
      console.warn(
        "KNOWN ISSUE: Race condition — both bookings succeeded for same dates"
      );
    }

    await guest1Ctx.close();
    await guest2Ctx.close();
    await hostCtx.close();
  });

  test("overlapping dates: exact same dates rejected", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Overlap Exact Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    const start = futureDate(40);
    const end = futureDate(45);

    // First booking succeeds
    const first = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: start,
      endDate: end,
      totalPrice: 750,
    });
    expect(first.response.status()).toBe(201);

    // Second booking with exact same dates should fail
    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    const second = await createBookingViaAPI(guest2Ctx.request, {
      listingId: lid,
      startDate: start,
      endDate: end,
      totalPrice: 750,
    });
    expect(second.response.status()).toBe(400);

    await hostCtx.close();
    await guestCtx.close();
    await guest2Ctx.close();
  });

  test("overlapping dates: subset range rejected", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Overlap Subset Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    // Book a wide range
    const first = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(50),
      endDate: futureDate(60),
      totalPrice: 1500,
    });
    expect(first.response.status()).toBe(201);

    // Try booking a subset range
    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    const second = await createBookingViaAPI(guest2Ctx.request, {
      listingId: lid,
      startDate: futureDate(52),
      endDate: futureDate(58),
      totalPrice: 900,
    });
    expect(second.response.status()).toBe(400);

    await hostCtx.close();
    await guestCtx.close();
    await guest2Ctx.close();
  });

  test("overlapping dates: start-overlap rejected", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Overlap Start Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(70),
      endDate: futureDate(75),
      totalPrice: 750,
    });

    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    // Overlaps at the start
    const res = await createBookingViaAPI(guest2Ctx.request, {
      listingId: lid,
      startDate: futureDate(68),
      endDate: futureDate(72),
      totalPrice: 600,
    });
    expect(res.response.status()).toBe(400);

    await hostCtx.close();
    await guestCtx.close();
    await guest2Ctx.close();
  });

  test("overlapping dates: end-overlap rejected", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Overlap End Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(80),
      endDate: futureDate(85),
      totalPrice: 750,
    });

    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    // Overlaps at the end
    const res = await createBookingViaAPI(guest2Ctx.request, {
      listingId: lid,
      startDate: futureDate(83),
      endDate: futureDate(88),
      totalPrice: 750,
    });
    expect(res.response.status()).toBe(400);

    await hostCtx.close();
    await guestCtx.close();
    await guest2Ctx.close();
  });

  test("non-overlapping dates from different guests both succeed", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Non-Overlap Test",
    });
    const lid = ld._id;

    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);

    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    const res1 = await createBookingViaAPI(guest1Ctx.request, {
      listingId: lid,
      startDate: futureDate(90),
      endDate: futureDate(95),
      totalPrice: 750,
    });
    expect(res1.response.status()).toBe(201);

    const res2 = await createBookingViaAPI(guest2Ctx.request, {
      listingId: lid,
      startDate: futureDate(100),
      endDate: futureDate(105),
      totalPrice: 750,
    });
    expect(res2.response.status()).toBe(201);

    await hostCtx.close();
    await guest1Ctx.close();
    await guest2Ctx.close();
  });

  test("listing deleted while guest tries to book — 404", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Delete While Booking Test",
    });
    const lid = ld._id;

    // Host deletes the listing
    const delRes = await hostCtx.request.delete(
      `${BASE_URL.api}/listings/${lid}`
    );
    expect(delRes.status()).toBe(204);

    // Guest tries to book the deleted listing
    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    const bookRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(110),
      endDate: futureDate(115),
      totalPrice: 750,
    });
    expect(bookRes.response.status()).toBe(404);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("host books their own listing — documents product question", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Host Self-Book Test",
    });
    const lid = ld._id;

    // KNOWN ISSUE: No validation prevents host from booking their own listing
    const res = await createBookingViaAPI(hostCtx.request, {
      listingId: lid,
      startDate: futureDate(120),
      endDate: futureDate(125),
      totalPrice: 750,
    });
    // Documents that host self-booking is allowed
    expect(res.response.status()).toBe(201);

    await hostCtx.close();
  });

  test("manipulated totalPrice (zero) — documents price validation gap", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Price Manipulation Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    // KNOWN ISSUE: Server accepts any totalPrice without validation
    const res = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(130),
      endDate: futureDate(135),
      totalPrice: 0,
    });
    expect(res.response.status()).toBe(201);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("past dates booking — documents missing validation", async ({
    browser,
  }) => {
    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    // KNOWN ISSUE: No check that dates are in the future
    const res = await createBookingViaAPI(guestCtx.request, {
      listingId,
      startDate: "2020-01-01",
      endDate: "2020-01-05",
      totalPrice: 600,
    });
    expect(res.response.status()).toBe(201);

    await guestCtx.close();
  });

  test("endDate before startDate — documents missing validation", async ({
    browser,
  }) => {
    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    // KNOWN ISSUE: No check that endDate > startDate
    const res = await createBookingViaAPI(guestCtx.request, {
      listingId,
      startDate: futureDate(145),
      endDate: futureDate(140),
      totalPrice: 750,
    });
    expect(res.response.status()).toBe(201);

    await guestCtx.close();
  });

  test("rapid duplicate booking (double-click reserve) — race condition possible", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Double Click Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    const payload = {
      listingId: lid,
      startDate: futureDate(150),
      endDate: futureDate(155),
      totalPrice: 750,
    };

    // Simulate double-click by firing two rapid requests
    const [r1, r2] = await Promise.all([
      createBookingViaAPI(guestCtx.request, payload),
      createBookingViaAPI(guestCtx.request, payload),
    ]);

    const statuses = [r1.response.status(), r2.response.status()].sort();
    // At least one should succeed
    expect(statuses).toContain(201);

    await hostCtx.close();
    await guestCtx.close();
  });
});
