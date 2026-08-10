import { test, expect } from "@playwright/test";

/**
 * Happy-path E2E for the moderation surfaces, in DEMO mode (tracker X-3).
 * NOT run in CI — run locally with `pnpm test:e2e` (after `playwright install`).
 *
 * Two complementary halves of moderation, both demo-drivable with no backend:
 *
 *  1. REPORTING (member side) — the standalone report form at /safety/report.
 *     `useCreateReport` resolves locally in demo (a simulated round-trip, no
 *     network) and, on success, the form clears its fields. We fill + submit and
 *     assert the "involved" field resets — a persistent, deterministic signal
 *     the submit actually completed (the success toast is transient).
 *
 *  2. TRIAGE (moderator side) — the admin moderation queue at /admin/moderation.
 *     Demo defaults the simulated team role to `admin` (features/admin/adminRole.ts)
 *     and the auth gate is bypassed in demo+dev (authGate.ts), so the console
 *     renders directly off the mock report seed (adminModeration.data.ts). We
 *     assert the queue renders, open a report row, and assert its decision
 *     drawer opens.
 *
 * Selectors target real controls: the FormField-labelled <select>/<input>, the
 * "Submit report" button, the report card's `<button>` (accessible name carries
 * its title + preview), and the drawer `role="dialog"` with its decision CTA.
 */

test("moderation: submitting the report form clears it on success", async ({
  page,
}) => {
  await page.goto("/safety/report");

  // Category is a labelled <select> (FormField wires the <label htmlFor>).
  await page
    .getByLabel("What are you reporting?")
    .selectOption({ label: "Harassment or threats" });

  const involved = page.getByLabel(/Member or content involved/i);
  await involved.fill("@troublemaker");

  await page.getByRole("button", { name: "Submit report" }).click();

  // Demo resolves the report locally; the form's success handler resets its
  // fields, so the "involved" input goes back to empty. Playwright polls, so the
  // ~650ms simulated latency is absorbed.
  await expect(involved).toHaveValue("");
});

test("moderation: opening a queued report reveals its decision drawer", async ({
  page,
}) => {
  await page.goto("/admin/moderation");

  // The queue renders with the mock seed (demo admin role, gate bypassed).
  await expect(page.getByText("Moderation queue")).toBeVisible();

  // Open a report card. The card's main <button> accessible name carries the
  // report title, which is unique in the seed.
  await page
    .getByRole("button", {
      name: /Repeated unwanted DMs after being asked to stop/i,
    })
    .click();

  // The decision drawer opens: a modal dialog with the action grid and its
  // confirm CTA (admin:moderation.reportDrawer.*).
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText(/Take a decision/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirm & notify member" }),
  ).toBeVisible();
});
