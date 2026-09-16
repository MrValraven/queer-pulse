import { test, expect } from "@playwright/test";

/**
 * E2E for the message log's scroll behaviour, in DEMO mode: the unread
 * divider, loading older history, and the jump-to-latest pill. Companion to
 * messaging.spec.ts (open DM -> compose -> send) and messaging-actions.spec.ts
 * (the per-message action surface), which don't touch scroll.
 *
 * Every spec below opens the seeded "Maria Ferreira" DM
 * (`DEMO_LONG_THREAD_CONVERSATION_ID = "maria"`,
 * `src/features/messages/demoLongThread.data.ts`): 48 messages over three
 * days, the last 9 unread, with the unread divider latching in front of
 * `demo-msg-maria-040` ("That's such good news!"). It's the only demo thread
 * long enough to overflow the viewport and exercise scroll, load-older and
 * the divider at all; every other seeded DM/group is a handful of messages.
 *
 * DEMO PAGING: as read from `src/features/messages/api/useMessageThread.ts`
 * and `api/demoThreadCache.ts`, demo history now rides the SAME infinite
 * query live mode does, over a local session-store copy of the seeded
 * thread: the newest `DEMO_THREAD_PAGE_SIZE` (30) messages load first, then
 * 30 older ones per `onLoadOlder()` request, each taking
 * `DEMO_OLDER_PAGE_DELAY_MS` (400ms) to "arrive" so the load-older spinner
 * and the prepend anchor run through a real in-flight state. Maria's 48
 * messages therefore load as two pages (the newest 30, then the remaining
 * 18), so the oldest seeded message genuinely is not in the DOM until the
 * reader scrolls to load it.
 *
 * NOT run in CI: run locally with `pnpm test:e2e` (after `playwright install`).
 * Selectors are resilient (role/label/text), sourced from `MessageArea`
 * (`role="log"`), `MessageAreaRow` (the unread divider, `role="separator"`),
 * `ComposerDockContent` (the jump pill) and the `messages` i18n catalog.
 *
 * The "receiving a message while scrolled up" spec below relies on
 * `useDemoInboundMessageSimulation` (`useDemoSignalSimulation.ts`): demo mode
 * has no socket, so nothing else ever adds a message to an already-open
 * thread. That hook delivers ONE genuine inbound message into this same Maria
 * thread a fixed `DEMO_INBOUND_MESSAGE_DELAY_MS` (1.5s) after it opens,
 * through the real `upsertMessage` cache patch a live `message:new` frame
 * uses, so it exercises the actual jump-pill code path rather than a
 * test-only shortcut.
 */

/** Dismisses the app-wide `ConsentBanner` (a fresh browser profile has no
 *  stored choice, so it renders on every cold `page.goto`) before anything
 *  below the fold is clicked; left showing, it sits over the composer dock
 *  and intercepts the jump pill / send button clicks scroll specs below rely on.
 *  A no-op (short timeout, swallowed) if a persisted profile already carries
 *  a choice and the banner never renders. */
async function dismissConsentBanner(page: import("@playwright/test").Page) {
  await page
    .getByRole("button", { name: "Accept", exact: true })
    .click({ timeout: 3000 })
    .catch(() => {});
}

/** Opens the "Maria Ferreira" DM (the long, 48-message, 9-unread thread) and
 *  waits for its composer. */
async function openMariaConversation(page: import("@playwright/test").Page) {
  await page.goto("/messages");
  await dismissConsentBanner(page);
  await page
    .getByRole("button", {
      name: /Thank you for doing all of this, truly/i,
    })
    .click();
  await expect(page.getByPlaceholder(/Message Maria/i)).toBeVisible();
}

/** The scrolling message log (`MessageArea.tsx`'s `.area`, `role="log"`). */
function messageArea(page: import("@playwright/test").Page) {
  return page.getByRole("log");
}

test("messaging scroll: opening a long unread thread lands on the unread divider", async ({
  page,
}) => {
  await openMariaConversation(page);

  // useUnreadDivider.ts latches the divider in front of the first of Maria's
  // nine unread lines, and useUnreadLanding.ts scrolls it into view (with a
  // little context above it) the moment the thread opens, instead of landing
  // on the newest message.
  await expect(
    page.getByRole("separator", { name: "New messages start here" }),
  ).toBeVisible();

  // demo-msg-maria-040 ("That's such good news!") is the message the divider
  // precedes (demoLongThread.data.ts: "the divider lands on the first of
  // Maria's nine newer lines"), so it's on screen alongside it once the
  // landing settles.
  await expect(page.getByText("That's such good news!")).toBeVisible();
});

test("messaging scroll: scrolling to the top loads older messages", async ({
  page,
}) => {
  await openMariaConversation(page);

  // Wait for the initial unread landing to settle first: it owns the
  // viewport for up to its own deadline right after the thread opens, and a
  // manual scroll before then would race its own scroll-position write.
  await expect(
    page.getByRole("separator", { name: "New messages start here" }),
  ).toBeVisible();

  const area = messageArea(page);
  const oldestText =
    "Hi Maria, thanks again for making time. Is now still a good moment to go through the healthcare list?";

  // Demo history pages the newest 30 of the thread's 48 messages first
  // (`DEMO_THREAD_PAGE_SIZE`, demoThreadCache.ts), so the oldest seeded
  // message is entirely absent from the DOM before the older page loads.
  await expect(page.getByText(oldestText)).toHaveCount(0);

  // The message log is virtualized (`@tanstack/react-virtual`), so a single
  // `scrollTop` write can land a frame before newly-measured rows settle
  // into their final offsets, and the older-page request takes
  // `DEMO_OLDER_PAGE_DELAY_MS` to resolve. Retry the whole scroll-and-check
  // as one unit rather than sleeping a fixed amount.
  await expect(async () => {
    await area.evaluate((element) => {
      element.scrollTop = 0;
    });
    await expect(page.getByText(oldestText)).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
});

test("messaging scroll: receiving a message while scrolled up shows the jump pill and clicking it returns to the bottom", async ({
  page,
}) => {
  // `useMessageScroll.ts`'s jump-pill counter only ever increments on a
  // genuinely inbound ("them") arrival while the reader is scrolled away
  // from the bottom; that file's own comment says so directly: "Only
  // inbound arrivals count as 'new' on the pill; my own sends ... never
  // do." `useDemoInboundMessageSimulation` (see this file's header) is what
  // supplies that arrival in demo: it delivers one message into THIS SAME
  // Maria thread `DEMO_INBOUND_MESSAGE_DELAY_MS` after it opens, through the
  // real `upsertMessage` cache patch a live `message:new` frame uses.
  await openMariaConversation(page);
  await expect(
    page.getByRole("separator", { name: "New messages start here" }),
  ).toBeVisible();

  // Scroll to the middle of the loaded content: away from the bottom (so a
  // stick-to-bottom auto-follow, if one fired, would be visible as a jump)
  // and away from `handleAreaScroll`'s near-top load-older threshold
  // (`scrollTop <= 48`, useMessageScroll.ts), which would otherwise
  // interleave an unrelated older-page prepend with the scroll-position
  // assertions below.
  const area = messageArea(page);
  await area.evaluate((element) => {
    element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
  });

  // The simulated inbound message lands here, a fixed ~1.5s after the thread
  // opened; a generous bounded timeout comfortably covers that fixed delay
  // without depending on a random or recurring timer. The count-prefixed
  // pattern (`{count} new message(s)`, `messages:conversation.newMessagesCount`)
  // is required to stay clear of the sidebar's own always-present "New
  // message" compose button, a distinct control with no leading count.
  const jumpPill = page.getByRole("button", { name: /^\d+ new messages?$/i });
  await expect(jumpPill).toBeVisible({ timeout: 5000 });
  await jumpPill.click();

  await expect(jumpPill).not.toBeVisible();
  // `jumpToLatest` (useMessageScroll.ts) requests a SMOOTH glide for this
  // explicit, user-initiated jump (every other pin in that hook is instant),
  // so the scroller keeps moving for a moment after the pill itself is
  // already gone. Poll rather than reading `scrollTop` the instant after the
  // click, which would race the animation and read a mid-glide value.
  await expect(async () => {
    const distanceFromBottom = await area.evaluate(
      (element) =>
        element.scrollHeight - element.scrollTop - element.clientHeight,
    );
    expect(distanceFromBottom).toBeLessThan(4);
  }).toPass({ timeout: 2000 });
});

test("messaging scroll: sending a message while scrolled away from the bottom keeps the reader's place", async ({
  page,
}) => {
  await openMariaConversation(page);
  await expect(
    page.getByRole("separator", { name: "New messages start here" }),
  ).toBeVisible();

  // Scroll to the middle of the loaded content: away from the bottom, and
  // away from `handleAreaScroll`'s near-top load-older threshold
  // (`scrollTop <= 48`, useMessageScroll.ts), so an unrelated older-page
  // prepend can't shift `scrollTop` out from under this test's own
  // before/after comparison.
  const area = messageArea(page);
  await area.evaluate((element) => {
    element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
  });
  const scrollTopBeforeSend = await area.evaluate(
    (element) => element.scrollTop,
  );

  const composer = page.getByPlaceholder(/Message Maria/i);
  const outgoing = "Just checking in from up here in the thread.";
  await composer.fill(outgoing);
  // Exact: Anika's inbox row preview ("Thanks for sending the brunch link…")
  // contains "sending", which a plain substring match on "Send" also picks up.
  await page.getByRole("button", { name: "Send", exact: true }).click();

  // The message sends (it's in the DOM, even scrolled out of view), but
  // useMessageScroll.ts's content effect only sticks to the bottom, or shows
  // the jump pill, for a genuinely inbound arrival or for growth seen while
  // the reader was already pinned to the bottom. A reader's own send from
  // away from the bottom moves neither: the scroller stays where it was, and
  // no jump pill appears.
  await expect(page.getByText(outgoing)).toBeAttached();
  const scrollTopAfterSend = await area.evaluate(
    (element) => element.scrollTop,
  );
  expect(scrollTopAfterSend).toBeLessThan(scrollTopBeforeSend + 50);
  await expect(
    page.getByRole("button", { name: /^\d+ new messages?$/i }),
  ).not.toBeVisible();
});

test("messaging scroll: the New messages divider has an accessible name", async ({
  page,
}) => {
  await openMariaConversation(page);

  // Covered incidentally by the unread-landing spec above too; this spec
  // documents the accessible-name contract on its own: the divider's visible
  // label is decorative (`aria-hidden`), and `role="separator"` plus
  // `aria-label={t("messages:conversation.unreadDividerAria")}` carries the
  // name a screen reader announces (MessageAreaRow.tsx).
  await expect(
    page.getByRole("separator", { name: "New messages start here" }),
  ).toBeVisible();
});
