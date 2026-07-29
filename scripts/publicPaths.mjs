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
 * The quiet public surface — the full set of ungated paths listed in the
 * sitemap. A curated SUBSET of these is prerendered to static HTML
 * (PRERENDER_PATHS, below); the rest are served as normal SPA routes. The
 * sitemap and the prerendered set deliberately DIVERGE: the sitemap costs no
 * build data, so it keeps advertising every public page to search engines
 * (Googlebot renders JS and finds them), while prerendering is kept minimal to
 * save build time and data.
 *
 * Scope decision (see docs/superpowers/specs/2026-07-20-seo-and-ai-discoverability-design.md):
 * QueerPulse deliberately does NOT index the magazine, cinema, studio, activism,
 * archive or sustainer surfaces — they rely on word-of-mouth and direct sharing.
 * The resources surface is likewise excluded from prerender + sitemap: it is
 * served as normal SPA routes. Safety and arrival guides are the front door.
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
 *      Known API-backed paths in this list: /about/partners, /about/volunteer.
 *      They are kept because their content is genuinely worth indexing, but the
 *      build machine MUST be able to reach the API. Audit any new path against
 *      this before adding it.
 *
 * Dynamic `:slug` routes are excluded: there is no canonical content source to
 * enumerate, and profiles are gated regardless.
 */
export const QUIET_PUBLIC_PATHS = [
  "/",

  // ── About / governance ───────────────────────────────────────────────────
  "/about",
  "/about/governance",
  "/about/contact",
  "/about/partners",
  "/about/press-kit",
  "/about/for-organisations",
  "/about/help",
  "/about/help/accessibility",
  "/about/volunteer",

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
 * The ESSENTIAL subset that is prerendered to static HTML at build time.
 *
 * Prerendering runs a headless Chromium against the production bundle and bakes
 * the settled DOM for each path — real build-time + data cost that grows with
 * every path. Everything in QUIET_PUBLIC_PATHS that is NOT listed here is still
 * public, still in the sitemap, and still reachable — just served as a normal
 * SPA route with no prebaked HTML. The only thing an omitted page loses is a
 * crawlable snapshot for the JS-less AI retrieval crawlers (OAI-SearchBot,
 * Claude-SearchBot, PerplexityBot); JS-executing crawlers (Googlebot) are
 * unaffected.
 *
 * Kept deliberately minimal (homepage only): it is the single most valuable
 * page to serve as static HTML to a JS-less crawler. Dynamic persona pages
 * (/p/:handle) are intentionally NOT prerendered — their count is unbounded.
 *
 * Every entry MUST also appear in QUIET_PUBLIC_PATHS (assertPrerenderSubset
 * enforces this) — so a page can never be prerendered without being a known,
 * ungated, sitemap-listed public path.
 */
export const PRERENDER_PATHS = ["/"];

/**
 * Throw if PRERENDER_PATHS contains anything not in QUIET_PUBLIC_PATHS. Keeps
 * the prerendered set honest: it can only ever be a subset of the vetted public
 * surface, never a path that is gated or otherwise unlisted.
 */
export function assertPrerenderSubset() {
  const surface = new Set(QUIET_PUBLIC_PATHS);
  const strays = PRERENDER_PATHS.filter((candidatePath) => !surface.has(candidatePath));
  if (strays.length > 0) {
    throw new Error(
      `PRERENDER_PATHS contains paths not in QUIET_PUBLIC_PATHS:\n  ${strays.join("\n  ")}`,
    );
  }
}

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

/**
 * Fetch the published-persona handles from the backend
 * (`GET /subprofiles/public-handles`) and turn them into dynamic `/p/:handle`
 * sitemap/prerender entries.
 *
 * NEVER throws: a demo/offline build must still succeed with no API
 * reachable, so any failure (missing apiUrl, network error, non-2xx, bad
 * JSON) is swallowed into a `console.warn` + an empty array.
 */
export async function fetchSubprofilePublicPaths(apiUrl) {
  if (!apiUrl) return [];
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/subprofiles/public-handles`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    const entries = (body.items ?? [])
      .filter((item) => item && typeof item.handle === "string" && item.handle.length > 0)
      .map((item) => ({ path: `/p/${item.handle}`, lastmod: item.updatedAt ?? null }));
    assertNoGatedPaths(entries.map((entry) => entry.path));
    return entries;
  } catch (error) {
    console.warn(
      `[publicPaths] Could not fetch persona handles: ${error.message}. Skipping dynamic /p/* paths.`,
    );
    return [];
  }
}
