import type { JoinRequestDTO } from "../../auth/api/joinRequest.api";

/** Demo-mode sample of incoming platform join requests, so the mod review queue
 *  renders fully with no backend. Mirrors {@link JoinRequestDTO} exactly — name,
 *  email, city, message and the 18+ attestation record a reviewer needs. */
export const JOIN_REQUESTS: JoinRequestDTO[] = [
  {
    id: "jr-marco",
    name: "Marco Vieira",
    email: "marco@example.com",
    city: "Porto",
    status: "pending",
    createdAt: "2026-07-01T09:12:00.000Z",
    ageAttestedAt: "2026-07-01T09:11:40.000Z",
    termsVersion: "2.4",
    source: "homepage_hero",
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message:
      "I run a small queer zine in Porto and keep hearing this is where the good people are. I'd love a quieter place to actually talk.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
  },
  {
    id: "jr-rui",
    name: "Rui Antunes",
    email: "rui@example.com",
    city: "Lisboa",
    status: "pending",
    createdAt: "2026-06-30T18:40:00.000Z",
    ageAttestedAt: "2026-06-30T18:39:12.000Z",
    termsVersion: "2.4",
    source: "skills",
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message: "New to Lisbon and looking for community that isn't just nightlife.",
    // Demo covers the structured-field branch: named a real member instead of
    // leaving it blank.
    mutualMemberEmail: "devon@example.com",
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
  },
  {
    id: "jr-nadia",
    name: "Nadia Lopes",
    email: "nadia@example.com",
    // Left blank on the form — city is optional, so demo covers the null branch.
    city: null,
    status: "pending",
    createdAt: "2026-06-28T11:05:00.000Z",
    ageAttestedAt: "2026-06-28T11:04:31.000Z",
    termsVersion: "2.4",
    // No source — went straight to the request page, so demo covers the
    // "Opened the invite page directly" fallback.
    source: null,
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message:
      "Trans organiser, been doing mutual-aid work for years. I want somewhere I can be off the clock and still queer.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
  },
  // Demonstrates a non-trivial state for visual/manual testing: a flagged,
  // previously-declined applicant asking again.
  {
    id: "jr-flagged-demo",
    name: "Alex Pending",
    email: "alex@mailinator.com",
    city: "Porto",
    status: "pending",
    createdAt: "2026-08-10T00:00:00.000Z",
    ageAttestedAt: "2026-08-01T00:00:00.000Z",
    termsVersion: "2.4",
    source: "skills",
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    message: "Second time asking. Things have changed for me since last time.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: ["disposable_email"],
    priorDeclineCount: 1,
    referenceMemberName: null,
    referenceMemberSlug: null,
  },
  // Already-reviewed rows, so the quality-sampling page (Task 7) has
  // something to show in demo mode: one approved, one declined.
  {
    id: "jr-sample-approved",
    name: "Priya Costa",
    email: "priya@example.com",
    city: "Braga",
    status: "approved",
    createdAt: "2026-06-20T10:00:00.000Z",
    ageAttestedAt: "2026-06-20T09:59:20.000Z",
    termsVersion: "2.4",
    source: "directory",
    reviewedAt: "2026-06-21T08:30:00.000Z",
    reviewedBy: "demo-moderator",
    inviteCode: "QP-7F3K-2026",
    message:
      "A friend from the reading group told me about this place. I'd like to find people nearby who share the same books.",
    mutualMemberEmail: "devon@example.com",
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: "Devon Okoro",
    referenceMemberSlug: "devon",
  },
  {
    id: "jr-sample-declined",
    name: "Sam Ferreira",
    email: "sam@mailinator.com",
    city: null,
    status: "declined",
    createdAt: "2026-06-15T14:20:00.000Z",
    ageAttestedAt: "2026-06-15T14:19:50.000Z",
    termsVersion: "2.4",
    source: null,
    reviewedAt: "2026-06-16T09:00:00.000Z",
    reviewedBy: "demo-moderator",
    inviteCode: null,
    message: "let me in please",
    mutualMemberEmail: null,
    declineReason: "spam_pattern",
    flags: ["disposable_email"],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
  },
];

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * A plausible, stable invite code for demo-mode approvals — the same shape the
 * backend issues (`QP-7F3K-2026`). Deterministic from the request id so the
 * copied link doesn't change between renders.
 */
export function demoInviteCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  let block = "";
  for (let i = 0; i < 4; i++) {
    block += CODE_ALPHABET[h % CODE_ALPHABET.length];
    h = Math.floor(h / CODE_ALPHABET.length) + 7;
  }
  return `QP-${block}-2026`;
}
