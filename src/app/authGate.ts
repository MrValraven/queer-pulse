import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "./providers/authContext";
import { linkToPath, routes } from "./routeMap";

/**
 * Auth gating policy for the walled-garden model.
 *
 * QueerPulse is invite-only, so the member surface (feed, messages, communities,
 * gatherings, economy, studio, the account area, admin/mod, …) is closed to
 * logged-out visitors. Marketing, the magazine/culture, cinema browsing,
 * resources, safety/crisis pages, policies, and the auth flow stay public so the
 * platform can still attract members and support people in crisis who aren't
 * signed in.
 *
 * This is a denylist: anything not matched here is public by default, which keeps
 * legal/marketing pages from ever being locked by accident. To gate a new page,
 * add its path (or a `/prefix/*` pattern) to GATED_PATTERNS.
 */
const GATED_PATTERNS: string[] = [
  // Account hub + all settings sub-flows
  "/account",
  "/account/*",
  // Work / economy (jobs, housing, mentorship, freelance tools, …)
  "/work",
  "/work/*",
  "/economy",
  "/economy/*",
  // Music studio (creator platform)
  "/studio",
  "/studio/*",
  // Admin & moderation panels
  "/admin",
  "/admin/*",
  "/mod/*",
  // Personal member surfaces
  "/feed",
  "/search",
  "/members",
  "/members/*",
  "/member-directory-filter",
  "/dating",
  "/reading-groups",
  "/family",
  "/messages",
  "/notifications",
  "/mentions",
  "/notification-deep-link",
  // Communities
  "/communities",
  "/communities/*",
  "/community/*",
  // Gatherings, events & the social calendar
  "/calendar",
  "/events",
  "/event",
  "/gathering",
  "/gathering/*",
  "/gatherings",
  "/rsvp",
  "/rsvp-ticket",
  "/gathering-recap",
  "/gathering-cancelled",
  "/gathering-dashboard",
  "/gathering-photos",
  "/host",
  "/create-gathering",
  "/manage-gathering",
  "/co-host-invite",
  // Forum
  "/forum",
  "/thread",
  "/thread/*",
  // Community stories & pathways
  "/changemakers",
  "/changemaker/*",
  "/coming-out",
  "/parents",
  "/caregivers",
  // Member-only actions
  "/vouch",
  "/qr-scanner",
  "/magazine/submit-story",
  // Local discovery — directory & map (safe-spaces / visas / arriving stay public)
  "/local/directory",
  "/local/directory/*",
  "/local/map",
  "/business-directory",
  "/spaces-map",
  // Cinema: browsing films is public; watching + membership are gated
  "/cinema/watch",
  "/cinema/membership",
];

/**
 * Public escape hatches that fall *inside* a gated prefix. The studio ships its
 * own sign-in and error screens, which must stay reachable without a session.
 */
const PUBLIC_EXCEPTIONS: string[] = [
  "/studio/sign-in",
  "/studio/404",
  "/studio/500",
  "/studio/off-air",
  // The studio's public shopfront: the logged-out landing renders at /studio
  // itself, and the outward-facing info/press pages stay readable without a
  // session so prospective members and press can reach them.
  "/studio",
  "/studio/about",
  "/studio/accessibility",
  "/studio/terms",
  "/studio/help",
  "/studio/press",
  "/studio/end-card",
];

function matchesAny(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchPath(pattern, pathname) !== null);
}

/**
 * True when `pathname` is closed to logged-out visitors — i.e. it matches a
 * gated pattern and isn't a public escape hatch. This is the single source of
 * truth shared by the route guard and the nav/footer link filtering.
 */
export function isGatedPath(pathname: string): boolean {
  if (matchesAny(pathname, PUBLIC_EXCEPTIONS)) return false;
  return matchesAny(pathname, GATED_PATTERNS);
}

/**
 * True when a link destination is gated. Accepts the same href strings the
 * nav/footer feed to `linkToPath()` (clean paths, legacy design filenames, or
 * in-page anchors); the trailing #anchor is dropped before matching, and
 * external/non-path hrefs are treated as public.
 */
export function isGatedLink(href: string): boolean {
  const path = linkToPath(href).split("#")[0] || "/";
  if (!path.startsWith("/")) return false; // external / mailto / tel
  return isGatedPath(path);
}

/**
 * Returns a predicate that decides whether a nav/footer link should be shown to
 * the current visitor: everything is visible to logged-in members, while
 * logged-out visitors don't see links into the gated member surface.
 */
export function useIsLinkVisible(): (href: string) => boolean {
  const { loggedIn } = useAuth();
  return (href: string) => loggedIn || !isGatedLink(href);
}

/**
 * When a logged-out visitor lands on a gated route, returns the sign-in path
 * with a `?next=` back-link so they return here after authenticating. Returns
 * null when the visitor is allowed through (logged in, or on a public route).
 */
export function useAuthGateRedirect(): string | null {
  const { loggedIn } = useAuth();
  const { pathname } = useLocation();

  if (loggedIn) return null;
  if (!isGatedPath(pathname)) return null;

  return `${routes.signIn}?next=${encodeURIComponent(pathname)}`;
}
