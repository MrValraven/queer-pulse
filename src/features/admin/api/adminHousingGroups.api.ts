import { apiGet, apiPatch } from "../../../shared/api/client";

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

/** Every group join request across all groups, for the triage queue. */
export const getAdminGroupJoinRequests = () =>
  apiGet<AdminGroupJoinRequestDTO[]>("/admin/housing-groups/join-requests");

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
