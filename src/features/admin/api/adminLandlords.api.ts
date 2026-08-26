import { apiDelete, apiGet, apiPatch } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";

/**
 * The landlord directory console (`/admin/landlords`, moderator/admin only).
 *
 * Two things members do here reach the database and wait on a person: they
 * suggest a landlord for the directory, and they ask to be introduced to one.
 * Both decisions are now sent back to the member who did the work, and a
 * decision that goes against them carries its reason.
 *
 * Mirrors the backend `AdminLandlordDTO` / `IntroRequestDTO` hand-mapped in
 * `landlord-response.ts`. 403s for anyone without the role.
 */

/** The member a row is about, as the backend's compact `MemberRef`. */
export interface LandlordMemberRef {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns: string | null;
  avatarUrl: string | null;
}

/** `review` is "suggested, not published yet"; `live` is in the directory. */
export type LandlordStatus = "review" | "live";

export interface AdminLandlordDTO {
  id: string;
  slug: string;
  name: string;
  initials: string;
  tint: "coral" | "jade" | "plum";
  photo: string | null;
  hood: string;
  note: string;
  tagline: string;
  rating: { score: string; count: number };
  status: LandlordStatus;
  /** The member who suggested the entry; `null` for a staff-created one. */
  submittedBy: LandlordMemberRef | null;
  decidedAt: string | null;
  /** The deciding staffer's user id — the audit key, never a display name. */
  decidedBy: string | null;
  decisionReason: string | null;
  createdAt: string;
}

export type LandlordIntroStatus = "pending" | "accepted" | "declined";

export interface LandlordIntroRequestDTO {
  id: string;
  landlordSlug: string;
  landlordName: string;
  /** The name the member typed on the form, which may be a chosen name. */
  name: string;
  note: string | null;
  contactEmail: string | null;
  status: LandlordIntroStatus;
  createdAt: string;
  /** The member who asked; `null` once their account has been erased. */
  requester: LandlordMemberRef | null;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionReason: string | null;
}

/** The directory tab's status filter, plus the "everything" option. */
export type LandlordStatusFilter = LandlordStatus | "all";
/** The introduction tab's state filter, plus "everything". */
export type LandlordIntroFilter = LandlordIntroStatus | "all";

export interface AdminLandlordListParameters {
  page?: number;
  status?: LandlordStatus;
  hood?: string;
  /** Free-text match over the entry's name. */
  q?: string;
}

/** One page of directory entries, newest first. */
export const getAdminLandlords = (
  parameters: AdminLandlordListParameters,
  signal?: AbortSignal,
) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  if (parameters.hood) searchParams.set("hood", parameters.hood);
  if (parameters.q) searchParams.set("q", parameters.q);
  const querySuffix = searchParams.toString();
  return apiGet<ItemsPage<AdminLandlordDTO>>(
    `/admin/landlords${querySuffix ? `?${querySuffix}` : ""}`,
    undefined,
    undefined,
    signal,
  );
};

/**
 * Publish a suggested entry, or hold it back for review.
 *
 * The backend requires a reason whenever a member-suggested entry is moved back
 * to `review`, is idempotent on an unchanged status, and tells the member who
 * suggested it either way. It answers with the landlord's full detail shape,
 * which this console does not render, so the row is reconciled by refetching.
 */
export const setAdminLandlordStatus = (
  id: string,
  body: { status: LandlordStatus; reason?: string },
) => apiPatch<unknown>(`/admin/landlords/${id}/status`, body);

/**
 * Remove a directory entry. The reason rides in the query string because a
 * DELETE body is not reliably carried by every client, and the backend requires
 * it whenever there is a member to tell.
 */
export const removeAdminLandlord = (id: string, reason?: string) => {
  const querySuffix = reason
    ? `?${new URLSearchParams({ reason }).toString()}`
    : "";
  return apiDelete<void>(`/admin/landlords/${id}${querySuffix}`);
};

export interface AdminIntroRequestListParameters {
  page?: number;
  status?: LandlordIntroStatus;
  /** Narrow to one landlord by slug. An unknown slug yields an empty page. */
  landlord?: string;
}

/** One page of introduction requests, newest first. */
export const getAdminIntroRequests = (
  parameters: AdminIntroRequestListParameters,
  signal?: AbortSignal,
) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  if (parameters.landlord) searchParams.set("landlord", parameters.landlord);
  const querySuffix = searchParams.toString();
  return apiGet<ItemsPage<LandlordIntroRequestDTO>>(
    `/admin/landlords/intro-requests${querySuffix ? `?${querySuffix}` : ""}`,
    undefined,
    undefined,
    signal,
  );
};

/**
 * Answer an introduction request. The backend requires a reason on `declined`,
 * is idempotent, and sends the answer to the member who asked.
 */
export const triageAdminIntroRequest = (
  id: string,
  body: { action: "accepted" | "declined"; reason?: string },
) =>
  apiPatch<LandlordIntroRequestDTO>(
    `/admin/landlords/intro-requests/${id}`,
    body,
  );
