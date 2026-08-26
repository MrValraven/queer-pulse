import { routes } from "../../app/routeMap";
import type { NavEntry } from "../../app/navHistory";

/**
 * Where a member profile's back link should send the visitor.
 *
 * - `history` — they reached this profile from another in-app page, so the way
 *   back is a real history POP: `ScrollManager` restores the exact offset they
 *   left that page at, landing them on the row they tapped rather than the top
 *   of a long list.
 * - `link` — we can't know where they came from (a shared URL, a refresh, a
 *   push notification, an unknown POP), so the link falls back to the members
 *   directory, exactly as it always used to.
 */
export interface ProfileBackTarget {
  mode: "history" | "link";
  /** Destination path (with query), used as the anchor's href either way. */
  to: string;
  /** Key in the `members` catalog for the visible label. */
  labelKey: string;
}

const DIRECTORY_TARGET: ProfileBackTarget = {
  mode: "link",
  to: routes.members,
  labelKey: "profile.backToRoom",
};

/**
 * Origins we never offer as a way back, because returning to them is either
 * meaningless or actively hostile: an auth step the visitor has since
 * completed, or a system/error screen. These fall back to the directory.
 */
const UNRETURNABLE_PREFIXES = ["/auth", "/system", "/genesis"];

/**
 * Known origins and what to call them. `labelKey` names the section root
 * itself; `deepLabelKey` names a single item inside it, so arriving from a
 * community page offers "Back to the community" while arriving from the
 * communities index offers "Back to communities".
 *
 * Longest matching prefix wins (segment-aware, like `tabOf`), and anything
 * unmapped gets a plain "Back" — honest, and cheaper than a name we'd have to
 * fetch.
 */
const ORIGINS: Array<{
  prefix: string;
  labelKey: string;
  deepLabelKey?: string;
}> = [
  // A deeper /members path is another profile or one of its personas, which
  // "Back to the room" would misname — the generic label covers it.
  { prefix: routes.members, labelKey: "profile.backToRoom" },
  {
    prefix: routes.communities,
    labelKey: "profile.backTo.communities",
    deepLabelKey: "profile.backTo.community",
  },
  {
    prefix: routes.forum,
    labelKey: "profile.backTo.forum",
    deepLabelKey: "profile.backTo.thread",
  },
  {
    prefix: routes.gatherings,
    labelKey: "profile.backTo.gatherings",
    deepLabelKey: "profile.backTo.gathering",
  },
  {
    prefix: routes.events,
    labelKey: "profile.backTo.events",
    deepLabelKey: "profile.backTo.event",
  },
  { prefix: routes.feed, labelKey: "profile.backTo.feed" },
  { prefix: routes.messages, labelKey: "profile.backTo.messages" },
  { prefix: routes.search, labelKey: "profile.backTo.search" },
  { prefix: routes.directory, labelKey: "profile.backTo.directory" },
  { prefix: routes.connections, labelKey: "profile.backTo.connections" },
  { prefix: routes.calendar, labelKey: "profile.backTo.calendar" },
  { prefix: routes.changemakers, labelKey: "profile.backTo.changemakers" },
];

/** Segment-aware prefix match: `/forum` matches `/forum/x`, never `/forumX`. */
function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** The label for an origin path — longest mapped prefix wins, else plain "Back". */
export function backLabelKeyFor(pathname: string): string {
  if (pathname === routes.homepage) return "profile.backTo.home";

  let best: (typeof ORIGINS)[number] | null = null;
  for (const origin of ORIGINS) {
    if (!matches(pathname, origin.prefix)) continue;
    if (!best || origin.prefix.length > best.prefix.length) best = origin;
  }
  if (!best) return "profile.backTo.generic";

  const isDeep = pathname !== best.prefix;
  if (!isDeep) return best.labelKey;
  return best.deepLabelKey ?? "profile.backTo.generic";
}

/**
 * Resolve the back link for a profile page from the entry visited before it.
 *
 * `currentPathname` guards the degenerate case where the previous entry is this
 * same page (e.g. a persona tab that replaced the URL) — going "back" to where
 * you already are would be a dead link, so that falls back to the directory.
 */
export function profileBackTarget(
  previous: NavEntry | null,
  currentPathname: string,
): ProfileBackTarget {
  if (!previous) return DIRECTORY_TARGET;
  if (previous.pathname === currentPathname) return DIRECTORY_TARGET;
  if (
    UNRETURNABLE_PREFIXES.some((prefix) => matches(previous.pathname, prefix))
  )
    return DIRECTORY_TARGET;

  return {
    mode: "history",
    to: `${previous.pathname}${previous.search}`,
    labelKey: backLabelKeyFor(previous.pathname),
  };
}
