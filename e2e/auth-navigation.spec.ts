import { test, expect } from "@playwright/test";

/**
 * E2E for authenticated access + navigation, in DEMO mode (tracker X-3).
 * NOT run in CI — run locally with `pnpm test:e2e` (after `playwright install`).
 *
 * There is no real backend sign-in in demo mode: `AuthProvider` auto-provides a
 * logged-in mock member ("Tiago") synchronously (getInitialLoggedIn defaults to
 * true). So rather than a credential flow the specs below exercise what demo can
 * genuinely produce — the walled-garden auth gate (authGate.ts) as seen by an
 * already-authenticated member:
 *
 *  1. A GATED route (/feed) renders the member app shell for the demo user
 *     (identity + logged-in nav chrome) instead of bouncing to sign-in.
 *  2. Navigating the app shell: the top-nav Messages link moves between two
 *     gated surfaces and the messages inbox renders.
 *  3. A GUEST-ONLY route (/auth/sign-in) redirects the signed-in member to their
 *     feed — the mirror image of the gate, and the one "sign-in" behaviour demo
 *     can actually drive.
 *
 * Selectors are resilient: the feed greeting text, the nav `<Link aria-label>`
 * ("Messages"), and the inbox search placeholder (unique to the messages page).
 */

test("auth: a gated route renders the member shell for the demo user", async ({
  page,
}) => {
  await page.goto("/feed");

  // We stayed on the gated route (not bounced to /auth/sign-in?next=/feed).
  await expect(page).toHaveURL(/\/feed$/);

  // The demo member's identity renders in the feed greeting.
  await expect(page.getByText("Tiago").first()).toBeVisible();

  // The logged-in nav chrome (Messages link) is present.
  await expect(
    page.getByRole("link", { name: "Messages" }).first(),
  ).toBeVisible();
});

test("auth: navigating the app shell reaches another gated surface", async ({
  page,
}) => {
  await page.goto("/feed");

  // Use the real nav affordance rather than a raw goto. The top-nav link and the
  // (mobile) bottom-tab link share the "Messages" label; either lands on the
  // same route, so `.first()` is safe.
  await page.getByRole("link", { name: "Messages" }).first().click();

  await expect(page).toHaveURL(/\/messages$/);
  // The inbox search box is unique to the messages page — a stable render signal.
  await expect(
    page.getByPlaceholder(/Search messages and people/i),
  ).toBeVisible();
});

test("auth: a guest-only sign-in page redirects the signed-in member to the feed", async ({
  page,
}) => {
  await page.goto("/auth/sign-in");

  // The demo member is already authenticated, so the guest-only gate bounces
  // them to their feed (safeNext default).
  await expect(page).toHaveURL(/\/feed$/);
});
