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
  FiCompass,
  FiDownload,
  FiCreditCard,
  FiKey,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";

/** Sentinel id for the one non-navigating row (see `action` below). */
export const INSTALL_APP_ACTION = "installApp";

export type AccountItem = {
  labelKey: string;
  icon: IconType;
  /**
   * Optional trailing badge (a persona count pill / pending-invite dot,
   * personas Phase 5 M3). Never set in this static array — counts need
   * live hooks, so `AccountMenuPanel`/`AccountSheetBody` compute it and
   * attach it per-row (matched by `to`) when rendering.
   */
  badge?: ReactNode;
  /**
   * Only show this row in live mode. Set on surfaces that track a real member's
   * account state (e.g. Getting started), which have nothing to show in the demo
   * sandbox — the panel/sheet drop the row when `demoMode` is on.
   */
  liveOnly?: boolean;
} & (
  | { to: string; action?: undefined }
  /**
   * A row that opens something in place instead of navigating (currently only
   * "Install the app" — mobile-only, opens InstallAppModal). `to` is omitted
   * rather than pointed at a fake route so it can never be mistaken for a real
   * link destination.
   */
  | { to?: undefined; action: typeof INSTALL_APP_ACTION }
);

/**
 * The canonical account links, grouped by type. Each inner array renders as its
 * own two-column sub-grid in the desktop menu, separated by a divider, so the
 * clusters read as categories (people & what's on · career & content · support).
 * Saved and Settings are NOT here — they live as icon actions in the menu header
 * (see HEADER_ACTIONS). Labels are bare nouns.
 */
export const ACCOUNT_GROUPS: AccountItem[][] = [
  // Getting started — pinned to the very top so new members find their setup
  // checklist first. liveOnly: it drops out in the demo sandbox.
  [
    {
      labelKey: "shared:accountMenu.items.gettingStarted",
      to: routes.gettingStarted,
      icon: FiCompass,
      liveOnly: true,
    },
  ],
  // Install the app — mobile-only (AccountMenuPanel excludes it; AccountSheet
  // filters it further by useDisplayMode().isInstalled). Opens InstallAppModal
  // instead of navigating.
  [
    {
      labelKey: "shared:accountMenu.items.installApp",
      icon: FiDownload,
      action: INSTALL_APP_ACTION,
    },
  ],
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
    // ACQ-08 — the member-minted invite flow used to hang off a single button
    // in the Connections page header, so unspent invites expired unseen. It
    // sits right after Connections: this is the "people" cluster, and inviting
    // someone is the same move as connecting, one step earlier. NOT `liveOnly`
    // — `inviteQuota.data.ts` gives the demo sandbox a real allowance to show.
    // The trailing count comes from `useInviteQuotaBadge`.
    {
      labelKey: "shared:accountMenu.items.invite",
      to: routes.invite,
      icon: FiKey,
    },
    { labelKey: "nav:communities", to: routes.communities, icon: FiUsers },
    {
      labelKey: "shared:accountMenu.items.events",
      to: routes.events,
      icon: FiCalendar,
    },
    {
      labelKey: "shared:accountMenu.items.cards",
      to: routes.myCards,
      icon: FiCreditCard,
    },
  ],
  // Career & content. Applications now lives inside the Work hub, not as its
  // own link. Drafts/Pitches sit here, not in the staff-only RoleLinks block
  // below: both are general-member features. Drafts spans job/post/pitch/
  // grant drafts, and Pitches tracks any member's submitted story pitches;
  // neither is gated to the magazine_writer staff role.
  [
    {
      labelKey: "shared:accountMenu.items.work",
      to: routes.work,
      icon: FiBriefcase,
    },
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

/** An {@link AccountItem} that navigates (excludes the install-app action row). */
export type AccountLinkItem = Extract<AccountItem, { to: string }>;

/**
 * Saved + Settings — promoted out of the grid into compact icon actions in the
 * menu header (rendered with tooltips).
 */
export const HEADER_ACTIONS: AccountLinkItem[] = [
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
