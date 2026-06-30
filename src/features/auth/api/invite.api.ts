import { apiGet, apiPost } from "../../../shared/api/client";

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
  /** ISO timestamp the invite stops working. */
  expiresAt: string;
  /** Days the link stays live from creation (for the "Valid for N days" badge). */
  validForDays: number;
  /** Current community size, for the "247 members" line. */
  memberCount: number;
  inviter: InviteInviterDTO;
  /** The personal note the inviter wrote — shown in the link preview / landing. */
  note?: string;
  /** The inviter's vouch (why they're inviting this person) — shown at onboarding. */
  vouch?: string;
}

/** Resolve an invite code to its inviter + status. 404 → invalid code. */
export const getInvite = (code: string) =>
  apiGet<InviteDTO>(`/invites/${encodeURIComponent(code)}`);

/** What the member types when generating a share link. */
export interface CreateInvitePayload {
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

/** What the backend returns once a recipient redeems their invite. */
export interface AcceptInviteResult {
  ok: boolean;
}

/**
 * Redeem an invite for the logged-in recipient, promoting them to an active
 * member. One-time use — a second accept (or an expired/own/mismatched code)
 * returns a 4xx the caller surfaces. Requires the session + CSRF header.
 */
export const acceptInvite = (code: string) =>
  apiPost<AcceptInviteResult>(`/invites/${encodeURIComponent(code)}/accept`);
