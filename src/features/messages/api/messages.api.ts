import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  ConversationResponse,
  MessageResponse,
  MessageSearchResponse,
  Paginated,
  StarredMessagesResponse,
} from "../../../shared/contracts/contracts";
import type { GifAttachment } from "../../../shared/api/gifs";

// ── Messages DTOs + raw calls ────────────────────────────────────────────────
// Shapes come straight from src/shared/contracts/contracts.ts (the SDK target).
// PAGINATION: cursor-based (`Paginated<T>` = { data, pageInfo{nextCursor,hasMore} })
// for the message history — it's an infinite, newest-first thread the panel loads
// older on scroll-up. The conversations list is small enough to fetch in one page.

export type { ConversationResponse, MessageResponse };

/**
 * GET /conversations — the inbox list, most-recent first.
 * The backend returns a bare array (the list fits in one page); older/other
 * envelopes wrap it in `{ data }`. Normalize to always resolve a plain array so
 * callers never have to guess the shape.
 */
export async function getConversations(): Promise<ConversationResponse[]> {
  const res = await apiGet<
    ConversationResponse[] | Paginated<ConversationResponse>
  >("/conversations");
  return Array.isArray(res) ? res : (res?.data ?? []);
}

/**
 * GET /conversations/unread-count — the count of conversations with unread
 * messages, for the nav DM badge. Cheap counterpart to `getConversations`, so
 * the app-wide badge never pulls the whole inbox. Mirrors
 * `/notifications/unread-count`.
 */
export async function getConversationsUnreadCount(): Promise<number> {
  const res = await apiGet<{ count: number }>("/conversations/unread-count");
  return res?.count ?? 0;
}

/** GET /conversations/:id/messages?cursor= — cursor page of history. */
export async function getMessages(conversationId: string, cursor?: string) {
  const q = new URLSearchParams();
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  const res = await apiGet<MessageResponse[] | Paginated<MessageResponse>>(
    `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
  );
  return toPage(res);
}

/** POST /conversations/:id/messages — send. Rejects a blocked pair with 403.
 *  `clientMessageId` is the sender's idempotency key — the server dedupes on it,
 *  so a retry (or the HTTP + WS dual path) returns the same message, never two. */
export const sendMessage = (
  conversationId: string,
  body: string,
  replyToId?: string,
  clientMessageId?: string,
  forwarded?: boolean,
  attachment?: GifAttachment,
  kind?: "user" | "gif",
) =>
  apiPost<MessageResponse>(`/conversations/${conversationId}/messages`, {
    body,
    ...(replyToId ? { replyToId } : {}),
    ...(clientMessageId ? { clientMessageId } : {}),
    ...(forwarded ? { forwarded: true } : {}),
    ...(kind === "gif" && attachment ? { kind: "gif", attachment } : {}),
  });

/** GET /conversations/:id/pins — the conversation's SHARED pinned messages,
 *  newest-pin-first. */
export const getPinnedMessages = (conversationId: string) =>
  apiGet<MessageResponse[]>(`/conversations/${conversationId}/pins`);

/** POST /conversations/:id/messages/:messageId/pin — pin a message (shared). */
export const pinMessage = (conversationId: string, messageId: string) =>
  apiPost<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/pin`,
    {},
  );

/** DELETE /conversations/:id/messages/:messageId/pin — unpin a message (shared). */
export const unpinMessage = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/pin`,
  );

/** POST /conversations/:id/messages/:messageId/star — privately bookmark a message. */
export const starMessage = (conversationId: string, messageId: string) =>
  apiPost<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/star`,
    {},
  );

/** DELETE /conversations/:id/messages/:messageId/star — remove my star. */
export const unstarMessage = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/star`,
  );

/** GET /messages/starred — my starred messages, newest-star-first. */
export async function getStarredMessages(
  limit?: number,
): Promise<StarredMessagesResponse> {
  const qs = limit ? `?limit=${limit}` : "";
  return apiGet<StarredMessagesResponse>(`/messages/starred${qs}`);
}

/** PATCH /conversations/:id/messages/:messageId — edit own message (15-min window). */
export const editMessage = (
  conversationId: string,
  messageId: string,
  body: string,
) =>
  apiPatch<MessageResponse>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { body },
  );

/** POST /conversations — open (or reuse) a DM with a member by handle. */
export const startConversation = (recipientHandle: string) =>
  apiPost<ConversationResponse>("/conversations", { recipientHandle });

/** POST /conversations/group — create a group thread. Members are addressed by
 *  handle (slug); the caller becomes owner. Each member must be a connection and
 *  not blocked (server-enforced). Returns the new group's ConversationResponse. */
export const createGroup = (
  title: string,
  memberHandles: string[],
  avatarUrl?: string,
) =>
  apiPost<ConversationResponse>("/conversations/group", {
    title,
    memberHandles,
    ...(avatarUrl ? { avatarUrl } : {}),
  });

/** POST /conversations/:id/leave — the caller leaves a group (keeps history). */
export const leaveGroup = (conversationId: string) =>
  apiPost<{ ok: true }>(`/conversations/${conversationId}/leave`, {});

/** POST /conversations/:id/members — owner/admin adds members by handle. Each
 *  must be a connection + not blocked (server-enforced). Returns the group DTO. */
export const addGroupMembers = (conversationId: string, memberHandles: string[]) =>
  apiPost<ConversationResponse>(`/conversations/${conversationId}/members`, {
    memberHandles,
  });

/** DELETE /conversations/:id/members/:userId — owner/admin removes a member
 *  (owner can't be removed; only owner removes an admin). Returns the group DTO. */
export const removeGroupMember = (conversationId: string, userId: string) =>
  apiDelete<ConversationResponse>(
    `/conversations/${conversationId}/members/${userId}`,
  );

/** PATCH /conversations/:id/members/:userId/role — OWNER promotes/demotes a
 *  member (`admin` | `member`). Returns the group DTO. */
export const changeGroupMemberRole = (
  conversationId: string,
  userId: string,
  role: "admin" | "member",
) =>
  apiPatch<ConversationResponse>(
    `/conversations/${conversationId}/members/${userId}/role`,
    { role },
  );

/** PATCH /conversations/:id — owner/admin edits a group's title/avatar. A title
 *  change posts a `group_renamed` pill server-side. Returns the group DTO. */
export const updateGroup = (
  conversationId: string,
  changes: { title?: string; avatarUrl?: string },
) => apiPatch<ConversationResponse>(`/conversations/${conversationId}`, changes);

/** GET /messages/search?q= — cross-conversation body search, scoped server-side
 *  to the caller's conversations and floored by their `clearedAt`. Accepts an
 *  `AbortSignal` (react-query forwards its `queryFn` signal here) so a fast
 *  retype cancels the previous keystroke's still-in-flight request instead of
 *  letting it run to completion against the backend. */
export async function searchMessages(
  query: string,
  limit?: number,
  signal?: AbortSignal,
): Promise<MessageSearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.set("limit", String(limit));
  return apiGet<MessageSearchResponse>(
    `/messages/search?${params.toString()}`,
    undefined,
    undefined,
    signal,
  );
}

/** POST /conversations/:id/read — clear unread up to `lastReadAt`. */
export const markConversationRead = (
  conversationId: string,
  lastReadAt: string,
) =>
  apiPost<{ ok: true }>(`/conversations/${conversationId}/read`, {
    lastReadAt,
  });

/** POST /conversations/:id/messages/:messageId/reactions — add (or replace) my reaction. */
export const addMessageReaction = (
  conversationId: string,
  messageId: string,
  key: string,
) =>
  apiPost<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/reactions`,
    { key },
  );

/** DELETE /conversations/:id/messages/:messageId/reactions/:key — remove my reaction. */
export const removeMessageReaction = (
  conversationId: string,
  messageId: string,
  key: string,
) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(key)}`,
  );

/** DELETE /conversations/:id/messages/:messageId — soft-delete a message. */
export const deleteMessage = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}`,
  );

/** DELETE /conversations/:id — delete the conversation for my account only
 *  (WhatsApp-style). The other member keeps their copy. */
export const deleteConversation = (conversationId: string) =>
  apiDelete<{ ok: true }>(`/conversations/${conversationId}`);
