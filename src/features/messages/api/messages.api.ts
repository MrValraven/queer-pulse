import { apiGet, apiPost } from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
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
