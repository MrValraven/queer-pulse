import { apiGet } from "../api/client";

/** One mention, named. Mirrors the backend `ResolvedMentionNameResponse`. */
export interface ResolvedMentionNameDTO {
  kind: string;
  slug: string;
  name: string;
}

/**
 * `GET /mentions/names?refs=member:ana-lopes,community:lisboa-queer`.
 *
 * Only the refs that resolved come back — a mention of something deleted,
 * private, or simply mistyped is absent, and the caller leaves it rendering as
 * the raw `sigil + slug` it already parsed.
 *
 * `conversationId` names the chat the text is rendered in: inside a matched
 * Go together chat the reader sits in, its members come back by first name
 * (PRD-423).
 */
export function getMentionNames(
  refs: string[],
  signal?: AbortSignal,
  conversationId?: string,
): Promise<ResolvedMentionNameDTO[]> {
  const query = encodeURIComponent(refs.join(","));
  const conversationQuery = conversationId
    ? `&conversationId=${encodeURIComponent(conversationId)}`
    : "";
  return apiGet<ResolvedMentionNameDTO[]>(
    `/mentions/names?refs=${query}${conversationQuery}`,
    undefined,
    undefined,
    signal,
  );
}
