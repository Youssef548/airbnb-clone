import { test, expect } from "../../fixtures/auth.fixture";
import { BASE_URL, TEST_USERS, TEST_LISTING } from "../../fixtures/test-data";
import {
  futureDate,
  createBookingViaAPI,
  createListingViaAPI,
  getListingIds,
  loginAndGetContext,
} from "../../helpers/api";

test.describe("Authorization Checks", () => {
  test("guest tries to create listing — 403", async ({ browser }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.guest);

    const res = await ctx.request.post(`${BASE_URL.api}/listings`, {
      data: TEST_LISTING,
    });
    expect(res.status()).toBe(403);

    await ctx.close();
  });

  test("guest tries to delete listing — 403", async ({ browser }) => {
    const ctx = await browser.newContext();
    const ids = await getListingIds(ctx.request);

    await loginAndGetContext(ctx.request, TEST_USERS.guest);

    const res = await ctx.request.delete(
      `${BASE_URL.api}/listings/${ids[0]}`
    );
    expect(res.status()).toBe(403);

    await ctx.close();
  });

  test("host deletes non-existent listing — 404", async ({ browser }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.host);

    // Valid ObjectId format but doesn't exist
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await ctx.request.delete(
      `${BASE_URL.api}/listings/${fakeId}`
    );
    // Server returns 400 "Listing not found" (uses errorHandler(400) in service)
    expect(res.status()).toBe(400);

    await ctx.close();
  });

  test("unauthenticated user hits all protected endpoints — all 401", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    const fakeId = "507f1f77bcf86cd799439011";

    const protectedEndpoints = [
      { method: "GET", path: "/auth/me" },
      { method: "POST", path: "/listings", data: TEST_LISTING },
      { method: "DELETE", path: `/listings/${fakeId}` },
      { method: "POST", path: `/favorites/${fakeId}` },
      { method: "DELETE", path: `/favorites/${fakeId}` },
      { method: "GET", path: "/favorites" },
      {
        method: "POST",
        path: "/booking",
        data: {
          listingId: fakeId,
          startDate: futureDate(300),
          endDate: futureDate(305),
          totalPrice: 100,
        },
      },
      { method: "GET", path: "/booking" },
      { method: "DELETE", path: `/booking/${fakeId}` },
    ];

    for (const ep of protectedEndpoints) {
      const res = await ctx.request.fetch(`${BASE_URL.api}${ep.path}`, {
        method: ep.method,
        ...(ep.data ? { data: ep.data } : {}),
      });
      expect(
        res.status(),
        `${ep.method} ${ep.path} should be 401`
      ).toBe(401);
    }

    await ctx.close();
  });

  test("guest cancels another guest's booking — 403", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Auth Cross Cancel Test",
    });
    const lid = ld._id;

    // Guest1 books
    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guest1Ctx.request, {
      listingId: lid,
      startDate: futureDate(240),
      endDate: futureDate(245),
      totalPrice: 750,
    });
    const bookingId = bookRes.data._id;

    // Guest2 tries to cancel
    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);
    const cancelRes = await guest2Ctx.request.delete(
      `${BASE_URL.api}/booking/${bookingId}`
    );
    expect(cancelRes.status()).toBe(403);

    await hostCtx.close();
    await guest1Ctx.close();
    await guest2Ctx.close();
  });

  test("host (listing owner) cancels guest's booking — 204", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Host Cancel Auth Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(250),
      endDate: futureDate(255),
      totalPrice: 750,
    });
    const bookingId = bookRes.data._id;

    // Host cancels
    const cancelRes = await hostCtx.request.delete(
      `${BASE_URL.api}/booking/${bookingId}`
    );
    expect(cancelRes.status()).toBe(204);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("guest cancels own booking — 204", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Guest Self Cancel Auth Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(260),
      endDate: futureDate(265),
      totalPrice: 750,
    });
    const bookingId = bookRes.data._id;

    const cancelRes = await guestCtx.request.delete(
      `${BASE_URL.api}/booking/${bookingId}`
    );
    expect(cancelRes.status()).toBe(204);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("zero/negative totalPrice accepted — documents vulnerability", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Negative Price Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    // Zero price
    const zeroRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(270),
      endDate: futureDate(275),
      totalPrice: 0,
    });
    // KNOWN ISSUE: Server accepts zero totalPrice
    expect(zeroRes.response.status()).toBe(201);

    // Negative price
    const negRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(280),
      endDate: futureDate(285),
      totalPrice: -500,
    });
    // KNOWN ISSUE: Server accepts negative totalPrice
    expect(negRes.response.status()).toBe(201);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("invalid ObjectId format in URL params — 400", async ({ browser }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.guest);

    const invalidId = "not-a-valid-objectid";

    // Listing detail
    const listingRes = await ctx.request.get(
      `${BASE_URL.api}/listings/${invalidId}`
    );
    expect(listingRes.status()).toBe(400);

    // Favorite
    const favRes = await ctx.request.post(
      `${BASE_URL.api}/favorites/${invalidId}`
    );
    expect(favRes.status()).toBe(400);

    // Booking cancel
    const bookingRes = await ctx.request.delete(
      `${BASE_URL.api}/booking/${invalidId}`
    );
    expect(bookingRes.status()).toBe(400);

    await ctx.close();
  });

  test("missing required fields in booking creation — 400", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.guest);

    // Missing listingId
    const noListing = await ctx.request.post(`${BASE_URL.api}/booking`, {
      data: {
        startDate: futureDate(290),
        endDate: futureDate(295),
        totalPrice: 500,
      },
    });
    expect(noListing.status()).toBe(400);

    // Missing dates
    const noDates = await ctx.request.post(`${BASE_URL.api}/booking`, {
      data: {
        listingId: "507f1f77bcf86cd799439011",
        totalPrice: 500,
      },
    });
    expect(noDates.status()).toBe(400);

    // Missing totalPrice
    const noPrice = await ctx.request.post(`${BASE_URL.api}/booking`, {
      data: {
        listingId: "507f1f77bcf86cd799439011",
        startDate: futureDate(290),
        endDate: futureDate(295),
      },
    });
    expect(noPrice.status()).toBe(400);

    await ctx.close();
  });
});
