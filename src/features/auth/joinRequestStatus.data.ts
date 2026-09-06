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
  /** PRD-304: still under review, and past the three-day date the platform
   *  promised. The state the row exists for, and the only one where the page
   *  apologises and points at a person. */
  underReviewOverdue: demoToken("demoUnderReviewLate"),
  approved: demoToken("demoApproved"),
  approvedInviteSpent: demoToken("demoApprovedSpent"),
  /** Approved, invite already redeemed. The one spent state that is NOT
   *  recoverable, so the refresh action must not be offered on it. */
  approvedInviteUsed: demoToken("demoApprovedUsed"),
  /** Approved with a live invite that lapses tomorrow, so the deadline's
   *  urgency treatment is reviewable without waiting six days for it. */
  approvedExpiringSoon: demoToken("demoApprovedSoon"),
  declined: demoToken("demoDeclined"),
  /** The decline reason that must never read as a rejection of the person. */
  declinedUnderage: demoToken("demoDeclinedUnderage"),
} as const;

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const daysFromNow = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const DEMO_STATUSES: Record<string, JoinRequestStatusDTO> = {
  [DEMO_STATUS_TOKENS.underReview]: {
    status: "under_review",
    submittedAt: daysAgo(2),
    decidedAt: null,
    declineReason: null,
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    // Three days from submission, matching the backend's review window, so the
    // date on screen is one a reader can check against "you sent it 2 days ago".
    dueAt: daysFromNow(1),
  },
  // PRD-304: the promise the queue missed. Nothing chases this applicant, so
  // the page is the only place the overrun is ever admitted.
  [DEMO_STATUS_TOKENS.underReviewOverdue]: {
    status: "under_review",
    submittedAt: daysAgo(9),
    decidedAt: null,
    declineReason: null,
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    dueAt: daysAgo(6),
  },
  [DEMO_STATUS_TOKENS.approved]: {
    status: "approved",
    submittedAt: daysAgo(9),
    decidedAt: daysAgo(1),
    declineReason: null,
    inviteCode: "QPDEMO-4K7M-2XQR",
    inviteStatus: "valid",
    // The window runs from the applicant's FIRST look, not from the decision,
    // which is why this sits six days out on a decision made yesterday.
    inviteExpiresAt: daysFromNow(6),
    // Decided, so the backend withholds the review deadline: `decidedAt` is
    // the answer now, and the date it was owed by adds nothing.
    dueAt: null,
  },
  [DEMO_STATUS_TOKENS.approvedExpiringSoon]: {
    status: "approved",
    submittedAt: daysAgo(14),
    decidedAt: daysAgo(7),
    declineReason: null,
    inviteCode: "QPDEMO-4K7M-2XQR",
    inviteStatus: "valid",
    inviteExpiresAt: daysFromNow(1),
    dueAt: null,
  },
  // Approved, and the window ran out. THE RECOVERABLE ONE: the status page
  // offers to mint a fresh window on this same invite.
  [DEMO_STATUS_TOKENS.approvedInviteSpent]: {
    status: "approved",
    submittedAt: daysAgo(40),
    decidedAt: daysAgo(31),
    declineReason: null,
    inviteCode: null,
    inviteStatus: "expired",
    inviteExpiresAt: daysAgo(3),
    dueAt: null,
  },
  // Approved and already redeemed. Not recoverable, and the page must not
  // offer it: someone already has an account on this invite.
  [DEMO_STATUS_TOKENS.approvedInviteUsed]: {
    status: "approved",
    submittedAt: daysAgo(60),
    decidedAt: daysAgo(52),
    declineReason: null,
    inviteCode: null,
    inviteStatus: "used",
    inviteExpiresAt: daysAgo(45),
    dueAt: null,
  },
  [DEMO_STATUS_TOKENS.declined]: {
    status: "declined",
    submittedAt: daysAgo(12),
    decidedAt: daysAgo(6),
    declineReason: "implausible",
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    dueAt: null,
  },
  [DEMO_STATUS_TOKENS.declinedUnderage]: {
    status: "declined",
    submittedAt: daysAgo(15),
    decidedAt: daysAgo(14),
    declineReason: "underage",
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    dueAt: null,
  },
};

/** The fixture for a demo code, or null so the page can render its honest
 *  "we could not find a request for that code" state. */
export function demoJoinRequestStatusFor(
  token: string,
): JoinRequestStatusDTO | null {
  return DEMO_STATUSES[token] ?? null;
}

/**
 * What the demo answers a refresh with: the same request, carrying a live
 * invite again on a window that starts now. Mirrors the live route, which
 * returns the whole recomputed status rather than just a code.
 *
 * Falls back to the approved fixture for an unknown token so the sandbox can
 * never render a half-state; live mode reaches the same branch through a real
 * 404, which the page shows as its "we could not find that" screen.
 */
export function demoRefreshedJoinRequestInvite(
  token: string,
  expiresAt: string,
): JoinRequestStatusDTO {
  const base =
    DEMO_STATUSES[token] ?? DEMO_STATUSES[DEMO_STATUS_TOKENS.approved]!;
  return {
    ...base,
    status: "approved",
    inviteCode: "QPDEMO-4K7M-2XQR",
    inviteStatus: "valid",
    inviteExpiresAt: expiresAt,
    dueAt: null,
  };
}
