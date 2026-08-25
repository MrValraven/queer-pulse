import { test, expect } from "@playwright/test";

/**
 * E2E for the message action-overlay affordances (reply / reaction), in DEMO
 * mode. Companion to messaging.spec.ts (open DM -> compose -> send), which
 * deliberately skipped these flows. This file re-attempts them now that
 * Playwright can drive hover + click deterministically — and records, in
 * executable form, exactly how far demo mode lets those flows go.
 *
 * KEY CONSTRAINT discovered by reading the source (do not delete — it explains
 * the fixme's below): in demo mode every message comes straight from the static
 * mock `Conversation.messages` in src/features/messages/data.ts, and NONE of
 * those messages carry a server `id` (the field is documented "Absent for
 * demo/optimistic messages"). The entire action-overlay + reply + reaction
 * surface is HARD-GATED on `message.id`:
 *   - MessageBubble.tsx: `canOpenOverlay = !!message.id` and
 *     `canInteract = canOpenOverlay && !message.deletedAt`. Without an id the
 *     bubble is not focusable (no Enter entry point), swipe/long-press/
 *     right-click gestures are `enabled: false` (useMessageGestures), and the
 *     hover bar's "Reply" button is not even rendered (`onReply` is undefined).
 *   - useMessageActionMenu.ts `openActions()` early-returns when `!message.id`,
 *     so the desktop "More" button (which IS rendered) opens nothing in demo.
 *   - useMessageActions.ts reaction/edit/delete mutations early-return on
 *     `demoMode` (no-op), so even a picked reaction never lands a pill.
 * Optimistic sends don't help: they get a client `localId`, never an `id`, so a
 * freshly-sent demo bubble is equally un-openable.
 *
 * Net effect: the two flows the task asked for — (a) Reply entering composer
 * quote mode, and (b) a reaction pill rendering on a bubble — cannot be driven
 * to their asserted end state in demo. They are NOT flaky; they are
 * structurally impossible here, so they are captured as `test.fixme` with the
 * full intended script, ready to un-fixme against a real backend (live mode,
 * where messages carry ids) or if the demo seed is ever given ids. The ONE
 * genuinely demo-drivable slice of the reaction affordance — the desktop hover
 * action bar revealing and its reaction picker popover opening — is covered as
 * a real, deterministic, passing test below.
 *
 * NOT run in CI — run locally with `pnpm test:e2e` (after `playwright install`).
 * Selectors are resilient (role/label/text), sourced from MessageActions,
 * ReactionPicker, Composer and the `messages` i18n catalog.
 */

/** Opens the "Jordan Park" DM (a plain, always-live demo thread) and waits for
 *  its composer, mirroring messaging.spec.ts's navigation. */
async function openJordanConversation(page: import("@playwright/test").Page) {
  await page.goto("/messages");
  await page
    .getByRole("button", { name: /See you at the book club on Saturday/i })
    .click();
  await expect(page.getByPlaceholder(/Message Jordan/i)).toBeVisible();
}

test("messaging actions: hovering a bubble opens the reaction picker", async ({
  page,
}) => {
  await openJordanConversation(page);

  // Hover a bubble to reveal its desktop action bar. We target the OWN/sent
  // bubble ("Are you going…") on purpose: its text is unique to the thread
  // body, whereas the received line ("See you at the book club…") is also the
  // inbox row's preview, which would make a text lookup ambiguous. The hover
  // bar (React + More) renders on every bubble regardless of `message.id`, and
  // opening the reaction picker is pure local component state — so this slice
  // is deterministic in demo even though picking a reaction is a no-op here.
  const ownBubble = page.getByText(
    "Are you going to the book club on Saturday?",
  );
  await ownBubble.hover();

  // Only the hovered bubble's bar is revealed (CSS `.bubbleWrap:hover`), so of
  // the per-bubble "React" buttons in the DOM exactly one is visible. Narrow to
  // it by role + visibility rather than a hashed CSS-module class.
  const reactButton = page
    .getByRole("button", { name: "React" })
    .and(page.locator(":visible"));
  await expect(reactButton).toBeVisible();
  await reactButton.click();

  // The picker is a labelled toolbar of the six reaction emoji (ReactionPicker:
  // role="toolbar", aria-label "React to message"; each emoji button's
  // aria-label is its reaction key, e.g. "love").
  const reactionPicker = page.getByRole("toolbar", {
    name: "React to message",
  });
  await expect(reactionPicker).toBeVisible();
  await expect(
    reactionPicker.getByRole("button", { name: "love" }),
  ).toBeVisible();
});

// ── Blocked in demo (see the file header) — kept as executable intent ─────────

test.fixme("messaging actions: replying to a message enters composer quote mode", async ({
  page,
}) => {
  // BLOCKED IN DEMO: demo bubbles have no `message.id`, so the hover bar's
  // "Reply" button is not rendered (MessageBubble passes `onReply: undefined`)
  // and no other trigger (long-press/right-click/Enter/swipe) is enabled.
  // With no way to arm a reply, `replyDraft` never sets and the composer's
  // reply-preview banner never opens. This script is the intended flow for
  // LIVE mode (or a demo seed with ids).
  await openJordanConversation(page);

  const receivedBubble = page.getByText("See you at the book club on Saturday");
  await receivedBubble.hover();
  await page
    .getByRole("button", { name: "Reply" })
    .and(page.locator(":visible"))
    .click();

  // Composer.tsx renders a reply-preview banner (quoted sender name + snippet)
  // above the textarea once `replyDraft` is set.
  const replyPreview = page.getByText(/See you at the book club on Saturday/);
  await expect(replyPreview).toBeVisible();

  const composer = page.getByPlaceholder(/Message Jordan/i);
  await composer.fill("Saturday works — see you there!");
  await page.getByRole("button", { name: "Send" }).click();

  // The sent bubble carries its reply context (the quoted snippet) alongside
  // the new text.
  await expect(page.getByText("Saturday works — see you there!")).toBeVisible();
  await expect(
    page.getByText(/See you at the book club on Saturday/),
  ).toBeVisible();
});

test.fixme("messaging actions: picking a reaction renders a pill on the bubble", async ({
  page,
}) => {
  // BLOCKED IN DEMO: the reaction picker OPENS (covered by the passing test
  // above), but picking a reaction calls useMessageActions' toggle mutation,
  // whose demo branch is an explicit no-op (`if (demoMode) return`) — there is
  // no server id to mutate — so no reaction pill is ever appended. This script
  // is the intended flow for LIVE mode (bubbles carry ids; the mutation runs).
  await openJordanConversation(page);

  const ownBubble = page.getByText(
    "Are you going to the book club on Saturday?",
  );
  await ownBubble.hover();
  await page
    .getByRole("button", { name: "React" })
    .and(page.locator(":visible"))
    .click();
  await page
    .getByRole("toolbar", { name: "React to message" })
    .getByRole("button", { name: "love" })
    .click();

  // BubbleReactionStrip renders the toggled reaction as a pill under the
  // bubble (its aria-label carries the reaction key + count).
  await expect(page.getByRole("button", { name: /love/i })).toBeVisible();
});
