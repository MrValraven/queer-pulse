import type { MemberRefDTO } from "../../shared/api/refs";
import type {
  AdminVerificationRequestDetailDTO,
  AdminVerificationRequestDTO,
  AdminVerificationRequestListDTO,
  VerificationRequestCounts,
  VerificationRequestSort,
  VerificationRequestStatusFilter,
} from "./api/adminVerifications.api";
import type { VerificationType } from "../economy/api/verification.api";

/**
 * Demo fixture for the admin review-queue segment — six requests, one per
 * `VerificationRequestStatus` (including an appeal), a detail record per
 * request with history + a Phase 3 `signals` snapshot, and precomputed
 * counts.
 * The prototype has no real request pipeline, so this stands in and never
 * hits the network (the live endpoints are moderator/admin-only, and this
 * fabricated data must never surface as platform truth in live mode).
 *
 * Reuses the same member refs as `adminVerifications.data.ts`'s level-console
 * fixture (sofia, catarina, rui, diogo, beatriz, marta) rather than inventing
 * a parallel mock registry — the two fixture domains are independent (a
 * request's `requestedLevel` here doesn't have to match that member's current
 * level in the level-console fixture; Phase 3 is expected to reconcile them
 * once requests are the only path to a level change).
 */

const SOFIA: MemberRefDTO = {
  slug: "sofia",
  firstName: "Sofia",
  lastName: "Almeida",
  avatarUrl: null,
};
const CATARINA: MemberRefDTO = {
  slug: "catarina",
  firstName: "Catarina",
  lastName: "Brito",
  avatarUrl: null,
};
const RUI: MemberRefDTO = {
  slug: "rui",
  firstName: "Rui",
  lastName: "Mendes",
  avatarUrl: null,
};
const DIOGO: MemberRefDTO = {
  slug: "diogo",
  firstName: "Diogo",
  lastName: "Faria",
  avatarUrl: null,
};
const BEATRIZ: MemberRefDTO = {
  slug: "beatriz",
  firstName: "Beatriz",
  lastName: "Nogueira",
  avatarUrl: null,
};
const MARTA: MemberRefDTO = {
  slug: "marta",
  firstName: "Marta",
  lastName: "Sequeira",
  avatarUrl: null,
};

/** A staff member's ref, for events/decisions attributed to a moderator's
 *  review rather than the member's own submission. Mirrors the reviewer in
 *  `adminVerifications.data.ts`'s `ADMIN_VERIFICATION_HISTORY` fixture. */
const STAFF_REVIEWER: MemberRefDTO = {
  slug: "ana-ribeiro",
  firstName: "Ana",
  lastName: "Ribeiro",
  avatarUrl: null,
};

const IDENTITY: VerificationType = "identity";

const DAY_MS = 86_400_000;

/**
 * The OPS-04 due date as an offset from right now, so an OPEN demo row shows a
 * live clock every time the fixture is opened. A frozen ISO string would read
 * as overdue forever once the date passed, and the queue needs to show both a
 * late request and one with time left.
 */
function dueDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

export const DEMO_VERIFICATION_REQUESTS: AdminVerificationRequestDTO[] = [
  {
    id: "request-pending-1",
    member: SOFIA,
    type: IDENTITY,
    requestedLevel: "phone",
    status: "pending",
    isAppeal: false,
    createdAt: "2026-08-10T09:20:00.000Z",
    updatedAt: "2026-08-10T09:20:00.000Z",
    hasDuplicateSignal: false,
    assignedStaffId: null,
    dueAt: dueDaysFromNow(2),
  },
  {
    id: "request-review-1",
    member: CATARINA,
    type: IDENTITY,
    requestedLevel: "id_verified",
    status: "in_review",
    isAppeal: false,
    createdAt: "2026-08-09T14:05:00.000Z",
    updatedAt: "2026-08-11T10:00:00.000Z",
    // The one duplicate-fingerprint case in this fixture — shows the row's
    // warn chip (VerificationRequestRows) and the drawer's duplicate banner.
    hasDuplicateSignal: true,
    assignedStaffId: "staff-ana",
    assignedStaffName: "Ana Ribeiro",
    dueAt: dueDaysFromNow(-1),
  },
  {
    id: "request-approved-1",
    member: RUI,
    type: IDENTITY,
    requestedLevel: "id_verified",
    status: "approved",
    isAppeal: false,
    createdAt: "2026-08-05T11:30:00.000Z",
    updatedAt: "2026-08-06T16:45:00.000Z",
    hasDuplicateSignal: false,
    assignedStaffId: null,
    dueAt: null,
  },
  {
    id: "request-rejected-1",
    member: DIOGO,
    type: IDENTITY,
    requestedLevel: "phone",
    status: "rejected",
    isAppeal: false,
    createdAt: "2026-08-03T08:00:00.000Z",
    updatedAt: "2026-08-04T09:10:00.000Z",
    hasDuplicateSignal: false,
    assignedStaffId: null,
    dueAt: null,
  },
  {
    id: "request-appealing-1",
    member: BEATRIZ,
    type: IDENTITY,
    requestedLevel: "phone",
    status: "appealing",
    isAppeal: true,
    createdAt: "2026-07-28T13:15:00.000Z",
    updatedAt: "2026-08-08T17:30:00.000Z",
    hasDuplicateSignal: false,
    assignedStaffId: null,
    dueAt: dueDaysFromNow(-3),
  },
  {
    id: "request-withdrawn-1",
    member: MARTA,
    type: IDENTITY,
    requestedLevel: "id_verified",
    status: "withdrawn",
    isAppeal: false,
    createdAt: "2026-07-25T10:00:00.000Z",
    updatedAt: "2026-07-26T12:00:00.000Z",
    hasDuplicateSignal: false,
    assignedStaffId: null,
    dueAt: null,
  },
];

/** Per-request detail, keyed by `id` — what the demo drawer reads. `signals`
 *  is a light placeholder (Phase 2 defers real signal computation; the drawer
 *  shows it as-is). `history` is newest first, mirroring
 *  `ADMIN_VERIFICATION_HISTORY`'s ordering. */
export const DEMO_VERIFICATION_REQUEST_DETAIL: Record<
  string,
  AdminVerificationRequestDetailDTO
> = {
  "request-pending-1": {
    ...DEMO_VERIFICATION_REQUESTS[0]!,
    context:
      "I've been an active member for over a year and would like phone verification so I can RSVP to smaller gatherings.",
    evidenceRef: null,
    decisionReason: null,
    reviewedBy: null,
    signals: {
      accountAgeDays: 410,
      priorRejections: 0,
      duplicateProviderRef: null,
    },
    history: [
      {
        id: "event-pending-1-1",
        action: "submitted",
        fromLevel: "email",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-08-10T09:20:00.000Z",
      },
    ],
  },
  "request-review-1": {
    ...DEMO_VERIFICATION_REQUESTS[1]!,
    context:
      "I host reading-group meetups and would like ID verification to list them as in-person. Linking my community profile below.",
    evidenceRef: "queerpulse.app/members/catarina",
    decisionReason: null,
    reviewedBy: null,
    // Demo's one duplicate-fingerprint case: Catarina's identity-provider
    // session reference is shared with two other accounts.
    signals: {
      accountAgeDays: 260,
      priorRejections: 0,
      duplicateProviderRef: {
        count: 2,
        userIds: ["member-demo-7f1a", "member-demo-9c3d"],
      },
    },
    history: [
      {
        id: "event-review-1-1",
        action: "submitted",
        fromLevel: "phone",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-08-09T14:05:00.000Z",
      },
    ],
  },
  "request-approved-1": {
    ...DEMO_VERIFICATION_REQUESTS[2]!,
    context: "Linking my LinkedIn, which matches the name on my profile.",
    evidenceRef: "linkedin.com/in/demo-rui-mendes",
    decisionReason: "Reference checks out. Welcome to id-verified.",
    reviewedBy: STAFF_REVIEWER,
    signals: {
      accountAgeDays: 500,
      priorRejections: 0,
      duplicateProviderRef: null,
    },
    history: [
      {
        id: "event-approved-1-2",
        action: "approved",
        fromLevel: "phone",
        toLevel: "id_verified",
        reason: "Reference checks out. Welcome to id-verified.",
        actor: STAFF_REVIEWER,
        createdAt: "2026-08-06T16:45:00.000Z",
      },
      {
        id: "event-approved-1-1",
        action: "submitted",
        fromLevel: "phone",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-08-05T11:30:00.000Z",
      },
    ],
  },
  "request-rejected-1": {
    ...DEMO_VERIFICATION_REQUESTS[3]!,
    context: "Here's my number, please verify me.",
    evidenceRef: null,
    decisionReason:
      "We couldn't confirm the number provided. Please resubmit with a working number we can reach.",
    reviewedBy: STAFF_REVIEWER,
    signals: {
      accountAgeDays: 30,
      priorRejections: 0,
      duplicateProviderRef: null,
    },
    history: [
      {
        id: "event-rejected-1-2",
        action: "rejected",
        fromLevel: "email",
        toLevel: null,
        reason:
          "We couldn't confirm the number provided. Please resubmit with a working number we can reach.",
        actor: STAFF_REVIEWER,
        createdAt: "2026-08-04T09:10:00.000Z",
      },
      {
        id: "event-rejected-1-1",
        action: "submitted",
        fromLevel: "email",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-08-03T08:00:00.000Z",
      },
    ],
  },
  "request-appealing-1": {
    ...DEMO_VERIFICATION_REQUESTS[4]!,
    context:
      "The reference link should resolve now, I had my profile set to private. Reopening my request.",
    evidenceRef: "queerpulse.app/members/beatriz",
    decisionReason:
      "The reference link you shared didn't resolve for us. Feel free to appeal once it's reachable.",
    reviewedBy: STAFF_REVIEWER,
    // A prior rejection (this appeal's own re-opened one) — demos the panel's
    // `warn` tone on the "prior rejections" chip.
    signals: {
      accountAgeDays: 90,
      priorRejections: 1,
      duplicateProviderRef: null,
    },
    history: [
      {
        id: "event-appealing-1-3",
        action: "appealed",
        fromLevel: null,
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-08-08T17:30:00.000Z",
      },
      {
        id: "event-appealing-1-2",
        action: "rejected",
        fromLevel: "email",
        toLevel: null,
        reason:
          "The reference link you shared didn't resolve for us. Feel free to appeal once it's reachable.",
        actor: STAFF_REVIEWER,
        createdAt: "2026-08-01T15:00:00.000Z",
      },
      {
        id: "event-appealing-1-1",
        action: "submitted",
        fromLevel: "email",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-07-28T13:15:00.000Z",
      },
    ],
  },
  "request-withdrawn-1": {
    ...DEMO_VERIFICATION_REQUESTS[5]!,
    context: "Actually, I'll hold off on this for now.",
    evidenceRef: null,
    decisionReason: null,
    reviewedBy: null,
    signals: {
      accountAgeDays: 610,
      priorRejections: 0,
      duplicateProviderRef: null,
    },
    history: [
      {
        id: "event-withdrawn-1-2",
        action: "withdrawn",
        fromLevel: null,
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-07-26T12:00:00.000Z",
      },
      {
        id: "event-withdrawn-1-1",
        action: "submitted",
        fromLevel: "email",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-07-25T10:00:00.000Z",
      },
    ],
  },
};

/** Group demo rows by status, for the fixture's precomputed counts and the
 *  client-side filter below. Zero-filled over every status so a status with
 *  no matching rows still reports `0` rather than being absent. */
function countVerificationRequestsByStatus(
  rows: AdminVerificationRequestDTO[],
): VerificationRequestCounts {
  const counts: VerificationRequestCounts = {
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    appealing: 0,
    withdrawn: 0,
  };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

/** Precomputed counts across the whole fixture (no search term applied) —
 *  what each tab shows before the moderator types anything. */
export const DEMO_VERIFICATION_REQUEST_COUNTS: VerificationRequestCounts =
  countVerificationRequestsByStatus(DEMO_VERIFICATION_REQUESTS);

function matchesVerificationRequestQuery(
  row: AdminVerificationRequestDTO,
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const name = row.member
    ? `${row.member.firstName} ${row.member.lastName}`.toLowerCase()
    : "";
  const slug = row.member?.slug.toLowerCase() ?? "";
  return name.includes(trimmed) || slug.includes(trimmed);
}

function sortDemoVerificationRequests(
  rows: AdminVerificationRequestDTO[],
  sort: VerificationRequestSort,
): AdminVerificationRequestDTO[] {
  const sorted = [...rows];
  if (sort === "oldest") {
    sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } else {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return sorted;
}

/**
 * Client-side filter/sort over the demo fixture, mirroring the backend's
 * `listRequestsForAdmin` semantics: `counts` reflects the `q`/`type` search
 * but is NOT scoped by `status` (every tab needs its own count regardless of
 * which one is active), while `rows` is scoped by both, and sorted by
 * `createdAt` (the submission date, unlike the level console's `updatedAt`).
 * Returns one full synthetic page (`nextCursor: null`) — the fixture is small
 * enough that "load more" never triggers in demo mode.
 */
export function filterDemoVerificationRequests(filter: {
  status: VerificationRequestStatusFilter;
  type?: VerificationType;
  query: string;
  sort: VerificationRequestSort;
  /** OPS-04. `"me"` is the signed-in demo reviewer, whose id the caller passes
   *  as `currentUserId` — demo mode has no session on this side of the wire,
   *  and live mode resolves the same word against the real one. */
  assignedTo?: "me" | "unassigned";
  currentUserId?: string | null;
}): AdminVerificationRequestListDTO {
  const typeMatched = filter.type
    ? DEMO_VERIFICATION_REQUESTS.filter((row) => row.type === filter.type)
    : DEMO_VERIFICATION_REQUESTS;
  const assignmentMatched =
    filter.assignedTo === "unassigned"
      ? typeMatched.filter((row) => row.assignedStaffId === null)
      : filter.assignedTo === "me"
        ? typeMatched.filter(
            (row) => row.assignedStaffId === (filter.currentUserId ?? null),
          )
        : typeMatched;
  const queryMatched = assignmentMatched.filter((row) =>
    matchesVerificationRequestQuery(row, filter.query),
  );
  const statusAndQueryMatched =
    filter.status === "all"
      ? queryMatched
      : queryMatched.filter((row) => row.status === filter.status);

  return {
    rows: sortDemoVerificationRequests(statusAndQueryMatched, filter.sort),
    counts: countVerificationRequestsByStatus(queryMatched),
    nextCursor: null,
  };
}
