import type { JoinRequestStatusDTO } from "./api/joinRequest.api";

/**
 * Demo fixtures for the join-request status page (`/auth/request-invite/status`).
 *
 * Demo mode makes zero backend calls, so without these the sandbox could only
 * ever render the empty "paste your code" form — and the four states this page
 * exists for (the wait, the win, the dead invite, the decline) would be
 * unreviewable without a live backend and four hand-made database rows.
 *
 * HOW TO SEE EACH STATE: open the page with the matching code in the query
 * string, e.g. `/auth/request-invite/status?token=<DEMO_STATUS_TOKENS.approved>`,
 * or paste that code into the form. Any code that is well-formed but unknown
 * falls through to the "we could not find that" state, which is the fifth thing
 * worth looking at.
 */

/**
 * Shape a readable label like a real token: base64url, exactly 43 characters,
 * so the page's format guard and the copy affordance behave in demo exactly as
 * they do in live rather than taking a shortcut for short strings.
 */
const demoToken = (label: string): string => label.padEnd(43, "0").slice(0, 43);

/** The demo codes, one per state. Keys are display states, not wire values. */
export const DEMO_STATUS_TOKENS = {
  underReview: demoToken("demoUnderReview"),
  approved: demoToken("demoApproved"),
  approvedInviteSpent: demoToken("demoApprovedSpent"),
  declined: demoToken("demoDeclined"),
  /** The decline reason that must never read as a rejection of the person. */
  declinedUnderage: demoToken("demoDeclinedUnderage"),
} as const;

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const DEMO_STATUSES: Record<string, JoinRequestStatusDTO> = {
  [DEMO_STATUS_TOKENS.underReview]: {
    status: "under_review",
    submittedAt: daysAgo(3),
    decidedAt: null,
    declineReason: null,
    inviteCode: null,
  },
  [DEMO_STATUS_TOKENS.approved]: {
    status: "approved",
    submittedAt: daysAgo(9),
    decidedAt: daysAgo(1),
    declineReason: null,
    inviteCode: "QPDEMO-4K7M-2XQR",
  },
  // Approved, but the invite behind it is gone (used, revoked or expired).
  [DEMO_STATUS_TOKENS.approvedInviteSpent]: {
    status: "approved",
    submittedAt: daysAgo(40),
    decidedAt: daysAgo(31),
    declineReason: null,
    inviteCode: null,
  },
  [DEMO_STATUS_TOKENS.declined]: {
    status: "declined",
    submittedAt: daysAgo(12),
    decidedAt: daysAgo(6),
    declineReason: "implausible",
    inviteCode: null,
  },
  [DEMO_STATUS_TOKENS.declinedUnderage]: {
    status: "declined",
    submittedAt: daysAgo(15),
    decidedAt: daysAgo(14),
    declineReason: "underage",
    inviteCode: null,
  },
};

/** The fixture for a demo code, or null so the page can render its honest
 *  "we could not find a request for that code" state. */
export function demoJoinRequestStatusFor(
  token: string,
): JoinRequestStatusDTO | null {
  return DEMO_STATUSES[token] ?? null;
}
