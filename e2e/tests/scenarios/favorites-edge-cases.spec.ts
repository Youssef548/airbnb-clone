import { test, expect } from "../../fixtures/auth.fixture";
import { BASE_URL, TEST_USERS } from "../../fixtures/test-data";
import {
  getListingIds,
  createListingViaAPI,
  loginAndGetContext,
} from "../../helpers/api";

test.describe("Favorites Edge Cases", () => {
  let listingId: string;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const ids = await getListingIds(ctx.request);
    listingId = ids[0];
    await ctx.close();
  });

  test("rapid sequential toggle (add/remove/add) — final state correct", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.guest);

    // Ensure clean state — remove if already favorited (ignore error)
    await ctx.request.delete(`${BASE_URL.api}/favorites/${listingId}`);

    // Add
    const add1 = await ctx.request.post(
      `${BASE_URL.api}/favorites/${listingId}`
    );
    expect(add1.status()).toBe(200);

    // Remove
    const rem = await ctx.request.delete(
      `${BASE_URL.api}/favorites/${listingId}`
    );
    expect(rem.status()).toBe(200);

    // Add again
    const add2 = await ctx.request.post(
      `${BASE_URL.api}/favorites/${listingId}`
    );
    expect(add2.status()).toBe(200);

    // Verify it's in favorites
    const favRes = await ctx.request.get(`${BASE_URL.api}/favorites`);
    const favData = await favRes.json();
    const favorites = favData.favorites || favData;
    const ids = favorites.map((f: { _id: string }) => f._id);
    expect(ids).toContain(listingId);

    // Clean up
    await ctx.request.delete(`${BASE_URL.api}/favorites/${listingId}`);
    await ctx.close();
  });

  test("favorite listing then host deletes it — removed from favorites", async ({
    browser,
  }) => {
    // Host creates a listing
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Favorite Delete Test",
    });
    const lid = ld._id;

    // Guest favorites it
    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    const favRes = await guestCtx.request.post(
      `${BASE_URL.api}/favorites/${lid}`
    );
    expect(favRes.status()).toBe(200);

    // Host deletes the listing
    const delRes = await hostCtx.request.delete(
      `${BASE_URL.api}/listings/${lid}`
    );
    expect(delRes.status()).toBe(204);

    // Guest's favorites should not include the deleted listing
    const favsRes = await guestCtx.request.get(`${BASE_URL.api}/favorites`);
    const favsData = await favsRes.json();
    const favorites = favsData.favorites || favsData;
    const ids = favorites.map((f: { _id: string }) => f._id);
    expect(ids).not.toContain(lid);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("multiple users favorite same listing concurrently", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Multi Favorite Test",
    });
    const lid = ld._id;

    const guest1Ctx = await browser.newContext();
    await loginAndGetContext(guest1Ctx.request, TEST_USERS.guest);

    const guest2Ctx = await browser.newContext();
    await loginAndGetContext(guest2Ctx.request, TEST_USERS.guest2);

    const [r1, r2] = await Promise.all([
      guest1Ctx.request.post(`${BASE_URL.api}/favorites/${lid}`),
      guest2Ctx.request.post(`${BASE_URL.api}/favorites/${lid}`),
    ]);

    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);

    await hostCtx.close();
    await guest1Ctx.close();
    await guest2Ctx.close();
  });

  test("host favorites their own listing — allowed", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Host Self-Favorite Test",
    });
    const lid = ld._id;

    const res = await hostCtx.request.post(
      `${BASE_URL.api}/favorites/${lid}`
    );
    expect(res.status()).toBe(200);

    // Clean up
    await hostCtx.request.delete(`${BASE_URL.api}/favorites/${lid}`);
    await hostCtx.close();
  });

  test("double-favorite (POST twice) — second returns 400", async ({
    browser,
  }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Double Favorite Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    const first = await guestCtx.request.post(
      `${BASE_URL.api}/favorites/${lid}`
    );
    expect(first.status()).toBe(200);

    const second = await guestCtx.request.post(
      `${BASE_URL.api}/favorites/${lid}`
    );
    expect(second.status()).toBe(400);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("unfavorite when not favorited — returns 400", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Unfavorite Not Favorited Test",
    });
    const lid = ld._id;

    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);

    const res = await guestCtx.request.delete(
      `${BASE_URL.api}/favorites/${lid}`
    );
    expect(res.status()).toBe(400);

    await hostCtx.close();
    await guestCtx.close();
  });

  test("favorites page after favorited listing deleted — clean, no ghosts", async ({
    browser,
  }) => {
    // Host creates two listings
    const hostCtx = await browser.newContext();
    await loginAndGetContext(hostCtx.request, TEST_USERS.host);
    const { data: ld1 } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Fav Ghost Test A",
    });
    const { data: ld2 } = await createListingViaAPI(hostCtx.request, {
      title: "E2E Fav Ghost Test B",
    });
    const lid1 = ld1._id;
    const lid2 = ld2._id;

    // Guest favorites both
    const guestCtx = await browser.newContext();
    await loginAndGetContext(guestCtx.request, TEST_USERS.guest);
    await guestCtx.request.post(`${BASE_URL.api}/favorites/${lid1}`);
    await guestCtx.request.post(`${BASE_URL.api}/favorites/${lid2}`);

    // Host deletes listing A
    await hostCtx.request.delete(`${BASE_URL.api}/listings/${lid1}`);

    // Guest's favorites should only have listing B
    const favsRes = await guestCtx.request.get(`${BASE_URL.api}/favorites`);
    const favsData = await favsRes.json();
    const favorites = favsData.favorites || favsData;
    const ids = favorites.map((f: { _id: string }) => f._id);
    expect(ids).not.toContain(lid1);
    expect(ids).toContain(lid2);

    // Clean up
    await guestCtx.request.delete(`${BASE_URL.api}/favorites/${lid2}`);
    await hostCtx.close();
    await guestCtx.close();
  });
});
