import { apiGet, apiPost } from "../../../shared/api/client";

/**
 * The admin account-recovery levers (`/admin/members/:id/account-recovery`,
 * `/admin/email-suppressions`, both admin-only). Mirrors the backend's
 * `src/admin-members/admin-identity-response.ts` field for field, and stays
 * self-contained the way `adminMembers.api.ts` does.
 *
 * These three levers exist so that an accident cannot strand somebody
 * permanently: a member whose Google account was re-created, a member left
 * deactivated with no ledger row, and a person who erased their account and
 * later wants to come back. Before them the only remedy for any of the three
 * was a hand-written database edit.
 */

/** One Google identity that presented this member's verified address and was
 *  turned away at sign-in. */
export interface RelinkCandidateDTO {
  id: string;
  /** The LAST SIX characters of the Google subject. The backend never sends
   *  the whole value, and there is no field anywhere that accepts one. */
  googleIdTail: string;
  status: "pending" | "applied" | "dismissed" | "superseded";
  attemptCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  decidedAt: string | null;
  decisionNote: string | null;
}

/**
 * Whether one lever is open, and the operator-facing sentence to show when it
 * is closed.
 *
 * `blockedReason` is rendered VERBATIM and is deliberately not translated: the
 * server is the only place that knows which of several refusals applies, and
 * mirroring that decision into the client would be a second copy of the
 * guardrails, free to drift from the copy that is actually enforced.
 */
export interface RecoveryLeverDTO {
  isAvailable: boolean;
  blockedReason: string | null;
}

export interface MemberAccountRecoveryDTO {
  memberId: string;
  slug: string;
  relink: RecoveryLeverDTO & { candidates: RelinkCandidateDTO[] };
  /** `isApplicable` is "this member is deactivated at all" — the console has no
   *  other source for that, since the member detail DTO carries no status. */
  reactivation: RecoveryLeverDTO & { isApplicable: boolean };
}

export interface RelinkDecisionDTO {
  memberId: string;
  candidateId: string;
  status: "applied" | "dismissed";
  decidedAt: string;
}

export interface ReactivatedMemberDTO {
  memberId: string;
  slug: string;
  status: string;
  reactivatedAt: string;
}

export interface EmailSuppressionLookupDTO {
  email: string;
  isSuppressed: boolean;
  emailHashPrefix: string;
  reason: string | null;
  suppressedAt: string | null;
}

export interface EmailSuppressionLiftedDTO {
  email: string;
  isSuppressed: false;
  emailHashPrefix: string;
  liftedAt: string;
}

/** One member's account-recovery panel. Admin-only; 403s otherwise. */
export const getMemberAccountRecovery = (memberId: string) =>
  apiGet<MemberAccountRecoveryDTO>(
    `/admin/members/${memberId}/account-recovery`,
  );

/**
 * Re-point a member's account at one of the Google identities that proved
 * control of their address.
 *
 * The body carries a reason and nothing else. The identity is named by
 * `candidateId`, and the backend will only ever accept a candidate its own
 * sign-up path recorded after Google asserted `email_verified` for this
 * member's address. There is no parameter here that takes a Google id, by
 * design: that is the control the whole feature rests on. Never add one.
 */
export const applyMemberRelink = (
  memberId: string,
  candidateId: string,
  reason: string,
) =>
  apiPost<RelinkDecisionDTO>(
    `/admin/members/${memberId}/account-recovery/candidates/${candidateId}/relink`,
    { reason },
  );

/** Refuse a candidate. Recorded and audited, never a quiet delete. */
export const dismissMemberRelink = (
  memberId: string,
  candidateId: string,
  reason: string,
) =>
  apiPost<RelinkDecisionDTO>(
    `/admin/members/${memberId}/account-recovery/candidates/${candidateId}/dismiss`,
    { reason },
  );

/** Reactivate a member left deactivated with no open deactivation row. The
 *  backend refuses every other case and 409s with the reason. */
export const reactivateMember = (memberId: string, reason: string) =>
  apiPost<ReactivatedMemberDTO>(
    `/admin/members/${memberId}/account-recovery/reactivate`,
    { reason },
  );

/**
 * Is this address on the erasure suppression list?
 *
 * POST rather than GET, because the address is the input: a query string lands
 * in access logs, proxy logs and browser history, and the suppression table
 * stores a hash precisely so that "who has ever left" is not readable anywhere.
 */
export const lookupEmailSuppression = (email: string) =>
  apiPost<EmailSuppressionLookupDTO>("/admin/email-suppressions/lookup", {
    email,
  });

/**
 * Lift a suppression so the address can create a NEW account.
 *
 * It restores nothing. The erased account is gone; this only stops the platform
 * refusing a fresh signup on that address. Audited, and the reason is required.
 */
export const liftEmailSuppression = (email: string, reason: string) =>
  apiPost<EmailSuppressionLiftedDTO>("/admin/email-suppressions/lift", {
    email,
    reason,
  });
