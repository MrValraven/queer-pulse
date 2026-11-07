import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { VERDICTS, analyse, classifyKey } from "./report-unused-i18n.mjs";

/**
 * Regression pins for the "loose prefix" cases of the unused-i18n reporter.
 *
 * THE FAILURE THIS GUARDS. A key that is a prefix of other keys (`card` beside
 * `card.title`, or a bare word that begins a whole family) is easy to judge by
 * the wrong rule. Two mistakes are possible, and they point in opposite
 * directions:
 *
 * - WRONGLY KEPT. A prefix match that is too loose lets one live key excuse its
 *   neighbours. That is how `forOrgs.cta.list1` once kept the dead
 *   `forOrgs.tiers.*.list1-5` bullets alive. The report then hides dead copy.
 * - WRONGLY DELETED. A prefix match that is too strict reports the members of a
 *   curried-prefix family as unreachable, which is the 1A miss that blanked
 *   the published Transparency Report tables.
 *
 * `report-unused-i18n.test.mjs` pins those with real catalog keys. A real key
 * can be deleted on purpose, and the pin then dies with it. This file builds
 * its own catalog and its own source tree out of invented names in a temporary
 * directory, so no edit to the real catalogs can reach it. That is the whole
 * reason it exists as a separate file.
 *
 * Every key below lives in the invented namespace `loosefixture`. Keep it that
 * way: a bare key such as `card.title` written in this file would be read by
 * the real report as a use site in EVERY namespace.
 *
 * WHAT THIS FILE DELIBERATELY NEVER ASSERTS: a total. The synthetic world is
 * tiny and fixed, but a count would still tie the test to an incidental detail.
 * Every assertion is a verdict for a named synthetic key.
 */

const NAMESPACE = "loosefixture";

/** The synthetic EN catalog. Values are irrelevant; only the key names matter. */
const CATALOG_KEYS = [
  // A key that is a prefix of two longer keys AND of a longer word.
  "card",
  "card.title",
  "card.body",
  "cardinal",
  // A key that is a prefix of a key the source does spell.
  "deep",
  "deep.child",
  // A family whose bare stem is never a key and never the whole of a literal.
  "stem.alpha",
  "stem.beta",
  // A family reached through a curried prefix, with its bare parent beside it.
  "family",
  "family.one",
  "family.two",
  "family.three",
];

/**
 * The synthetic product source. One file, every shape on its own line:
 *
 * - `loosefixture:card` names exactly one key.
 * - `loosefixture:deep.child` names the longer key and nothing else.
 * - `loosefixture:stem` is a segment-boundary prefix with no trailing
 *   separator. It is an ordinary string, not a key and not a shape.
 * - `loosefixture:family.` ends on a separator and is a proper prefix of
 *   catalog keys, so rule 8 turns it into the shape `loosefixture:family.*`.
 * - `"three"` spells one of the three suffixes that shape could take.
 */
const SYNTHETIC_SOURCE = `
declare function t(key: string): string;
declare function curriedLabels(prefix: string): (suffix: string) => string;

export const examples = [
  t("${NAMESPACE}:card"),
  t("${NAMESPACE}:deep.child"),
  t("${NAMESPACE}:stem"),
  curriedLabels("${NAMESPACE}:family."),
  curriedLabels("three"),
];
`;

const CATALOG_SOURCE = `import type { Catalog } from "../../types";

export const ${NAMESPACE}: Catalog = {
${CATALOG_KEYS.map((key) => `  "${key}": "value",`).join("\n")}
};
`;

let temporaryRoot;
let result;

beforeAll(() => {
  temporaryRoot = mkdtempSync(join(tmpdir(), "unused-i18n-loose-prefix-"));
  const catalogDirectory = join(temporaryRoot, "catalogs", "en");
  const sourceDirectory = join(temporaryRoot, "src");
  mkdirSync(catalogDirectory, { recursive: true });
  mkdirSync(sourceDirectory, { recursive: true });
  writeFileSync(join(catalogDirectory, `${NAMESPACE}.ts`), CATALOG_SOURCE);
  writeFileSync(join(sourceDirectory, "usage.ts"), SYNTHETIC_SOURCE);

  result = analyse({
    rootDirectory: temporaryRoot,
    catalogDirectory,
    scanRoots: ["src"],
  });
});

afterAll(() => {
  if (temporaryRoot) rmSync(temporaryRoot, { recursive: true, force: true });
});

/** The verdict for a synthetic key, failing loudly if the fixture itself broke. */
function verdictFor(path) {
  const verdict = classifyKey(result, `${NAMESPACE}:${path}`);
  if (verdict === VERDICTS.ABSENT) {
    throw new Error(
      `FIXTURE BROKEN. "${NAMESPACE}:${path}" is missing from the synthetic ` +
        `catalog this test wrote, so the catalog loader or this test's ` +
        `CATALOG_KEYS list changed. The reporter's verdicts were not checked.`,
    );
  }
  return verdict;
}

describe("report-unused-i18n loose prefix: a live key never excuses its neighbours", () => {
  it("scans the synthetic tree cleanly", () => {
    expect(result.unparseableFiles).toEqual([]);
    expect(result.productFileCount).toBe(1);
  });

  it("keeps the named key live", () => {
    expect(verdictFor("card")).toBe(VERDICTS.LIVE_LITERAL);
  });

  it.each(["card.title", "card.body", "cardinal"])(
    "reports %s unreachable although its prefix `card` is live",
    (path) => {
      // `card` is a string prefix of all three. None of them is spelled, and
      // no shape reaches them, so excusing them would be the loose-prefix bug.
      expect(verdictFor(path)).toBe(VERDICTS.UNUSED_UNREACHABLE);
    },
  );

  it("keeps the spelled longer key live", () => {
    expect(verdictFor("deep.child")).toBe(VERDICTS.LIVE_LITERAL);
  });

  it("reports the shorter parent unreachable although its child is live", () => {
    // The reverse direction: a live child must not excuse the key it extends.
    expect(verdictFor("deep")).toBe(VERDICTS.UNUSED_UNREACHABLE);
  });

  it.each(["stem.alpha", "stem.beta"])(
    "reports %s unreachable when only its bare stem is spelled",
    (path) => {
      // `loosefixture:stem` ends on no separator, so rule 8 must not read it as
      // a prefix. Accepting it is the failure that would empty tiers 1A and 1B.
      expect(verdictFor(path)).toBe(VERDICTS.UNUSED_UNREACHABLE);
    },
  );
});

describe("report-unused-i18n loose prefix: a separator-terminated prefix reaches its family", () => {
  it("never puts a family member back in tier 1A", () => {
    // The load-bearing half. `loosefixture:family.` becomes a shape, so the
    // members it can complete are reachable. Calling them unreachable is the
    // curried-prefix miss: the tier a deletion pass trusts blindly.
    for (const path of ["family.one", "family.two", "family.three"]) {
      expect(verdictFor(path)).not.toBe(VERDICTS.UNUSED_UNREACHABLE);
    }
  });

  it("keeps the member whose suffix the source spells live by shape", () => {
    expect(verdictFor("family.three")).toBe(VERDICTS.LIVE_SHAPE);
  });

  it.each(["family.one", "family.two"])(
    "hands %s to a human in tier 1C when nothing spells its suffix",
    (path) => {
      // A one-segment hole that pins its namespace: a real enumeration the tool
      // cannot settle, so it lands in the small tier a person reads.
      expect(verdictFor(path)).toBe(VERDICTS.UNUSED_TIGHT_SHAPE);
    },
  );

  it("does not stretch the family shape over its own bare parent", () => {
    // `family` has no trailing separator, so `loosefixture:family.*` does not
    // match it. The prefix reaches the children and never the parent.
    expect(verdictFor("family")).toBe(VERDICTS.UNUSED_UNREACHABLE);
  });
});
