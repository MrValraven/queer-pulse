import { apiGet } from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  MessageResponse,
  Paginated,
} from "../../../shared/contracts/contracts";

/** The three shelves of a conversation's "Media, links and docs" gallery
 *  (PRD-373). Doubles as the wire value of the endpoint's `kind` parameter. */
export type ConversationMediaKind = "media" | "links" | "documents";

/** One page of the gallery: a three-column grid of 30 fills a phone sheet
 *  with room left to scroll towards the next page. */
export const CONVERSATION_MEDIA_PAGE_SIZE = 30;

/**
 * GET /conversations/:id/media?kind=&cursor=&limit=: one page of the messages
 * in this conversation that carry a photo or GIF (`media`), a URL (`links`) or
 * a file (`documents`), newest first. Same `MessageResponse` shape and the
 * same visibility rules as `getMessages` (cleared history, deletes, takedowns),
 * so the gallery never surfaces a message the thread itself would hide.
 * `toPage` reads a bare array as one terminal page, exactly as the thread does.
 * `signal` is react-query's cancellation signal: closing the sheet or switching
 * tabs aborts the abandoned request.
 */
export async function getConversationMedia(
  conversationId: string,
  kind: ConversationMediaKind,
  cursor?: string,
  signal?: AbortSignal,
): Promise<Paginated<MessageResponse>> {
  const searchParams = new URLSearchParams({
    kind,
    limit: String(CONVERSATION_MEDIA_PAGE_SIZE),
  });
  if (cursor) searchParams.set("cursor", cursor);
  const response = await apiGet<MessageResponse[] | Paginated<MessageResponse>>(
    `/conversations/${conversationId}/media?${searchParams.toString()}`,
    undefined,
    undefined,
    signal,
  );
  return toPage(response);
}
