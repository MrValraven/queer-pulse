import { test, expect } from "@playwright/test";

/**
 * Happy-path E2E for the request-invite (onboarding) flow, in DEMO mode.
 * NOT run in CI — run locally with `pnpm test:e2e` (after `playwright install`).
 *
 * Fills the form and asserts the branded success panel ("You're on the list.")
 * replaces it — i.e. the whole submit→success flow works end to end, not a stub.
 */
test("request-invite: filling the form shows the success panel", async ({
  page,
}) => {
  await page.goto("/auth/request-invite");

  await page.getByPlaceholder("Alex").fill("Sam Rivers");
  await page.getByPlaceholder("Lisbon").fill("Porto");
  await page.getByPlaceholder("you@example.com").fill("sam@example.com");
  await page
    .getByPlaceholder(/What you're looking for/i)
    .fill("Looking for a warm queer community to build with.");

  // Consent + age gates (both required for the submit button to enable).
  await page.locator("#ri-agree").check();
  await page.locator("#ri-age").check();

  await page.getByRole("button", { name: /Send my request/i }).click();

  await expect(page.getByText(/You're on the/i)).toBeVisible();
});
