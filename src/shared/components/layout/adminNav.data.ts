import {
  FiGrid,
  FiShield,
  FiUsers,
  FiGlobe,
  FiAward,
  FiInbox,
  FiSettings,
  FiHeart,
  FiMapPin,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../../app/routeMap";
import { currentUser } from "../../../features/members/data/members";

/** Live pending-count source for a nav pill, resolved in AdminSidebar. */
export type AdminNavBadge = "moderation" | "members" | "partnerships";

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
    labelKey: "nav:members",
    to: routes.adminMembers,
    icon: FiUsers,
    badge: "members",
    tone: "warn",
  },
  { labelKey: "nav:communities", to: routes.adminCommunities, icon: FiGlobe },
  {
    labelKey: "shared:adminNav.items.safeSpaces",
    to: routes.adminSafeSpaces,
    icon: FiMapPin,
  },
  {
    labelKey: "community:changemakers.admin.navLabel",
    to: routes.adminChangemakers,
    icon: FiHeart,
  },
  {
    labelKey: "shared:adminNav.items.partnerships",
    to: routes.adminPartnerApplications,
    icon: FiInbox,
    badge: "partnerships",
    tone: "warn",
  },
  {
    labelKey: "shared:adminNav.items.governance",
    to: routes.adminGovernance,
    icon: FiAward,
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
