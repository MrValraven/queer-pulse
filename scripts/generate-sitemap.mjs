#!/usr/bin/env node
/**
 * Build-time sitemap generator for QueerPulse.
 *
 * Emits `public/sitemap.xml` listing ONLY public routes. Run manually via the
 * `sitemap` package.json script (see repo README/report) — it is intentionally
 * NOT wired into the main `build` and NOT required in CI. Because `public/` is
 * copied verbatim into `dist/`, the generated file ships as `/sitemap.xml`.
 *
 * Source of truth for public-vs-gated is `src/app/authGate.ts`
 * (GATED_PATTERNS / PUBLIC_EXCEPTIONS). This script re-implements the same
 * denylist matcher standalone (a plain .mjs can't import the TS + react-router
 * module) and hard-asserts that every path it emits is NOT gated — so a gated
 * path can never leak into the sitemap. If you change authGate, mirror it here.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const SITE_ORIGIN = process.env.VITE_SITE_ORIGIN ?? "https://queerpulse.com";

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
  return patterns.some((p) => matchesPattern(pathname, p));
}

/** True when a path is closed to logged-out visitors. Mirrors isGatedPath(). */
function isGatedPath(pathname) {
  if (matchesAny(pathname, PUBLIC_EXCEPTIONS)) return false;
  return matchesAny(pathname, GATED_PATTERNS);
}

// --- Curated public route list ----------------------------------------------
// High-value, static, public pages. Dynamic `:slug` routes (articles, films,
// profiles) are excluded — there's no canonical content source to enumerate
// with mock data, and profiles are gated anyway.
const PUBLIC_SITEMAP_PATHS = [
  "/",
  // Magazine
  "/magazine",
  "/magazine/issues",
  "/magazine/newsletter-archive",
  "/magazine/cover-gallery",
  "/magazine/culture",
  "/magazine/creatives",
  // Cinema (browsing is public)
  "/cinema",
  "/cinema/browse",
  "/cinema/collections",
  "/cinema/about",
  "/cinema/made-here",
  "/cinema/open-calls",
  "/cinema/rights",
  // About / governance / org
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
  "/about/volunteer",
  // Resources
  "/resources",
  "/resources/library",
  "/resources/101",
  "/resources/glossary",
  "/resources/pronouns-guide",
  "/resources/mental-health",
  "/resources/wellbeing",
  "/resources/trans-hub",
  "/resources/trans-healthcare",
  "/resources/sexual-health",
  "/resources/harm-reduction",
  "/resources/therapists",
  // Safety / crisis (public by design)
  "/safety",
  "/safety/emergency",
  "/safety/report",
  "/safety/legal",
  "/safety/hate-crime",
  // Policies
  "/policies/privacy",
  "/policies/terms",
  "/policies/cookies",
  "/policies/guidelines",
  // Local (safe-spaces / arriving / visas / housing are public)
  "/local/safe-spaces",
  "/local/arriving",
  "/local/visas",
  "/local/housing",
  // Studio public shopfront
  "/studio",
  "/studio/about",
  "/studio/press",
  "/studio/help",
  "/studio/terms",
  "/studio/accessibility",
  // Membership / activism / archive
  "/sustainer",
  "/activism",
  "/activism/open-letter",
  "/archive",
  // Auth entry points that are public + shareable
  "/auth/sign-in",
  "/auth/request-invite",
];

// --- Guard: no gated path may leak in ---------------------------------------
const leaked = PUBLIC_SITEMAP_PATHS.filter((p) => isGatedPath(p));
if (leaked.length > 0) {
  console.error(
    `[sitemap] Refusing to emit — these paths are GATED per authGate.ts:\n  ${leaked.join(
      "\n  ",
    )}`,
  );
  process.exit(1);
}

// De-dupe (the studio shopfront appears once under two sections above).
const uniquePaths = [...new Set(PUBLIC_SITEMAP_PATHS)];

const lastmod = new Date().toISOString().slice(0, 10);
const urls = uniquePaths
  .map((path) => {
    const loc = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
    const priority = path === "/" ? "1.0" : "0.7";
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "sitemap.xml",
);
writeFileSync(outPath, xml, "utf8");
console.log(
  `[sitemap] Wrote ${uniquePaths.length} public URLs to ${outPath} (origin ${SITE_ORIGIN})`,
);
