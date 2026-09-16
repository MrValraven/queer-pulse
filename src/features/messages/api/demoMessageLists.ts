// src/features/messages/api/demoMessageLists.ts
import type { QueryClient } from "@tanstack/react-query";
import type {
  MessageResponse,
  MessageSearchConversationGroup,
  StarredMessageHit,
  StarredMessagesResponse,
} from "../../../shared/contracts/contracts";
import { conversations as demoConversations, type Conversation } from "../data";
import { readDemoThread } from "./demoThreadCache";

// ── DEMO pinned and starred lists ────────────────────────────────────────────
// Derived from the demo threads as they stand in the cache (see
// `demoThreadCache.ts`): the seeded pins and stars plus whatever this session
// toggled, filtered and ordered by the same rules as the server's
// `GET /conversations/:id/pins` and `GET /messages/starred`.

/** Server snippet length for a starred hit (`message-annotations.service.ts`). */
const STARRED_SNIPPET_LENGTH = 160;

/** The pinned banner's list: pinned messages without a tombstone, most
 *  recently pinned first. */
export function demoPinnedMessages(
  newestFirst: MessageResponse[],
): MessageResponse[] {
  return newestFirst
    .filter((message) => message.pinnedAt && !message.deletedAt)
    .sort((first, second) =>
      (second.pinnedAt ?? "").localeCompare(first.pinnedAt ?? ""),
    );
}

const demoStarredAtByMessageId = new Map<string, string>();

/** Records when the viewer starred a demo message this session, so the list
 *  orders newest star first. Seeded stars fall back to the message's time. */
export function rememberDemoStarToggle(
  messageId: string,
  isStarred: boolean,
  starredAt: string = new Date().toISOString(),
): void {
  if (isStarred) demoStarredAtByMessageId.set(messageId, starredAt);
  else demoStarredAtByMessageId.delete(messageId);
}

/** A demo thread's grouping metadata, shaped like the server's: a group files
 *  under its own title and avatar, a DM under its counterpart, the official
 *  thread under neither. */
function conversationGroupFor(
  conversation: Conversation,
): MessageSearchConversationGroup {
  const isGroup = !!conversation.isGroup;
  const isOfficial = !!conversation.official;
  return {
    conversationId: conversation.id,
    otherParticipant:
      isGroup || isOfficial
        ? null
        : {
            handle: conversation.slug ?? "",
            displayName: conversation.name,
            pronouns: conversation.pronouns || null,
            avatarUrl: conversation.avatarUrl ?? null,
          },
    isOfficial,
    kind: isGroup ? "group" : "direct",
    title: isGroup ? conversation.name : null,
    avatarUrl: isGroup ? (conversation.avatarUrl ?? null) : null,
  };
}

export interface DemoThreadSnapshot {
  conversation: Conversation;
  newestFirst: MessageResponse[];
}

/** The starred list across `threads`: starred and not deleted (a message
 *  hidden for the viewer is already gone from its thread), newest star first,
 *  then newest id, with one conversation group per thread that has a hit. */
export function buildDemoStarredMessages(
  threads: DemoThreadSnapshot[],
  starredAtByMessageId: ReadonlyMap<string, string>,
): StarredMessagesResponse {
  const items: StarredMessageHit[] = [];
  const conversations: MessageSearchConversationGroup[] = [];
  for (const { conversation, newestFirst } of threads) {
    const starred = newestFirst.filter(
      (message) => message.starred && !message.deletedAt,
    );
    if (starred.length === 0) continue;
    conversations.push(conversationGroupFor(conversation));
    for (const message of starred) {
      items.push({
        id: message.id,
        conversationId: conversation.id,
        snippet: message.body.slice(0, STARRED_SNIPPET_LENGTH),
        sender: message.sender,
        createdAt: message.createdAt,
        starredAt: starredAtByMessageId.get(message.id) ?? message.createdAt,
        kind: message.kind,
        attachment: message.attachment,
      });
    }
  }
  items.sort(
    (first, second) =>
      second.starredAt.localeCompare(first.starredAt) ||
      second.id.localeCompare(first.id),
  );
  // Demo mode has no server page to exhaust: the whole seeded-plus-session
  // list is always returned in one page, so there is never a next one.
  return { items, conversations, nextCursor: null, hasMore: false };
}

/** The demo `GET /messages/starred` answer, read from the cache. */
export function readDemoStarredMessages(
  queryClient: QueryClient,
): StarredMessagesResponse {
  return buildDemoStarredMessages(
    demoConversations.map((conversation) => ({
      conversation,
      newestFirst: readDemoThread(queryClient, conversation.id),
    })),
    demoStarredAtByMessageId,
  );
}
