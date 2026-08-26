import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEMO_GATHERING_SLUGS,
  gatheringDetails,
  gatheringPath,
  resolveGathering,
} from "./data";

/**
 * Every demo link to a gathering must name a gathering that exists.
 *
 * `resolveGathering` answers any slug, because a visitor must never meet an
 * error page in a prototype. That safety net also swallows a typo or a slug
 * nobody ever wrote an entry for: the link works, and quietly opens the
 * default gathering instead of the one on the card. Four calendar cards and
 * five story links shipped that way before anyone noticed, and every one of
 * them looked correct in review.
 *
 * A dev-only console warning catches this while the link is being written
 * (`warnIfUnresolvedGathering`). This is the CI half of the same guard, in the
 * spirit of the mirror check in `scripts/publicPaths.test.mjs`: it reads the
 * source rather than the running app, so a bad slug fails here even when
 * nobody happened to click that card.
 *
 * Scope: literal single-argument calls only. A slug built at runtime from a
 * live DTO is a real backend slug and has no business in this registry.
 */

// `../..` from this file is `src/`. The trailing slash is trimmed so the
// paths this test reports back read as `/features/...` rather than `//...`.
const SOURCE_ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(
  /\/$/,
  "",
);

/** The path helpers whose first argument is a gathering slug. */
const SLUG_HELPERS = [
  "gatheringPath",
  "gatheringRecapPath",
  "gatheringCancelledPath",
  "gatheringDashboardPath",
  "manageGatheringPath",
  "gatheringPhotosPath",
  "coHostInvitePath",
  "gatheringShareUrl",
  "gatheringShareDisplayUrl",
];

const LITERAL_CALL = new RegExp(
  `(${SLUG_HELPERS.join("|")})\\("([a-z0-9-]*)"`,
  "g",
);

/** Every `.ts`/`.tsx` file under `src`, tests included. */
function sourceFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) found.push(...sourceFiles(fullPath));
    else if (/\.tsx?$/.test(entry.name)) found.push(fullPath);
  }
  return found;
}

/** Each `helper("slug")` written anywhere in `src`, with where it was found. */
function literalSlugCallSites(): Array<{ file: string; slug: string }> {
  const callSites: Array<{ file: string; slug: string }> = [];
  for (const file of sourceFiles(SOURCE_ROOT)) {
    const contents = readFileSync(file, { encoding: "utf8" });
    for (const match of contents.matchAll(LITERAL_CALL)) {
      callSites.push({ file: file.slice(SOURCE_ROOT.length), slug: match[2]! });
    }
  }
  return callSites;
}

describe("gathering slugs resolve", () => {
  it("finds the demo link sites it is meant to be checking", () => {
    // A regex that silently matches nothing would make every other assertion
    // in this file vacuously true, so anchor it on the real call count.
    expect(literalSlugCallSites().length).toBeGreaterThan(20);
  });

  it("has an entry for every slug a demo link names", () => {
    const unresolved = literalSlugCallSites().filter(
      ({ slug }) => !(slug in gatheringDetails),
    );
    expect(unresolved).toEqual([]);
  });

  it("has an entry for every DEMO_GATHERING_SLUGS subject", () => {
    const unresolved = Object.entries(DEMO_GATHERING_SLUGS).filter(
      ([, slug]) => !(slug in gatheringDetails),
    );
    expect(unresolved).toEqual([]);
  });

  it("round-trips each entry through its own path", () => {
    // Guards the shortId suffix too: `gatheringPath` appends one and
    // `resolveGathering` has to strip it back off to find the entry again.
    for (const slug of Object.keys(gatheringDetails)) {
      const param = gatheringPath(slug).replace("/gatherings/", "");
      expect(resolveGathering(param).slug).toBe(slug);
    }
  });
});
