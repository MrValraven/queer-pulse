import {
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
} from "../../../shared/api/client";

/** The person who created the invite — resolved server-side from the code. */
export interface InviteInviterDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  /** Year/label the inviter joined, e.g. "2024". */
  memberSince?: string;
}

export interface InviteDTO {
  code: string;
  /** Only `valid` lets the recipient continue; the rest route to the expired page. */
  status: "valid" | "expired" | "used" | "revoked";
  /** ISO timestamp the invite stops working. Null when it has no set expiry. */
  expiresAt: string | null;
  /** Days the link stays live from creation (for the "Valid for N days" badge).
   *  Null when the invite has no set expiry. */
  validForDays: number | null;
  /** Current community size, for the "247 members" line. */
  memberCount: number;
  inviter: InviteInviterDTO;
  /** Whether the inviter is still an active member. `false` means they're
   *  deactivated / suspended / banned / erased — the redeem flow must not let a
   *  new member join off a ghost, even when `status` is still `valid`. */
  inviterActive: boolean;
  /** The personal note the inviter wrote — shown in the link preview / landing. */
  note?: string;
  /** The inviter's vouch (why they're inviting this person) — shown at onboarding. */
  vouch?: string;
}

/** Resolve an invite code to its inviter + status. 404 → invalid code. */
export const getInvite = (code: string) =>
  apiGet<InviteDTO>(`/invites/${encodeURIComponent(code)}`);

/** Any run of whitespace, including the newline a paste out of a chat carries. */
const CODE_WHITESPACE = /\s+/g;

/**
 * PRD-306. What a typed invite code has to become before it can be looked up.
 *
 * The backend matches the code EXACTLY (`invites.service.ts`,
 * `findOne({ where: { code } })`), and mints every code from an uppercase
 * alphabet in the shape `QP-XXXX-XXXX`. So two things a person typing by hand
 * gets wrong are recoverable here and nowhere else:
 *
 *   - CASE. Upper-casing can never break a real code, because no code has ever
 *     contained a lowercase character, and it rescues every code read out loud
 *     or typed on a phone keyboard.
 *   - WHITESPACE, anywhere. A code copied out of a message brings a trailing
 *     newline or a stray space with it, and the lookup would answer 404 for
 *     something the person holds correctly.
 *
 * Deliberately nothing else. No shape check, no hyphen repair: this platform
 * has codes that predate the current generator, the demo fixtures use their
 * own, and a client-side format rule would reject a valid code with a
 * confident error rather than letting the server answer honestly.
 */
export function normalizeInviteCode(raw: string): string {
  return raw.replace(CODE_WHITESPACE, "").toUpperCase();
}

/**
 * Characters that would break out of the `/auth/invite/:code` path segment
 * rather than resolve to a missing invite. Answered in the field, because
 * navigating with one produces a route miss rather than the honest
 * "we could not find that invite" the landing page renders.
 */
const CODE_PATH_BREAKING = /[/?#\\]/;

/** True when `code` (already normalized) can safely be put in the invite URL. */
export function isRoutableInviteCode(code: string): boolean {
  return code.length > 0 && !CODE_PATH_BREAKING.test(code);
}

/** What the member types when generating a share link. */
export interface CreateInvitePayload {
  /**
   * Optional address the invite is pinned to. When set, the backend stores it on
   * the invite row and `validateInviteForSignup` refuses any sign-up whose Google
   * account is a different address (typed `invite_email_mismatch` refusal), so a
   * forwarded or screenshotted link admits nobody else. Omitted, the invite stays
   * a bearer link anyone holding it can redeem. Pinning delivers NOTHING to the
   * address: QueerPulse sends no email, the member passes the link on themselves.
   */
  email?: string;
  /** Optional personal note shown in the link preview (max 200 chars). */
  note?: string;
  /** Optional vouch — why they're inviting this person — shown at onboarding (max 280). */
  vouch?: string;
}

/** The row the backend creates in the `invites` table, returned to the client. */
export interface CreatedInviteDTO {
  code: string;
  expiresAt: string;
  status: "valid";
}

/**
 * Persist a new invite. The backend ties it to the authenticated member, mints a
 * unique code, sets the expiry, and inserts the row in the `invites` table.
 */
export const createInvite = (payload: CreateInvitePayload) =>
  apiPost<CreatedInviteDTO>("/invites", payload);

/**
 * True for the typed `403 { code: "INVITE_QUOTA_EXCEEDED" }` refusal — the
 * member has already used up this month's personal-invite allowance.
 *
 * The `code` IS the contract, the same shape `isUnder18Error` reads
 * (`joinRequest.api.ts`). This used to fall back to a `/limit|month/i` regex
 * against the backend's English sentence while the typed code was still being
 * built; the code has landed (`InvitesService.assertWithinMonthlyQuota`), so
 * that bridge is gone — it would have broken the instant the sentence was
 * reworded or localized. Never render `err.message` either: it is backend
 * English, and the UI needs a catalog string it can show in the member's own
 * language.
 */
export function isInviteQuotaError(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    err.status === 403 &&
    (err.data as { code?: string } | null | undefined)?.code ===
      "INVITE_QUOTA_EXCEEDED"
  );
}

// NOTE: `acceptInvite` (POST /invites/:code/accept) is gone — the backend
// removed the route because it was unreachable by construction. Redeeming it
// required a session, and the only way to hold one is to already have an
// account, which you can only get by redeeming an invite at Google sign-up —
// where `validateInviteForSignup` + `claimInvite` consume it. By the time you
// could call the route, your invite was already `Accepted`. There is now
// exactly one redemption point: sign-up.

/**
 * One invite the current member has already sent, as returned by GET /invites
 * (and echoed back by the revoke + resend endpoints). This is the backend's
 * finalized `MyInviteView` — build the adapter in `useSentInvites` to this shape.
 *
 * `status` reuses the same lifecycle union as {@link InviteDTO}
 * (`valid` | `expired` | `used` | `revoked`), computed server-side.
 */
export interface SentInviteDTO {
  /** Stable invite uuid — used to patch the right cache row optimistically.
   *  The revoke and resend routes both resolve by `code`, not this id. */
  id: string;
  code: string;
  /** The personal note the member wrote when sending it, if any. */
  note: string | null;
  /** The inviter's vouch — why they're inviting this person — if any. */
  vouch: string | null;
  /** The address the invite was addressed to, if it was an email invite. */
  email: string | null;
  status: InviteDTO["status"];
  /** ISO timestamp the invite stops working. May be null (no set expiry). */
  expiresAt: string | null;
  /** ISO timestamp the invite was created (for "Sent 2 days ago"). */
  createdAt: string;
  /** Non-null ONLY when `status === "used"`: the member who redeemed the code. */
  acceptedBy: {
    firstName: string;
    lastName: string;
    slug: string;
    avatarUrl: string | null;
  } | null;
}

/**
 * List the invites the authenticated member has sent (their status + expiry).
 * The backend scopes this to the current session — no member id needed.
 */
export const getSentInvites = () => apiGet<SentInviteDTO[]>("/invites");

/**
 * Re-mint an expired invite the current member owns: the backend resets its
 * expiry to +7d and flips the status back to valid/pending, keeping the same
 * code (quota-neutral). Returns the updated {@link SentInviteDTO} row.
 *
 * Only an `expired` invite you own is resendable — the backend 403s an invite
 * that isn't yours, 404s an unknown code, and 409s one that's already accepted,
 * revoked, or still valid.
 */
export const resendInvite = (code: string) =>
  apiPost<SentInviteDTO>(`/invites/${encodeURIComponent(code)}/resend`);

/**
 * Revoke one of the current member's own still-pending invites, killing the
 * link immediately. The backend scopes this to the session (you can only revoke
 * an invite you sent) and 403/404s otherwise. Targets the invite by its `code`
 * — the `DELETE /invites/:code` route resolves by code, not the row uuid.
 */
export const revokeInvite = (code: string) =>
  apiDelete<void>(`/invites/${encodeURIComponent(code)}`);

/**
 * The member's personal-invite allowance for the current calendar month, as
 * returned by GET /invites/quota. `used` counts every invite created since the
 * UTC month start regardless of status; `resetsAt` is 00:00 UTC on the 1st of
 * next month. The backend scopes this to the current session — no id needed.
 */
export interface InviteQuotaDTO {
  limit: number;
  used: number;
  remaining: number;
  /** ISO timestamp the allowance resets (1st of next month, UTC). */
  resetsAt: string;
  /** Current community size, for the compose page's share preview. */
  memberCount: number;
}

/** The current member's remaining personal invites + reset date. */
export const getInviteQuota = () => apiGet<InviteQuotaDTO>("/invites/quota");
