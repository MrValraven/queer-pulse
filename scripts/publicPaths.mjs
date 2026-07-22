/**
 * Shared public-path module for QueerPulse build scripts.
 *
 * Source of truth for public-vs-gated is `src/app/authGate.ts`
 * (GATED_PATTERNS / PUBLIC_EXCEPTIONS). This module re-implements the same
 * denylist matcher standalone (a plain .mjs can't import the TS + react-router
 * module) and hard-asserts (via assertNoGatedPaths) that every path a
 * consumer emits is NOT gated — so a gated path can never leak into the
 * sitemap or the prerenderer. If you change authGate.ts, mirror it here.
 */

// --- Mirror of src/app/authGate.ts (keep in sync) ---------------------------

/** Gated (member-only) path patterns. `/prefix/*` = prefix match. */
const GATED_PATTERNS = [
  "/account",
  "/account/*",
  "/work",
  "/work/*",
  "/economy",
  "/economy/*",
  "/studio",
  "/studio/*",
  "/admin",
  "/admin/*",
  "/mod/*",
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
  "/communities",
  "/communities/*",
  "/community/*",
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
  "/forum",
  "/thread",
  "/thread/*",
  "/changemakers",
  "/changemaker/*",
  "/coming-out",
  "/parents",
  "/caregivers",
  "/vouch",
  "/qr-scanner",
  "/magazine/submit-story",
  "/local/directory",
  "/local/directory/*",
  "/local/map",
  "/business-directory",
  "/spaces-map",
  "/cinema/watch",
  "/cinema/membership",
];

/** Public escape hatches that fall inside a gated prefix (the studio shopfront). */
const PUBLIC_EXCEPTIONS = [
  "/studio/sign-in",
  "/studio/404",
  "/studio/500",
  "/studio/off-air",
  "/studio",
  "/studio/about",
  "/studio/accessibility",
  "/studio/terms",
  "/studio/help",
  "/studio/press",
  "/studio/end-card",
];

/** matchPath-equivalent for our patterns: exact, or `/base/*` prefix. */
function matchesPattern(pathname, pattern) {
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2);
    return pathname === base || pathname.startsWith(`${base}/`);
  }
  return pathname === pattern;
}

function matchesAny(pathname, patterns) {
  return patterns.some((pattern) => matchesPattern(pathname, pattern));
}

/** True when a path is closed to logged-out visitors. Mirrors isGatedPath(). */
export function isGatedPath(pathname) {
  if (matchesAny(pathname, PUBLIC_EXCEPTIONS)) return false;
  return matchesAny(pathname, GATED_PATTERNS);
}

/**
 * The quiet public surface — the ONLY paths that are prerendered and listed in
 * the sitemap.
 *
 * Scope decision (see docs/superpowers/specs/2026-07-20-seo-and-ai-discoverability-design.md):
 * QueerPulse deliberately does NOT index the magazine, cinema, studio, activism,
 * archive or sustainer surfaces — they rely on word-of-mouth and direct sharing.
 * Resources and safety are the front door: they are the pages someone searching
 * for queer healthcare, legal or crisis guidance in Lisbon actually needs.
 *
 * Two hard rules for anything added here:
 *   1. It must not be gated (assertNoGatedPaths enforces this).
 *   2. Its content must be verifiably safe to serialise at BUILD time.
 *      The prerender runs against the production bundle. Demo mode is an
 *      explicit VITE_DEMO=1 opt-in and is NEVER inferred from a missing
 *      VITE_API_URL (see src/shared/api/config.ts) — so with a real
 *      VITE_API_URL an API-backed page will FETCH during the pass, and bakes
 *      whatever it gets (including an empty-state fallback if the build machine
 *      cannot reach the API). With VITE_DEMO=1 it bakes fixture data as though
 *      it were real. Both are ways to ship a misleading page to crawlers.
 *      Known API-backed paths in this list: /resources/glossary,
 *      /resources/library, /about/partners, /about/volunteer. They are kept
 *      because their content is genuinely worth indexing, but the build machine
 *      MUST be able to reach the API. Audit any new path against this before
 *      adding it.
 *
 * Dynamic `:slug` routes are excluded: there is no canonical content source to
 * enumerate, and profiles are gated regardless.
 */
export const QUIET_PUBLIC_PATHS = [
  "/",

  // ── Resources — the primary indexed surface ──────────────────────────────
  "/resources",
  "/resources/101",
  "/resources/accessible-lisbon",
  "/resources/art-crit-guide",
  "/resources/coming-out-at-work",
  "/resources/community-privacy",
  "/resources/disability-healthcare",
  "/resources/first-meetup-guide",
  "/resources/glossary",
  "/resources/group-show-archive",
  "/resources/harm-reduction",
  "/resources/ingredients-map",
  "/resources/intersectionality",
  "/resources/lgbtq-aging-guide",
  "/resources/library",
  "/resources/mental-health",
  "/resources/oral-history-project",
  "/resources/peer-support",
  "/resources/pronouns-guide",
  "/resources/qtipoc-archive",
  "/resources/qtipoc-organisations",
  "/resources/queer-paediatricians",
  "/resources/running-guide",
  "/resources/school-forms-guide",
  "/resources/sexual-health",
  "/resources/shared-equipment",
  "/resources/sober",
  "/resources/spoon-theory",
  // NOTE: "/resources/therapists" is deliberately ABSENT. routeMap.ts defines
  // the constant, but routes.tsx registers only "/resources/therapists/:id"
  // (individual profiles) — there is no directory index at the bare path. It
  // would fall through to the SPA catch-all, render NotFound, never set
  // data-prerender-ready, and fail the build; and it would advertise a dead URL
  // in the sitemap. Re-add it here if a real therapists index page is built.
  "/resources/trans-healthcare",
  "/resources/trans-hub",
  "/resources/wellbeing",

  // ── About / governance ───────────────────────────────────────────────────
  "/about",
  "/about/manifesto",
  "/about/governance",
  "/about/contact",
  "/about/roadmap",
  "/about/partners",
  "/about/press-kit",
  "/about/for-organisations",
  "/about/newsletter",
  "/about/donate",
  "/about/cities",
  "/about/help",
  "/about/help/accessibility",
  "/about/volunteer",
  "/about/platforms",

  // ── Policies ─────────────────────────────────────────────────────────────
  "/policies/privacy",
  "/policies/terms",
  "/policies/cookies",
  "/policies/guidelines",

  // ── Local — arrival + safe-space guides (directory/map are gated) ────────
  "/local/safe-spaces",
  "/local/arriving",
  "/local/visas",
];

/**
 * Throw if any path is gated. Lists every offender rather than the first, so a
 * bad edit is fixed in one pass.
 */
export function assertNoGatedPaths(paths) {
  const leaked = paths.filter((candidatePath) => isGatedPath(candidatePath));
  if (leaked.length > 0) {
    throw new Error(
      `Refusing to proceed — these paths are GATED per authGate.ts:\n  ${leaked.join("\n  ")}`,
    );
  }
}
