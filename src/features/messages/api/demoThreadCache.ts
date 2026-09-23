// src/features/messages/api/demoThreadCache.ts
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type {
  AuthorSummary,
  MessageReactionKey,
  MessageResponse,
  ReactionSummary,
} from "../../../shared/contracts/contracts";
import {
  currentUser,
  currentUserSlug,
} from "../../members/data/demoCurrentUser";
import {
  conversations as demoConversations,
  type ChatMessage,
  type Conversation,
} from "../data";
import { demoIdentityAuthor } from "../demoIdentities.data";
import type { MessageGroup } from "../useMessagesController.helpers";
import type { MessagePage } from "./threadCacheTrim";

// ── DEMO thread cache ────────────────────────────────────────────────────────
// Demo history rides the SAME infinite query as live (`["messages", id,
// true]`), so paging, prepend anchoring and every message action run the live
// code. The seeded thread is kept in one extra cache entry,
// `["messages", id, "demo-store"]`: newest first, in one page that is kept for
// the whole page session. Both entries share the `["messages", id]` prefix that every
// `shared/api/messageCache.ts` helper filters on, so one helper call patches the
// rendered pages and the store together, and a later refetch (a thread reopened
// after the inactive trim) pages the patched store back in. Nothing here touches
// the network.

/** Messages per demo history page, newest page first. */
export const DEMO_THREAD_PAGE_SIZE = 30;

/** How long an older demo page takes to "arrive", so the load-older spinner
 *  and the prepend anchor run through a real in-flight state. */
export const DEMO_OLDER_PAGE_DELAY_MS = 400;

/** The demo viewer's handle: `groupMessages` decides `from: "me"` by it. */
export const DEMO_VIEWER_HANDLE = currentUserSlug;

type ThreadData = InfiniteData<MessagePage>;
type SeededMessage = ChatMessage & { id: string };

const REACTION_KEYS: MessageReactionKey[] = [
  "love",
  "laugh",
  "like",
  "wow",
  "sad",
  "thanks",
];

const DEMO_VIEWER: AuthorSummary = {
  handle: currentUserSlug,
  displayName: `${currentUser.first} ${currentUser.last}`,
  avatarUrl: currentUser.photo ?? null,
};

export function findDemoConversation(
  conversationId: string,
): Conversation | undefined {
  return demoConversations.find(
    (conversation) => conversation.id === conversationId,
  );
}

const seedByConversationId = new Map<string, Map<string, SeededMessage>>();

/** A demo thread's seeded messages by id (empty for a thread created this
 *  session). The registry is static, so the index is built once per thread. */
function seedMessagesById(conversationId: string): Map<string, SeededMessage> {
  const cached = seedByConversationId.get(conversationId);
  if (cached) return cached;
  const conversation = findDemoConversation(conversationId);
  const index = new Map<string, SeededMessage>();
  for (const group of conversation?.messages ?? []) {
    for (const item of group.items) {
      if (item.id) index.set(item.id, item as SeededMessage);
    }
  }
  seedByConversationId.set(conversationId, index);
  return index;
}

/** The demo thread holding `messageId`, or null. Lets a pin or star resolve
 *  its thread when the caller has no conversation id to hand. */
export function findDemoConversationIdForMessage(
  messageId: string,
): string | null {
  const conversation = demoConversations.find((candidate) =>
    seedMessagesById(candidate.id).has(messageId),
  );
  return conversation?.id ?? null;
}

/** The always-six-key summary the server sends, so a toggle on a key the seed
 *  never mentioned still lands. */
function normalizedReactions(
  reactions: ReactionSummary[] | undefined,
): ReactionSummary[] {
  return REACTION_KEYS.map((key) => {
    const seeded = reactions?.find((reaction) => reaction.key === key);
    return seeded ? { ...seeded } : { key, count: 0, mine: false };
  });
}

/**
 * Business mailboxes: `senderIdentityId` and `isSenderFormerBusiness` are
 * checked before the plain viewer/former-member/counterpart branches, since a
 * business reply carries `from: "me"` (it renders on the viewer's side of the
 * thread) for every staff member's send, colleague included. A system row
 * keeps its own branch untouched, as it always has.
 */
function senderOf(
  message: ChatMessage,
  conversation: Conversation,
): AuthorSummary {
  if (message.kind === "system") {
    if (message.systemEvent?.actorIsMe === true) return DEMO_VIEWER;
    const actorName = message.systemEvent?.actorName ?? "";
    return { handle: "", displayName: actorName, avatarUrl: null };
  }
  if (message.senderIdentityId) {
    return demoIdentityAuthor(
      message.senderIdentityId,
      message.senderStaffFirstName,
    );
  }
  if (message.isSenderFormerBusiness) {
    return {
      handle: "",
      displayName: "Former business",
      avatarUrl: null,
      isFormerIdentity: true,
    };
  }
  if (message.from === "me") return DEMO_VIEWER;
  // ENG-243: the demo's erased sender, in the shape the server sends one.
  if (message.isSenderFormerMember) {
    return {
      handle: "",
      displayName: message.senderName ?? "",
      avatarUrl: null,
      isFormerMember: true,
    };
  }
  return {
    handle: message.senderHandle ?? conversation.slug ?? "",
    displayName: message.senderName ?? conversation.name,
    avatarUrl:
      message.senderAvatar ??
      (conversation.isGroup ? null : (conversation.avatarUrl ?? null)),
  };
}

/** One seeded bubble in the shape the server sends it. */
export function demoMessageToResponse(
  message: SeededMessage,
  conversation: Conversation,
): MessageResponse {
  const { replyTo, systemEvent } = message;
  return {
    id: message.id,
    conversationId: conversation.id,
    body: message.text,
    sender: senderOf(message, conversation),
    createdAt: message.at ?? conversation.updatedAt ?? "",
    editedAt: message.editedAt ?? null,
    reactions: normalizedReactions(message.reactions),
    deletedAt: message.deletedAt ?? null,
    deliveredAt: message.deliveredAt ?? null,
    clientMessageId: null,
    forwarded: !!message.forwarded,
    pinnedAt: message.pinnedAt ?? null,
    starred: !!message.starred,
    canPin: !!message.canPin,
    canEdit: !!message.canEdit,
    canDelete: !!message.canDelete,
    canReport: !!message.canReport,
    replyTo: replyTo
      ? {
          id: replyTo.id,
          snippet: replyTo.snippet,
          senderName: replyTo.senderName,
          senderIsFormerMember: replyTo.senderIsFormerMember,
          deleted: replyTo.deleted,
          kind: replyTo.kind ?? "user",
          thumbnailUrl: replyTo.thumbnailUrl ?? null,
          fileName: replyTo.fileName ?? null,
        }
      : null,
    kind: message.kind ?? "user",
    attachment: message.attachment ?? null,
    systemEvent: systemEvent
      ? {
          type: systemEvent.type,
          actorName: systemEvent.actorName,
          targetName: systemEvent.targetName ?? null,
          value: systemEvent.value ?? null,
          ...(systemEvent.mailboxName !== undefined
            ? { mailboxName: systemEvent.mailboxName }
            : {}),
        }
      : null,
    // Business mailboxes: only a reply sent as an identity the viewer staffs
    // defines this on the seed; every other row leaves the key off entirely,
    // matching the server's own presence rule (see `MessageResponse`'s doc).
    ...(message.isSentByViewer !== undefined
      ? { isSentByViewer: message.isSentByViewer }
      : {}),
  };
}

function seededNewestFirst(conversationId: string): MessageResponse[] {
  const conversation = findDemoConversation(conversationId);
  if (!conversation) return [];
  return [...seedMessagesById(conversationId).values()]
    .map((message) => demoMessageToResponse(message, conversation))
    .reverse();
}

export function demoThreadStoreKey(conversationId: string) {
  return ["messages", conversationId, "demo-store"] as const;
}

/** A demo thread newest first: the session store once it exists, else the
 *  seed. Never writes, so it is safe to call while rendering. */
export function readDemoThread(
  queryClient: QueryClient,
  conversationId: string,
): MessageResponse[] {
  const stored = queryClient.getQueryData<ThreadData>(
    demoThreadStoreKey(conversationId),
  );
  return stored
    ? (stored.pages[0]?.items ?? [])
    : seededNewestFirst(conversationId);
}

/** Creates the session store from the seed the first time. Call it before a
 *  demo action patches the cache (never while rendering), so the shared
 *  helper's patch reaches the store as well as the rendered pages. */
export function ensureDemoThreadStore(
  queryClient: QueryClient,
  conversationId: string,
): MessageResponse[] {
  const storeKey = demoThreadStoreKey(conversationId);
  const stored = queryClient.getQueryData<ThreadData>(storeKey);
  if (stored) return stored.pages[0]?.items ?? [];
  // Lives for the page session: infinite gc and stale times, and a stray
  // refetch hands back exactly what the store already holds.
  queryClient.setQueryDefaults(storeKey, {
    gcTime: Infinity,
    staleTime: Infinity,
    queryFn: () =>
      queryClient.getQueryData<ThreadData>(storeKey) ?? {
        pages: [],
        pageParams: [],
      },
  });
  const items = seededNewestFirst(conversationId);
  queryClient.setQueryData<ThreadData>(storeKey, {
    pages: [{ items, nextCursor: null }],
    pageParams: [null],
  });
  return items;
}

function cursorFor(message: MessageResponse): string {
  return `${message.createdAt}|${message.id}`;
}

/** True when `message` sorts before the cursor in the thread's total order
 *  `(createdAt, id)`, the same keyset the server pages by. */
function isOlderThanCursor(message: MessageResponse, cursor: string): boolean {
  const separatorIndex = cursor.indexOf("|");
  const createdAt = cursor.slice(0, separatorIndex);
  const id = cursor.slice(separatorIndex + 1);
  return (
    message.createdAt < createdAt ||
    (message.createdAt === createdAt && message.id < id)
  );
}

/** One history page of a newest-first thread: the newest page for no cursor,
 *  else the page just older than it. `nextCursor` is null on the oldest page. */
export function demoThreadPage(
  newestFirst: MessageResponse[],
  cursor: string | undefined,
  pageSize: number = DEMO_THREAD_PAGE_SIZE,
): MessagePage {
  const startIndex =
    cursor === undefined
      ? 0
      : newestFirst.findIndex((message) => isOlderThanCursor(message, cursor));
  if (startIndex === -1) return { items: [], nextCursor: null };
  const items = newestFirst.slice(startIndex, startIndex + pageSize);
  const lastItem = items.at(-1);
  const hasOlder = startIndex + pageSize < newestFirst.length;
  return {
    items,
    nextCursor: hasOlder && lastItem ? cursorFor(lastItem) : null,
  };
}

function demoAbortError(): DOMException {
  return new DOMException("The demo page request was aborted.", "AbortError");
}

/** Resolves after `delayMs`, or rejects with an AbortError as soon as `signal`
 *  aborts, clearing the timer so an abandoned request leaves nothing pending. */
export function waitForDemoRoundTrip(
  delayMs: number,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(demoAbortError());
      return;
    }
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, delayMs);
    function handleAbort() {
      clearTimeout(timeoutId);
      reject(demoAbortError());
    }
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

/** The demo query's `queryFn`: pages the session store, holding an older page
 *  back for `DEMO_OLDER_PAGE_DELAY_MS` the way a network round trip would.
 *  Honours react-query's `signal`, so a cancelled request rejects at once. */
export async function fetchDemoThreadPage(
  queryClient: QueryClient,
  conversationId: string,
  cursor: string | undefined,
  signal?: AbortSignal,
): Promise<MessagePage> {
  if (cursor !== undefined) {
    await waitForDemoRoundTrip(DEMO_OLDER_PAGE_DELAY_MS, signal);
  }
  return demoThreadPage(
    ensureDemoThreadStore(queryClient, conversationId),
    cursor,
  );
}

const presentedByBubble = new WeakMap<ChatMessage, ChatMessage>();

/**
 * Restores the seed's presentation fields on the bubbles `groupMessages` built
 * from demo DTOs. The DTO carries everything an action can change (body,
 * reactions, edited, deleted, pinned, starred, permission flags); the seed
 * keeps what a DTO cannot say, chiefly each group sender's avatar tint, which
 * the live adapter would re-derive from the handle and repaint. Cached per
 * bubble object, so an untouched message keeps its identity across patches.
 */
export function withDemoPresentation(
  conversationId: string,
  groups: MessageGroup[],
): MessageGroup[] {
  const seedById = seedMessagesById(conversationId);
  if (seedById.size === 0) return groups;
  return groups.map((group) => ({
    ...group,
    items: group.items.map((bubble) => {
      const seed = bubble.id ? seedById.get(bubble.id) : undefined;
      if (!seed) return bubble;
      const cached = presentedByBubble.get(bubble);
      if (cached) return cached;
      const presented: ChatMessage = {
        ...bubble,
        from: seed.from,
        senderName: seed.senderName,
        senderHandle: seed.senderHandle,
        senderTint: seed.senderTint,
        senderAvatar: seed.senderAvatar,
        systemEvent: seed.systemEvent,
      };
      presentedByBubble.set(bubble, presented);
      return presented;
    }),
  }));
}

/**
 * Adds a demo row's bubbles that the store does not page (a system pill a demo
 * group action appended this session, or every bubble of a thread created this
 * session) to the thread's session sends, so `mergeOptimisticGroups` files them
 * into Today exactly as it did when demo rendered `active.messages` directly.
 */
export function withDemoLocalOnlyMessages(
  sent: Record<string, ChatMessage[]>,
  active: Conversation,
): Record<string, ChatMessage[]> {
  const seedById = seedMessagesById(active.id);
  const localOnly = active.messages.flatMap((group) =>
    group.items.filter((item) => !item.id || !seedById.has(item.id)),
  );
  if (localOnly.length === 0) return sent;
  return { ...sent, [active.id]: [...localOnly, ...(sent[active.id] ?? [])] };
}
