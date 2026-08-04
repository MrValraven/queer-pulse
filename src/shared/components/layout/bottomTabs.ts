import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiHome,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";

export interface BottomTab {
  /** Stable identity for React keys and active-state comparison. */
  key: string;
  labelKey: string;
  href: string;
  icon: IconType;
  /**
   * Path prefixes that should light this tab. A prefix matches the pathname
   * exactly, or as a full path segment (`/members` matches `/members/123` but
   * never `/members-only`).
   */
  matchPrefixes: string[];
}

/**
 * The installed-app tab sets. Deliberately hand-curated rather than derived from
 * NAV_MENUS: a tab bar has five slots, so which destinations earn permanent
 * residence is an editorial decision, not a filter. Everything else stays
 * reachable through the "More" tab, which opens the same drawer NAV_MENUS feeds.
 *
 * MEMBER_TABS holds three links; BottomTabBar renders "More" and "You" (the
 * avatar button) as the last two slots.
 * PUBLIC_TABS deliberately holds only three: signing in is the app bar's job
 * (Navbar renders it in the installed-mode strip), and duplicating it at the
 * bottom gave a logged-out visitor two sign-in affordances on one screen.
 */
export const MEMBER_TABS: BottomTab[] = [
  {
    key: "feed",
    labelKey: "nav:feed",
    href: routes.feed,
    icon: FiHome,
    matchPrefixes: [routes.feed],
  },
  {
    key: "events",
    labelKey: "nav:events",
    href: routes.events,
    icon: FiCalendar,
    matchPrefixes: [routes.events, routes.calendar, routes.gatherings],
  },
  {
    key: "members",
    labelKey: "nav:members",
    href: routes.members,
    icon: FiUsers,
    matchPrefixes: [routes.members],
  },
];

export const PUBLIC_TABS: BottomTab[] = [
  {
    key: "events",
    labelKey: "nav:events",
    href: routes.events,
    icon: FiCalendar,
    matchPrefixes: [routes.events, routes.calendar, routes.gatherings],
  },
  {
    key: "places",
    labelKey: "nav:places",
    href: routes.directory,
    icon: FiMapPin,
    matchPrefixes: [routes.directory],
  },
  {
    key: "resources",
    labelKey: "nav:resources",
    href: routes.resources,
    icon: FiBookOpen,
    matchPrefixes: [routes.resources],
  },
];

/**
 * The key of the tab that owns `pathname`, or null when none does.
 *
 * Longest prefix wins, so a nested tab (`/local/directory`) beats a broader one
 * (`/local`) on a path both could claim. Matching is segment-aware to stop
 * `/members-only` from lighting the `/members` tab.
 */
export function activeTabKey(
  pathname: string,
  tabs: BottomTab[],
): string | null {
  let matchedKey: string | null = null;
  let matchedLength = 0;

  for (const tab of tabs) {
    for (const prefix of tab.matchPrefixes) {
      const isMatch =
        pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (isMatch && prefix.length > matchedLength) {
        matchedKey = tab.key;
        matchedLength = prefix.length;
      }
    }
  }

  return matchedKey;
}
