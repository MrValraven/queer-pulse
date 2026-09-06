import type { ConcernStatusDTO } from "./api/governance.api";

/**
 * PRD-261. Demo fixtures for the concern status page
 * (`/about/governance/concern-status`).
 *
 * Demo mode makes zero backend calls, so without these the sandbox could only
 * ever render the empty "paste your code" form — and the four states this page
 * exists for (nobody has looked yet, somebody is looking, it was resolved, it
 * was closed without action) would be unreviewable without a live backend and
 * four hand-made database rows.
 *
 * HOW TO SEE EACH STATE: open the page with the matching code in the query
 * string, e.g. `/about/governance/concern-status?token=<DEMO_CONCERN_CODES.reviewing>`,
 * or paste that code into the form. Any code that is well-formed but unknown
 * falls through to the "we could not find that" state, which is the fifth thing
 * worth looking at.
 */

/**
 * Shape a readable label like a real code: base64url, exactly 43 characters, so
 * the page's format guard and the copy affordance behave in demo exactly as they
 * do in live rather than taking a shortcut for short strings.
 */
const demoCode = (label: string): string => label.padEnd(43, "0").slice(0, 43);

/** The demo codes, one per state. */
export const DEMO_CONCERN_CODES = {
  received: demoCode("demoConcernReceived"),
  reviewing: demoCode("demoConcernReviewing"),
  resolved: demoCode("demoConcernResolved"),
  dismissed: demoCode("demoConcernDismissed"),
} as const;

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const DEMO_CONCERN_STATUSES: Record<string, ConcernStatusDTO> = {
  [DEMO_CONCERN_CODES.received]: {
    status: "new",
    submittedAt: daysAgo(1),
    updatedAt: null,
  },
  [DEMO_CONCERN_CODES.reviewing]: {
    status: "reviewing",
    submittedAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  [DEMO_CONCERN_CODES.resolved]: {
    status: "resolved",
    submittedAt: daysAgo(9),
    updatedAt: daysAgo(3),
  },
  [DEMO_CONCERN_CODES.dismissed]: {
    status: "dismissed",
    submittedAt: daysAgo(12),
    updatedAt: daysAgo(6),
  },
};

/** The fixture for a demo code, or null — which the hook turns into the same
 *  404 the live route answers with, so the miss state is reachable in demo. */
export function demoConcernStatusFor(code: string): ConcernStatusDTO | null {
  return DEMO_CONCERN_STATUSES[code] ?? null;
}

/** The code the demo confirmation panel hands back after a simulated submit.
 *  It resolves, so the "check back" link in the sandbox reaches a real state
 *  rather than the not-found screen. */
export const DEMO_SUBMITTED_CONCERN_CODE = DEMO_CONCERN_CODES.received;
