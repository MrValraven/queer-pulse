import type { JoinRequestDTO } from "../../auth/api/joinRequest.api";

const DAY_MS = 86_400_000;

/**
 * An invite expiry relative to right now, so the decided tab's "expires in 3
 * days" / "expired" branches both stay true whenever the demo is opened. A
 * frozen ISO string would read as expired forever once the date passed, and
 * the whole point of these rows is to show a reviewer both outcomes.
 */
function expiryDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/**
 * The OPS-04 due date as an offset from right now, for the same reason
 * `expiryDaysFromNow` exists: a frozen ISO string would read as overdue
 * forever once the date passed, and the pending queue needs to show both a
 * late row and rows with time left whenever the demo is opened.
 */
function dueDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

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
    inviteStatus: null,
    inviteExpiresAt: null,
    message:
      "I run a small queer zine in Porto and keep hearing this is where the good people are. I'd love a quieter place to actually talk.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: dueDaysFromNow(-2),
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
    inviteStatus: null,
    inviteExpiresAt: null,
    message:
      "New to Lisbon and looking for community that isn't just nightlife.",
    // Demo covers the structured-field branch: named a real member instead of
    // leaving it blank.
    mutualMemberEmail: "devon@example.com",
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: "mod-ines",
    assignedStaffName: "Inês Duarte",
    dueAt: dueDaysFromNow(1),
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
    inviteStatus: null,
    inviteExpiresAt: null,
    message:
      "Trans organiser, been doing mutual-aid work for years. I want somewhere I can be off the clock and still queer.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: dueDaysFromNow(2),
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
    inviteStatus: null,
    inviteExpiresAt: null,
    message: "Second time asking. Things have changed for me since last time.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: ["disposable_email"],
    priorDeclineCount: 1,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: dueDaysFromNow(3),
  },
  // Already-reviewed rows, so the quality-sampling page (Task 7) has
  // something to show in demo mode: one approved, one declined.
  //
  // Decided rows deliberately carry MORE THAN ONE reviewer between them, so the
  // sample page's reviewer filter has something to filter by. The names here
  // are attribution and nothing else. The sample never counts or ranks anyone.
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
    reviewedByName: "Inês Duarte",
    inviteCode: "QP-7F3K-2026",
    // Still redeemable: the reviewer can copy this link and it will work.
    inviteStatus: "valid",
    inviteExpiresAt: expiryDaysFromNow(3),
    message:
      "A friend from the reading group told me about this place. I'd like to find people nearby who share the same books.",
    mutualMemberEmail: "devon@example.com",
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: "Devon Okoro",
    referenceMemberSlug: "devon",
    assignedStaffId: null,
    dueAt: null,
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
    reviewedByName: "Inês Duarte",
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    message: "let me in please",
    mutualMemberEmail: null,
    declineReason: "spam_pattern",
    flags: ["disposable_email"],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: null,
  },
  // The decided tab's three approval outcomes. The reviewer's job is the same
  // every time — carry the link over by hand — but what they can still do about
  // it differs, so demo mode shows all three.
  {
    id: "jr-decided-expired",
    name: "Helena Braga",
    email: "helena@example.com",
    city: "Coimbra",
    status: "approved",
    createdAt: "2026-05-30T08:15:00.000Z",
    ageAttestedAt: "2026-05-30T08:14:10.000Z",
    termsVersion: "2.4",
    source: "magazine",
    reviewedAt: "2026-05-31T17:45:00.000Z",
    reviewedBy: "mod-ana",
    reviewedByName: "Ana Reis",
    inviteCode: "QP-M4NB-2026",
    // Approved, then nobody sent the link on. This is the case the decided tab
    // exists for: the reissue action makes the same code work again.
    inviteStatus: "expired",
    inviteExpiresAt: expiryDaysFromNow(-9),
    message:
      "I read the piece on housing co-ops and would like to meet the people behind it.",
    mutualMemberEmail: null,
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: null,
  },
  {
    id: "jr-decided-used",
    name: "Tomás Reis",
    email: "tomas@example.com",
    city: "Lisboa",
    status: "approved",
    createdAt: "2026-05-12T19:00:00.000Z",
    ageAttestedAt: "2026-05-12T18:59:30.000Z",
    termsVersion: "2.4",
    source: "public_profile",
    reviewedAt: "2026-05-13T09:20:00.000Z",
    reviewedBy: "mod-ana",
    reviewedByName: "Ana Reis",
    inviteCode: "QP-Q8XT-2026",
    // Redeemed — they are already a member, so there is nothing left to hand
    // over and no reissue to offer.
    inviteStatus: "used",
    inviteExpiresAt: "2026-05-20T09:20:00.000Z",
    message:
      "A friend vouched for me at a gathering last month. I would like to stay in touch with people I met there.",
    mutualMemberEmail: "devon@example.com",
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: "Devon Okoro",
    referenceMemberSlug: "devon",
    assignedStaffId: null,
    dueAt: null,
  },
  // Two more declines, so the decided tab shows more than one reason label.
  {
    id: "jr-decided-safety",
    name: "Anon Requester",
    email: "anon@example.net",
    city: null,
    status: "declined",
    createdAt: "2026-05-08T22:10:00.000Z",
    ageAttestedAt: "2026-05-08T22:09:44.000Z",
    termsVersion: "2.4",
    source: "sign_in",
    reviewedAt: "2026-05-09T10:05:00.000Z",
    // Decided, but the row carries no reviewer. This is also exactly what an
    // erased reviewer's past decisions look like: `join_requests.reviewed_by`
    // is ON DELETE SET NULL, so the id goes with the account and no name can
    // come back. Covers the sample card's "not recorded" branch.
    reviewedBy: null,
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    message: "I want to see who is in there.",
    mutualMemberEmail: null,
    declineReason: "safety_concern",
    flags: [],
    priorDeclineCount: 1,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: null,
  },
  {
    id: "jr-decided-implausible",
    name: "K. Silva",
    email: "k.silva@example.org",
    city: "Faro",
    status: "declined",
    createdAt: "2026-04-27T13:30:00.000Z",
    ageAttestedAt: "2026-04-27T13:29:50.000Z",
    termsVersion: "2.4",
    source: "homepage_hero",
    reviewedAt: "2026-04-28T11:00:00.000Z",
    // An id the server could not put a name to (no profile row behind the
    // account). Covers the card's short-reference fallback, which still groups
    // this reviewer's calls without claiming to identify them.
    reviewedBy: "mod-unresolved",
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    message: "Hello, I am from Faro and also from Berlin and also a student.",
    mutualMemberEmail: "nobody@example.com",
    declineReason: "implausible",
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    assignedStaffId: null,
    dueAt: null,
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
