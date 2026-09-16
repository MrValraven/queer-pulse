import { test, expect } from "@playwright/test";

/**
 * E2E for the message action surface (reply / reaction / edit / delete / pin /
 * star), in DEMO mode. Companion to messaging.spec.ts (open DM -> compose ->
 * send), which deliberately skipped these flows.
 *
 * HISTORY: every demo message used to carry no server `id` (documented
 * "Absent for demo/optimistic messages"), which hard-gated the whole action
 * surface off, including `MessageBubble.tsx`'s `canOpenOverlay = !!message.id`,
 * the hover bar's "Reply" button, and `useMessageActionMenu.ts`'s
 * `openActions()`, so the two flows below lived as `test.fixme`. The demo
 * seed now gives every message a stable `demo-msg-<thread>-NNN` id
 * (`src/features/messages/demoDirectThreads.data.ts`,
 * `demoGroupThreads.data.ts`, `demoLongThread.data.ts`), so the gate is open:
 * hovering, the hover bar's Reply/React/More buttons, the desktop context
 * menu (`MessageContextMenu`) and its Edit/Delete/Pin/Star items all render
 * for a real seeded message. `demoTimeline.data.ts`'s `serverFlags()`
 * computes `canEdit`/`canDelete`/`canPin`/`canReport` per message the same
 * way the backend does (author, deleted state, the 15-minute edit window),
 * so the menu's gating is real too.
 *
 * THE WRITE PATH ALSO WORKS NOW: as read from
 * `src/features/messages/api/useMessageActions.ts` and
 * `api/useMessagePinStar.ts`, every mutation's demo branch calls
 * `ensureDemoThreadStore()` (`api/demoThreadCache.ts`) and then runs the SAME
 * cache patch live mode does (`patchMessageReaction`/`patchMessageDelete`/
 * `patchMessageEdit`/`patchMessagePinned`/`patchMessageStarred`), so a demo
 * reaction, edit, delete, pin or star renders exactly like a live one and
 * lasts for the page session. `usePinnedMessages`/`useStarredMessages` no
 * longer hard-disable their query in demo either: both derive their list from
 * the same demo thread store (`demoMessageLists.ts`), so the pinned banner and
 * the Starred modal show the seed's own marks plus anything toggled this
 * session. `useConversationPinStar.ts` hands demo's `active.id` straight
 * through as the conversation id (never the `null` a just-picked live
 * placeholder gets), including for the DMs whose id equals their slug (anika,
 * jordan, kai, maria), so pin/star resolve the right thread there too.
 * `demoTimeline.data.ts`'s `serverFlags()` computes `canEdit`/`canDelete`/
 * `canPin`/`canReport` per message the same way the backend does (author,
 * deleted state, the 15-minute edit window), so the menu's gating is real.
 *
 * NOT run in CI: run locally with `pnpm test:e2e` (after `playwright install`).
 * Selectors are resilient (role/label/text and the message's own DOM id
 * `#message-<id>`), sourced from MessageActions, MessageContextMenu,
 * ReactionPicker, ConversationPinnedBanner, StarredMessagesModal, Composer
 * and the `messages` i18n catalog.
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

/** Opens the "Anika Kovač" DM: favorite, unread, and the thread carrying a
 *  reply quote, a starred message (`demo-msg-anika-001`) and an already-
 *  edited one (`demo-msg-anika-004`, still inside its edit window). */
async function openAnikaConversation(page: import("@playwright/test").Page) {
  await page.goto("/messages");
  await page
    .getByRole("button", {
      name: /Thanks for sending the brunch link, I'll be there/i,
    })
    .click();
  await expect(page.getByPlaceholder(/Message Anika/i)).toBeVisible();
}

/** Opens the "Pride Brunch Crew" group: owned by the viewer, with a message
 *  (`demo-msg-brunch-015`) the seed already marks `pinnedAt`. */
async function openBrunchCrewConversation(
  page: import("@playwright/test").Page,
) {
  await page.goto("/messages");
  await page
    .getByRole("button", {
      name: /The terrace is booked for 11am, see you all there!/i,
    })
    .click();
  await expect(page.getByPlaceholder(/Message the group/i)).toBeVisible();
}

/** Hovers the bubble with this server id to reveal its desktop hover bar,
 *  then clicks "More" to open the cursor-anchored desktop context menu
 *  (`MessageContextMenu`, opened via `source: "pointer"`, the only surface
 *  Playwright's mouse-driven "More" click can reach, as opposed to the
 *  touch-only full-screen `MessageActionOverlay`). Returns the menu's own
 *  locator (`role="menu"`, accessible name "Message actions") so the caller
 *  can pick a menuitem by its accessible name. */
async function openMessageActionsMenu(
  page: import("@playwright/test").Page,
  messageId: string,
) {
  const bubble = page.locator(`#message-${messageId}`);
  await bubble.hover();
  await bubble.getByRole("button", { name: "More" }).click();
  const menu = page.getByRole("menu", { name: "Message actions" });
  await expect(menu).toBeVisible();
  return menu;
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
  // opening the reaction picker is pure local component state, so this slice
  // is deterministic in demo. Picking a reaction here also patches the shared
  // demo cache and renders a reaction pill on the bubble, the same as live.
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
  // accessible name is the translated reaction name, e.g. "Love", with
  // aria-pressed reflecting whether the viewer already holds that reaction).
  const reactionPicker = page.getByRole("toolbar", {
    name: "React to message",
  });
  await expect(reactionPicker).toBeVisible();
  await expect(
    reactionPicker.getByRole("button", { name: "Love", exact: true }),
  ).toBeVisible();
});

// ── Un-fixme'd now that every demo message carries a stable id ────────────────

test("messaging actions: replying to a message enters composer quote mode", async ({
  page,
}) => {
  await openJordanConversation(page);

  // Hover the received bubble by its own DOM id (`#message-demo-msg-jordan-
  // 002`): the same text is also the inbox row's preview line, still on
  // screen in the two-pane desktop layout, so a text lookup would match both.
  const receivedBubble = page.locator("#message-demo-msg-jordan-002");
  await receivedBubble.hover();
  await receivedBubble.getByRole("button", { name: "Reply" }).click();

  // Composer.tsx renders a reply-preview banner (quoted sender name + snippet)
  // above the textarea once `replyDraft` is set. Its close button ("Cancel
  // reply") is unique to that banner, so scoping through it avoids the same
  // duplicated-text ambiguity as the hover target above.
  const cancelReplyButton = page.getByRole("button", { name: "Cancel reply" });
  await expect(cancelReplyButton).toBeVisible();
  const replyPreviewBanner = cancelReplyButton.locator("..");
  await expect(
    replyPreviewBanner.getByText("See you at the book club on Saturday"),
  ).toBeVisible();

  const composer = page.getByPlaceholder(/Message Jordan/i);
  const outgoing = "Saturday works, see you there!";
  await composer.fill(outgoing);
  await page.getByRole("button", { name: "Send" }).click();

  // The reply banner closes and the sent bubble appears once the send goes
  // through.
  await expect(cancelReplyButton).not.toBeVisible();
  await expect(page.getByText(outgoing)).toBeVisible();
});

test("messaging actions: picking a reaction renders a pill on the bubble", async ({
  page,
}) => {
  // The reaction picker opening is already covered by the passing test above;
  // this one additionally exercises `useToggleReaction`'s demo branch, which
  // patches the cache the same way live mode does (see the file header), so
  // picking a reaction here renders a real pill.
  await openJordanConversation(page);

  const ownBubble = page.locator("#message-demo-msg-jordan-001");
  await ownBubble.hover();
  await ownBubble.getByRole("button", { name: "React" }).click();
  await page
    .getByRole("toolbar", { name: "React to message" })
    .getByRole("button", { name: "Love", exact: true })
    .click();

  // BubbleReactionStrip renders the toggled reaction as a pill under the
  // bubble (its accessible name is the translated reaction name, pluralized
  // count, and whether the viewer reacted, e.g. "Love, 1 reaction, including
  // yours").
  await expect(ownBubble.getByRole("button", { name: /Love/ })).toBeVisible();
});

test("messaging actions: editing a message updates its bubble text", async ({
  page,
}) => {
  // Opening the inline editor is pure local component state; saving calls
  // `useEditMessage`'s demo branch, which patches the cache in place (see the
  // file header), so the bubble's text really changes.
  await openAnikaConversation(page);

  const bubble = page.locator("#message-demo-msg-anika-004");
  const originalText =
    "That would be amazing, yes please. And I saw the brunch is confirmed: https://queerpulse.example/pride-brunch";
  await expect(bubble.getByText(originalText)).toBeVisible();

  const menu = await openMessageActionsMenu(page, "demo-msg-anika-004");
  await menu.getByRole("menuitem", { name: "Edit", exact: true }).click();

  // MessageBubble swaps its content for `InlineEditField`'s `MentionTextarea`
  // (role="combobox") while `editingMessageId` matches this message.
  const editField = bubble.getByRole("combobox");
  await expect(editField).toBeVisible();
  const editedText =
    "That would be amazing, yes please. And the brunch is confirmed. See you Thursday!";
  await editField.fill(editedText);
  await bubble.getByRole("button", { name: "Save" }).click();

  await expect(bubble.getByText(editedText)).toBeVisible();
  await expect(bubble.getByText(originalText)).toHaveCount(0);
});

test("messaging actions: deleting a message for everyone shows a tombstone", async ({
  page,
}) => {
  // `useDeleteMessage`'s demo branch patches the cache the same way live
  // mode does (see the file header), so confirming here really tombstones
  // the bubble.
  await openJordanConversation(page);

  const originalText = "Are you going to the book club on Saturday?";
  const bubble = page.locator("#message-demo-msg-jordan-001");
  await expect(bubble.getByText(originalText)).toBeVisible();

  const menu = await openMessageActionsMenu(page, "demo-msg-jordan-001");
  await menu.getByRole("menuitem", { name: "Delete", exact: true }).click();

  const confirmDialog = page.getByRole("dialog", {
    name: "Delete this message?",
  });
  await expect(confirmDialog).toBeVisible();
  await confirmDialog
    .getByRole("button", { name: "Delete", exact: true })
    .click();

  // BubbleTombstone replaces the bubble's own DOM id with a plain placeholder
  // (no `id`), so this looks for the tombstone text at the page level rather
  // than through the now-gone `#message-demo-msg-jordan-001` scope. The
  // 2-message Jordan thread has only one tombstone once this runs, so the
  // text stays unambiguous.
  await expect(page.getByText("This message was deleted")).toBeVisible();
  await expect(page.getByText(originalText)).toHaveCount(0);
});

test("messaging actions: a pinned message shows in the pinned banner", async ({
  page,
}) => {
  // Reads a message the seed already marks `pinnedAt` (`demo-msg-brunch-015`
  // in demoGroupThreads.data.ts) rather than toggling Pin from the menu, so
  // this covers the seed's own pinned mark surfacing through
  // `usePinnedMessages` on a freshly opened thread. The toggle round trip
  // (Pin then Unpin from the menu) is covered separately below.
  await openBrunchCrewConversation(page);

  await expect(
    page.getByRole("button", {
      name: /Jump to pinned message: The terrace is booked for 11am/i,
    }),
  ).toBeVisible();
});

test("messaging actions: a starred message shows in the Starred messages modal", async ({
  page,
}) => {
  // Reads a message the seed already marks `starred` (`demo-msg-anika-001` in
  // demoDirectThreads.data.ts) rather than starring one from the menu, so
  // this covers the seed's own starred mark surfacing through
  // `useStarredMessages` on a freshly opened modal. The toggle round trip
  // (Star then Unstar from the menu) is covered separately below.
  await openAnikaConversation(page);

  await page.getByRole("button", { name: "Starred messages" }).click();

  const starredModal = page.getByRole("dialog", { name: "Starred messages" });
  await expect(starredModal).toBeVisible();
  await expect(
    starredModal.getByText("Nothing starred yet.", { exact: false }),
  ).not.toBeVisible();
  await expect(
    starredModal.getByRole("button", { name: /Anika Kovač/i }),
  ).toBeVisible();
});

test("messaging actions: pinning a message from the menu shows it in the banner, unpinning removes it", async ({
  page,
}) => {
  // demo-msg-jordan-002 starts with no seeded pin, and the Jordan DM has no
  // other pinned message, so the banner's presence is entirely this toggle's
  // doing. The viewer is an active participant in every DM, so `canPin` is
  // true (demoTimeline.data.ts's `serverFlags()`).
  await openJordanConversation(page);

  const pinnedBanner = page.getByRole("button", {
    name: /Jump to pinned message: See you at the book club on Saturday/i,
  });
  await expect(pinnedBanner).not.toBeVisible();

  let menu = await openMessageActionsMenu(page, "demo-msg-jordan-002");
  await menu.getByRole("menuitem", { name: "Pin", exact: true }).click();
  await expect(pinnedBanner).toBeVisible();

  menu = await openMessageActionsMenu(page, "demo-msg-jordan-002");
  await menu.getByRole("menuitem", { name: "Unpin", exact: true }).click();
  await expect(pinnedBanner).not.toBeVisible();
});

test("messaging actions: starring a message from the menu lists it, unstarring removes it", async ({
  page,
}) => {
  // demo-msg-jordan-001 starts unstarred, unlike demo-msg-anika-001 above
  // (already seeded `starred: true`), so this exercises the toggle mutation
  // itself rather than the seed's own mark.
  await openJordanConversation(page);

  let menu = await openMessageActionsMenu(page, "demo-msg-jordan-001");
  await menu.getByRole("menuitem", { name: "Star", exact: true }).click();

  await page.getByRole("button", { name: "Starred messages" }).click();
  let starredModal = page.getByRole("dialog", { name: "Starred messages" });
  await expect(starredModal).toBeVisible();
  await expect(
    starredModal.getByRole("button", { name: /Jordan Park/i }),
  ).toBeVisible();
  await starredModal.getByRole("button", { name: "Close" }).click();

  menu = await openMessageActionsMenu(page, "demo-msg-jordan-001");
  await menu.getByRole("menuitem", { name: "Unstar", exact: true }).click();

  await page.getByRole("button", { name: "Starred messages" }).click();
  starredModal = page.getByRole("dialog", { name: "Starred messages" });
  await expect(starredModal).toBeVisible();
  await expect(
    starredModal.getByRole("button", { name: /Jordan Park/i }),
  ).not.toBeVisible();
});
