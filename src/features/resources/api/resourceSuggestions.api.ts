import { apiGet } from "../../../shared/api/client";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// The submitter's own view of the resources they suggested, mirroring
// `MyResourceSuggestionDTO` in queerpulse-backend
// (`src/resources/resource-suggestion-response.ts`). Kept in its own module
// rather than in `resources.api.ts`, which is the guide/glossary/listings
// read side; this is a member's own submission tracker and the two have
// nothing in common but a URL prefix.

/**
 * Where a suggestion has got to. Mirrors the backend
 * `ResourceSuggestionStatus` enum: renaming a value here without renaming it
 * there silently drops the row out of every branch that reads it.
 *
 * `archived` means the queue closed it without a verdict either way, a
 * duplicate or a stale row, and it is deliberately its own state rather than
 * a shade of `declined`: telling somebody they were turned down when nobody
 * turned them down is worse than telling them the truth.
 */
export type ResourceSuggestionStatus =
  "pending" | "approved" | "declined" | "archived";

/** One row of `GET /resources/suggestions/mine`. */
export interface MyResourceSuggestionDTO {
  id: string;
  /** "legal_aid" | "sexual_health_testing" — the directory it was suggested for. */
  category: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  /** ISO timestamp: when the member sent it in. */
  createdAt: string;
  status: ResourceSuggestionStatus;
  /** ISO timestamp of the decision, null while `pending`. */
  decidedAt: string | null;
  /**
   * The reviewer's written reason, addressed to this member. Null when the
   * reviewer left none, and null on every pending row. Never carries the
   * reviewer's identity: the backend withholds `decidedBy` outright.
   */
  decisionNote: string | null;
}

/** `GET /resources/suggestions/mine`. Always an object, never null. */
export interface MyResourceSuggestionsDTO {
  items: MyResourceSuggestionDTO[];
}

/**
 * The caller's own resource suggestions, newest first, capped at 50 by the
 * backend. Scoped to the session, so there is no id to pass.
 *
 * `apiGet` and not `apiGetNullable`: the endpoint answers `{ items: [] }` for
 * a member who has never suggested anything, so react-query never sees an
 * undefined body.
 */
export function getMyResourceSuggestions(): Promise<MyResourceSuggestionsDTO> {
  return apiGet<MyResourceSuggestionsDTO>("/resources/suggestions/mine");
}
