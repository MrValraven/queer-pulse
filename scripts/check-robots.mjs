#!/usr/bin/env node
/**
 * Build gate: keep `public/robots.txt` honest about what is gated.
 *
 * `robots.txt` is a static file. It cannot import `src/app/authGate.ts`, so it
 * has always been hand-maintained against it, and it drifted in both
 * directions: seven gated prefixes were missing from the Disallow list (the
 * housing board, listing venues, the two organiser-side volunteer surfaces,
 * block & mute, and the onboarding wizard with its legacy alias), while
 * `/coming-out` was disallowed under the gated heading even though authGate
 * keeps the coming-out guide public so it reaches a questioning visitor who
 * isn't signed in.
 *
 * This script closes that loop. It parses robots.txt the way a crawler does
 * (per-agent groups, longest-match Allow/Disallow, the `*` and `$` wildcard
 * extensions) and asserts three things about every group that is allowed to
 * crawl at all:
 *
 *   1. GATED: every gated pattern from `publicPaths.mjs` (itself the audited
 *      mirror of authGate's GATED_PATTERNS) resolves to "blocked".
 *   2. PUBLIC: every path the sitemap advertises (QUIET_PUBLIC_PATHS) resolves
 *      to "crawlable", so robots.txt can never contradict the sitemap.
 *   3. JUSTIFIED: every Disallow rule either blocks something genuinely gated
 *      or appears in ACCEPTED_EXTRA_DISALLOWS below. This is the direction that
 *      caught `/coming-out`: blocking a public page is now a build failure
 *      until somebody writes down why.
 *
 * Wired into `scripts/build-gates.mjs` beside the sitemap generator, which is
 * the other consumer of the same mirror.
 *
 * ONE KNOWN BLIND SPOT: `publicPaths.mjs` carries no `:param` patterns (its
 * matcher has no param support, and it emits no `:slug` path), so the gated
 * `/about/volunteer/opportunity/:slug/edit` is not machine-checked here. Its
 * Disallow line in robots.txt is hand-written.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  QUIET_PUBLIC_PATHS,
  isGatedPath,
  GATED_PATTERNS,
} from "./publicPaths.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const robotsPath = resolve(scriptDirectory, "../public/robots.txt");

/**
 * Disallow rules that block nothing gated, each with the reason it is still
 * correct. Anything blocking a public page belongs here or nowhere: the third
 * check fails the build on a rule that is in neither.
 */
const ACCEPTED_EXTRA_DISALLOWS = new Map([
  [
    "/activism",
    "Deliberately de-indexed public surface (word-of-mouth only), per the file header.",
  ],
  [
    "/archive",
    "Deliberately de-indexed public surface (word-of-mouth only), per the file header.",
  ],
  [
    "/sustainer",
    "Deliberately de-indexed public surface (word-of-mouth only), per the file header.",
  ],
  [
    "/resources/therapists",
    "Therapist profiles are still mock fixture data; indexing fabricated clinician listings could send someone to a practitioner who does not exist.",
  ],
  [
    "/mentions",
    "Defensive prefix: no such route exists today, and the name could only ever belong to the member surface.",
  ],
  [
    "/notification-deep-link",
    "Defensive prefix: no such route exists today, and the name could only ever belong to the member surface.",
  ],
  [
    "/manage-gathering",
    "Defensive prefix: gathering management lives under the gated /gatherings/:slug, so a top-level alias must stay blocked if one is ever added.",
  ],
  [
    "/co-host-invite",
    "Defensive prefix: co-host invites live under the gated /gatherings/:slug, so a top-level alias must stay blocked if one is ever added.",
  ],
  [
    "/qr-scanner",
    "Defensive prefix: no such route exists today, and a member card scanner could only ever be member-only.",
  ],
  [
    "/about/volunteer/opportunity/*/edit",
    "Gated per authGate (routes.editVolunteer), but carries a :slug so publicPaths.mjs cannot express it. Hand-written on purpose.",
  ],
]);

/** One `User-agent:` block: the agents it names and the rules they obey. */
function parseGroups(robotsText) {
  const groups = [];
  let currentGroup = null;
  let isCollectingAgents = false;

  for (const rawLine of robotsText.split("\n")) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (line === "") continue;
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const field = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (field === "user-agent") {
      if (currentGroup === null || !isCollectingAgents) {
        currentGroup = { userAgents: [], rules: [] };
        groups.push(currentGroup);
        isCollectingAgents = true;
      }
      currentGroup.userAgents.push(value);
      continue;
    }
    if (field !== "allow" && field !== "disallow") continue;
    if (currentGroup === null) continue;
    isCollectingAgents = false;
    currentGroup.rules.push({ isAllow: field === "allow", pattern: value });
  }

  return groups;
}

/** A rule pattern as a regex: `*` is any run of characters, `$` anchors the end. */
function ruleMatcher(pattern) {
  const hasEndAnchor = pattern.endsWith("$");
  const body = hasEndAnchor ? pattern.slice(0, -1) : pattern;
  const escaped = body
    .split("*")
    .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${escaped}${hasEndAnchor ? "$" : ""}`);
}

/**
 * Would a crawler in `group` fetch `pathname`? Longest matching rule wins, and
 * an Allow beats a Disallow of the same length, which is how RFC 9309 and every
 * major crawler resolve it.
 */
function isPathCrawlable(group, pathname) {
  let winner = null;
  for (const rule of group.rules) {
    if (rule.pattern === "") continue; // An empty Disallow means "allow all".
    if (!ruleMatcher(rule.pattern).test(pathname)) continue;
    const specificity = rule.pattern.length;
    const isBetter =
      winner === null ||
      specificity > winner.specificity ||
      (specificity === winner.specificity && rule.isAllow);
    if (isBetter) winner = { specificity, isAllow: rule.isAllow };
  }
  return winner === null ? true : winner.isAllow;
}

/** A concrete pathname a gated pattern would match, for testing rules against. */
function sampleGatedPath(pattern) {
  return pattern
    .replace(/\/\*$/, "/sample")
    .replace(/:[A-Za-z0-9_]+/g, "sample");
}

/**
 * The gated sample paths, minus any the public exceptions rescue (`/studio` is
 * both a gated prefix and the studio's public shopfront).
 */
const gatedSamplePaths = [
  ...new Set(GATED_PATTERNS.map(sampleGatedPath)),
].filter((candidatePath) => isGatedPath(candidatePath));

const problems = [];
const robotsText = readFileSync(robotsPath, "utf8");
const groups = parseGroups(robotsText);

if (groups.length === 0) {
  problems.push("robots.txt declares no User-agent group at all.");
}

for (const group of groups) {
  const agentLabel = group.userAgents.join(", ");
  // A group that blocks the site outright (the model-training blockers) has
  // nothing to keep in sync: it already refuses everything.
  if (!isPathCrawlable(group, "/")) continue;

  for (const gatedPath of gatedSamplePaths) {
    if (isPathCrawlable(group, gatedPath)) {
      problems.push(
        `[${agentLabel}] would crawl ${gatedPath}, which is GATED per authGate.ts. Add a Disallow that covers it.`,
      );
    }
  }

  for (const publicPath of QUIET_PUBLIC_PATHS) {
    if (!isPathCrawlable(group, publicPath)) {
      problems.push(
        `[${agentLabel}] blocks ${publicPath}, which the sitemap advertises as public. Remove or narrow the Disallow that covers it.`,
      );
    }
  }

  for (const rule of group.rules) {
    if (rule.isAllow || rule.pattern === "" || rule.pattern === "/") continue;
    if (ACCEPTED_EXTRA_DISALLOWS.has(rule.pattern)) continue;
    // Justified two ways: the rule's own path is gated (`/studio/dashboard`
    // sits under the gated `/studio/*`), or the rule is a broader prefix that
    // covers a gated path (`/event` covers `/events`, `/magazine` covers
    // `/magazine/editor`).
    const blocksSomethingGated =
      isGatedPath(sampleGatedPath(rule.pattern.replace(/\*/g, "sample"))) ||
      gatedSamplePaths.some((gatedPath) =>
        ruleMatcher(rule.pattern).test(gatedPath),
      );
    if (!blocksSomethingGated) {
      problems.push(
        `[${agentLabel}] Disallow: ${rule.pattern} blocks nothing that authGate.ts gates. If that is deliberate, add it to ACCEPTED_EXTRA_DISALLOWS in scripts/check-robots.mjs with the reason; otherwise delete the line.`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(
    `[check-robots] public/robots.txt has drifted from authGate.ts:\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}

console.log(
  `[check-robots] ${groups.length} group(s) checked against ${gatedSamplePaths.length} gated paths and ${QUIET_PUBLIC_PATHS.length} public paths. No drift.`,
);
