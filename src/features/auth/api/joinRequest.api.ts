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
  /** The email of a member already here who can vouch for the applicant, as a
   *  structured field a reviewer can actually match — null when they named
   *  nobody. */
  mutualMemberEmail: string | null;
  status: "pending" | "approved" | "declined" | "waitlisted";
  /** When the 18+ self-attestation was recorded. Shown in the mod queue. */
  ageAttestedAt: string;
  /** Which Terms version's eligibility clause was affirmed. */
  termsVersion: string;
  /**
   * Which frontend entry point the applicant came through (a stable key from
   * {@link JoinRequestSource}, e.g. "skills"). Null for a direct visit or a
   * legacy row. Shown as a "came from" line in the mod queue.
   */
  source: string | null;
  /** ISO timestamp the request was submitted. */
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  /**
   * Populated on approve. The backend returns the **code only, never a URL** —
   * the client builds the shareable link from the route map (`inviteLink`).
   */
  inviteCode: string | null;
  /** Closed-set reason key the reviewer picked when declining. Null for
   *  approvals, waitlists, and legacy declines that predate this field. */
  declineReason: string | null;
  /** Confidence-tiered triage signals — surfaced to a human reviewer, never
   *  acted on automatically. See the backend's `join-request-flags.ts`. */
  flags: string[];
  /** How many times a request from this same email was previously declined,
   *  regardless of how long ago. */
  priorDeclineCount: number;
  /** Set only when `mutualMemberEmail` resolved to a real active member at
   *  submit time — the display name to show as corroboration. */
  referenceMemberName: string | null;
  /** The resolved member's profile slug, for a link. */
  referenceMemberSlug: string | null;
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
  /** The email of a member already here who can vouch for the applicant — a
   *  structured field a reviewer can match, distinct from the free-text
   *  `message`. Omit when they named nobody. */
  mutualMemberEmail?: string;
  /** The 18+ self-attestation (spec 06). Must be true; the backend re-validates. */
  ageAttested: true;
  /** Which Terms version's eligibility clause was affirmed. */
  termsVersion: string;
  /** Optional stronger record; server rejects a DOB computing to age < 18. */
  dateOfBirth?: string;
  /**
   * Which CTA sent the applicant here (a {@link JoinRequestSource} key). Omitted
   * for a direct visit to the request page. Attribution only — the backend
   * length-caps it and never treats it as identity.
   */
  source?: string;
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
 * - `429` — the public route's per-IP throttle (3/hour) tripped ({@link isRateLimitedError})
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
 * True when the public submit route's per-IP throttle (3/hour) tripped. An
 * immediate retry will fail again for up to an hour, so the UI must not
 * suggest one — see {@link isDuplicateJoinRequest} for the sibling special case.
 */
export function isRateLimitedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 429;
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
 * A moderator's decision on a join request (Mod/Admin only). Declining
 * requires `declineReason` — the backend rejects a decline with none.
 * Approving also fires an automatic invite email; the approved response
 * still carries `inviteCode` so the reviewer can send the resulting link
 * themselves as a manual backup.
 */
export const reviewJoinRequest = (
  id: string,
  status: "approved" | "declined" | "waitlisted",
  declineReason?: string,
) =>
  apiPatch<JoinRequestDTO>(`/join-requests/${encodeURIComponent(id)}`, {
    status,
    declineReason,
  });

export const JOIN_REQUEST_BULK_ACTION_CAP = 50;

export interface BulkReviewResult {
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

/** Bulk approve/decline/waitlist (Mod/Admin only), up to
 *  `JOIN_REQUEST_BULK_ACTION_CAP` ids per call. Per-item result, not
 *  all-or-nothing — check `failed` even on a 200. */
export const bulkReviewJoinRequests = (
  ids: string[],
  status: "approved" | "declined" | "waitlisted",
  declineReason?: string,
) =>
  apiPost<BulkReviewResult>("/join-requests/bulk", {
    ids,
    status,
    declineReason,
  });

/** A random sample of past-reviewed requests, for the periodic peer quality
 *  pass (Mod/Admin only). */
export const sampleJoinRequests = (n = 10) =>
  apiGet<JoinRequestDTO[]>(`/join-requests/sample?n=${n}`);
