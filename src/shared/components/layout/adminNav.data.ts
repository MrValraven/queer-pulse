import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiClock,
  FiCpu,
  FiEdit3,
  FiFeather,
  FiFileText,
  FiFlag,
  FiGlobe,
  FiGrid,
  FiHash,
  FiHeart,
  FiHome,
  FiImage,
  FiInbox,
  FiKey,
  FiLayers,
  FiMail,
  FiMap,
  FiMapPin,
  FiMessageSquare,
  FiPhoneCall,
  FiRadio,
  FiSettings,
  FiShield,
  FiTag,
  FiThumbsUp,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../../app/routeMap";
import type { StaffRoleId } from "../../../features/admin/staffRoles.registry";
import { currentUser } from "../../../features/members/data/members";

/** Live pending-count source for a nav pill, resolved in AdminSidebar. */
export type AdminNavBadge =
  "moderation" | "members" | "partnerships" | "verifications" | "housingCoops";

export interface AdminNavItem {
  /** Catalog key for the visible label — resolve with `t()`. */
  labelKey: string;
  to: string;
  icon: IconType;
  end?: boolean;
  /** Which live queue feeds this item's pill; the pill is hidden when its count is 0. */
  badge?: AdminNavBadge;
  /** Pill tone: 'alert' (red) for urgent, 'warn' (amber) for waiting. */
  tone?: "alert" | "warn";
  /**
   * Additive staff grants that reach this destination on their own (OPS-03).
   * Set it only where the backend controller genuinely admits the grant and
   * `CAPABILITY_ELEVATED_PATTERNS` in `app/authGate.ts` elevates the same path,
   * so the rail can never offer a link the route gate then bounces. Absent
   * means "account tier only", which is most of the console.
   */
  capabilities?: StaffRoleId[];
}

export interface AdminNavSection {
  /** Stable key for the open/closed map persisted to localStorage — never
   * derived from the label, so translating a heading cannot lose the state. */
  id: string;
  /** Catalog key for the section heading — resolve with `t()`. */
  labelKey: string;
  /** Whether the section starts open the first time an admin loads the nav.
   * Later visits read the persisted map instead. */
  defaultOpen?: boolean;
  items: AdminNavItem[];
}

/** Sits above the first section, outside any collapsible group: the admin's way
 * home, so it can never end up hidden behind a collapsed heading. */
export const ADMIN_NAV_OVERVIEW: AdminNavItem = {
  labelKey: "shared:adminNav.items.overview",
  to: routes.admin,
  icon: FiGrid,
  end: true,
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "trust",
    labelKey: "shared:adminNav.sections.trust",
    defaultOpen: true,
    items: [
      {
        labelKey: "shared:adminNav.items.moderation",
        to: routes.adminModeration,
        icon: FiShield,
        badge: "moderation",
        tone: "alert",
      },
      {
        labelKey: "shared:adminNav.items.concerns",
        to: routes.adminConcerns,
        icon: FiFlag,
      },
      {
        // ACQ-03: the intake console — the eleven intake kinds nobody read plus
        // the public contact/partnership inbox. Filed beside Concerns because
        // it is the same job (reading what people sent) and because the two
        // link across: a governance concern shows there as a stub and is
        // triaged here.
        //
        // Deliberately without a `badge`. `AdminNavBadge` is a closed union of
        // the five queues `useAdminNavBadges` resolves, and none of them counts
        // intakes or inquiries; borrowing one would put another queue's number
        // on this link. Widening it into a per-queue registry is OPS-01's job,
        // so this ships honest and unbadged rather than half-building that.
        labelKey: "shared:adminNav.items.intakes",
        to: routes.adminIntakes,
        icon: FiInbox,
      },
      {
        // TS-16: the reason-keyed library a moderator prefills a decision note
        // from. It sits beside the queue that consumes it.
        labelKey: "admin:moderation.templates.navLabel",
        to: routes.adminModResponseTemplates,
        icon: FiMessageSquare,
      },
      {
        // ID-04: the DSAR queue. Filed under Trust & safety rather than
        // People & access: a data-subject request is a statutory obligation
        // with a running clock, the same kind of work as concerns and
        // moderation, not roster administration.
        labelKey: "admin:adminDsar.navLabel",
        to: routes.adminDsar,
        icon: FiFileText,
      },
      {
        labelKey: "shared:adminNav.items.verifications",
        to: routes.adminVerifications,
        icon: FiUserCheck,
        badge: "verifications",
        tone: "warn",
      },
    ],
  },
  {
    id: "people",
    labelKey: "shared:adminNav.sections.people",
    defaultOpen: true,
    items: [
      {
        labelKey: "nav:members",
        to: routes.adminMembers,
        icon: FiUsers,
        badge: "members",
        tone: "warn",
      },
      {
        // The join-request queue. It is also the "pending" tab of Members above,
        // but that page is admin-only while the backend authorizes moderators
        // for the queue itself, so this is the entry a moderator can follow.
        labelKey: "admin:settings.joinRequests.title",
        to: routes.adminJoinRequests,
        icon: FiUserPlus,
        badge: "members",
        tone: "warn",
      },
      {
        labelKey: "shared:adminNav.items.invites",
        to: routes.adminInvites,
        icon: FiMail,
      },
      {
        labelKey: "shared:adminNav.items.staff",
        to: routes.adminStaff,
        icon: FiKey,
      },
    ],
  },
  {
    id: "communities",
    labelKey: "shared:adminNav.sections.communities",
    items: [
      {
        labelKey: "nav:communities",
        to: routes.adminCommunities,
        capabilities: ["communities"],
        icon: FiGlobe,
      },
      {
        labelKey: "shared:adminNav.items.communityTagRequests",
        to: routes.adminCommunityTagRequests,
        capabilities: ["communities"],
        icon: FiTag,
      },
      {
        labelKey: "shared:adminNav.items.housingGroups",
        to: routes.adminHousingGroups,
        icon: FiHome,
      },
      {
        // OPS-06: `/admin/housing` was registered, backed by live co-op and
        // join-request endpoints, and linked from nowhere. The cross-co-op
        // join-request queue had real people waiting in it, reachable only by
        // typing the URL. Admin-only, like the endpoints behind it, so it
        // carries no `capabilities` grant.
        labelKey: "shared:adminNav.items.housingCoops",
        to: routes.adminHousingCoops,
        icon: FiHome,
        badge: "housingCoops",
        tone: "warn",
      },
      {
        labelKey: "shared:adminNav.items.housingGroupListings",
        to: routes.adminHousingGroupListings,
        capabilities: ["housing_moderator"],
        icon: FiHome,
        tone: "warn",
      },
      {
        labelKey: "shared:adminNav.items.readingGroupProposals",
        to: routes.adminReadingGroupProposals,
        capabilities: ["communities"],
        icon: FiBookOpen,
      },
    ],
  },
  {
    id: "directory",
    labelKey: "shared:adminNav.sections.directory",
    items: [
      {
        labelKey: "shared:adminNav.items.safeSpaces",
        to: routes.adminSafeSpaces,
        capabilities: ["directory_moderator"],
        icon: FiMapPin,
      },
      {
        labelKey: "shared:adminNav.items.topics",
        to: routes.adminTopics,
        capabilities: ["communities"],
        icon: FiHash,
      },
      {
        labelKey: "shared:adminNav.items.listings",
        to: routes.adminListings,
        capabilities: ["directory_moderator"],
        icon: FiFileText,
      },
      {
        labelKey: "shared:adminNav.items.housingListings",
        to: routes.adminHousingListings,
        capabilities: ["housing_moderator"],
        icon: FiHome,
      },
      {
        labelKey: "shared:adminNav.items.landlords",
        to: routes.adminLandlords,
        icon: FiKey,
      },
      {
        labelKey: "shared:adminNav.items.resourceGuides",
        to: routes.adminResourceGuides,
        capabilities: ["resource_curator"],
        icon: FiBookOpen,
      },
      {
        labelKey: "shared:adminNav.items.resourceListings",
        to: routes.adminResourceListings,
        capabilities: ["resource_curator"],
        icon: FiPhoneCall,
      },
      {
        labelKey: "shared:adminNav.items.resourceSuggestions",
        to: routes.adminResourceSuggestions,
        capabilities: ["resource_curator"],
        icon: FiMessageSquare,
      },
    ],
  },
  {
    id: "editorial",
    labelKey: "shared:adminNav.sections.editorial",
    items: [
      {
        labelKey: "shared:adminNav.items.magazineSubmissions",
        to: routes.adminMagazineSubmissions,
        capabilities: ["editorial"],
        icon: FiEdit3,
      },
      {
        labelKey: "shared:adminNav.items.writerApplications",
        to: routes.adminWriterApplications,
        capabilities: ["editorial"],
        icon: FiFeather,
      },
      {
        labelKey: "shared:adminNav.items.commissionInterests",
        to: routes.adminCommissionInterests,
        capabilities: ["editorial"],
        icon: FiFeather,
      },
      {
        labelKey: "shared:adminNav.items.guideFeedback",
        to: routes.adminGuideFeedback,
        capabilities: ["resource_curator"],
        icon: FiThumbsUp,
      },
    ],
  },
  {
    id: "partners",
    labelKey: "shared:adminNav.sections.partners",
    items: [
      {
        labelKey: "shared:adminNav.items.partnerships",
        to: routes.adminPartnerApplications,
        capabilities: ["partnerships"],
        icon: FiInbox,
        badge: "partnerships",
        tone: "warn",
      },
      {
        labelKey: "shared:adminNav.items.orgTiers",
        to: routes.adminOrgTiers,
        capabilities: ["partnerships"],
        icon: FiLayers,
      },
      {
        labelKey: "community:changemakers.admin.navLabel",
        to: routes.adminChangemakers,
        capabilities: ["partnerships"],
        icon: FiHeart,
      },
      {
        labelKey: "shared:adminNav.items.changemakerNominations",
        to: routes.adminChangemakerNominations,
        capabilities: ["partnerships"],
        icon: FiUserPlus,
      },
    ],
  },
  {
    id: "site",
    labelKey: "shared:adminNav.sections.site",
    items: [
      {
        labelKey: "shared:adminNav.items.landing",
        to: routes.adminLanding,
        capabilities: ["editorial"],
        icon: FiHome,
      },
      {
        labelKey: "shared:adminNav.items.pressKit",
        to: routes.adminPressKit,
        capabilities: ["editorial"],
        icon: FiRadio,
      },
      {
        labelKey: "shared:adminNav.items.roadmap",
        to: routes.adminRoadmap,
        icon: FiMap,
      },
    ],
  },
  {
    id: "platform",
    labelKey: "shared:adminNav.sections.platform",
    items: [
      {
        labelKey: "shared:adminNav.items.governance",
        to: routes.adminGovernance,
        icon: FiAward,
      },
      {
        labelKey: "shared:adminNav.items.reports",
        to: routes.adminReports,
        icon: FiBarChart2,
      },
      {
        // SUS-05: confirmed volunteer sessions and hours. Filed beside Reports
        // because it is the same job: figures the team can put in front of a
        // partner or a funder.
        //
        // Deliberately without a `badge`. `AdminNavBadge` is a closed union of
        // live PENDING counts, and this is a report, not a queue: nothing here
        // is waiting on anybody, so any number on this link would be borrowed
        // from another queue and would lie.
        //
        // No `capabilities` either. `GET /admin/volunteering/hours` is
        // `@Roles(Moderator, Admin)` with no `@StaffRoles(...)` union, because
        // no grant in `staff-roles.registry.ts` covers volunteering. The
        // moderator half is expressed in MOD_ACCESSIBLE_ADMIN_PATTERNS.
        labelKey: "shared:adminNav.items.volunteerHours",
        to: routes.adminVolunteerHours,
        icon: FiClock,
      },
      {
        // ID-16 — the status-incident desk. Filed under Platform next to
        // Reports: it is operations work, and what it publishes is read by
        // people with no session at all.
        labelKey: "system:statusAdmin.navLabel",
        to: routes.adminStatusIncidents,
        icon: FiActivity,
      },
      {
        labelKey: "shared:adminNav.items.systemAccounts",
        to: routes.adminBots,
        icon: FiCpu,
      },
      {
        labelKey: "shared:adminNav.items.media",
        to: routes.adminMedia,
        icon: FiImage,
      },
      {
        labelKey: "admin:settings.breadcrumb",
        to: routes.adminSettings,
        icon: FiSettings,
      },
    ],
  },
];

/**
 * The rail as one viewer should see it.
 *
 * Platform tiers keep exactly the rail they had: an admin sees everything, and
 * so does a moderator (the route gate is still what decides each link). A
 * member who is in the console only because they hold an additive staff grant
 * sees the items that grant opens and nothing else, so the console reads as
 * the job they were handed rather than as a wall of links that bounce.
 */
export function visibleAdminNavSections(options: {
  /** True for a viewer who sees the whole console: admin, moderator, or demo. */
  isFullConsole: boolean;
  staffRoles: readonly StaffRoleId[];
}): AdminNavSection[] {
  if (options.isFullConsole) return ADMIN_NAV_SECTIONS;
  return ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      (item.capabilities ?? []).some((capability) =>
        options.staffRoles.includes(capability),
      ),
    ),
  })).filter((section) => section.items.length > 0);
}

/** Every admin destination as one flat list, for callers that only care that a
 * link exists rather than where it is filed. */
export const ADMIN_NAV: AdminNavItem[] = [
  ADMIN_NAV_OVERVIEW,
  ...ADMIN_NAV_SECTIONS.flatMap((section) => section.items),
];

export interface StewardedCommunity {
  initials: string;
  name: string;
  meta: string;
  /** Avatar tint as inline rgba pair (bg alpha / text). */
  tintBg: string;
  tintFg: string;
}

/** Communities the signed-in admin moderates — shown in the role switcher. */
export const STEWARDED: StewardedCommunity[] = [
  {
    initials: "TR",
    name: "Trans & Friends",
    meta: "Moderator · 1,204 members",
    tintBg: "rgba(var(--jade-rgb),.22)",
    tintFg: "var(--jade)",
  },
  {
    initials: "QC",
    name: "Queer Creatives",
    meta: "Moderator · 842 members",
    tintBg: "rgba(var(--violet-rgb),.22)",
    tintFg: "var(--violet)",
  },
];

/**
 * The DEMO admin persona, kept only as a fallback for surfaces that greet the
 * viewer by name before a live session resolves.
 *
 * It used to carry `name` and an invented `role` ("Trust & Safety lead") that
 * the sidebar's account button rendered verbatim — so a real signed-in admin
 * was shown the mock persona's name and a job title with no backend
 * counterpart. Those fields are gone: `AdminAccountMenu` reads the real
 * identity through `useAccountIdentity` and the real grants through
 * `useMyStaffRoles`. Anything added back here is demo-only by definition.
 */
export const ADMIN_PROFILE = {
  initials: currentUser.initials,
  firstName: currentUser.first,
};
