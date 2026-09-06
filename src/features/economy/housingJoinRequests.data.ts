/**
 * The applicant's own view of a housing join request, on both housing surfaces
 * (PRD-242).
 *
 * ONE shape for co-ops and vetted groups on purpose. The two backend enums
 * spell the same outcome differently (`accepted` on a co-op, `approved` on a
 * group), and the person reading the page is asking one question of both: did
 * they say yes. The adapters normalise to `accepted` so the copy and the pills
 * are written once.
 */
export type HousingJoinRequestStatus = "pending" | "accepted" | "declined";

export interface MyHousingJoinRequest {
  id: string;
  /** The co-op or group's public display name. */
  name: string;
  /** Its slug, or null for a resource that has since been removed. */
  slug: string | null;
  status: HousingJoinRequestStatus;
  /** ISO submission date. */
  createdAt: string;
}

/**
 * Demo fixtures. Hand-dated into the PAST like every other demo registry, so
 * nothing here may be treated as "recent" by live logic.
 */
export const DEMO_MY_COOP_JOIN_REQUESTS: MyHousingJoinRequest[] = [
  {
    id: "demo-coop-join-1",
    name: "Casa Almirante",
    slug: "casa-almirante",
    status: "pending",
    createdAt: "2026-05-18T10:20:00.000Z",
  },
];

/** Every group the demo persona has applied to, across the whole surface. The
 *  group detail page picks its own row out by slug. */
export const DEMO_MY_GROUP_JOIN_REQUESTS: MyHousingJoinRequest[] = [
  {
    id: "demo-group-join-1",
    name: "Trans housing",
    slug: "lisbon-trans-housing",
    status: "accepted",
    createdAt: "2026-04-02T09:00:00.000Z",
  },
];
