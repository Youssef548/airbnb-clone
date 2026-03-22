import { type APIRequestContext } from "@playwright/test";
import { BASE_URL, TEST_LISTING } from "../fixtures/test-data";

/**
 * Returns a YYYY-MM-DD date string `daysFromNow` days in the future.
 */
export function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

/**
 * Fetches all listing IDs from the API (public endpoint, no auth needed).
 */
export async function getListingIds(
  request: APIRequestContext
): Promise<string[]> {
  const res = await request.get(`${BASE_URL.api}/listings`);
  const data = await res.json();
  // API returns { listings: [...], pagination: {...} } or an array directly
  const listings = data.listings || data;
  return listings.map((l: { _id: string }) => l._id);
}

/**
 * Creates a booking via POST /api/booking.
 * The request context must have an authenticated cookie.
 */
export async function createBookingViaAPI(
  request: APIRequestContext,
  payload: {
    listingId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
  }
) {
  const res = await request.post(`${BASE_URL.api}/booking`, { data: payload });
  return { response: res, data: res.ok() ? await res.json() : null };
}

/**
 * Creates a listing via POST /api/listings.
 * The request context must have an authenticated host cookie.
 */
export async function createListingViaAPI(
  request: APIRequestContext,
  overrides: Partial<typeof TEST_LISTING> = {}
) {
  const data = { ...TEST_LISTING, ...overrides };
  const res = await request.post(`${BASE_URL.api}/listings`, { data });
  return { response: res, data: res.ok() ? await res.json() : null };
}

/**
 * Logs in via API and returns the request context (with cookie set).
 */
export async function loginAndGetContext(
  request: APIRequestContext,
  user: { email: string; password: string }
) {
  const res = await request.post(`${BASE_URL.api}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (!res.ok()) {
    throw new Error(`Login failed for ${user.email}: ${res.status()}`);
  }
  return res;
}
