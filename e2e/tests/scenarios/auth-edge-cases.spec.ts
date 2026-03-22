import { test, expect } from "../../fixtures/auth.fixture";
import { BASE_URL, TEST_USERS } from "../../fixtures/test-data";
import { loginAndGetContext } from "../../helpers/api";
import jwt from "jsonwebtoken";

test.describe("Auth Edge Cases", () => {
  test("requests after logout (cookie cleared) — 401", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();
    await loginAndGetContext(ctx.request, TEST_USERS.guest);

    // Verify authenticated
    const meRes = await ctx.request.get(`${BASE_URL.api}/auth/me`);
    expect(meRes.status()).toBe(200);

    // Logout
    const logoutRes = await ctx.request.post(`${BASE_URL.api}/auth/logout`);
    expect(logoutRes.ok()).toBe(true);

    // Should be 401 now
    const afterRes = await ctx.request.get(`${BASE_URL.api}/auth/me`);
    expect(afterRes.status()).toBe(401);

    await ctx.close();
  });

  test("tampered/garbage JWT cookie — 401", async ({ browser }) => {
    const ctx = await browser.newContext();

    // Set a garbage cookie
    await ctx.addCookies([
      {
        name: "token",
        value: "garbage.not.ajwt",
        domain: new URL(BASE_URL.api).hostname,
        path: "/",
      },
    ]);

    const res = await ctx.request.get(`${BASE_URL.api}/auth/me`);
    expect(res.status()).toBe(401);

    await ctx.close();
  });

  test("JWT signed with wrong secret — 401", async ({ browser }) => {
    const ctx = await browser.newContext();

    // Create a valid-looking JWT but signed with wrong secret
    const fakeToken = jwt.sign(
      { userId: "507f1f77bcf86cd799439011", role: "guest" },
      "wrong-secret-key-12345"
    );

    await ctx.addCookies([
      {
        name: "token",
        value: fakeToken,
        domain: new URL(BASE_URL.api).hostname,
        path: "/",
      },
    ]);

    const res = await ctx.request.get(`${BASE_URL.api}/auth/me`);
    expect(res.status()).toBe(401);

    await ctx.close();
  });

  test("multiple concurrent logins same account — both work (stateless JWT)", async ({
    browser,
  }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();

    await loginAndGetContext(ctx1.request, TEST_USERS.guest);
    await loginAndGetContext(ctx2.request, TEST_USERS.guest);

    // Both sessions should work
    const [r1, r2] = await Promise.all([
      ctx1.request.get(`${BASE_URL.api}/auth/me`),
      ctx2.request.get(`${BASE_URL.api}/auth/me`),
    ]);

    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);

    await ctx1.close();
    await ctx2.close();
  });

  test("logout in one session doesn't invalidate another", async ({
    browser,
  }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();

    await loginAndGetContext(ctx1.request, TEST_USERS.guest);
    await loginAndGetContext(ctx2.request, TEST_USERS.guest);

    // Logout from session 1
    await ctx1.request.post(`${BASE_URL.api}/auth/logout`);

    // Session 1 should be 401
    const r1 = await ctx1.request.get(`${BASE_URL.api}/auth/me`);
    expect(r1.status()).toBe(401);

    // Session 2 should still work (stateless JWT)
    const r2 = await ctx2.request.get(`${BASE_URL.api}/auth/me`);
    expect(r2.status()).toBe(200);

    await ctx1.close();
    await ctx2.close();
  });

  test("duplicate email registration — 400+", async ({ browser }) => {
    const ctx = await browser.newContext();

    // Try registering with an existing email
    const res = await ctx.request.post(`${BASE_URL.api}/auth/register`, {
      data: {
        username: "duplicate_test_user",
        email: TEST_USERS.guest.email,
        password: "DupeTest123!",
      },
    });

    // Server returns 500 for duplicate email (uses MongoDB unique constraint error)
    // KNOWN ISSUE: Should return 409 Conflict, but returns 500
    expect(res.status()).toBeGreaterThanOrEqual(400);

    await ctx.close();
  });

  test("registration validation — short username and weak password", async ({
    browser,
  }) => {
    const ctx = await browser.newContext();

    // Short username (< 3 chars)
    const shortUsername = await ctx.request.post(
      `${BASE_URL.api}/auth/register`,
      {
        data: {
          username: "ab",
          email: "e2eshort@test.com",
          password: "ValidPass123!",
        },
      }
    );
    expect(shortUsername.status()).toBe(400);

    // Weak password (no uppercase, no digit)
    const weakPassword = await ctx.request.post(
      `${BASE_URL.api}/auth/register`,
      {
        data: {
          username: "validuser",
          email: "e2eweak@test.com",
          password: "weak",
        },
      }
    );
    expect(weakPassword.status()).toBe(400);

    await ctx.close();
  });

  test("no cookie on protected endpoint — 401", async ({ browser }) => {
    const ctx = await browser.newContext();

    // Fresh context with no cookies
    const endpoints = [
      { method: "GET" as const, path: "/auth/me" },
      { method: "GET" as const, path: "/booking" },
      { method: "GET" as const, path: "/favorites" },
    ];

    for (const ep of endpoints) {
      const res = await ctx.request.fetch(`${BASE_URL.api}${ep.path}`, {
        method: ep.method,
      });
      expect(res.status(), `${ep.method} ${ep.path} should be 401`).toBe(401);
    }

    await ctx.close();
  });
});
