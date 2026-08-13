import {
  FiGrid,
  FiShield,
  FiUsers,
  FiHome,
  FiGlobe,
  FiAward,
  FiInbox,
  FiSettings,
  FiHeart,
  FiMapPin,
  FiLayers,
  FiCpu,
  FiFileText,
  FiMap,
  FiMail,
  FiUserPlus,
  FiFeather,
  FiBookOpen,
  FiEdit3,
  FiRadio,
  FiImage,
  FiUserCheck,
  FiFlag,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../../app/routeMap";
import { currentUser } from "../../../features/members/data/members";

/** Live pending-count source for a nav pill, resolved in AdminSidebar. */
export type AdminNavBadge =
  | "moderation"
  | "members"
  | "partnerships"
  | "verifications";

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

export const ADMIN_NAV: AdminNavItem[] = [
  {
    labelKey: "shared:adminNav.items.overview",
    to: routes.admin,
    icon: FiGrid,
    end: true,
  },
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
    labelKey: "nav:members",
    to: routes.adminMembers,
    icon: FiUsers,
    badge: "members",
    tone: "warn",
  },
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
  { labelKey: "nav:communities", to: routes.adminCommunities, icon: FiGlobe },
  {
    labelKey: "shared:adminNav.items.safeSpaces",
    to: routes.adminSafeSpaces,
    icon: FiMapPin,
  },
  {
    labelKey: "shared:adminNav.items.listings",
    to: routes.adminListings,
    icon: FiFileText,
  },
  {
    labelKey: "shared:adminNav.items.housingGroups",
    to: routes.adminHousingGroups,
    icon: FiHome,
  },
  {
    labelKey: "shared:adminNav.items.media",
    to: routes.adminMedia,
    icon: FiImage,
  },
  {
    labelKey: "shared:adminNav.items.invites",
    to: routes.adminInvites,
    icon: FiMail,
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
  {
    labelKey: "shared:adminNav.items.commissionInterests",
    to: routes.adminCommissionInterests,
    icon: FiFeather,
  },
  {
    labelKey: "shared:adminNav.items.readingGroupProposals",
    to: routes.adminReadingGroupProposals,
    icon: FiBookOpen,
  },
  {
    labelKey: "shared:adminNav.items.magazineSubmissions",
    to: routes.adminMagazineSubmissions,
    icon: FiEdit3,
  },
  {
    labelKey: "shared:adminNav.items.partnerships",
    to: routes.adminPartnerApplications,
    icon: FiInbox,
    badge: "partnerships",
    tone: "warn",
  },
  {
    labelKey: "shared:adminNav.items.verifications",
    to: routes.adminVerifications,
    icon: FiUserCheck,
    badge: "verifications",
    tone: "warn",
  },
  {
    labelKey: "shared:adminNav.items.orgTiers",
    to: routes.adminOrgTiers,
    icon: FiLayers,
  },
  {
    labelKey: "shared:adminNav.items.governance",
    to: routes.adminGovernance,
    icon: FiAward,
  },
  {
    labelKey: "shared:adminNav.items.roadmap",
    to: routes.adminRoadmap,
    icon: FiMap,
  },
  {
    labelKey: "shared:adminNav.items.systemAccounts",
    to: routes.adminBots,
    icon: FiCpu,
  },
  {
    labelKey: "admin:settings.breadcrumb",
    to: routes.adminSettings,
    icon: FiSettings,
  },
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

/** The signed-in admin — same identity as the logged-in member on the main platform. */
export const ADMIN_PROFILE = {
  initials: currentUser.initials,
  name: `${currentUser.first} ${currentUser.last}`,
  firstName: currentUser.first,
  role: "Trust & Safety lead",
};
