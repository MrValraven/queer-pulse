import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "./providers/authContext";
import { useDemoMode } from "./providers/DemoModeProvider";
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
 * Role-gated surfaces. Being logged in is not enough for these — the admin panel
 * requires an admin, the community/`/mod` moderation surfaces require a moderator
 * (or admin). Enforced client-side in live mode; the backend remains the source
 * of truth and must 403 each call regardless.
 */
const ADMIN_PATTERNS: string[] = ["/admin", "/admin/*"];
const MOD_PATTERNS: string[] = ["/mod/*"];

/**
 * Guest-only surfaces: the sign-in / sign-up entry pages that only make sense to
 * a logged-out visitor. A signed-in member has nothing to do here, so the gate
 * bounces them to their feed (or the `?next=` they were headed for). This is the
 * mirror image of GATED_PATTERNS. Post-signup pages (onboarding, welcome tour,
 * member-sends-an-invite) are intentionally NOT here — being logged in is the
 * whole point of those.
 */
const GUEST_ONLY_PATTERNS: string[] = [
  routes.signIn,
  routes.createAccount,
  routes.magicLink,
  routes.requestInvite,
  "/studio/sign-in",
];

/** True when a path is only meaningful to logged-out visitors. */
export function isGuestOnlyPath(pathname: string): boolean {
  return matchesAny(pathname, GUEST_ONLY_PATTERNS);
}

/** Only honour same-origin internal paths from `?next=` (avoids open redirects). */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/feed";
}

/** The role a path demands, or null when logged-in access is sufficient. */
export function requiredRole(pathname: string): "admin" | "mod" | null {
  if (matchesAny(pathname, ADMIN_PATTERNS)) return "admin";
  if (matchesAny(pathname, MOD_PATTERNS)) return "mod";
  return null;
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
  const { loggedIn, checking, role } = useAuth();
  const { demoMode } = useDemoMode();
  const { pathname, search } = useLocation();

  // Live-mode session probe still in flight: don't decide the gate yet, or we'd
  // bounce a signed-in member reloading a gated page to sign-in before /auth/me
  // confirms. AppRoutes holds gated paths on a loader meanwhile.
  if (checking) return null;

  if (loggedIn) {
    // Role-gate admin/mod surfaces. Demo mode is intentionally an explorable
    // sandbox where the admin panel is reachable (its team role is simulated via
    // AdminRoleProvider, which defaults to "staff"), so role isn't enforced
    // there — but that sandbox exists for local development only. Requiring DEV
    // as well as demo means no shipped build can ever reach the bypass, even one
    // deliberately built with VITE_DEMO=1: `import.meta.env.DEV` is inlined false
    // by `vite build`, so the guard below is unconditional in every artifact.
    if (!demoMode || !import.meta.env.DEV) {
      const need = requiredRole(pathname);
      if (need === "admin" && role !== "admin") return routes.homepage;
      if (need === "mod" && role !== "moderator" && role !== "admin") {
        return routes.homepage;
      }
    }
    // Nothing to sign into when you're already in — send members on to their
    // feed (or the `?next=` they were headed for) instead of the auth screens.
    if (isGuestOnlyPath(pathname)) {
      return safeNext(new URLSearchParams(search).get("next"));
    }
    return null;
  }
  if (!isGatedPath(pathname)) return null;

  return `${routes.signIn}?next=${encodeURIComponent(pathname)}`;
}
