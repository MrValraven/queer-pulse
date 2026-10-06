import type {
  AdminStaffGrantDTO,
  AdminStaffRosterRowDTO,
  PlatformStaffRowDTO,
} from "./api/adminStaffRoster.api";
import { inStaffRegistryOrder } from "./api/adminStaffRoster.api";
import type { CouncilCandidateDTO } from "./api/adminGovernanceOverview.api";
import type { AdminMember } from "./adminMembers.data";
import type { StaffRoleId } from "./staffRoles.registry";
import { DEMO_STAFF_GRANTS } from "../../shared/staff/staffRegistry.data";
import { isBadgedStaffRoleId } from "../../shared/staff/badgedStaffRoles";
import { currentUser } from "../members/data/demoCurrentUser";

/** Who is on the demo roster, and under what name. */
const DEMO_ROSTER_PEOPLE: {
  slug: string;
  firstName: string;
  lastName: string;
  platformRole: PlatformStaffRowDTO["platformRole"];
}[] = [
  {
    slug: "tiago",
    firstName: "Tiago",
    lastName: "Costa",
    platformRole: "admin",
  },
  {
    slug: "mariana",
    firstName: "Mariana",
    lastName: "Loução",
    platformRole: "moderator",
  },
  {
    slug: "rui",
    firstName: "Rui",
    lastName: "Marçal",
    platformRole: "moderator",
  },
  {
    slug: "ana",
    firstName: "Ana",
    lastName: "Reis",
    platformRole: "moderator",
  },
  // On the ordinary member tier, on the roster only for the housing queue she
  // was handed. `platformRole` is null for exactly this person, the way the
  // live endpoint sends it.
  {
    slug: "ines",
    firstName: "Inês",
    lastName: "Tavares",
    platformRole: null,
  },
];

/**
 * Demo `GET /platform/staff` rows, read by the governance fixtures and the
 * council picker below. Mirrors `DEMO_STAFF` (`shared/staff/staffRegistry.data.ts`):
 * same people, same roles, with the name fields the roster needs that the slug-keyed badge
 * map doesn't carry. The badged grants are read from the same
 * `DEMO_STAFF_GRANTS` the badge map uses, so the two fixtures cannot drift
 * into disagreeing about who holds what.
 */
export const ADMIN_STAFF_ROSTER_DEMO: PlatformStaffRowDTO[] =
  DEMO_ROSTER_PEOPLE.map((person) => ({
    ...person,
    badgedStaffRoles: (DEMO_STAFF_GRANTS[person.slug] ?? []).filter(
      isBadgedStaffRoleId,
    ),
  }));

/**
 * Demo fallback for the advisory-council picker (`GET
 * /admin/governance/overview/council-candidates`). The same roster again — a
 * seat may only be held by someone on it — with the user id a seat stores.
 *
 * Demo ids are the slug: nothing in demo mode round-trips to a database, and a
 * legible id makes a demo seat readable in the draft diff. Live ids are uuids.
 */
export const COUNCIL_CANDIDATES_DEMO: CouncilCandidateDTO[] =
  ADMIN_STAFF_ROSTER_DEMO.map((staffMember) => ({
    id: staffMember.slug,
    slug: staffMember.slug,
    firstName: staffMember.firstName,
    lastName: staffMember.lastName,
    avatarUrl: null,
    platformRole: staffMember.platformRole,
  }));

/* ── Staff roster rows (`GET /admin/members/staff-roster`) ───────────────── */

/** One input person for {@link ADMIN_STAFF_ROSTER_ROWS_DEMO}. */
type DemoStaffRosterPerson = Omit<
  AdminStaffRosterRowDTO,
  "id" | "avatarUrl" | "grants"
> & { grants: AdminStaffGrantDTO[] };

/** Used for any demo join or grant date the maps below leave out. */
const DEMO_FALLBACK_DATE = "2026-01-05T09:00:00.000Z";

/** When each person on the shared demo roster joined, keyed by slug. */
const DEMO_JOINED_AT: Record<string, string> = {
  tiago: "2023-02-14T09:00:00.000Z",
  mariana: "2023-06-03T18:20:00.000Z",
  rui: "2024-01-22T11:45:00.000Z",
  ana: "2024-09-09T08:30:00.000Z",
  ines: "2025-03-17T20:10:00.000Z",
};

/** When each `DEMO_STAFF_GRANTS` grant was handed over, keyed by slug. */
const DEMO_GRANTED_AT: Record<string, Partial<Record<StaffRoleId, string>>> = {
  mariana: {
    directory_moderator: "2026-01-19T10:00:00.000Z",
    communities: "2026-04-02T15:30:00.000Z",
  },
  rui: {
    editorial: "2026-02-11T09:15:00.000Z",
    resource_curator: "2026-06-24T14:00:00.000Z",
  },
  ana: { partnerships: "2026-03-08T11:20:00.000Z" },
  ines: { housing_moderator: "2026-08-27T16:45:00.000Z" },
};

/**
 * Each demo roster person's photo, keyed by slug. Tiago is the demo session
 * user, so his row shows the same face as the admin sidebar. Mariana, Rui and
 * Ana reuse their own members directory photos; Leonor, Beatriz and Duarte
 * borrow directory photos no admin fixture shows. Inês is left out on purpose
 * so the roster keeps one initials avatar.
 */
const DEMO_AVATAR_URL: Record<string, string | undefined> = {
  tiago: currentUser.photo,
  mariana:
    "https://images.unsplash.com/photo-1614204424926-196a80bf0be8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rui: "https://plus.unsplash.com/premium_photo-1682144187125-b55e638cf286?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ana: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
  leonor:
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop",
  beatriz:
    "https://images.unsplash.com/photo-1485893086445-ed75865251e0?q=80&w=800&auto=format&fit=crop",
  duarte:
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop",
};

/**
 * People who appear on the staff roster page alone, so its coverage panel has
 * some variety: a second housing moderator, two magazine writers, and one
 * suspended grant holder. Nobody holds `magazine_editor`, so the demo page
 * shows that grant as a gap. Kept out of `DEMO_ROSTER_PEOPLE` on purpose:
 * the badge map, the grants fixture and the council picker stay as they were.
 */
const DEMO_STAFF_ROSTER_EXTRA_PEOPLE: DemoStaffRosterPerson[] = [
  {
    slug: "leonor",
    firstName: "Leonor",
    lastName: "Batista",
    platformRole: "moderator",
    status: "active",
    joinedAt: "2024-05-30T13:05:00.000Z",
    grants: [
      { role: "housing_moderator", grantedAt: "2026-05-14T10:30:00.000Z" },
    ],
  },
  {
    slug: "beatriz",
    firstName: "Beatriz",
    lastName: "Nunes",
    platformRole: "member",
    status: "active",
    joinedAt: "2025-01-08T19:40:00.000Z",
    grants: [
      { role: "magazine_writer", grantedAt: "2026-07-03T09:00:00.000Z" },
    ],
  },
  {
    slug: "duarte",
    firstName: "Duarte",
    lastName: "Pires",
    platformRole: "member",
    status: "suspended",
    joinedAt: "2024-11-12T21:15:00.000Z",
    grants: [
      { role: "magazine_writer", grantedAt: "2026-02-26T17:10:00.000Z" },
      { role: "communities", grantedAt: "2026-09-15T12:00:00.000Z" },
    ],
  },
];

/**
 * Demo fallback for `GET /admin/members/staff-roster`. Built from the same
 * `DEMO_ROSTER_PEOPLE` and `DEMO_STAFF_GRANTS` as the fixtures above (every
 * grant, badged or not), so it cannot drift from them, plus the roster-only
 * people listed just above. Ids are `staff-<slug>`: the bare slug `ines`
 * already names Inês Martins in `MEMBERS`, and the member drawer resolves its
 * card and detail by id, so a shared id would open her record. Photos come
 * from {@link DEMO_AVATAR_URL}.
 */
export const ADMIN_STAFF_ROSTER_ROWS_DEMO: AdminStaffRosterRowDTO[] = [
  ...DEMO_ROSTER_PEOPLE.map((person): DemoStaffRosterPerson => ({
    slug: person.slug,
    firstName: person.firstName,
    lastName: person.lastName,
    platformRole: person.platformRole ?? "member",
    status: "active",
    joinedAt: DEMO_JOINED_AT[person.slug] ?? DEMO_FALLBACK_DATE,
    grants: (DEMO_STAFF_GRANTS[person.slug] ?? []).map((role) => ({
      role,
      grantedAt: DEMO_GRANTED_AT[person.slug]?.[role] ?? DEMO_FALLBACK_DATE,
    })),
  })),
  ...DEMO_STAFF_ROSTER_EXTRA_PEOPLE,
].map((person) => ({
  ...person,
  id: `staff-${person.slug}`,
  avatarUrl: DEMO_AVATAR_URL[person.slug] ?? null,
  grants: inStaffRegistryOrder(person.grants),
}));

/**
 * A demo staff roster row as an `AdminMember` card, so the member drawer can
 * open on anyone the staff page lists. Counts the row has no data for stay at
 * zero. A suspended row reads as unverified with a coral chip, which is the
 * pair `detailFor` treats as suspended, so the drawer offers to lift it.
 */
export function cardForStaffRosterRow(
  row: AdminStaffRosterRowDTO,
): AdminMember {
  const isSuspended = row.status === "suspended";
  return {
    id: row.id,
    slug: row.slug,
    name: `${row.firstName} ${row.lastName}`,
    initials: `${row.firstName.charAt(0)}${row.lastName.charAt(0)}`,
    tone: "plum",
    pronoun: "",
    verified: !isSuspended,
    role: row.platformRole,
    avatarUrl: row.avatarUrl,
    statusTone: isSuspended ? "coral" : "jade",
    newThisWeek: false,
    meta: "",
    vouchCount: 0,
    vouchedBy: [],
    staffRoles: row.grants.map((grant) => grant.role),
  };
}
