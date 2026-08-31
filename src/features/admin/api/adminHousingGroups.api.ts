import { apiGet, apiPatch } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";

/**
 * Admin housing-groups console (`/admin/housing-groups`, moderator/admin only).
 * Mirrors the backend `AdminGroupJoinRequestDTO` / `AdminGroupListingDTO` shapes
 * hand-mapped in `housing-groups-response.ts` — the moderation fields (mutual-
 * connections trust signal, hidden/hiddenReason) the public DTOs deliberately
 * drop. 403s for anyone without the role.
 */

/** One answer to a screening question, snapshotting the prompt text. */
export interface GroupScreeningAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export type GroupJoinRequestStatus = "pending" | "approved" | "declined";

export interface AdminGroupJoinRequestDTO {
  id: string;
  name: string;
  relationship: string;
  answers: GroupScreeningAnswer[];
  note: string | null;
  status: GroupJoinRequestStatus;
  createdAt: string;
  group: { slug: string; name: string } | null;
  /** Accepted connections already in this group; null when applied anonymously. */
  mutualConnections: number | null;
}

export interface AdminGroupListingDTO {
  id: string;
  title: string;
  description: string;
  neighbourhood: string;
  priceEuros: number;
  accessibilityInfo: string;
  groupSlug: string | null;
  hidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
}

export type GroupTriageAction = "approved" | "declined";

export interface AdminGroupJoinRequestsParameters {
  page?: number;
  /** Omitted returns every status. The console asks for `pending`. */
  status?: GroupJoinRequestStatus;
  /** A group slug to narrow to. */
  group?: string;
}

/**
 * GET /admin/housing-groups/join-requests?page&status&group — one page of the
 * group join-request triage queue, newest first.
 *
 * This route used to answer with a flat array of the newest 200 requests in
 * EVERY status, and this console filtered to the pending ones in the browser
 * (ENG-41). So a group carrying 200 already-decided requests newer than one
 * pending request showed a moderator an empty queue while somebody waited. The
 * status filter now lives in the query, and the response is the
 * `{ items, total, page, pageSize }` envelope with `total` counting the whole
 * filtered queue. Wrapped in `toItemsPage` so a deploy where the backend is
 * still on the old array shape reads as one full page instead of throwing on
 * `.items`.
 */
export const getAdminGroupJoinRequests = async (
  parameters: AdminGroupJoinRequestsParameters = {},
) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  if (parameters.group) searchParams.set("group", parameters.group);
  const querySuffix = searchParams.toString();
  const response = await apiGet<
    AdminGroupJoinRequestDTO[] | ItemsPage<AdminGroupJoinRequestDTO>
  >(
    `/admin/housing-groups/join-requests${querySuffix ? `?${querySuffix}` : ""}`,
  );
  return toItemsPage(response);
};

export const triageAdminGroupJoinRequest = (
  id: string,
  action: GroupTriageAction,
) =>
  apiPatch<AdminGroupJoinRequestDTO>(
    `/admin/housing-groups/join-requests/${id}`,
    { action },
  );

/** Every group listing, including hidden ones, for norm enforcement. */
export const getAdminGroupListings = () =>
  apiGet<AdminGroupListingDTO[]>("/admin/housing-groups/listings");

export const setAdminGroupListingHidden = (
  id: string,
  hidden: boolean,
  reason?: string,
) =>
  apiPatch<AdminGroupListingDTO>(
    `/admin/housing-groups/listings/${id}/hidden`,
    { hidden, reason },
  );
