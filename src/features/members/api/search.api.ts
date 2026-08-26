import { apiGet, type ResponseValidator } from "../../../shared/api/client";

export type LiveResultType =
  | "member"
  | "community"
  | "event"
  | "forum"
  | "forumPost"
  | "business"
  | "magazine"
  | "job"
  | "housing"
  | "resource"
  | "subprofile"
  | "topic";

const LIVE_RESULT_TYPES: readonly LiveResultType[] = [
  "member",
  "community",
  "event",
  "forum",
  "forumPost",
  "business",
  "magazine",
  "job",
  "housing",
  "resource",
  "subprofile",
  "topic",
];

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
  /** True when the requested `type` has results past this page (SOC-08).
   *  Always false on the unfiltered, all-types view. Older responses predate
   *  the field, so a missing value reads as "no further page". */
  hasMore: boolean;
}

/**
 * Validates a `GET /search` body.
 *
 * Lives here rather than in `shared/api/validation.ts` because it does one
 * thing that module's `validateSearchResponse` does not: it NORMALISES the
 * body, defaulting `query` to "" and `hasMore` to false so a response predating
 * those fields still satisfies `SearchResponseDTO`. The shared validator
 * asserts and returns the input unchanged. (`SEARCH_RESULT_TYPES` there now
 * knows `forumPost` too, so the two type lists agree; keep them in step.)
 *
 * The `type` discriminant is asserted because the UI switches icon and link
 * target on it, so an unknown token would render a broken row. `avatarUrl`
 * (member rows only) and `hasMore` are left unasserted: neither can break a
 * render.
 */
const validateSearchResponse: ResponseValidator<SearchResponseDTO> = (data) => {
  const body = data as Partial<SearchResponseDTO> | null;
  if (!body || typeof body !== "object" || !Array.isArray(body.results)) {
    throw new Error("expected a search response with a results array");
  }
  body.results.forEach((result, index) => {
    const path = `results[${index}]`;
    if (!result || typeof result !== "object") {
      throw new Error(`expected "${path}" to be an object`);
    }
    if (!LIVE_RESULT_TYPES.includes(result.type)) {
      throw new Error(`unexpected "${path}.type": ${String(result.type)}`);
    }
    for (const field of ["slug", "name", "sub"] as const) {
      if (typeof result[field] !== "string") {
        throw new Error(`expected "${path}.${field}" to be a string`);
      }
    }
  });
  return {
    query: typeof body.query === "string" ? body.query : "",
    results: body.results,
    hasMore: body.hasMore === true,
  };
};

/** GET /search — unified cross-entity search (live mode, session required).
 *  Accepts an `AbortSignal` (react-query forwards its `queryFn` signal here)
 *  so a fast retype in the ⌘K palette cancels the previous keystroke's
 *  still-in-flight request instead of letting it run to completion.
 *  `limit` lets a caller ask for more than the default per-type cap once a
 *  single `type` is selected — the backend only widens the per-type cap when
 *  `type` is set (see `search.service.ts`'s `perTypeLimit`), so passing
 *  `limit` without `type` has no effect on an unfiltered query. `offset` is
 *  the same story: it pages one type's tab and is ignored without `type`. */
export function searchApi(
  query: string,
  type?: LiveResultType,
  signal?: AbortSignal,
  limit?: number,
  offset?: number,
): Promise<SearchResponseDTO> {
  const params = new URLSearchParams({ q: query });
  if (type) params.set("type", type);
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  return apiGet<SearchResponseDTO>(
    `/search?${params.toString()}`,
    undefined,
    validateSearchResponse,
    signal,
  );
}
