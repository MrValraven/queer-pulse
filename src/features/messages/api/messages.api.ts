import { apiGet, apiPost } from "../../../shared/api/client";
import type {
  ConversationResponse,
  MessageResponse,
  Paginated,
} from "../../../shared/contracts/contracts";

// ── Messages DTOs + raw calls ────────────────────────────────────────────────
// Shapes come straight from src/shared/contracts/contracts.ts (the SDK target).
// PAGINATION: cursor-based (`Paginated<T>` = { data, pageInfo{nextCursor,hasMore} })
// for the message history — it's an infinite, newest-first thread the panel loads
// older on scroll-up. The conversations list is small enough to fetch in one page.

export type { ConversationResponse, MessageResponse };

/** GET /conversations — the inbox list, most-recent first. */
export const getConversations = () =>
  apiGet<Paginated<ConversationResponse>>("/conversations");

/** GET /conversations/:id/messages?cursor= — cursor page of history. */
export function getMessages(conversationId: string, cursor?: string) {
  const q = new URLSearchParams();
  if (cursor) q.set("cursor", cursor);
  const qs = q.toString();
  return apiGet<Paginated<MessageResponse>>(
    `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
  );
}

/** POST /conversations/:id/messages — send. Rejects a blocked pair with 403. */
export const sendMessage = (conversationId: string, body: string) =>
  apiPost<MessageResponse>(`/conversations/${conversationId}/messages`, {
    body,
  });

/** POST /conversations — open (or reuse) a DM with a member by handle. */
export const startConversation = (recipientHandle: string) =>
  apiPost<ConversationResponse>("/conversations", { recipientHandle });

/** POST /conversations/:id/read — clear unread up to `lastReadAt`. */
export const markConversationRead = (
  conversationId: string,
  lastReadAt: string,
) =>
  apiPost<{ ok: true }>(`/conversations/${conversationId}/read`, {
    lastReadAt,
  });
