import { levelRank } from "../economy/api/verification.api";
import type {
  AdminVerificationDTO,
  AdminVerificationListDTO,
  VerificationCounts,
  VerificationEventDTO,
  VerificationLevelFilter,
  VerificationSort,
} from "./api/adminVerifications.api";
import { VERIFICATION_LEVELS } from "./api/adminVerifications.api";

/**
 * Demo fixture for the admin verification console — 8 members spanning every
 * level, a per-member audit history, and precomputed counts. The prototype
 * has no real verification events, so this stands in and never hits the
 * network (the live endpoint is moderator/admin-only, and this fabricated
 * data must never surface as platform truth in live mode). Override actions
 * stay disabled in demo — there is no real record to change.
 */
export const ADMIN_VERIFICATIONS_DEMO: AdminVerificationDTO[] = [
  {
    userId: "demo-user-1",
    member: {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: null,
    },
    level: "id_verified",
    method: "id_document",
    provider: "stub_identity",
    providerRef: "stub_demo_0001",
    verifiedAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    userId: "demo-user-2",
    member: {
      slug: "rui",
      firstName: "Rui",
      lastName: "Mendes",
      avatarUrl: null,
    },
    level: "phone",
    method: "phone_otp",
    provider: "dev_phone",
    providerRef: null,
    verifiedAt: "2026-08-05T14:30:00.000Z",
    updatedAt: "2026-08-05T14:30:00.000Z",
  },
  {
    userId: "demo-user-3",
    member: {
      slug: "beatriz",
      firstName: "Beatriz",
      lastName: "Nogueira",
      avatarUrl: null,
    },
    level: "none",
    method: null,
    provider: null,
    providerRef: null,
    verifiedAt: null,
    updatedAt: "2026-07-20T09:15:00.000Z",
  },
  {
    userId: "demo-user-4",
    member: {
      slug: "diogo",
      firstName: "Diogo",
      lastName: "Faria",
      avatarUrl: null,
    },
    level: "none",
    method: null,
    provider: null,
    providerRef: null,
    verifiedAt: null,
    updatedAt: "2026-07-22T16:40:00.000Z",
  },
  {
    userId: "demo-user-5",
    member: {
      slug: "marta",
      firstName: "Marta",
      lastName: "Sequeira",
      avatarUrl: null,
    },
    level: "email",
    method: null,
    provider: null,
    providerRef: null,
    verifiedAt: null,
    updatedAt: "2026-07-25T11:00:00.000Z",
  },
  {
    userId: "demo-user-6",
    member: {
      slug: "sofia",
      firstName: "Sofia",
      lastName: "Almeida",
      avatarUrl: null,
    },
    level: "email",
    method: null,
    provider: null,
    providerRef: null,
    verifiedAt: null,
    updatedAt: "2026-07-27T08:20:00.000Z",
  },
  {
    userId: "demo-user-7",
    member: {
      slug: "catarina",
      firstName: "Catarina",
      lastName: "Brito",
      avatarUrl: null,
    },
    level: "phone",
    method: "phone_otp",
    provider: "dev_phone",
    providerRef: null,
    verifiedAt: "2026-08-03T13:10:00.000Z",
    updatedAt: "2026-08-03T13:10:00.000Z",
  },
  {
    userId: "demo-user-8",
    member: {
      slug: "miguel",
      firstName: "Miguel",
      lastName: "Costa",
      avatarUrl: null,
    },
    level: "id_verified",
    method: "id_document",
    provider: "manual_review",
    providerRef: null,
    verifiedAt: "2026-08-07T17:00:00.000Z",
    updatedAt: "2026-08-07T17:00:00.000Z",
  },
];

/** A staff member's ref, for events attributed to an admin/moderator action
 *  rather than the member's own step-up flow. */
const STAFF_REVIEWER = {
  slug: "ana-ribeiro",
  firstName: "Ana",
  lastName: "Ribeiro",
  avatarUrl: null,
};

/**
 * Per-member audit trail keyed by `userId`, newest first — what the demo
 * drawer's history panel reads. Illustrates both provenances the drawer must
 * tell apart: a member-earned event (`actor: null`, reached through the
 * ordinary step-up flow) and an admin override carrying a reviewer note.
 */
export const ADMIN_VERIFICATION_HISTORY: Record<string, VerificationEventDTO[]> =
  {
    "demo-user-1": [
      {
        id: "event-1-2",
        action: "approved",
        fromLevel: "phone",
        toLevel: "id_verified",
        reason: null,
        actor: null,
        createdAt: "2026-08-01T10:00:00.000Z",
      },
      {
        id: "event-1-1",
        action: "submitted",
        fromLevel: "phone",
        toLevel: null,
        reason: null,
        actor: null,
        createdAt: "2026-08-01T09:50:00.000Z",
      },
    ],
    "demo-user-2": [
      {
        id: "event-2-1",
        action: "approved",
        fromLevel: "email",
        toLevel: "phone",
        reason: null,
        actor: null,
        createdAt: "2026-08-05T14:30:00.000Z",
      },
    ],
    "demo-user-7": [
      {
        id: "event-7-1",
        action: "approved",
        fromLevel: "email",
        toLevel: "phone",
        reason: null,
        actor: null,
        createdAt: "2026-08-03T13:10:00.000Z",
      },
    ],
    "demo-user-8": [
      {
        id: "event-8-2",
        action: "overridden",
        fromLevel: "phone",
        toLevel: "id_verified",
        reason:
          "Verified passport in person during a community meetup check-in.",
        actor: STAFF_REVIEWER,
        createdAt: "2026-08-07T17:00:00.000Z",
      },
      {
        id: "event-8-1",
        action: "approved",
        fromLevel: "email",
        toLevel: "phone",
        reason: null,
        actor: null,
        createdAt: "2026-07-30T12:00:00.000Z",
      },
    ],
  };

/** Group demo rows by level, for the fixture's precomputed counts and the
 *  client-side filter below. */
function countVerificationsByLevel(
  rows: AdminVerificationDTO[],
): VerificationCounts {
  const counts: VerificationCounts = {
    none: 0,
    email: 0,
    phone: 0,
    id_verified: 0,
  };
  for (const row of rows) counts[row.level] += 1;
  return counts;
}

/** Precomputed counts across the whole fixture (no search term applied) —
 *  what each tab shows before the moderator types anything. */
export const ADMIN_VERIFICATIONS_DEMO_COUNTS: VerificationCounts =
  countVerificationsByLevel(ADMIN_VERIFICATIONS_DEMO);

function matchesVerificationQuery(
  row: AdminVerificationDTO,
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

function sortDemoVerifications(
  rows: AdminVerificationDTO[],
  sort: VerificationSort,
): AdminVerificationDTO[] {
  const sorted = [...rows];
  if (sort === "oldest") {
    sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  } else if (sort === "level") {
    sorted.sort((a, b) => levelRank(b.level) - levelRank(a.level));
  } else {
    sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  return sorted;
}

/**
 * Client-side filter/sort over the demo fixture, mirroring the backend's
 * `listForAdmin` semantics: `counts` reflects the `query` search but is NOT
 * scoped by `level` (every tab needs its own count regardless of which one is
 * active), while `rows` is scoped by both. Returns one full synthetic page
 * (`nextCursor: null`) — the fixture is small enough that "load more" never
 * triggers in demo mode.
 */
export function filterDemoVerifications(filter: {
  level: VerificationLevelFilter;
  query: string;
  sort: VerificationSort;
}): AdminVerificationListDTO {
  const queryMatched = ADMIN_VERIFICATIONS_DEMO.filter((row) =>
    matchesVerificationQuery(row, filter.query),
  );
  const levelAndQueryMatched =
    filter.level === "all"
      ? queryMatched
      : queryMatched.filter((row) => row.level === filter.level);

  return {
    rows: sortDemoVerifications(levelAndQueryMatched, filter.sort),
    counts: countVerificationsByLevel(queryMatched),
    nextCursor: null,
  };
}

// Re-exported so a caller that only needs "every level in ladder order"
// (e.g. a level `<select>`) doesn't need a second import from the api module.
export { VERIFICATION_LEVELS };
