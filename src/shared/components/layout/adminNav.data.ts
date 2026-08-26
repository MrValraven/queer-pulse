import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBookOpen,
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
import { currentUser } from "../../../features/members/data/members";

/** Live pending-count source for a nav pill, resolved in AdminSidebar. */
export type AdminNavBadge =
  "moderation" | "members" | "partnerships" | "verifications";

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
        icon: FiGlobe,
      },
      {
        labelKey: "shared:adminNav.items.communityTagRequests",
        to: routes.adminCommunityTagRequests,
        icon: FiTag,
      },
      {
        labelKey: "shared:adminNav.items.housingGroups",
        to: routes.adminHousingGroups,
        icon: FiHome,
      },
      {
        labelKey: "shared:adminNav.items.housingGroupListings",
        to: routes.adminHousingGroupListings,
        icon: FiHome,
        tone: "warn",
      },
      {
        labelKey: "shared:adminNav.items.readingGroupProposals",
        to: routes.adminReadingGroupProposals,
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
        icon: FiMapPin,
      },
      {
        labelKey: "shared:adminNav.items.topics",
        to: routes.adminTopics,
        icon: FiHash,
      },
      {
        labelKey: "shared:adminNav.items.listings",
        to: routes.adminListings,
        icon: FiFileText,
      },
      {
        labelKey: "shared:adminNav.items.housingListings",
        to: routes.adminHousingListings,
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
        icon: FiBookOpen,
      },
      {
        labelKey: "shared:adminNav.items.resourceListings",
        to: routes.adminResourceListings,
        icon: FiPhoneCall,
      },
      {
        labelKey: "shared:adminNav.items.resourceSuggestions",
        to: routes.adminResourceSuggestions,
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
        icon: FiEdit3,
      },
      {
        labelKey: "shared:adminNav.items.writerApplications",
        to: routes.adminWriterApplications,
        icon: FiFeather,
      },
      {
        labelKey: "shared:adminNav.items.commissionInterests",
        to: routes.adminCommissionInterests,
        icon: FiFeather,
      },
      {
        labelKey: "shared:adminNav.items.guideFeedback",
        to: routes.adminGuideFeedback,
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
        icon: FiInbox,
        badge: "partnerships",
        tone: "warn",
      },
      {
        labelKey: "shared:adminNav.items.orgTiers",
        to: routes.adminOrgTiers,
        icon: FiLayers,
      },
      {
        labelKey: "community:changemakers.admin.navLabel",
        to: routes.adminChangemakers,
        icon: FiHeart,
      },
      {
        labelKey: "shared:adminNav.items.changemakerNominations",
        to: routes.adminChangemakerNominations,
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
        icon: FiHome,
      },
      {
        labelKey: "shared:adminNav.items.pressKit",
        to: routes.adminPressKit,
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
