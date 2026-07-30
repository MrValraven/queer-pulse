import { apiGet } from "../../../shared/api/client";

export type LiveResultType =
  "member" | "community" | "event" | "forum" | "business";

export interface SearchResultDTO {
  type: LiveResultType;
  slug: string;
  name: string;
  sub: string;
  /** Member avatar URL (member rows only); absent for other result types. */
  avatarUrl?: string | null;
}

export interface SearchResponseDTO {
  query: string;
  results: SearchResultDTO[];
}

/** GET /search — unified cross-entity search (live mode, session required). */
export function searchApi(
  query: string,
  type?: LiveResultType,
): Promise<SearchResponseDTO> {
  const params = new URLSearchParams({ q: query });
  if (type) params.set("type", type);
  return apiGet<SearchResponseDTO>(`/search?${params.toString()}`);
}
