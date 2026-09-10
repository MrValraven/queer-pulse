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
 */
export function getMentionNames(
  refs: string[],
  signal?: AbortSignal,
): Promise<ResolvedMentionNameDTO[]> {
  const query = encodeURIComponent(refs.join(","));
  return apiGet<ResolvedMentionNameDTO[]>(
    `/mentions/names?refs=${query}`,
    undefined,
    undefined,
    signal,
  );
}
