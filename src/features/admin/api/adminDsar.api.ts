import { ApiError, apiGet, apiPatch } from "../../../shared/api/client";

/**
 * Admin review queue for data-subject requests (`/admin/dsar`,
 * Moderator/Admin). A DSAR is filed from the member's own account data pane
 * (`POST /account/dsar`) and starts a 30-day statutory clock the moment it
 * lands, so this queue is sorted by deadline server-side and every row carries
 * the countdown. This file only owns the wire shape; the backend does the
 * guarding and 403s otherwise.
 */

/** The stored lifecycle of one request. `received` is what intake writes. */
export type AdminDsarStatus =
  "received" | "in_review" | "resolved" | "rejected";

/** The statuses an operator can move a request INTO. Nothing returns a request
 *  to `received`, and the two terminal states accept no further moves. */
export type AdminDsarTargetStatus = Exclude<AdminDsarStatus, "received">;

/** GDPR articles the intake form offers: access, rectification, erasure,
 *  objection. Carried as a number so the copy can key off it directly. */
export type AdminDsarArticle = 15 | 16 | 17 | 21;

/** The member who filed the request, composed name and all. */
export interface AdminDsarMemberDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminDsarRequestDTO {
  id: string;
  /** The human-facing tracking code the member was shown, e.g. "DSAR-4F91A2B0". */
  reference: string;
  article: AdminDsarArticle;
  status: AdminDsarStatus;
  /** Which parts of their data the member named on the intake form. */
  scopes: string[];
  /** What they asked for, in their own words. */
  details: string;
  /** Where in the product they filed it from, when intake captured that. */
  context: string | null;
  member: AdminDsarMemberDTO | null;
  submittedAt: string;
  /** The statutory deadline: submitted + 30 days. */
  dueBy: string;
  respondedAt: string | null;
  /** What the operator decided, written when the request was closed. */
  outcomeNote: string | null;
  /** Whole days left before `dueBy`; negative once the deadline has passed. */
  daysRemaining: number;
  /** True only while the request is still open AND past its deadline. */
  isOverdue: boolean;
}

export interface AdminDsarListDTO {
  items: AdminDsarRequestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** GET /admin/dsar. Closest statutory deadline first, paginated, optionally
 *  filtered by status. */
export const getAdminDsarRequests = (parameters: {
  page?: number;
  status?: AdminDsarStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminDsarListDTO>(
    `/admin/dsar${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** GET /admin/dsar/:id. One request in full. */
export const getAdminDsarRequest = (id: string) =>
  apiGet<AdminDsarRequestDTO>(`/admin/dsar/${id}`);

export interface UpdateAdminDsarBody {
  status: AdminDsarTargetStatus;
  /** Required by the backend for `resolved`/`rejected`: closing a statutory
   *  request without saying what was done is refused with a 400. */
  outcomeNote?: string;
}

/**
 * PATCH /admin/dsar/:id. Moves a request along and records the outcome.
 * Returns the request in its new state, so the caller patches the row rather
 * than refetching the page.
 *
 * Failure modes worth telling apart from a generic error:
 * - `409`: that move is not available from where the request is, usually
 *   because someone else moved it while the pane was open
 *   ({@link isDsarTransitionConflict}).
 * - `400`: a closing move with no outcome note.
 */
export const updateAdminDsarRequest = (id: string, body: UpdateAdminDsarBody) =>
  apiPatch<AdminDsarRequestDTO>(`/admin/dsar/${id}`, body);

/** True when the backend refused a move because the request had already moved
 *  on underneath the open pane. A conflict, never a fault. */
export function isDsarTransitionConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
