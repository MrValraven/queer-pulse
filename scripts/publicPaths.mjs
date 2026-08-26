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
  "/magazine/editor",
  "/magazine/editor/*",
  "/magazine/writer",
  "/magazine/writer/*",
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
  "/communities",
  "/communities/*",
  "/community/*",
  "/calendar",
  "/events",
  "/gatherings",
  "/gatherings/*",
  "/rsvp",
  "/host",
  "/create-gathering",
  "/forum",
  "/thread",
  "/thread/*",
  // `/coming-out` is deliberately NOT here: authGate keeps the coming-out guide
  // public so it reaches a questioning visitor who isn't signed in.
  "/changemakers",
  "/changemaker/*",
  "/parents",
  "/caregivers",
  "/vouch",
  "/magazine/submit-story",
  "/magazine/apply-to-write",
  // Organiser-side volunteer surfaces. The listing (/about/volunteer) and each
  // opportunity's detail page stay public; posting, editing and triaging do not.
  "/about/volunteer/post",
  "/about/volunteer/manage",
  // (authGate also gates /about/volunteer/opportunity/:slug/edit; this matcher
  // has no :param support, and no :slug path is ever emitted here — see the
  // "Dynamic :slug routes are excluded" note on QUIET_PUBLIC_PATHS. The
  // opportunity DETAIL page stays public either way.)
  // The writer pitch tracker (also capability-gated on magazine_writer).
  "/magazine/pitches",
  // Block & mute is account settings living under the public /safety prefix.
  "/safety/block-mute",
  // The one-time onboarding wizard and its legacy alias.
  "/auth/onboarding",
  "/auth/welcome",
  "/local/directory",
  "/local/directory/*",
  "/local/map",
  "/local/venue",
  "/local/venue/*",
  "/local/housing",
  "/local/housing/*",
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
  // Housing co-ops stay public even though the rest of /local/housing/* is gated.
  "/local/housing/coop",
  "/local/housing/coop/*",
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
  "/about/volunteer",

  // ── Policies ─────────────────────────────────────────────────────────────
  "/policies/privacy",
  "/policies/terms",
  "/policies/cookies",
  "/policies/guidelines",
  // The responsible-disclosure policy. Public by design: a security researcher
  // reporting a vulnerability has no account. ID-15.
  "/policies/security",
  // The accessibility statement. Public by design and deliberately indexable:
  // a legally required document is no use if only signed-in members find it.
  // LG-01.
  "/policies/accessibility",

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
  const strays = PRERENDER_PATHS.filter(
    (candidatePath) => !surface.has(candidatePath),
  );
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
 * BACKEND ROUTE: `GET /subprofiles/public-handles`, declared in
 * queerpulse-backend `src/subprofiles/subprofiles.controller.ts` (`@Public()`,
 * throttled) and served by `SubprofilePublicReadService.listPublicHandles`.
 * This script is that route's ONLY consumer, and it runs at BUILD time, so the
 * route has no call site anywhere under `src/`. A scan that diffs backend
 * routes against frontend `src/` call sites therefore reports it as orphaned.
 * It is not. Deleting it breaks every persona page's discoverability. The
 * backend route carries a matching CONSUMER note pointing back here.
 *
 * NEVER FAILS THE BUILD. A demo or offline build has to succeed with no API
 * reachable, so a missing `apiUrl`, a network error, a non-2xx, or bad JSON
 * all return an empty array. That is deliberate, and it is also the trap: an
 * empty return used to be indistinguishable from a healthy backend with
 * nothing published, which is how a silent SEO regression hides inside a green
 * build. So the three outcomes now log distinctly, and a genuine FAILURE logs
 * at `console.error` naming the URL and the reason.
 *
 * The one thing that DOES throw is `assertNoGatedPaths`. A gated path reaching
 * the sitemap is a privacy leak rather than a fetch problem, and it is held
 * outside the try below so `generate-sitemap.mjs` exits non-zero on it, exactly
 * as it already does for the static `QUIET_PUBLIC_PATHS` list.
 */
export async function fetchSubprofilePublicPaths(apiUrl) {
  if (!apiUrl) {
    console.log(
      "[publicPaths] No API URL configured, so persona handles were never requested. This build gets zero /p/* paths, which is expected for a demo or offline build.",
    );
    return [];
  }

  const endpointUrl = `${apiUrl.replace(/\/$/, "")}/subprofiles/public-handles`;
  let entries;

  try {
    const response = await fetch(endpointUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }
    const body = await response.json();
    entries = (body.items ?? [])
      .filter(
        (item) =>
          item && typeof item.handle === "string" && item.handle.length > 0,
      )
      .map((item) => ({
        path: `/p/${item.handle}`,
        lastmod: item.updatedAt ?? null,
      }));
  } catch (error) {
    console.error(
      `[publicPaths] PERSONA HANDLES UNAVAILABLE. GET ${endpointUrl} failed: ${error.message}`,
    );
    console.error(
      "[publicPaths] Every /p/:handle page is missing from the sitemap and the prerender set for this build.",
    );
    console.error(
      "[publicPaths] The build is allowed to continue so that demo and offline builds still succeed. On a production build, treat this as broken and re-run once the API answers.",
    );
    return [];
  }

  // Deliberately outside the try: this is the privacy guard, and it must be
  // able to fail the build instead of being downgraded to a fetch warning.
  assertNoGatedPaths(entries.map((entry) => entry.path));

  if (entries.length === 0) {
    console.warn(
      `[publicPaths] GET ${endpointUrl} answered OK and returned zero published persona handles, so this build has no /p/* paths. The endpoint is healthy and simply has nothing published yet.`,
    );
  } else {
    console.log(
      `[publicPaths] Fetched ${entries.length} persona handle(s) from ${endpointUrl}.`,
    );
  }

  return entries;
}
