import { apiGet } from "../../../shared/api/client";
import { validateSearchResponse } from "../../../shared/api/validation";

export type LiveResultType =
  | "member"
  | "community"
  | "event"
  | "forum"
  | "business"
  | "magazine"
  | "job"
  | "housing"
  | "resource"
  | "workshop"
  | "subprofile";

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

/** GET /search — unified cross-entity search (live mode, session required).
 *  Accepts an `AbortSignal` (react-query forwards its `queryFn` signal here)
 *  so a fast retype in the ⌘K palette cancels the previous keystroke's
 *  still-in-flight request instead of letting it run to completion. */
export function searchApi(
  query: string,
  type?: LiveResultType,
  signal?: AbortSignal,
): Promise<SearchResponseDTO> {
  const params = new URLSearchParams({ q: query });
  if (type) params.set("type", type);
  return apiGet<SearchResponseDTO>(
    `/search?${params.toString()}`,
    undefined,
    validateSearchResponse,
    signal,
  );
}
