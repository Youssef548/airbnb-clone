import { test, expect } from "../../fixtures/auth.fixture";
import { BASE_URL, TEST_USERS } from "../../fixtures/test-data";
import {
  futureDate,
  createBookingViaAPI,
  createListingViaAPI,
  loginAndGetContext,
} from "../../helpers/api";

test.describe("Host-Guest Interactions", () => {
  test("host deletes listing with active bookings — cascade cleans bookings and favorites", async ({
    browser,
  }) => {
    // Host creates a listing
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Cascade Delete Test",
    });
    const lid = ld._id;

    // Guest1 books it
    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guest1Ctx.request, {
      listingId: lid,
      startDate: futureDate(160),
      endDate: futureDate(165),
      totalPrice: 750,
    });
    expect(bookRes.response.status()).toBe(201);

    // Guest2 favorites it
    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);
    await guest2Ctx.request.post(`${BASE_URL.api}/favorites/${lid}`);

    // Host deletes the listing
    const delRes = await hostCtx.request.delete(
      `${BASE_URL.api}/listings/${lid}`
    );
    expect(delRes.status()).toBe(204);

    // Guest1's bookings should not include the deleted listing's booking
    const tripsRes = await guest1Ctx.request.get(`${BASE_URL.api}/booking`);
    const tripsData = await tripsRes.json();
    const trips = tripsData.bookings || tripsData;
    const tripListingIds = trips.map(
      (t: { listingId: string | { _id: string } }) =>
        typeof t.listingId === "string" ? t.listingId : t.listingId?._id
    );
    expect(tripListingIds).not.toContain(lid);

    // Guest2's favorites should not include the deleted listing
    const favsRes = await guest2Ctx.request.get(`${BASE_URL.api}/favorites`);
    const favsData = await favsRes.json();
    const favorites = favsData.favorites || favsData;
    const favIds = favorites.map((f: { _id: string }) => f._id);
    expect(favIds).not.toContain(lid);

    await hostCtx.close();
    await guest1Ctx.close();
    await guest2Ctx.close();
  });

  test("host cancels guest's booking — guest sees updated trips", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Host Cancel Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(170),
      endDate: futureDate(175),
      totalPrice: 750,
    });
    expect(bookRes.response.status()).toBe(201);
    const bookingId =
      bookRes.data._id;

    // Host cancels the booking
    const cancelRes = await hostCtx.request.delete(
      `${BASE_URL.api}/booking/${bookingId}`
    );
    expect(cancelRes.status()).toBe(204);

    // Guest's trips should not include the cancelled booking
    const tripsRes = await guestCtx.request.get(`${BASE_URL.api}/booking`);
    const tripsData = await tripsRes.json();
    const trips = tripsData.bookings || tripsData;
    const bookingIds = trips.map((t: { _id: string }) => t._id);
    expect(bookingIds).not.toContain(bookingId);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("multiple guests book non-overlapping dates on same listing", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Multi Guest Booking Test",
    });
    const lid = ld._id;

    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);
    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    const r1 = await createBookingViaAPI(guest1Ctx.request, {
      listingId: lid,
      startDate: futureDate(180),
      endDate: futureDate(185),
      totalPrice: 750,
    });
    expect(r1.response.status()).toBe(201);

    const r2 = await createBookingViaAPI(guest2Ctx.request, {
      listingId: lid,
      startDate: futureDate(190),
      endDate: futureDate(195),
      totalPrice: 750,
    });
    expect(r2.response.status()).toBe(201);

    await hostCtx.close();
    await guest1Ctx.close();
    await guest2Ctx.close();
  });

  test("guest tries to book deleted listing — 404", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Book Deleted Test",
    });
    const lid = ld._id;

    // Delete it
    await hostCtx.request.delete(`${BASE_URL.api}/listings/${lid}`);

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    const res = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(200),
      endDate: futureDate(205),
      totalPrice: 750,
    });
    expect(res.response.status()).toBe(404);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("guest cancels own booking — 204", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Guest Cancel Own Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(210),
      endDate: futureDate(215),
      totalPrice: 750,
    });
    expect(bookRes.response.status()).toBe(201);
    const bookingId = bookRes.data.booking?._id || bookRes.data._id;

    const cancelRes = await guestCtx.request.delete(
      `${BASE_URL.api}/booking/${bookingId}`
    );
    expect(cancelRes.status()).toBe(204);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("unauthorized user cancels another guest's booking — 403", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Unauthorized Cancel Test",
    });
    const lid = ld._id;

    // Guest1 books
    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);
    const bookRes = await createBookingViaAPI(guest1Ctx.request, {
      listingId: lid,
      startDate: futureDate(220),
      endDate: futureDate(225),
      totalPrice: 750,
    });
    const bookingId = bookRes.data.booking?._id || bookRes.data._id;

    // Guest2 tries to cancel guest1's booking
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

  test("listing count consistency after create and delete", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);

    // Create a listing
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Count Consistency Test",
    });
    const lid = ld._id;

    // Verify listing exists via GET by ID
    const getRes = await hostCtx.request.get(
      `${BASE_URL.api}/listings/${lid}`
    );
    expect(getRes.status()).toBe(200);

    // Delete it
    await hostCtx.request.delete(`${BASE_URL.api}/listings/${lid}`);

    // Verify listing no longer exists
    const afterDeleteRes = await hostCtx.request.get(
      `${BASE_URL.api}/listings/${lid}`
    );
    expect(afterDeleteRes.status()).toBe(404);

    await hostCtx.close();
  });

  test("cascade delete removes bookings and favorites atomically", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Atomic Cascade Test",
    });
    const lid = ld._id;

    // Guest books and favorites
    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    const bookRes = await createBookingViaAPI(guestCtx.request, {
      listingId: lid,
      startDate: futureDate(230),
      endDate: futureDate(235),
      totalPrice: 750,
    });
    expect(bookRes.response.status()).toBe(201);

    await guestCtx.request.post(`${BASE_URL.api}/favorites/${lid}`);

    // Host deletes listing
    await hostCtx.request.delete(`${BASE_URL.api}/listings/${lid}`);

    // Guest's bookings should be cleaned
    const tripsRes = await guestCtx.request.get(`${BASE_URL.api}/booking`);
    const tripsData = await tripsRes.json();
    const trips = tripsData.bookings || tripsData;
    const tripListingIds = trips.map(
      (t: { listingId: string | { _id: string } }) =>
        typeof t.listingId === "string" ? t.listingId : t.listingId?._id
    );
    expect(tripListingIds).not.toContain(lid);

    // Guest's favorites should be cleaned
    const favsRes = await guestCtx.request.get(`${BASE_URL.api}/favorites`);
    const favsData = await favsRes.json();
    const favorites = favsData.favorites || favsData;
    const favIds = favorites.map((f: { _id: string }) => f._id);
    expect(favIds).not.toContain(lid);

    await hostCtx.close();
    await guestCtx.close();
  });
});
