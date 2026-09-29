import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { apiGet } from "./client";
import { toPage } from "./pagination";
import type {
  MessageReactionKey,
  MessageResponse,
  Paginated,
  ReactionSummary,
} from "../contracts/contracts";
import {
  groupInitials,
  lastMessageMailboxFields,
  messageDisplayText,
  previewForMessage,
  timeLabel,
  type ConversationWithPreview,
  type LastMessageMailboxFields,
} from "../../features/messages/api/messages.adapters";
import type { Conversation } from "../../features/messages/data";
import { isCaptionEditKind } from "../../features/messages/messageEditKinds";

// ── Message-thread cache patches ─────────────────────────────────────────────
// The messages page keeps HTTP authoritative but avoids a blanket
// `invalidateQueries(["messages", convId])` for every reaction / edit / delete /
// inbound socket frame — a full refetch adds latency, flickers the list, and
// churns the scroll anchor. Instead we patch the `useInfiniteQuery` cache in
// place, mirroring the delete-conversation hook's `setQueriesData` pattern.
//
// The thread's query key is `["messages", conversationId, demoMode]`; a
// PREFIX filter (`["messages", conversationId]`) matches it regardless of the
// demoMode suffix. In demo mode the same query pages a local session store of
// the seeded thread, kept at `["messages", conversationId, "demo-store"]`
// (`features/messages/api/demoThreadCache.ts`). The prefix matches that entry
// too, so every helper here patches a demo thread and its store exactly as it
// patches a live thread.

/** One page of the infinite thread query (see `useMessageThread`). A page of
 *  a PRD-401 detached history window (`features/messages/api/threadWindow.ts`)
 *  also carries `newerCursor`, set while newer history remains unfetched. */
interface MessagePage {
  items: MessageResponse[];
  nextCursor: string | null;
  newerCursor?: string | null;
}
type ThreadData = InfiniteData<MessagePage>;

const REACTION_KEY_ORDER: MessageReactionKey[] = [
  "love",
  "laugh",
  "like",
  "wow",
  "sad",
  "thanks",
];

function threadFilter(conversationId: string) {
  return { queryKey: ["messages", conversationId] as const };
}

/** Map every message in every cached page through `update`. */
function patchThread(
  queryClient: QueryClient,
  conversationId: string,
  update: (message: MessageResponse) => MessageResponse,
): void {
  queryClient.setQueriesData<ThreadData>(
    threadFilter(conversationId),
    (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map(update),
        })),
      };
    },
  );
}

/** The always-6-entry reaction summary, built when a message carries none yet. */
function emptyReactionSummaries(): ReactionSummary[] {
  return REACTION_KEY_ORDER.map((key) => ({ key, count: 0, mine: false }));
}

/**
 * Patch a single reaction toggle into the thread. `add` is the new state
 * (true = the viewer just added this key, false = removed it). We know the
 * delta locally, so there's no need to refetch the whole page for one chip.
 */
export function patchMessageReaction(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  key: MessageReactionKey,
  add: boolean,
): void {
  patchThread(queryClient, conversationId, (message) => {
    if (message.id !== messageId) return message;
    const base = message.reactions.length
      ? message.reactions
      : emptyReactionSummaries();
    return {
      ...message,
      reactions: base.map((reaction) =>
        reaction.key === key
          ? {
              ...reaction,
              count: Math.max(0, reaction.count + (add ? 1 : -1)),
              mine: add,
            }
          : reaction,
      ),
    };
  });
}

/**
 * Apply a `reaction` socket frame's authoritative per-key counts to a message in
 * place — SET (not delta), so it can't double-apply on top of the reactor's own
 * optimistic patch, and each key keeps this viewer's existing `mine` (a count is
 * viewer-agnostic; only the reactor's own toggle changes their `mine`, and that
 * came from `patchMessageReaction`). A key absent from `counts` resets to 0. A
 * no-op if the message isn't cached (it'll carry the right counts on next load).
 */
export function patchMessageReactionCounts(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  counts: { key: MessageReactionKey; count: number }[],
): void {
  patchThread(queryClient, conversationId, (message) => {
    if (message.id !== messageId) return message;
    const mineByKey = new Map(
      message.reactions.map((reaction) => [reaction.key, reaction.mine]),
    );
    return {
      ...message,
      reactions: counts.map(({ key, count }) => ({
        key,
        count,
        mine: mineByKey.get(key) ?? false,
      })),
    };
  });
}

/** Patch an edit + `editedAt` in place (author edit, 15-min window).
 *  `editedText` is what the author edited: the body of a text message, or
 *  (ENG-405) the caption of a photo, document or GIF (every kind
 *  `isCaptionEditKind` names), whose `body` stays the send-time
 *  "Photo"/"Document"/"GIF" fallback the server also keeps. An empty
 *  caption clears it, exactly as the server stores no caption key. A
 *  sticker is never caption-edited, so its attachment is left as it is. */
export function patchMessageEdit(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  editedText: string,
  editedAt: string,
): void {
  patchThread(queryClient, conversationId, (message) => {
    if (message.id !== messageId) return message;
    if (!isCaptionEditKind(message.kind)) {
      return { ...message, body: editedText, editedAt };
    }
    const attachment = message.attachment;
    if (!attachment || "stickerId" in attachment) {
      return { ...message, editedAt };
    }
    return {
      ...message,
      editedAt,
      attachment: { ...attachment, caption: editedText || null },
    };
  });
}

/**
 * Patch a soft-delete tombstone in place: the row keeps its slot but blanks its
 * body + reactions, exactly as the server's `toMessageResponses` renders a
 * deleted message. Keeps the timeline continuous instead of leaving a hole.
 */
export function patchMessageDelete(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  deletedAt: string,
): void {
  patchThread(queryClient, conversationId, (message) =>
    message.id === messageId
      ? { ...message, body: "", reactions: [], deletedAt }
      : message,
  );
}

/**
 * Remove ONE message from the thread cache entirely — "delete for me"
 * (PRD-227), a SECOND thing beside `patchMessageDelete`'s tombstone above.
 * Unlike a tombstone (which deliberately KEEPS its slot so the timeline stays
 * continuous for every OTHER participant), hiding a message for just the
 * viewer removes it outright: it no longer exists in THEIR view, and no other
 * participant's cache is ever touched by this (they never even receive a
 * socket frame for it — the hide is server-private). A no-op if the thread
 * isn't cached / in demo mode.
 */
export function removeMessageFromThread(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
): void {
  queryClient.setQueriesData<ThreadData>(
    threadFilter(conversationId),
    (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== messageId),
        })),
      };
    },
  );
}

/** Patch a message's SHARED pin state in place (`pinnedAt` ISO, or null when
 *  unpinned) — for the acting user's optimistic update and the counterpart's
 *  `message:pinned` socket frame, so the in-bubble pin indicator flips without a
 *  thread refetch. The pinned-messages banner is a separate query, refreshed
 *  alongside. A no-op if the thread isn't cached / in demo mode. */
export function patchMessagePinned(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  pinnedAt: string | null,
): void {
  patchThread(queryClient, conversationId, (message) =>
    message.id === messageId ? { ...message, pinnedAt } : message,
  );
}

/** Patch a message's PRIVATE star state in place (viewer-only). Used by the
 *  star/unstar mutation's optimistic update; never arrives over the socket
 *  (stars are private). A no-op if the thread isn't cached / in demo mode. */
export function patchMessageStarred(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  starred: boolean,
): void {
  patchThread(queryClient, conversationId, (message) =>
    message.id === messageId ? { ...message, starred } : message,
  );
}

// ── Conversation-list cache patches ──────────────────────────────────────────
// The inbox list (`["conversations"]`, `useConversations`) used to be
// refetched with a blanket `invalidateQueries` on every send and every
// `message:new` socket frame — including the SENDER's own echo, which the
// backend broadcasts to the whole room (chat.gateway.ts). That meant every
// send fired TWO `GET /conversations` round-trips: one from the mutation's
// `onSuccess`, one from the echo. The frame already carries everything a
// refetch would have produced (the new `MessageResponse`), so patch the row's
// `preview`/`time` and move it to the top instead — called from BOTH
// `useSendMessage.onSuccess` and the `message:new` socket handler. Both fire
// for the sender's own send; applying the same message twice is harmless
// (idempotent — same input, same output, just re-affirms the row's position).
//
// ENG-253: `useConversations` now pages the inbox past its first ~30 rows
// (the bug ENG-253 fixes: the old bare-array endpoint truncated at a fixed
// count) by APPENDING later pages into this SAME flat `ConversationWithPreview[]`
// cache entry via a plain `setQueryData` in `useConversations.ts`'s own
// `fetchNextPage`. This deliberately avoids `useInfiniteQuery`'s
// `InfiniteData<Page>` wrapper, which would have changed this cache entry's
// shape out from under at least seven OTHER `setQueriesData<Conversation[]>`
// call sites across the messages feature (group management, conversation
// prefs, invites, demo signals; see this build's report) that assume a flat
// array and are outside this build's file allowlist. So every patch below is
// unchanged in shape from before ENG-253; only the element type widens to
// `ConversationWithPreview`, a structural superset of `Conversation`, so
// nothing downstream typed as `Conversation[]` even needs to change.
//
// ENG-403 follow-up: a thread opened past the loaded inbox pages (a search
// hit, a starred message, a `?c=` deep link) renders from its by-id read,
// `["conversation-detail", id, demoMode]` (`useConversationDetail`), and a
// thread the list does hold still reads its roster and draft from there. So
// every conversation-level patch below writes that detail entry too, through
// `patchConversationRow`, the same way `patchConversationClaim`
// (claimCache.ts) already did. The detail write is set-if-exists: an entry
// that was never fetched (or is still loading) is left absent, so a patch
// never invents a detail the server did not send. Demo mode never populates
// the detail entry (its query is disabled there), so the detail half is a
// no-op in demo.

/** Prefix filter for one thread's detail entry, whatever its demoMode
 *  segment. */
function conversationDetailFilter(conversationId: string) {
  return { queryKey: ["conversation-detail", conversationId] as const };
}

/** Apply `update` to one thread's cached detail entry. Set-if-exists: the
 *  updater hands back `undefined` for an entry with no data, and TanStack
 *  writes nothing for an `undefined` result, so no entry is ever created.
 *
 *  A manual write stamps the entry fresh (`isInvalidated: false`), which
 *  would wipe a stale mark a socket frame, a reconnect or a delete left for
 *  the entry's next open. So every entry that was invalidated before the
 *  write is marked stale again right after it, with no refetch fired
 *  (`refetchType: "none"`): the patched fields show at once, and the next
 *  open still reads the server. */
export function patchConversationDetail(
  queryClient: QueryClient,
  conversationId: string,
  update: (conversation: ConversationWithPreview) => ConversationWithPreview,
): void {
  const filter = conversationDetailFilter(conversationId);
  const staleKeys = queryClient
    .getQueryCache()
    .findAll(filter)
    .filter((query) => query.state.isInvalidated)
    .map((query) => query.queryKey);
  queryClient.setQueriesData<ConversationWithPreview>(filter, (previous) =>
    previous ? update(previous) : previous,
  );
  for (const queryKey of staleKeys) {
    void queryClient.invalidateQueries({
      queryKey,
      exact: true,
      refetchType: "none",
    });
  }
}

/** Apply `update` to the thread's row in every cached inbox list (each
 *  mailbox scope has its own `["conversations", ...]` entry) and to its
 *  detail entry, so both caches agree. A list without the thread keeps its
 *  array identity, and every other row keeps its object identity, so nothing
 *  re-renders that did not change. A no-op for entries that are not cached. */
export function patchConversationRow(
  queryClient: QueryClient,
  conversationId: string,
  update: (conversation: ConversationWithPreview) => ConversationWithPreview,
): void {
  patchConversationListRows(queryClient, conversationId, update);
  patchConversationDetail(queryClient, conversationId, update);
}

/** The list half of `patchConversationRow`. */
function patchConversationListRows(
  queryClient: QueryClient,
  conversationId: string,
  update: (conversation: ConversationWithPreview) => ConversationWithPreview,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) => {
      if (!previous?.some((row) => row.id === conversationId)) {
        return previous;
      }
      return previous.map((row) =>
        row.id === conversationId ? update(row) : row,
      );
    },
  );
}

/** Mark one thread's detail entry stale so its next read comes from the
 *  server, for the places the list is invalidated for the same thread
 *  (leave, a read the patch could not cover, a reconnect gap). An entry the
 *  screen is observing refetches at once. `shouldDeferRefetch` only marks
 *  it (`refetchType: "none"`), for a thread that is leaving the screen, so
 *  the next open reads fresh with no request fired now. */
export function invalidateConversationDetail(
  queryClient: QueryClient,
  conversationId: string,
  shouldDeferRefetch = false,
): Promise<void> {
  return queryClient.invalidateQueries({
    ...conversationDetailFilter(conversationId),
    ...(shouldDeferRefetch ? { refetchType: "none" as const } : null),
  });
}

/** `conversation` with its last activity taken from `activitySource`: the
 *  same fields `withMessagePreview` below writes from a message, so keep the
 *  two in step. Every other field (a name, a photo, a pin, a mute) stays
 *  `conversation`'s. Keys `activitySource` lacks are copied as `undefined`,
 *  clearing the older message's values the way a preview patch does. Lets
 *  `mergeInboxThreads` show a newer message from one copy of a row beside a
 *  rename that landed on another. */
export function withLastActivityOf<ConversationRow extends Conversation>(
  conversation: ConversationRow,
  activitySource: Conversation,
): ConversationRow {
  // Typed as the interface so a new mailbox key fails to compile here.
  const mailboxFields: LastMessageMailboxFields = {
    lastMessageSenderIdentityId: activitySource.lastMessageSenderIdentityId,
    lastMessageStaffFirstName: activitySource.lastMessageStaffFirstName,
    lastMessageIsSentByViewer: activitySource.lastMessageIsSentByViewer,
  };
  return {
    ...conversation,
    preview: activitySource.preview,
    time: activitySource.time,
    updatedAt: activitySource.updatedAt,
    lastMessageSenderHandle: activitySource.lastMessageSenderHandle,
    lastMessageBody: activitySource.lastMessageBody,
    lastMessageIsSystem: activitySource.lastMessageIsSystem,
    ...mailboxFields,
  };
}

/** `conversation` with `preview`/`time` and the fields behind them taken
 *  from `message`. */
function withMessagePreview(
  conversation: ConversationWithPreview,
  message: MessageResponse,
): ConversationWithPreview {
  return {
    ...conversation,
    preview: previewForMessage(!!conversation.isGroup, message),
    time: timeLabel(message.createdAt),
    // Keep the machine-readable instant in step with the rendered label.
    // `time` is a frozen string ("14:32", "Yesterday"), so without this the
    // row's age stops advancing for an actively-chatting thread and
    // `useThreadRowTimeLabel` has nothing newer to re-derive from.
    updatedAt: message.createdAt,
    // DES-190: carry the raw sender/body/kind behind `preview` forward too
    // (same fields `messages.adapters.ts` maps on load), so a live-patched
    // send/receive doesn't leave the row's "You: " substitution and DM
    // delivery-status tick pointing at the PREVIOUS last message until the
    // next full inbox refetch.
    lastMessageSenderHandle: message.sender.handle || undefined,
    lastMessageBody: messageDisplayText(message),
    lastMessageIsSystem: message.kind === "system",
    // Business mailboxes: all three keys are written on every patch, so
    // a customer message after a colleague's reply drops that colleague's
    // name and a reply the viewer typed reads "You: " at once.
    ...lastMessageMailboxFields(message),
  };
}

/** Patch a conversation-list row's `preview`/`time` from a new message and
 *  move it to the top (most-recently-active-first, matching the server's own
 *  `updatedAt DESC` ordering) — instead of `invalidateQueries(["conversations"])`.
 *  A no-op on a list that does not hold the conversation yet (a brand-new
 *  thread is picked up by `conversation:new`'s invalidate instead). The
 *  thread's detail entry gets the same fields in place, so its `updatedAt`
 *  stays what `patchConversationRead` and `isThreadCacheBehindConversation`
 *  compare against. */
export function patchConversationPreview(
  queryClient: QueryClient,
  conversationId: string,
  message: MessageResponse,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) => {
      if (!previous) return previous;
      const index = previous.findIndex((c) => c.id === conversationId);
      if (index === -1) return previous;
      const updated = withMessagePreview(previous[index]!, message);
      const next = previous.slice();
      next.splice(index, 1);
      next.unshift(updated);
      return next;
    },
  );
  patchConversationDetail(queryClient, conversationId, (conversation) =>
    withMessagePreview(conversation, message),
  );
}

/** Patch a conversation's pin state in place (`pinnedAt` ISO, or undefined
 *  when unpinned), in the list and the detail entry. Used by
 *  `useTogglePin`'s optimistic update in both demo and live mode, so the row
 *  floats to/from the top without an inbox refetch. A no-op if nothing is
 *  cached. */
export function patchConversationPinned(
  queryClient: QueryClient,
  conversationId: string,
  pinnedAt: string | undefined,
): void {
  patchConversationRow(queryClient, conversationId, (conversation) => ({
    ...conversation,
    pinnedAt,
  }));
}

/** Patch a conversation's favorite state in place, in the list and the
 *  detail entry. Used by `useToggleFavorite`'s optimistic update in both
 *  demo and live mode. A no-op if nothing is cached. */
export function patchConversationFavorite(
  queryClient: QueryClient,
  conversationId: string,
  favorite: boolean,
): void {
  patchConversationRow(queryClient, conversationId, (conversation) => ({
    ...conversation,
    favorite,
  }));
}

/** Patch a conversation's mute state in place, in the list and the detail
 *  entry. Used by `useToggleMute`'s optimistic update in both demo and live
 *  mode. A no-op if nothing is cached. */
export function patchConversationMuted(
  queryClient: QueryClient,
  conversationId: string,
  muted: boolean,
): void {
  patchConversationRow(queryClient, conversationId, (conversation) => ({
    ...conversation,
    muted,
  }));
}

/** Patch a group's title (and the initials derived from it, as
 *  `messages.adapters.ts` maps them) in the list and the detail entry, from
 *  a `group_renamed` pill's `systemEvent.value`. The pill is the only frame
 *  a remote rename sends, so without this the row kept the old title until
 *  the next inbox fetch. A no-op if nothing is cached. */
export function patchConversationTitle(
  queryClient: QueryClient,
  conversationId: string,
  title: string,
): void {
  patchConversationRow(queryClient, conversationId, (conversation) => ({
    ...conversation,
    name: title,
    initials: groupInitials(title),
  }));
}

/** The newest message cached for a thread across every demoMode variant, by
 *  `(createdAt, id)`, or null when nothing is cached. `useMarkRead` reads it
 *  once per POST so the id it sends and the watermark it patches locally come
 *  from the same message. */
export function newestCachedMessage(
  queryClient: QueryClient,
  conversationId: string,
): MessageResponse | null {
  let newest: MessageResponse | null = null;
  const entries = queryClient.getQueriesData<ThreadData>(
    threadFilter(conversationId),
  );
  for (const [, data] of entries) {
    for (const page of data?.pages ?? []) {
      for (const message of page.items) {
        if (!newest || isNewerMessage(message, newest)) newest = message;
      }
    }
  }
  return newest;
}

/** True when this tab's cached thread tail is behind what the conversation
 *  list row already knows arrived (`conversationUpdatedAt`, the row's
 *  `updatedAt`; see `patchConversationRead`'s own doc for why that stands in
 *  for "the newest message's `createdAt`"). Happens when a socket drop
 *  delivers messages into a non-active thread while this tab never fetches
 *  them into that thread's own `["messages", id]` cache (`threadCacheTrim.ts`
 *  marks a closed thread's cache stale, so page 0 refetches on reopen, but
 *  this check runs before that refetch lands). Reopening that thread would then send its stale cached tail as an honest
 *  `upToMessageId` read watermark, under-reporting what the reader has
 *  actually seen. Callers (`openThread`, the desktop auto-mark effect) use
 *  this to skip that stale POST and leave the real one to
 *  `useMarkReadOnInbound`'s own heal path once page 0 refetches and the
 *  reader has genuinely caught up. Returns false when nothing is cached yet
 *  (the wall-clock watermark form already handles that case) or the row
 *  carries no `updatedAt` to compare against. */
export function isThreadCacheBehindConversation(
  queryClient: QueryClient,
  conversationId: string,
  conversationUpdatedAt: string | null | undefined,
): boolean {
  if (!conversationUpdatedAt) return false;
  const newestCached = newestCachedMessage(queryClient, conversationId);
  return !!newestCached && newestCached.createdAt < conversationUpdatedAt;
}

/** Patch a conversation-list row's unread state from an acknowledged read
 *  watermark. Used by `useMarkRead.onSuccess` instead of unconditionally
 *  calling `invalidateQueries(["conversations"])`, so opening an unread
 *  thread (which fires on every thread-open-with-unread) doesn't cost a
 *  network round-trip. A no-op if the row isn't cached.
 *
 *  Only clears `unread`/`unreadCount` when `readThrough` actually covers the
 *  row's newest message (`conversation.updatedAt`, which both the live DTO
 *  and `patchConversationPreview` keep as that message's own `createdAt`;
 *  see their own docs). A thread whose message-thread cache is stale (e.g. a
 *  socket drop delivered messages this tab never fetched into that cache)
 *  sends an honest but older `readThrough` than the row already knows about:
 *  `useMarkRead`'s watermark comes from the cached thread tail, which can lag
 *  behind the row's own freshly-synced state. Clearing the row anyway would
 *  show a clean inbox for a thread the server still counts unread, which is
 *  the exact bug this guards against. When `readThrough` falls short,
 *  `unread`/`unreadCount` stay as they were and the caller
 *  (`useMarkRead.onSuccess`) re-syncs the row from the server instead. A row
 *  with no `updatedAt` (built by a shared cache patch from before that field
 *  existed) is treated as covered, the prior behaviour.
 *
 *  `markedUnreadAt` is always cleared, regardless of whether the watermark
 *  covers the row: the server's `markRead` clears `marked_unread_at`
 *  unconditionally on every successful read POST, on both its watermark and
 *  its wall-clock branch, so the two stay in lockstep.
 *
 *  Also always advances the viewer's own `myLastReadAt`, so reopening the
 *  thread before an inbox refetch places "New messages" after what was just
 *  read, even on a partially-covering watermark (a partial read still moved
 *  the watermark forward on the server). `readThrough` is the exact watermark
 *  the POST carried, captured when it started: the `createdAt` of the message
 *  sent as `upToMessageId` (whose `created_at` the server stores), or the
 *  wall-clock ISO sent as `lastReadAt` when nothing was cached. Re-reading the
 *  cache here on success would count a `message:new` upserted mid-request as
 *  read locally while the server still counts it unread. It only ever moves
 *  forward.
 *
 *  The thread's detail entry is patched by the same rule, and counts toward
 *  the result like any list row.
 *
 *  Returns true when every cached row for this conversation was fully
 *  covered (unread cleared, or no row was cached at all); false when at
 *  least one cached row's newest message is newer than `readThrough`, the
 *  caller's signal to resync. `patchConversationReadCoverage` below says
 *  which cache fell short, so the caller refetches only that one. */
export function patchConversationRead(
  queryClient: QueryClient,
  conversationId: string,
  readThrough: string,
): boolean {
  const coverage = patchConversationReadCoverage(
    queryClient,
    conversationId,
    readThrough,
  );
  return coverage.isListCovered && coverage.isDetailCovered;
}

/** Which caches a read watermark fully covered, reported per cache. */
export interface ConversationReadCoverage {
  /** Every cached inbox row for the thread (true when none is cached). */
  isListCovered: boolean;
  /** The thread's detail entry (true when it is not cached). */
  isDetailCovered: boolean;
}

/** `patchConversationRead`'s patch, reporting coverage per cache. A thread
 *  opened past the loaded inbox pages lives only in its detail entry, so a
 *  short watermark there needs that one entry refetched and leaves the
 *  whole inbox alone. */
export function patchConversationReadCoverage(
  queryClient: QueryClient,
  conversationId: string,
  readThrough: string,
): ConversationReadCoverage {
  const coverage: ConversationReadCoverage = {
    isListCovered: true,
    isDetailCovered: true,
  };
  const withRead = (
    conversation: ConversationWithPreview,
    onShort: () => void,
  ): ConversationWithPreview => {
    const isReadThroughCurrent =
      !conversation.updatedAt || readThrough >= conversation.updatedAt;
    if (!isReadThroughCurrent) onShort();
    return {
      ...conversation,
      markedUnreadAt: undefined,
      ...(isReadThroughCurrent ? { unread: false, unreadCount: 0 } : null),
      myLastReadAt:
        conversation.myLastReadAt && conversation.myLastReadAt > readThrough
          ? conversation.myLastReadAt
          : readThrough,
    };
  };
  patchConversationListRows(queryClient, conversationId, (conversation) =>
    withRead(conversation, () => {
      coverage.isListCovered = false;
    }),
  );
  patchConversationDetail(queryClient, conversationId, (conversation) =>
    withRead(conversation, () => {
      coverage.isDetailCovered = false;
    }),
  );
  return coverage;
}

/** Raise a conversation-list row's unread state by ONE — used by the socket
 *  layer's `message:new`/`conversation:message` handlers for a message that
 *  landed in a NON-active thread (the open thread is marked read instead, via
 *  `patchConversationRead` above). Sets `unread: true` and increments
 *  `unreadCount` (default 0), leaving every other field untouched — no
 *  `preview`/`time` bump here, that's `patchConversationPreview`'s job, called
 *  separately by the same handlers.
 *
 *  This is a LOCAL ESTIMATE, not an authoritative count: it can drift from the
 *  server (a burst that also raced a `["conversations"]` invalidate, a second
 *  tab reading the same conversation, etc.), but the next `GET /conversations`
 *  always corrects it, exactly like every other optimistic patch in this file.
 *
 *  Muted chats DO still count here — muting only suppresses push notifications,
 *  not unread counting/badges (see `muted`'s doc on `Conversation` in
 *  features/messages/data.ts: "unread counting/badges are unaffected (mirrors
 *  WhatsApp)") — so this never branches on `muted`.
 *
 *  The detail entry is raised the same way (see `patchConversationRow`). A
 *  no-op if the row isn't cached yet (a brand-new thread is
 *  `conversation:new`'s job instead). */
export function bumpConversationUnread(
  queryClient: QueryClient,
  conversationId: string,
): void {
  patchConversationRow(queryClient, conversationId, (conversation) => ({
    ...conversation,
    unread: true,
    unreadCount: (conversation.unreadCount ?? 0) + 1,
  }));
}

/** Patch a conversation-list row's manual "mark unread" state in place
 *  (PRD-225) — used by `useToggleMarkUnread`'s optimistic update. Setting it
 *  true also flips `unread` immediately (the row menu's whole point is an
 *  instant unread dot); clearing it does NOT touch `unread`/`unreadCount` on
 *  its own — only a genuine read (`patchConversationRead` above) may do that.
 *  Written to the list and the detail entry. A no-op if nothing is cached. */
export function patchConversationMarkedUnread(
  queryClient: QueryClient,
  conversationId: string,
  markedUnreadAt: string | undefined,
): void {
  patchConversationRow(queryClient, conversationId, (conversation) => ({
    ...conversation,
    markedUnreadAt,
    unread: markedUnreadAt ? true : conversation.unread,
  }));
}

/** True when `candidate` is the same message as `message` — by server id, or by
 *  the shared client idempotency key (reconciling the sender's optimistic copy). */
function isSameMessage(
  candidate: MessageResponse,
  message: MessageResponse,
): boolean {
  return (
    candidate.id === message.id ||
    (message.clientMessageId != null &&
      candidate.clientMessageId === message.clientMessageId)
  );
}

/** True when `candidate` sorts after `reference` in the thread's total order
 *  `(createdAt, id)`: the same tie-break `newestCachedMessageId` uses. */
function isNewerMessage(
  candidate: MessageResponse,
  reference: MessageResponse,
): boolean {
  return (
    candidate.createdAt > reference.createdAt ||
    (candidate.createdAt === reference.createdAt && candidate.id > reference.id)
  );
}

/** `pages` with page `pageIndex`'s items swapped; every other page (and every
 *  untouched message object) passes through by reference. */
function withPageItems(
  pages: MessagePage[],
  pageIndex: number,
  items: MessageResponse[],
): MessagePage[] {
  return pages.map((page, index) =>
    index === pageIndex ? { ...page, items } : page,
  );
}

/**
 * Place an unseen message at its `(createdAt, id)` slot (ENG-204). Pages and
 * the items inside them are newest-first, and consecutive pages are contiguous
 * ranges, so the message belongs to the first page whose oldest item is older
 * than it. Messages almost always arrive newest, which stops at index 0 of
 * page 0. Returns null when the message is older than everything loaded while
 * older history is still unfetched: that page will bring it, and inserting it
 * now would render it at the wrong edge and duplicate it once the page lands.
 */
function insertInOrder(
  pages: MessagePage[],
  message: MessageResponse,
): MessagePage[] | null {
  // The mirror of the older edge below, for a detached history window (PRD-401):
  // while newer history is still unfetched, a message newer than everything
  // loaded belongs past that gap, in the live query. The window's own newer
  // page brings it, or the live query already holds it when the two merge.
  const newestLoaded = pages.find((page) => page.items.length > 0)?.items[0];
  if (
    pages[0]?.newerCursor &&
    (!newestLoaded || isNewerMessage(message, newestLoaded))
  ) {
    return null;
  }
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const page = pages[pageIndex]!;
    const oldestInPage = page.items.at(-1);
    if (!oldestInPage || !isNewerMessage(message, oldestInPage)) continue;
    let insertIndex = 0;
    while (!isNewerMessage(message, page.items[insertIndex]!)) insertIndex += 1;
    return withPageItems(pages, pageIndex, [
      ...page.items.slice(0, insertIndex),
      message,
      ...page.items.slice(insertIndex),
    ]);
  }
  const lastIndex = pages.length - 1;
  const lastPage = pages[lastIndex]!;
  if (lastPage.nextCursor) return null;
  return withPageItems(pages, lastIndex, [...lastPage.items, message]);
}

/**
 * Insert (or replace) one message in the thread cache, deduping by server id and
 * by client id. Used for inbound `message:new` socket frames, send acks and
 * reconnect history sync. A message already present (the socket echo of our own
 * send, a duplicate frame, or a reconnect overlap) is replaced in place rather
 * than doubled. A genuinely new message is inserted at its chronological slot
 * (see `insertInOrder`), so thread order never depends on arrival order. A
 * no-op if the thread was never loaded: the message arrives with the first page.
 */
export function upsertMessage(
  queryClient: QueryClient,
  conversationId: string,
  message: MessageResponse,
): void {
  queryClient.setQueriesData<ThreadData>(
    threadFilter(conversationId),
    (data) => {
      if (!data || data.pages.length === 0) return data;
      let replaced = false;
      const pages = data.pages.map((page) => {
        if (!page.items.some((item) => isSameMessage(item, message))) {
          return page;
        }
        replaced = true;
        return {
          ...page,
          items: page.items.map((item) =>
            isSameMessage(item, message) ? message : item,
          ),
        };
      });
      if (replaced) return { ...data, pages };
      const orderedPages = insertInOrder(pages, message);
      return orderedPages ? { ...data, pages: orderedPages } : data;
    },
  );
}

/**
 * The newest message id currently cached for a conversation's thread — used
 * to send an honest `upToMessageId` read-watermark (see `useMarkRead`)
 * instead of the sender's wall clock. `MessageArea` renders straight from
 * this SAME cache (see the file header), so "newest cached" and "newest this
 * tab has actually rendered" are the same data source; walks every cached
 * demoMode variant of the thread query and keeps the max by `(createdAt,
 * id)`, mirroring `reconcileConversationHistory`'s own resume-point walk.
 * Returns null when nothing is cached yet (a thread whose history hasn't
 * been fetched into this tab), so the caller can fall back to its own
 * default watermark.
 */
export function newestCachedMessageId(
  queryClient: QueryClient,
  conversationId: string,
): string | null {
  const entries = queryClient.getQueriesData<ThreadData>(
    threadFilter(conversationId),
  );
  let newest: MessageResponse | null = null;
  for (const [, data] of entries) {
    for (const page of data?.pages ?? []) {
      for (const message of page.items) {
        if (
          !newest ||
          message.createdAt > newest.createdAt ||
          (message.createdAt === newest.createdAt && message.id > newest.id)
        ) {
          newest = message;
        }
      }
    }
  }
  return newest?.id ?? null;
}

/**
 * Reconnect history sync: after a socket drop (which buffers nothing), fetch
 * every message newer than the newest one currently cached and merge it,
 * deduping by id. This is the reliable substitute for transport redelivery — a
 * long offline gap is fully reconciled, not just the latest page refetched.
 * A no-op when nothing is cached yet (the normal page load covers that case).
 */
export async function reconcileConversationHistory(
  queryClient: QueryClient,
  conversationId: string,
): Promise<void> {
  const entries = queryClient.getQueriesData<ThreadData>(
    threadFilter(conversationId),
  );
  let newest: MessageResponse | null = null;
  for (const [, data] of entries) {
    for (const page of data?.pages ?? []) {
      for (const message of page.items) {
        if (
          !newest ||
          message.createdAt > newest.createdAt ||
          (message.createdAt === newest.createdAt && message.id > newest.id)
        ) {
          newest = message;
        }
      }
    }
  }
  if (!newest) return;
  // Page forward from the last known message until the gap is fully closed (a
  // short page means we've caught up). Bounded so a pathological gap can't loop
  // unbounded — the remaining tail then reconciles on the next interaction.
  const PAGE_LIMIT = 100;
  const MAX_PAGES = 20;
  let cursor = newest;
  let merged = false;
  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const res = await apiGet<MessageResponse[] | Paginated<MessageResponse>>(
      `/conversations/${conversationId}/messages?after=${encodeURIComponent(
        cursor.createdAt,
      )}&afterId=${cursor.id}&limit=${PAGE_LIMIT}`,
    );
    const page = toPage(res);
    if (page.data.length === 0) break;
    // Server returns oldest→newest; upserting in order keeps the cache's
    // newest-first ordering (each newer message prepends ahead of the last).
    for (const message of page.data) {
      upsertMessage(queryClient, conversationId, message);
    }
    merged = true;
    cursor = page.data[page.data.length - 1]!;
    if (page.data.length < PAGE_LIMIT) break;
  }
  // The gap may also have changed inbox previews / unread — cheap to refresh.
  // The thread's detail entry is refreshed by the reconnect itself
  // (`handleSessionLive` in realtime.ts invalidates every detail entry
  // once), the only caller of this function.
  if (merged) {
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }
}
