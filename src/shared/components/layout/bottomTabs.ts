import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiHome,
  FiInfo,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { isGatedLink } from "../../../app/authGate";
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
 * The installed-app tab sets. Which destinations earn permanent residence is an
 * editorial decision rather than a filter over NAV_MENUS: a tab bar has five
 * slots. Everything else stays reachable through the "More" tab, which opens
 * the same drawer NAV_MENUS feeds.
 *
 * MEMBER_TABS holds three links; BottomTabBar renders "More" and "You" (the
 * avatar button) as the last two slots.
 * PUBLIC_TABS holds three: signing in is the app bar's job (Navbar renders it
 * in the installed-mode strip), and duplicating it at the bottom gave a
 * logged-out visitor two sign-in affordances on one screen.
 *
 * WHICH destinations is editorial; whether a signed-out visitor can OPEN them
 * is not. `PUBLIC_TABS` is therefore derived from the candidate list below by
 * running every href through `authGate`'s own `isGatedLink`, so the two lists
 * can never disagree. They had disagreed: `/events` and `/local/directory` were
 * gated while still sitting in the public set, so BottomTabBar's own gate filter
 * dropped both at render and a logged-out phone got a one-tab bar.
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

/**
 * The signed-out candidates, in bar order. Every entry must be public per
 * `authGate.ts`; the derivation below is what enforces that.
 *
 * Chosen for what a visitor with no account can actually use: the resource
 * library (the platform's public-service front door), the safe-spaces guide
 * (the public half of the Lisbon surface, and already the Lisbon menu's
 * logged-out feature promo), and About (what this place is, and the route to
 * requesting an invite).
 */
const PUBLIC_TAB_CANDIDATES: BottomTab[] = [
  {
    key: "resources",
    labelKey: "nav:resources",
    href: routes.resources,
    icon: FiBookOpen,
    matchPrefixes: [routes.resources],
  },
  {
    key: "places",
    labelKey: "nav:places",
    href: routes.safeSpaces,
    icon: FiMapPin,
    matchPrefixes: [routes.safeSpaces],
  },
  {
    key: "about",
    labelKey: "nav:about",
    href: routes.about,
    icon: FiInfo,
    matchPrefixes: [routes.about],
  },
];

/**
 * The tab set a logged-out visitor gets, derived rather than hand-maintained.
 *
 * `isGatedLink` is the same predicate the route guard and the nav/footer
 * filtering use, so this list follows `GATED_PATTERNS` automatically: gating a
 * destination drops it from here in the same commit, and the signed-out bar can
 * never advertise a page that bounces to sign-in.
 */
export const PUBLIC_TABS: BottomTab[] = PUBLIC_TAB_CANDIDATES.filter(
  (tab) => !isGatedLink(tab.href),
);

/**
 * Dev-time drift alarm.
 *
 * The filter above keeps every shipped build correct on its own, but silently:
 * a newly gated destination would just shrink the bar, which is exactly how the
 * last drift went unnoticed until a logged-out phone showed one tab. So in
 * development (and under the test runner) the same condition is a hard stop
 * that names the offending tab. `import.meta.env.DEV` is inlined to `false` by
 * `vite build`, so no deployed artifact can white-screen on this.
 */
if (
  import.meta.env.DEV &&
  PUBLIC_TABS.length !== PUBLIC_TAB_CANDIDATES.length
) {
  const gatedTabs = PUBLIC_TAB_CANDIDATES.filter((tab) =>
    isGatedLink(tab.href),
  ).map((tab) => `${tab.key} (${tab.href})`);
  throw new Error(
    `PUBLIC_TAB_CANDIDATES has drifted from authGate.ts: ${gatedTabs.join(", ")} ${gatedTabs.length === 1 ? "is" : "are"} gated, so a signed-out visitor would lose ${gatedTabs.length === 1 ? "that tab" : "those tabs"}. Point the entry at a public destination, or ungate it in GATED_PATTERNS.`,
  );
}

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
      const isMatch = pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (isMatch && prefix.length > matchedLength) {
        matchedKey = tab.key;
        matchedLength = prefix.length;
      }
    }
  }

  return matchedKey;
}
