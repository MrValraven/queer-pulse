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
  previewForMessage,
  timeLabel,
  type ConversationWithPreview,
} from "../../features/messages/api/messages.adapters";

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

/** One page of the infinite thread query (see `useMessageThread`). */
interface MessagePage {
  items: MessageResponse[];
  nextCursor: string | null;
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

/** Patch an edited body + `editedAt` in place (author edit, 15-min window). */
export function patchMessageEdit(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  body: string,
  editedAt: string,
): void {
  patchThread(queryClient, conversationId, (message) =>
    message.id === messageId ? { ...message, body, editedAt } : message,
  );
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

/** Patch a conversation-list row's `preview`/`time` from a new message and
 *  move it to the top (most-recently-active-first, matching the server's own
 *  `updatedAt DESC` ordering) — instead of `invalidateQueries(["conversations"])`.
 *  A no-op if the conversation isn't in the cached list yet (a brand-new
 *  thread is picked up by `conversation:new`'s invalidate instead). */
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
      const conversation = previous[index]!;
      const updated: ConversationWithPreview = {
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
        lastMessageBody: message.body,
        lastMessageIsSystem: message.kind === "system",
      };
      const next = previous.slice();
      next.splice(index, 1);
      next.unshift(updated);
      return next;
    },
  );
}

/** Patch a conversation-list row's pin state in place (`pinnedAt` ISO, or
 *  undefined when unpinned) — used by `useTogglePin`'s optimistic update in
 *  both demo and live mode, so the row floats to/from the top without an
 *  inbox refetch. A no-op if the row isn't cached. */
export function patchConversationPinned(
  queryClient: QueryClient,
  conversationId: string,
  pinnedAt: string | undefined,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, pinnedAt }
          : conversation,
      ),
  );
}

/** Patch a conversation-list row's favorite state in place — used by
 *  `useToggleFavorite`'s optimistic update in both demo and live mode. A
 *  no-op if the row isn't cached. */
export function patchConversationFavorite(
  queryClient: QueryClient,
  conversationId: string,
  favorite: boolean,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, favorite }
          : conversation,
      ),
  );
}

/** Patch a conversation-list row's mute state in place — used by
 *  `useToggleMute`'s optimistic update in both demo and live mode. A no-op if
 *  the row isn't cached. */
export function patchConversationMuted(
  queryClient: QueryClient,
  conversationId: string,
  muted: boolean,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, muted }
          : conversation,
      ),
  );
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

/** Patch a conversation-list row's unread state to zero — used by
 *  `useMarkRead.onSuccess` instead of `invalidateQueries(["conversations"])`,
 *  so opening an unread thread (which fires on every thread-open-with-unread)
 *  doesn't cost a network round-trip. A no-op if the row isn't cached.
 *  Also clears `markedUnreadAt` (PRD-225): re-opening/reading a thread is the
 *  ONLY thing that clears a manual "mark unread", mirroring exactly what the
 *  server's `markRead` does in the same request this patches the response of —
 *  so the two can never disagree.
 *
 *  Also advances the viewer's own `myLastReadAt`, so reopening the thread
 *  before an inbox refetch places "New messages" after what was just read.
 *  `readThrough` is the exact watermark the POST carried, captured when it
 *  STARTED: the `createdAt` of the message sent as `upToMessageId` (whose
 *  `created_at` the server stores), or the wall-clock ISO sent as `lastReadAt`
 *  when nothing was cached. Re-reading the cache here on success would count a
 *  `message:new` upserted mid-request as read locally while the server still
 *  counts it unread. It never moves backwards. */
export function patchConversationRead(
  queryClient: QueryClient,
  conversationId: string,
  readThrough: string,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unread: false,
              unreadCount: 0,
              markedUnreadAt: undefined,
              myLastReadAt:
                conversation.myLastReadAt &&
                conversation.myLastReadAt > readThrough
                  ? conversation.myLastReadAt
                  : readThrough,
            }
          : conversation,
      ),
  );
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
 *  A no-op if the row isn't cached yet (a brand-new thread is `conversation:new`'s
 *  job instead). */
export function bumpConversationUnread(
  queryClient: QueryClient,
  conversationId: string,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unread: true,
              unreadCount: (conversation.unreadCount ?? 0) + 1,
            }
          : conversation,
      ),
  );
}

/** Patch a conversation-list row's manual "mark unread" state in place
 *  (PRD-225) — used by `useToggleMarkUnread`'s optimistic update. Setting it
 *  true also flips `unread` immediately (the row menu's whole point is an
 *  instant unread dot); clearing it does NOT touch `unread`/`unreadCount` on
 *  its own — only a genuine read (`patchConversationRead` above) may do that.
 *  A no-op if the row isn't cached. */
export function patchConversationMarkedUnread(
  queryClient: QueryClient,
  conversationId: string,
  markedUnreadAt: string | undefined,
): void {
  queryClient.setQueriesData<ConversationWithPreview[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              markedUnreadAt,
              unread: markedUnreadAt ? true : conversation.unread,
            }
          : conversation,
      ),
  );
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
  if (merged) {
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }
}
