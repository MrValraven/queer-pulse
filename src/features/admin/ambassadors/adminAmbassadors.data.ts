import type {
  AdminAmbassadorCircleDTO,
  AdminAmbassadorDTO,
} from "./adminAmbassadors.api";

/** The staff member named on the demo grants. */
const DEMO_GRANTOR = { slug: "ana", name: "Ana Ribeiro" };

/**
 * The admin ambassadors page in demo mode. The four active rows agree with
 * `shared/ambassadors/ambassadorRegistry.data.ts` (same members, same focus,
 * same since date), so the tag the rest of the demo paints matches what this
 * page lists. Mariana is the demo of a hidden tag: active here, and absent
 * from that registry for exactly that reason. Carla carries an invite quota
 * override so the "bonus not applying" note has a row to show on. Rui is a
 * revoked grant, for the Past tab. Diogo also holds an earlier revoked grant
 * (he stepped back and was granted again), so his History drawer shows two.
 */
export const ADMIN_AMBASSADORS_DEMO: readonly AdminAmbassadorDTO[] = [
  {
    id: "demo-ambassador-beatriz",
    member: {
      userId: "demo-user-beatriz",
      slug: "beatriz",
      firstName: "Beatriz",
      lastName: "Pinto",
      avatarUrl: null,
    },
    focusArea: "arts_and_culture",
    grantedAt: "2026-03-12T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason:
      "Runs the Graça open studio nights and has brought dozens of makers in.",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    isTagVisible: true,
    inviteQuotaOverride: null,
  },
  {
    id: "demo-ambassador-diogo",
    member: {
      userId: "demo-user-diogo",
      slug: "diogo",
      firstName: "Diogo",
      lastName: "Vasques",
      avatarUrl: null,
    },
    focusArea: "nightlife_safety",
    grantedAt: "2026-06-18T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason:
      "Leads the harm reduction crew at the Bairro Alto club nights.",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    isTagVisible: true,
    inviteQuotaOverride: null,
  },
  {
    id: "demo-ambassador-carla",
    member: {
      userId: "demo-user-carla",
      slug: "carla",
      firstName: "Carla",
      lastName: "Nogueira",
      avatarUrl: null,
    },
    focusArea: "work_and_careers",
    grantedAt: "2025-11-04T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason: "Mentors queer people moving into product and tech roles.",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    isTagVisible: true,
    inviteQuotaOverride: 25,
  },
  {
    id: "demo-ambassador-ines",
    member: {
      userId: "demo-user-ines",
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: null,
    },
    focusArea: "housing",
    grantedAt: "2026-01-20T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason: "Built the affirming landlord list with the housing desk.",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    isTagVisible: true,
    inviteQuotaOverride: null,
  },
  {
    id: "demo-ambassador-mariana",
    member: {
      userId: "demo-user-mariana",
      slug: "mariana",
      firstName: "Mariana",
      lastName: "Loução",
      avatarUrl: null,
    },
    focusArea: "mental_health",
    grantedAt: "2026-05-02T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason: "Hosts the monthly peer support circle for newcomers.",
    revokedAt: null,
    revokedBy: null,
    revokeReason: null,
    isTagVisible: false,
    inviteQuotaOverride: null,
  },
  {
    id: "demo-ambassador-rui",
    member: {
      userId: "demo-user-rui",
      slug: "rui",
      firstName: "Rui",
      lastName: "Marçal",
      avatarUrl: null,
    },
    focusArea: "rights_and_activism",
    grantedAt: "2025-09-15T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason: "Organised the open letter on the housing law consultation.",
    revokedAt: "2026-04-30T10:00:00.000Z",
    revokedBy: DEMO_GRANTOR,
    revokeReason: "Stepped back to focus on work. Welcome back any time.",
    isTagVisible: true,
    inviteQuotaOverride: null,
  },
  {
    id: "demo-ambassador-diogo-earlier",
    member: {
      userId: "demo-user-diogo",
      slug: "diogo",
      firstName: "Diogo",
      lastName: "Vasques",
      avatarUrl: null,
    },
    focusArea: "nightlife_safety",
    grantedAt: "2025-05-10T10:00:00.000Z",
    grantedBy: DEMO_GRANTOR,
    grantReason: "Started the first harm reduction table at the Arraial.",
    revokedAt: "2025-12-01T10:00:00.000Z",
    revokedBy: DEMO_GRANTOR,
    revokeReason: "Took a break for the winter season.",
    isTagVisible: true,
    inviteQuotaOverride: null,
  },
];

/** The circle's handle, as `ambassador-circle.data.ts` founds it. */
export const AMBASSADOR_CIRCLE_SLUG_DEMO = "queerpulse-ambassadors";

export const ADMIN_AMBASSADOR_CIRCLE_DEMO: AdminAmbassadorCircleDTO = {
  isFounded: true,
  slug: AMBASSADOR_CIRCLE_SLUG_DEMO,
  memberCount: 5,
  isViewerMember: false,
};
