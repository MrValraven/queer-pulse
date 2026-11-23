import { test, expect } from "@playwright/test";

/**
 * Happy-path E2E for the request-invite (onboarding) flow, in DEMO mode.
 * Run locally with `pnpm test:e2e` (after `playwright install`); CI skips it.
 *
 * Fills the form, asks for the code that confirms the address (SEC-10), types
 * it back and asserts the branded success panel ("You're on the list.")
 * replaces the form, so the whole submit, code and success flow works end to
 * end. Demo mode accepts any six digits except 000000.
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
  await page.getByPlaceholder(/A friend, a post/i).fill("A friend");

  // Consent ticks only once the guidelines are read to the end: open them,
  // scroll the dialog to its last clause, then confirm.
  await page.getByRole("button", { name: "community guidelines" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.evaluate((node) => {
    for (const element of [node, ...node.querySelectorAll("*")]) {
      element.scrollTop = element.scrollHeight;
    }
  });
  const done = page.getByRole("button", { name: "I've read it, done" });
  await expect(done).toBeEnabled();
  await done.click();
  await expect(page.locator("#ri-agree")).toBeChecked();
  await page.locator("#ri-age").check();

  await page.getByRole("button", { name: /Email me a code/i }).click();

  // The code step: the first box takes focus and the sixth digit checks it.
  const firstDigit = page.locator('input[autocomplete="one-time-code"]');
  await expect(firstDigit).toBeFocused();
  await page.keyboard.type("123456");

  await expect(page.getByText(/You're on the/i)).toBeVisible();
});
