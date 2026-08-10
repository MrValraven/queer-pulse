import { test, expect } from "@playwright/test";

/**
 * Happy-path E2E for the direct-messaging flow, in DEMO mode (tracker X-3).
 * NOT run in CI — run locally with `pnpm test:e2e` (after `playwright install`).
 *
 * Drives the real messaging UI against the static demo inbox: opens a DM
 * conversation from the inbox list, types into the composer, sends, and asserts
 * the sent message renders as a bubble in the thread — i.e. the whole
 * open→compose→send loop works end to end, not a stub. Demo mode appends the
 * message optimistically with no backend, so the flow is deterministic.
 *
 * Selectors are resilient (role/placeholder/text), targeting genuine surfaces:
 *  - the inbox row `<button>` (accessible name carries the row's preview line),
 *  - the composer textarea (placeholder "Message {firstName}…"),
 *  - the send `<button aria-label="Send">`,
 * all sourced from src/features/messages (MessagesThreadRow, Composer) and the
 * `messages` i18n catalog. "Jordan Park" is a plain (non-blocked, non-official,
 * non-group) demo DM, so the composer is always live.
 */
test("messaging: sending a message adds a bubble to the conversation", async ({
  page,
}) => {
  await page.goto("/messages");

  // Open the "Jordan Park" DM from the inbox. The row button's accessible name
  // includes its unique preview line, so we target that rather than the name
  // alone (the auto-selected group thread also surfaces Jordan as a sender).
  await page
    .getByRole("button", { name: /See you at the book club on Saturday/i })
    .click();

  // The conversation is open once its composer (placeholder "Message Jordan…")
  // is on screen.
  const composer = page.getByPlaceholder(/Message Jordan/i);
  await expect(composer).toBeVisible();

  const outgoing = "Playwright says hi — see you Saturday!";
  await composer.fill(outgoing);

  // The send control is an icon button labelled "Send" (messages:conversation.send).
  await page.getByRole("button", { name: "Send" }).click();

  // The optimistic bubble appears in the thread with exactly what we typed.
  await expect(page.getByText(outgoing)).toBeVisible();
});
