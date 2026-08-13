import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { apiGet } from "./client";
import { toPage } from "./pagination";
import type {
  MessageReactionKey,
  MessageResponse,
  Paginated,
  ReactionSummary,
} from "../contracts/contracts";
import { previewForMessage, timeLabel } from "../../features/messages/api/messages.adapters";
import type { Conversation } from "../../features/messages/data";

// ── Message-thread cache patches ─────────────────────────────────────────────
// The messages page keeps HTTP authoritative but avoids a blanket
// `invalidateQueries(["messages", convId])` for every reaction / edit / delete /
// inbound socket frame — a full refetch adds latency, flickers the list, and
// churns the scroll anchor. Instead we patch the `useInfiniteQuery` cache in
// place, mirroring the delete-conversation hook's `setQueriesData` pattern.
//
// The thread's query key is `["messages", conversationId, demoMode]`; a
// PREFIX filter (`["messages", conversationId]`) matches it regardless of the
// demoMode suffix. In demo mode the query is disabled (no cache entry), so every
// helper here is a safe no-op — demo mode is untouched.

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
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) => {
      if (!previous) return previous;
      const index = previous.findIndex((c) => c.id === conversationId);
      if (index === -1) return previous;
      const conversation = previous[index]!;
      const updated: Conversation = {
        ...conversation,
        preview: previewForMessage(!!conversation.isGroup, message),
        time: timeLabel(message.createdAt),
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
  queryClient.setQueriesData<Conversation[]>(
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
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, favorite }
          : conversation,
      ),
  );
}

/** Patch a conversation-list row's unread state to zero — used by
 *  `useMarkRead.onSuccess` instead of `invalidateQueries(["conversations"])`,
 *  so opening an unread thread (which fires on every thread-open-with-unread)
 *  doesn't cost a network round-trip. A no-op if the row isn't cached. */
export function patchConversationRead(
  queryClient: QueryClient,
  conversationId: string,
): void {
  queryClient.setQueriesData<Conversation[]>(
    { queryKey: ["conversations"] },
    (previous) =>
      previous?.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread: false, unreadCount: 0 }
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

/**
 * Insert (or replace) one message in the thread cache, deduping by server id and
 * by client id. Used for inbound `message:new` socket frames and reconnect
 * history sync. Pages are newest-first within the newest page (page[0]), so a
 * genuinely new message prepends there; a message already present (the socket
 * echo of our own send, a duplicate frame, or a reconnect overlap) is replaced
 * in place rather than doubled. A no-op if the thread was never loaded — the
 * message will arrive with the first page fetch.
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
      const [newest, ...rest] = pages;
      return {
        ...data,
        pages: [{ ...newest!, items: [message, ...newest!.items] }, ...rest],
      };
    },
  );
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
