import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";

/**
 * A prospective member's request to join QueerPulse. This is the platform-level
 * "ask to come in" flow (RequestInvitePage) — distinct from a member inviting a
 * friend (invite.api.ts) and from community-scoped join requests (handled by the
 * CommunityMembershipProvider). The mod queue reviews these.
 */
export interface JoinRequestDTO {
  id: string;
  /** The applicant's own words — why they want in (POST body `message`, 1–1000). */
  message: string;
  status: "pending" | "approved" | "declined";
  /** ISO timestamp the request was submitted. */
  createdAt: string;
  /** Present for Mod/Admin list views: who's asking. Absent on the submit echo. */
  applicant?: {
    firstName: string;
    lastName: string;
    email?: string;
    /** Pre-formatted mutual/vouch line, if the applicant named someone. */
    mutual?: string | null;
    avatarUrl?: string | null;
  } | null;
}

/** Payload for a prospective member's request to join. */
export interface CreateJoinRequestInput {
  /** The applicant's own words — why they want in (1–1000 chars). */
  message: string;
  /** The 18+ self-attestation (spec 06). Must be true; the backend re-validates. */
  ageAttested: true;
  /** Which Terms version's eligibility clause was affirmed. */
  termsVersion: string;
  /** Optional stronger record; server rejects a DOB computing to age < 18. */
  dateOfBirth?: string;
}

/**
 * Submit a join request for the signed-in-but-not-yet-approved member. This route
 * is pending-ok: it works before the member is verified. Body carries the message
 * plus the 18+ attestation, which the mod queue sees and the backend re-validates
 * (rejecting when `ageAttested !== true` or a supplied DOB computes to age < 18).
 */
export const createJoinRequest = (input: CreateJoinRequestInput) =>
  apiPost<JoinRequestDTO>("/join-requests", input);

/**
 * List join requests for the moderator queue (Mod/Admin only). Optional `status`
 * filters the queue (defaults to the backend's own default, typically "pending").
 */
export const getJoinRequests = (status?: JoinRequestDTO["status"]) =>
  apiGet<JoinRequestDTO[]>(
    status
      ? `/join-requests?status=${encodeURIComponent(status)}`
      : "/join-requests",
  );

/** A moderator's decision on a join request (Mod/Admin only). */
export const reviewJoinRequest = (
  id: string,
  status: "approved" | "declined",
) =>
  apiPatch<JoinRequestDTO>(`/join-requests/${encodeURIComponent(id)}`, {
    status,
  });
