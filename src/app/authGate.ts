import { matchPath, useLocation } from "react-router-dom";
import { useAuth } from "./providers/authContext";
import { useDemoMode } from "./providers/DemoModeProvider";
import { linkToPath, routes } from "./routeMap";
import type { StaffRoleId } from "../features/admin/staffRoles.registry";

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
  // Magazine editorial tools (dashboard + deck authoring) — staff-only
  "/magazine/editor",
  "/magazine/editor/*",
  // Magazine writer workspace (assignments/pitches/payments) — staff-only
  "/magazine/writer",
  "/magazine/writer/*",
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
  // Communities
  "/communities",
  "/communities/*",
  "/community/*",
  // Gatherings, events & the social calendar
  "/calendar",
  "/events",
  "/event",
  "/gatherings",
  "/gatherings/*",
  "/rsvp",
  "/host",
  "/create-gathering",
  // Forum
  "/forum",
  "/thread",
  "/thread/*",
  // Community stories & pathways. The coming-out guide (/coming-out) is a public
  // support page — it renders in the marketing PageShell and, like the resources
  // and safety/crisis pages, must reach a questioning visitor who isn't signed
  // in, so it is intentionally NOT gated here. `/parents` only redirects to the
  // gated `/family`, so gating it keeps the bounce consistent.
  "/changemakers",
  "/changemaker/*",
  "/parents",
  "/caregivers",
  // Member-only actions
  "/vouch",
  "/magazine/submit-story",
  "/magazine/apply-to-write",
  // Local discovery — directory & map (safe-spaces / visas / arriving stay public)
  "/local/directory",
  "/local/directory/*",
  "/local/map",
  "/local/venue",
  "/local/venue/*",
  // Housing board + listing detail + flatmates tab are member-only (backend
  // browse is ActiveMemberGuard); the co-ops surface stays public — see
  // PUBLIC_EXCEPTIONS below.
  "/local/housing",
  "/local/housing/*",
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
  // Housing co-ops stay public (their backend browse is @Public), even though
  // the rest of /local/housing/* is gated above.
  "/local/housing/coop",
  "/local/housing/coop/*",
];

function matchesAny(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchPath(pattern, pathname) !== null);
}

/**
 * The "Work & Economy" surface (Career + Economy columns of the Work meganav,
 * plus the freelance calculators that hang off `/economy`) is still being
 * finished, so for now it's hidden from members: its nav entry is dropped and
 * its routes bounce to the roadmap, where a "Coming soon" card lists what's
 * landing. Matched explicitly rather than by a `/work/*` prefix because Housing
 * lives under `/work/landlord` and `/work/housing` and is a separate, live
 * surface that must stay reachable.
 *
 * Active only in shipped builds. `import.meta.env.DEV` is `true` under
 * `pnpm dev`, so the whole area stays reachable for local development, and is
 * inlined to `false` by `vite build`, so every deployed artifact hides it — see
 * `isComingSoonPath`.
 */
const COMING_SOON_PATTERNS: string[] = [
  // Career column
  "/account/work",
  "/account/work-profile",
  "/work/jobs",
  "/work/jobs/*",
  "/work/companies",
  "/work/companies/*",
  "/work/skills",
  "/work/skills/*",
  "/work/mentorship",
  "/work/mentorship/*",
  "/work/employer-reviews",
  "/work/application-status",
  // Economy column + the freelance calculators reached from it
  "/work/barter",
  "/work/barter/*",
  "/work/solidarity",
  "/work/grants",
  "/work/offer",
  "/economy",
  "/economy/*",
];

/**
 * True when a path belongs to the not-yet-launched Work & Economy surface and
 * should be hidden. Always false in local development so the area stays
 * reachable while it's being built.
 */
export function isComingSoonPath(pathname: string): boolean {
  if (import.meta.env.DEV) return false;
  return matchesAny(pathname, COMING_SOON_PATTERNS);
}

/** The link-href form of `isComingSoonPath` (see `isGatedLink`). */
export function isComingSoonLink(href: string): boolean {
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
  if (!path.startsWith("/")) return false; // external / mailto / tel
  return isComingSoonPath(path);
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
 * Admin-prefixed surfaces whose backend controller authorizes Moderators as
 * well as Admins (e.g. `@Roles(Moderator, Admin)` on `moderation.controller.ts`
 * for the report queue). Checked before the blanket `/admin/*` admin-only match
 * in `requiredRole` so these specific routes downgrade to the same "mod" tier
 * as `/mod/*`, while the rest of the admin console stays admin-only.
 */
const MOD_ACCESSIBLE_ADMIN_PATTERNS: string[] = [
  routes.adminModeration,
  `${routes.adminModeration}/*`,
];

/**
 * Capability-gated surfaces: closed to the ordinary member tier regardless of
 * `role`, and opened by holding the matching additive staff-role grant (or by
 * being an admin, a superset — see the `role !== "admin"` short-circuit in
 * `useAuthGateRedirect`). Magazine editorial tools moved here from
 * MOD_PATTERNS: a moderator no longer gets them for free, only members holding
 * `magazine_editor` (plus admins).
 */
const CAPABILITY_PATTERNS: { patterns: string[]; capability: StaffRoleId }[] = [
  { patterns: ["/magazine/editor", "/magazine/editor/*"], capability: "magazine_editor" },
  { patterns: ["/magazine/writer", "/magazine/writer/*"], capability: "magazine_writer" },
];

/**
 * Guest-only surfaces: the sign-in / sign-up entry pages that only make sense to
 * a logged-out visitor. A signed-in member has nothing to do here, so the gate
 * bounces them to their feed (or the `?next=` they were headed for). This is the
 * mirror image of GATED_PATTERNS. Post-signup pages (onboarding,
 * member-sends-an-invite) are intentionally NOT here — being logged in is the
 * whole point of those.
 */
const GUEST_ONLY_PATTERNS: string[] = [
  routes.signIn,
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
  if (matchesAny(pathname, MOD_ACCESSIBLE_ADMIN_PATTERNS)) return "mod";
  if (matchesAny(pathname, ADMIN_PATTERNS)) return "admin";
  if (matchesAny(pathname, MOD_PATTERNS)) return "mod";
  return null;
}

/** The staff role a path demands, or null when the account tier is sufficient. */
export function requiredCapability(pathname: string): StaffRoleId | null {
  for (const entry of CAPABILITY_PATTERNS) {
    if (matchesAny(pathname, entry.patterns)) return entry.capability;
  }
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
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
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
  return (href: string) =>
    !isComingSoonLink(href) && (loggedIn || !isGatedLink(href));
}

/**
 * When a logged-out visitor lands on a gated route, returns the sign-in path
 * with a `?next=` back-link so they return here after authenticating. Returns
 * null when the visitor is allowed through (logged in, or on a public route).
 */
export function useAuthGateRedirect(): string | null {
  const { loggedIn, checking, role, status, user, staffRoles } = useAuth();
  const { demoMode } = useDemoMode();
  const { pathname, search } = useLocation();

  // Live-mode session probe still in flight: don't decide the gate yet, or we'd
  // bounce a signed-in member reloading a gated page to sign-in before /auth/me
  // confirms. AppRoutes holds gated paths on a loader meanwhile.
  if (checking) return null;

  if (loggedIn) {
    // A deactivated member — paused, or inside the 30-day erasure grace window —
    // is hidden everywhere and 403s on every ActiveMemberGuard route. Letting
    // them through to /feed would render an app where nothing loads and no
    // screen explains why. Send them to the delete-account page instead: it
    // hosts both the pending-erasure banner (with the cancel button that is the
    // only way back out of grace) and the reactivation copy. Demo mode has no
    // real status, so this never fires there.
    //
    // Note the backend auto-reactivates a *deactivated* member on Google
    // sign-in, so in practice this catches the erasure-grace case.
    if (!demoMode && status === "deactivated") {
      return pathname === routes.deleteAccount ? null : routes.deleteAccount;
    }
    // A suspended member: their sessions are revoked and every ActiveMemberGuard
    // route 403s, so a gated page would render a blank screen with no
    // explanation. Send them to the account-suspended page (or account-banned
    // when the suspension is permanent — status "suspended" with no
    // `suspendedUntil`), which now shows the real reason + expiry from /auth/me.
    // Unlike a deactivation, a suspension still lets them read PUBLIC content
    // (magazine, policies, crisis pages), so only a *gated* path bounces — and
    // the status + appeal pages are always allowed so the reason and the appeal
    // stay reachable. Demo mode has no real status, so this never fires there.
    if (!demoMode && status === "suspended") {
      const target = user?.suspendedUntil
        ? routes.accountSuspended
        : routes.accountBanned;
      const alwaysAllowed: string[] = [
        routes.accountSuspended,
        routes.accountBanned,
        routes.appealSubmit,
        routes.appealOutcome,
      ];
      if (alwaysAllowed.includes(pathname)) return null;
      return isGatedPath(pathname) ? target : null;
    }
    // Role-gate admin/mod surfaces. Demo mode is intentionally an explorable
    // sandbox where the admin panel is reachable (its team role is simulated via
    // the demo-only role store in features/admin/adminRole.ts), so role isn't enforced
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
      // Capability-gated surfaces (e.g. /magazine/editor): the account tier
      // alone isn't enough — admins are a superset, everyone else needs the
      // matching additive staff-role grant.
      const capability = requiredCapability(pathname);
      if (
        capability &&
        role !== "admin" &&
        !(staffRoles ?? []).includes(capability)
      ) {
        return routes.homepage;
      }
    }
    // Nothing to sign into when you're already in — send members on to their
    // feed (or the `?next=` they were headed for) instead of the auth screens.
    if (isGuestOnlyPath(pathname)) {
      return safeNext(new URLSearchParams(search).get("next"));
    }
    // The post-signup onboarding wizard is one-time. A member who already
    // finished it (onboardedAt set — backfilled for pre-existing members) has no
    // reason to be back here; browser autofill of the saved /auth/onboarding URL
    // is the usual way they land on it, and replaying it can silently re-submit
    // profile fields (the intents step overwrites `lookingFor`). Bounce them to
    // their feed. A member still mid-onboarding (onboardedAt null) falls through
    // and keeps the wizard. Demo mode is left explorable so the flow can be
    // previewed — it only ever fires in live mode.
    if (
      !demoMode &&
      user?.onboardedAt &&
      matchPath(routes.onboarding, pathname)
    ) {
      return routes.feed;
    }
    // The forward direction of the same one-time gate: a member still
    // mid-onboarding (onboardedAt null) who navigates straight to the member
    // surface (e.g. a bookmarked /feed, or the address bar) is nudged back into
    // the wizard instead of being left to wander it unfinished. Scoped to
    // `isGatedPath` — the same member-only surface GATED_PATTERNS already
    // fences off from logged-out visitors — rather than every logged-in-reachable
    // page, so it reads as one denylist: public marketing, magazine/cinema
    // browsing, legal (terms/privacy), support/contact, and the auth flow
    // (sign-in/request-invite) are never gated, so none of them are touched
    // here either — reading Terms or reaching contact support never gets
    // trapped. `routes.deleteAccount` is carved out explicitly even though
    // it lives under the gated `/account/*` prefix: a member who wants to leave
    // the platform shouldn't have to finish onboarding first, mirroring the
    // deactivated-member carve-out for the same page above. This is a
    // client-side nudge only — it does not change what the backend allows.
    if (
      !demoMode &&
      !user?.onboardedAt &&
      pathname !== routes.deleteAccount &&
      !matchPath(routes.onboarding, pathname) &&
      isGatedPath(pathname)
    ) {
      return routes.onboarding;
    }
    return null;
  }
  if (!isGatedPath(pathname)) return null;

  return `${routes.signIn}?next=${encodeURIComponent(pathname)}`;
}
