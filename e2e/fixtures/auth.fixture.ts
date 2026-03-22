import { test as base, type BrowserContext, type Page } from "@playwright/test";
import { BASE_URL, TEST_USERS } from "./test-data";

/**
 * Login via API and inject the httpOnly cookie into the browser context.
 * Also seeds localStorage with the user data so the Zustand store
 * initializes as logged-in (no flicker/modal popup).
 */
async function loginViaAPI(
  context: BrowserContext,
  page: Page,
  user: { email: string; password: string }
): Promise<void> {
  const response = await context.request.post(`${BASE_URL.api}/auth/login`, {
    data: { email: user.email, password: user.password },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(
      `Login failed for ${user.email}: ${response.status()} ${body}`
    );
  }

  const data = await response.json();
  const currentUser = data.currentUser;

  // Navigate to the app first so we can set localStorage on the correct origin
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Seed localStorage so the Zustand store initializes with the user
  await page.evaluate((userData) => {
    localStorage.setItem("currentUser", JSON.stringify(userData));
  }, currentUser);

  // Reload so the app picks up the localStorage data
  await page.reload({ waitUntil: "domcontentloaded" });
}

/**
 * Dismiss any modal that might be open (e.g., auto-opened login modal).
 * The Modal component closes via the X button or clicking the backdrop overlay.
 * It does NOT respond to Escape key.
 *
 * Waits up to 3s for a modal to appear (handles async 401 interceptor that
 * opens login modal after API responses), then clicks the backdrop to close it.
 */
async function dismissModal(page: Page): Promise<void> {
  const modalOverlay = page.locator(".fixed.inset-0.z-50");

  try {
    // Wait up to 3 seconds for a modal to appear
    await modalOverlay.waitFor({ state: "visible", timeout: 3_000 });
    // Click outside the modal content (on the overlay backdrop) to close it
    await modalOverlay.click({ position: { x: 10, y: 10 } });
    // Wait for the modal close animation (300ms) + buffer
    await page.waitForTimeout(500);
  } catch {
    // No modal appeared within 3 seconds, that's fine
  }
}

type AuthFixtures = {
  guestPage: Page;
  hostPage: Page;
  loggedOutPage: Page;
};

export const test = base.extend<AuthFixtures>({
  guestPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginViaAPI(context, page, TEST_USERS.guest);
    await use(page);
    await context.close();
  },

  hostPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginViaAPI(context, page, TEST_USERS.host);
    await use(page);
    await context.close();
  },

  loggedOutPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
export { loginViaAPI, dismissModal };
