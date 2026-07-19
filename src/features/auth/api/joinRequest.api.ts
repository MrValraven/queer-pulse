import {
  ApiError,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

/**
 * A prospective member's request to join QueerPulse. This is the platform-level
 * "ask to come in" flow (RequestInvitePage) — distinct from a member inviting a
 * friend (invite.api.ts) and from community-scoped join requests (handled by the
 * CommunityMembershipProvider). The mod queue reviews these.
 */
export interface JoinRequestDTO {
  id: string;
  /** The applicant's own name, as they typed it on the form. */
  name: string;
  /** Where we'd reach them — the whole point of the form, and the dedupe key. */
  email: string;
  /** Optional on the form, so null (never absent) once stored. */
  city: string | null;
  /** The applicant's own words — why they want in (POST body `message`, 1–1000). */
  message: string;
  status: "pending" | "approved" | "declined";
  /** When the 18+ self-attestation was recorded. Shown in the mod queue. */
  ageAttestedAt: string;
  /** Which Terms version's eligibility clause was affirmed. */
  termsVersion: string;
  /** ISO timestamp the request was submitted. */
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  /**
   * Populated on approve. The backend returns the **code only, never a URL** —
   * the client builds the shareable link from the route map (`inviteLink`).
   */
  inviteCode: string | null;
}

/** Payload for a prospective member's request to join. */
export interface CreateJoinRequestInput {
  /** How they'd like to be called — carried into the mod queue. */
  name: string;
  /** Required: with no account behind this route, it's the only way back to them. */
  email: string;
  /** Optional — helps the mod queue place someone. */
  city?: string;
  /** The applicant's own words — why they want in (1–1000 chars). */
  message: string;
  /** The 18+ self-attestation (spec 06). Must be true; the backend re-validates. */
  ageAttested: true;
  /** Which Terms version's eligibility clause was affirmed. */
  termsVersion: string;
  /** Optional stronger record; server rejects a DOB computing to age < 18. */
  dateOfBirth?: string;
}

/** The narrow 201 echo of a submitted request — no PII is read back. */
export interface CreateJoinRequestResult {
  id: string;
  status: "pending";
  createdAt: string;
}

/**
 * Submit a join request. **Public route — no session required**: the applicant
 * has no account yet (the old flow wrongly demanded a signed-in "pending" user,
 * which could never exist). Body carries name/email/city/message plus the 18+
 * attestation, which the mod queue sees and the backend re-validates.
 *
 * Failure modes the UI must handle rather than treat as a generic error:
 * - `409` — an open request already exists for that email ({@link isDuplicateJoinRequest})
 * - `403 { code: "UNDER_18" }` — a supplied DOB computes to under 18 ({@link isUnder18Error})
 */
export const createJoinRequest = (input: CreateJoinRequestInput) =>
  apiPost<CreateJoinRequestResult>("/join-requests", input);

/**
 * True when the backend says this email already has an open request. Not a
 * failure on the applicant's part — the UI confirms rather than scolds.
 */
export function isDuplicateJoinRequest(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

/** True for the typed `403 { code: "UNDER_18" }` age rejection. */
export function isUnder18Error(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    err.status === 403 &&
    (err.data as { code?: string } | null | undefined)?.code === "UNDER_18"
  );
}

/**
 * True for the typed `403 { code: "JOIN_REQUESTS_CLOSED" }` rejection — an
 * admin closed invite requests while this form was already open. The
 * pre-emptive check on RequestInvitePage can't catch this, since it only reads
 * platform status once, before the form is filled in.
 */
export function isJoinRequestsClosedError(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    err.status === 403 &&
    (err.data as { code?: string } | null | undefined)?.code ===
      "JOIN_REQUESTS_CLOSED"
  );
}

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

/**
 * A moderator's decision on a join request (Mod/Admin only). The approved
 * response carries `inviteCode` — there is no email service, so the reviewer
 * sends the resulting link themselves.
 */
export const reviewJoinRequest = (
  id: string,
  status: "approved" | "declined",
) =>
  apiPatch<JoinRequestDTO>(`/join-requests/${encodeURIComponent(id)}`, {
    status,
  });
