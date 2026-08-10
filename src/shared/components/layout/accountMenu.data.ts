import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiUser,
  FiUserPlus,
  FiEdit3,
  FiSend,
  FiBriefcase,
  FiBookmark,
  FiCalendar,
  FiUsers,
  FiLayers,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";

export type AccountItem = {
  labelKey: string;
  to: string;
  icon: IconType;
  /**
   * Optional trailing badge (a persona count pill / pending-invite dot,
   * personas Phase 5 M3). Never set in this static array — counts need
   * live hooks, so `AccountMenuPanel`/`AccountSheetBody` compute it and
   * attach it per-row (matched by `to`) when rendering.
   */
  badge?: ReactNode;
};

/**
 * The canonical account links, grouped by type. Each inner array renders as its
 * own two-column sub-grid in the desktop menu, separated by a divider, so the
 * clusters read as categories (people & what's on · career · writing · support).
 * Saved and Settings are NOT here — they live as icon actions in the menu header
 * (see HEADER_ACTIONS). Labels are bare nouns.
 */
export const ACCOUNT_GROUPS: AccountItem[][] = [
  // People — you, your circles, and what's on
  [
    {
      labelKey: "shared:accountMenu.items.profile",
      to: routes.accountProfile,
      icon: FiUser,
    },
    {
      labelKey: "shared:accountMenu.items.personas",
      to: routes.subprofilesDashboard,
      icon: FiLayers,
    },
    {
      labelKey: "shared:accountMenu.items.connections",
      to: routes.connections,
      icon: FiUserPlus,
    },
    { labelKey: "nav:communities", to: routes.communities, icon: FiUsers },
    {
      labelKey: "shared:accountMenu.items.events",
      to: routes.events,
      icon: FiCalendar,
    },
  ],
  // Career — Applications now lives inside the Work hub, not as its own link.
  [
    {
      labelKey: "shared:accountMenu.items.work",
      to: routes.work,
      icon: FiBriefcase,
    },
  ],
  // Writing
  [
    {
      labelKey: "shared:accountMenu.items.drafts",
      to: routes.drafts,
      icon: FiEdit3,
    },
    {
      labelKey: "shared:accountMenu.items.pitches",
      to: routes.pitchTracker,
      icon: FiSend,
    },
  ],
  // Support
  [
    {
      labelKey: "shared:accountMenu.items.help",
      to: routes.help,
      icon: FiHelpCircle,
    },
  ],
];

/**
 * Saved + Settings — promoted out of the grid into compact icon actions in the
 * menu header (rendered with tooltips).
 */
export const HEADER_ACTIONS: AccountItem[] = [
  {
    labelKey: "shared:accountMenu.items.saved",
    to: routes.collections,
    icon: FiBookmark,
  },
  {
    labelKey: "shared:accountMenu.items.settings",
    to: routes.settings,
    icon: FiSettings,
  },
];

