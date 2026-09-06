import { apiGet, apiPost } from "../../../shared/api/client";

export interface CoopFaceDTO {
  initials: string;
  tint: "coral" | "jade" | "plum";
}

export interface HousingCoopDTO {
  id: string;
  slug: string;
  name: string;
  nameEm: string | null;
  city: string;
  area: string;
  householdCount: number;
  phase: "forming" | "legal" | "finance" | "property" | "daily";
  progress: number;
  operational: boolean;
  operationalSince: string | null;
  formingSince: string | null;
  description: string;
  shareAmountEuros: number | null;
  monthlyEuros: number | null;
  sharesAreTarget: boolean;
  ctaKind: "join" | "updates" | "mentor";
  faces: CoopFaceDTO[];
  published: boolean;
  operatorVerified: boolean;
}

export interface CoopJoinRequestBody {
  name: string;
  householdSize: string;
  note?: string;
}

/** The three states a co-op join request moves through. Mirrors the backend
 *  `JoinRequestStatus` enum exactly. */
export type CoopJoinRequestStatus = "pending" | "accepted" | "declined";

/**
 * The APPLICANT's own view of a co-op join request (PRD-242). Deliberately
 * leaner than the admin row: it carries which co-op was asked and where the
 * request stands, and none of the triage material (`householdSize`, `note`)
 * that belongs to the review console.
 */
export interface MyCoopJoinRequestDTO {
  id: string;
  status: CoopJoinRequestStatus;
  createdAt: string;
  coop: { slug: string; name: string } | null;
}

export const getHousingCoops = () => apiGet<HousingCoopDTO[]>("/housing/coops");

/** The caller's own co-op applications across every co-op, newest first.
 *  Signed-in callers only. */
export const getMyCoopJoinRequests = () =>
  apiGet<MyCoopJoinRequestDTO[]>("/housing/coops/join-requests/mine");

export const submitCoopJoinRequest = (
  slug: string,
  body: CoopJoinRequestBody,
) => apiPost<{ id: string }>(`/housing/coops/${slug}/join-requests`, body);
