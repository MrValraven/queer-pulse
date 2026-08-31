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
   * The deciding reviewer's display name, resolved server-side from
   * `reviewedBy` in the same batched lookup that resolves `assignedStaffName`.
   * Absent when `reviewedBy` is null, including after that reviewer's erasure,
   * which NULLs the id, so no name can come back from a decision they made.
   * The id stays beside this because a display name is not stable enough to
   * group a reviewer's decisions on.
   */
  reviewedByName?: string;
  /**
   * Populated on approve. The backend returns the **code only, never a URL** —
   * the client builds the shareable link from the route map (`inviteLink`).
   */
  inviteCode: string | null;
  /**
   * Lifecycle of that invite, recomputed by the backend on every read. Null
   * when no invite was minted. An approval invite lapses after 7 days, and
   * QueerPulse sends no email, so a reviewer looking back at a past approval
   * needs to know whether the link they are about to copy still works.
   */
  inviteStatus: "valid" | "used" | "expired" | "revoked" | null;
  /** ISO timestamp the invite stops working, or null when it has no expiry. */
  inviteExpiresAt: string | null;
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
  /**
   * OPS-04. The reviewer currently working this request, or null when nobody
   * has claimed it. Distinct from `reviewedBy`, which is who DECIDED it: a
   * claim says "I have this open" so two reviewers do not open the same
   * applicant, and it is given back by releasing.
   */
  assignedStaffId: string | null;
  /** The claiming reviewer's display name. Absent on an unclaimed request,
   *  and "Deleted member" after their erasure. */
  assignedStaffName?: string;
  /**
   * ISO timestamp this request should have been answered by (3 days from
   * submission — `join-request-sla.ts` on the backend owns the window). Null
   * means NO CLOCK, never overdue: requests decided before OPS-04 existed
   * carry none.
   */
  dueAt: string | null;
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
  /**
   * The applicant's opaque status token (base64url, 43 chars) — the key to
   * {@link getJoinRequestStatus}.
   *
   * **This 201 is the one and only time it ever exists.** The backend stores
   * only its sha256 hash, so it cannot be looked up, re-derived or re-issued,
   * and QueerPulse sends no email and never will, so nothing else will ever
   * carry it to the applicant. If the client does not both SHOW it and PERSIST
   * it at this moment (see `rememberJoinRequestStatusToken`), the applicant has
   * permanently lost the only route to their own decision.
   *
   * Absent from the 409 duplicate path, which creates no row and mints no
   * token — the confirmation screen must render without a code there rather
   * than showing an empty slot.
   */
  statusToken: string;
}

/**
 * What the public status endpoint answers with. Every key is always present;
 * the three nullable ones arrive as `null` rather than absent.
 */
export interface JoinRequestStatusDTO {
  /**
   * The applicant-facing state. Deliberately NARROWER than
   * {@link JoinRequestDTO.status}: the backend collapses `waitlisted` into
   * `under_review` and forces `decidedAt` to null for it, because a waiting
   * list is an internal triage tool and telling someone they are on one is a
   * decision we have not actually made. Never write copy implying one exists.
   */
  status: "under_review" | "approved" | "declined";
  /** ISO 8601, always present — when they sent the request. */
  submittedAt: string;
  /** ISO 8601. Null while under review. */
  decidedAt: string | null;
  /** A closed-set reason key (see `joinRequestDeclineReason.ts`). Non-null
   *  only when declined. */
  declineReason: string | null;
  /**
   * The invite CODE (never a URL — the client builds the link with
   * `inviteFullUrlFor`). Non-null only when approved AND the invite is still
   * redeemable, so `status: "approved"` with a null code is a real, reachable
   * state: approved, but the invite has since been used, revoked or expired.
   */
  inviteCode: string | null;
  /**
   * WHY the code above is or is not there. `expired` is the recoverable one:
   * the applicant can revive it themselves with
   * {@link refreshJoinRequestInvite}. `used` means an account already
   * exists on it, and `revoked` was a moderator's deliberate act. Null when the
   * approval minted no invite, and on every non-approved request.
   *
   * Before this existed the page collapsed all three into one "your invite has
   * run out" dead end, which was wrong for two of them and unrecoverable for
   * the third.
   */
  inviteStatus: "valid" | "used" | "expired" | "revoked" | null;
  /**
   * ISO 8601 deadline of that invite, present whenever there is an invite at
   * all (including a lapsed one, where it is the moment it lapsed).
   *
   * The clock behind it starts at the applicant's FIRST status read, not at
   * approval: approval is a moment only the reviewer knows about, since
   * QueerPulse sends the applicant nothing. So this date is always one the
   * applicant has been shown before it matters, and the page must show it.
   */
  inviteExpiresAt: string | null;
}

/**
 * The shape the backend's status DTO accepts: base64url, 32–128 chars. Guarding
 * on it client-side turns an obvious typo into an instant answer instead of
 * spending one of the endpoint's 20 requests/hour on a certain 400.
 */
export const JOIN_REQUEST_STATUS_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

/** True when `token` could plausibly be a status token at all. */
export function isWellFormedStatusToken(token: string): boolean {
  return JOIN_REQUEST_STATUS_TOKEN_PATTERN.test(token);
}

/**
 * Where a specific join request stands. **Public route — no session**: the
 * applicant has no account, which is the whole point. Keyed solely on the
 * opaque token from {@link CreateJoinRequestResult.statusToken}, throttled at
 * 20 requests/hour per IP.
 *
 * Only two failures exist, and both mean "we cannot show you anything":
 * - `400` — the token is malformed or missing ({@link isMalformedStatusToken})
 * - `404` — a single indistinguishable miss ({@link isJoinRequestStatusNotFound}),
 *   which deliberately never reveals whether a given code exists.
 */
export const getJoinRequestStatus = (token: string) =>
  apiGet<JoinRequestStatusDTO>(
    `/join-requests/status?token=${encodeURIComponent(token)}`,
  );

/**
 * True for the `404` from {@link getJoinRequestStatus}. Not an error in the
 * usual sense: it is the endpoint's honest "we cannot find that", so the UI
 * renders a calm "check the code" state rather than a failure. Callers must not
 * sniff `err.status` themselves — a 404 anywhere else in this file would mean
 * something different.
 */
export function isJoinRequestStatusNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

/** True for the `400` a malformed or absent token gets. Same answer to the
 *  applicant as a 404 — one message that confirms nothing either way. */
export function isMalformedStatusToken(err: unknown): boolean {
  return err instanceof ApiError && err.status === 400;
}

/**
 * True when the status lookup can never succeed for this code, however the
 * backend phrased it. Both branches get one identical message, so an attacker
 * probing codes learns nothing from the difference, and retrying is pointless
 * — which is exactly the rule the query hook's `retry` needs.
 */
export function isUnresolvableStatusToken(err: unknown): boolean {
  return isJoinRequestStatusNotFound(err) || isMalformedStatusToken(err);
}

/**
 * Revive the lapsed invite an approval handed this applicant, keyed on the same
 * status token the read uses. **Public route, no session**: this is the
 * applicant acting for themselves, holding nothing else.
 *
 * It exists because approval used to expire into a dead end. Nothing carries an
 * approval to the applicant, so they learn of it only by coming back to look;
 * if they came back after the window closed, the page said the invite was gone
 * and offered no way to get another.
 *
 * Failures the UI must tell apart:
 * - `404`: the same indistinguishable miss the read answers with
 *   ({@link isUnresolvableStatusToken}), so this route is no more of an oracle
 *   than that one.
 * - `409 { code }`: `INVITE_ALREADY_USED`, `INVITE_REVOKED`,
 *   `INVITE_REFRESH_LIMIT` or `INVITE_REFRESH_UNAVAILABLE`
 *   ({@link joinRequestInviteRefreshRefusal}). Each is a real state with its
 *   own sentence; none of them is a retry.
 *
 * A still-valid invite is NOT an error: it comes back `200` with the live code,
 * because that is what the applicant was asking for.
 */
export const refreshJoinRequestInvite = (token: string) =>
  apiPost<JoinRequestStatusDTO>("/join-requests/status/invite/refresh", {
    token,
  });

/** The closed set of reasons a refresh can be refused. */
export type JoinRequestInviteRefreshRefusal =
  | "INVITE_ALREADY_USED"
  | "INVITE_REVOKED"
  | "INVITE_REFRESH_LIMIT"
  | "INVITE_REFRESH_UNAVAILABLE";

const REFRESH_REFUSALS: readonly JoinRequestInviteRefreshRefusal[] = [
  "INVITE_ALREADY_USED",
  "INVITE_REVOKED",
  "INVITE_REFRESH_LIMIT",
  "INVITE_REFRESH_UNAVAILABLE",
];

/**
 * The typed reason behind a refused refresh, or null for anything else (a
 * network failure, a 404, an unrecognised code from a newer backend). Callers
 * must fall back to their generic message on null rather than rendering a raw
 * code.
 */
export function joinRequestInviteRefreshRefusal(
  err: unknown,
): JoinRequestInviteRefreshRefusal | null {
  if (!(err instanceof ApiError) || err.status !== 409) return null;
  const code = (err.data as { code?: string } | null | undefined)?.code;
  return REFRESH_REFUSALS.find((refusal) => refusal === code) ?? null;
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
 *
 * On success the 201 carries `statusToken`, which exists nowhere else, ever.
 * Every caller of this function is responsible for persisting it — see
 * {@link CreateJoinRequestResult.statusToken}.
 */
export const createJoinRequest = (input: CreateJoinRequestInput) =>
  apiPost<CreateJoinRequestResult>("/join-requests", input);

/**
 * True when the backend says this email already has an open request. Not a
 * failure on the applicant's part — the UI confirms rather than scolds.
 *
 * The backend labels it `JOIN_REQUEST_PENDING`, which is what lets the
 * confirmation screen offer the way BACK to that request instead of ending the
 * journey on "you already asked". Older backends send a bare 409, so the status
 * alone still decides.
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
 * True when the public submit route's per-IP throttle (3 requests/hour, see
 * the `@Throttle` on `JoinRequestsController.submit`) tripped. An immediate
 * retry will fail again for up to an hour, so the UI must not suggest one —
 * see {@link isDuplicateJoinRequest} for the sibling special case.
 */
export function isRateLimitedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 429;
}

/** Read options the queue list accepts beyond the status filter. */
export interface GetJoinRequestsOptions {
  /** Page size, 1–100 on the backend. Omit for its own default (200). */
  limit?: number;
  /** Queue order. The backend defaults to "oldest" (fair triage of the waiting
   *  queue); a history view wants "newest" so the last decision reads first. */
  sort?: "oldest" | "newest";
  /**
   * OPS-04's "Assigned to me" filter, applied server-side. `"me"` resolves to
   * the CALLER on the backend, from the session, so no reviewer's id ever
   * travels on the wire and nobody can ask what a named colleague is holding.
   * `"unassigned"` narrows to what nobody has picked up. Omit for everything.
   */
  assignedTo?: "me" | "unassigned";
}

/**
 * List join requests for the moderator queue (Mod/Admin only). Optional `status`
 * filters the queue (defaults to the backend's own default, typically "pending").
 *
 * There is no server-side text search on this route, so a caller wanting to
 * find one applicant by name filters over what it has loaded and says so.
 */
export const getJoinRequests = (
  status?: JoinRequestDTO["status"],
  options: GetJoinRequestsOptions = {},
) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (options.limit != null) params.set("limit", String(options.limit));
  if (options.sort) params.set("sort", options.sort);
  if (options.assignedTo) params.set("assignedTo", options.assignedTo);
  const query = params.toString();
  return apiGet<JoinRequestDTO[]>(
    query ? `/join-requests?${query}` : "/join-requests",
  );
};

/**
 * A moderator's decision on a join request (Mod/Admin only). Declining
 * requires `declineReason` — the backend rejects a decline with none.
 *
 * Approving puts NOTHING in the applicant's inbox: QueerPulse runs no mail
 * service and never will. The approved response carries `inviteCode`, and
 * carrying that link over to the applicant is the reviewer's own job.
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

/**
 * Re-mint the expired invite an approval already handed out (Mod/Admin only),
 * addressed by the JOIN REQUEST id. Refreshes the same code's expiry, so a
 * link a reviewer copied earlier starts working again.
 *
 * The member-facing `POST /invites/:code/resend` cannot be used here: it is
 * scoped to the inviter, and the inviter on an approval invite is whichever
 * reviewer approved it. Failure modes each deserve their own message:
 * - `404` — unknown request, or one that never minted an invite;
 * - `409` — the invite was accepted or revoked, or is still valid;
 * - `403` — the caller is not a moderator or admin.
 */
export const reissueJoinRequestInvite = (id: string) =>
  apiPost<JoinRequestDTO>(
    `/join-requests/${encodeURIComponent(id)}/invite/reissue`,
  );

/** A random sample of past-reviewed requests, for the periodic peer quality
 *  pass (Mod/Admin only). */
export const sampleJoinRequests = (n = 10) =>
  apiGet<JoinRequestDTO[]>(`/join-requests/sample?n=${n}`);
