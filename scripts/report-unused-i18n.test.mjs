import { beforeAll, describe, expect, it } from "vitest";
import { VERDICTS, analyse, classifyKey } from "./report-unused-i18n.mjs";

/**
 * Regression pins for the unused-i18n reporter.
 *
 * The tool's whole value is that someone trusts its verdicts enough to delete
 * roughly nine hundred keys from EN and PT together. A wrong verdict in the
 * "unused" direction deletes copy a member sees. The cases below are the ones
 * that were hardest to get right, and every one of them is a case a later
 * simplification of the constant evaluator would silently break:
 *
 * - `forOrgs.tiers.*.list1-5`. An earlier grep-based sweep flagged three of
 *   the fifteen and let the other twelve through, because an unrelated live key
 *   (`forOrgs.cta.list1`) excused them through a loose prefix match.
 * - `privacy.retention.clears.gathering`. Built by `.map()` over an array of
 *   literals, then composed with a namespace inside a named callback. Reported
 *   dead until the evaluator learned to bind callback parameters.
 * - `moderationHealth.notification.critical.meta`. Built by a helper that
 *   returns from several branches. Reported dead until the evaluator learned to
 *   union every return expression rather than demand a single-expression body.
 * - `safety:governance.audit.badge_restored`. Genuinely LIVE, through a value
 *   that exists only on the backend (`action` is a bare `string` off the audit
 *   DTO). No static analysis of this repo can see it, which is exactly why
 *   tier 1C exists. It must land there and never in 1A.
 * - `governance:transparency.action.warn`. LIVE, and the tool reported it in
 *   tier 1A. The one time this tool's strongest tier was wrong. It is pinned
 *   below with the construct that broke it.
 *
 * WHAT THIS FILE DELIBERATELY NEVER ASSERTS: a total. The catalogs gain and
 * lose keys daily, so any absolute count would be flaky within a day. Every
 * assertion here is either a verdict for a named key or a relative invariant.
 *
 * `analyse()` parses ~4,000 files, so it runs once for the whole file. The
 * runbook behind these verdicts is `scripts/README-unused-i18n.md`.
 */

/** Verdicts that mean "the product can still reach this key". */
const LIVE_VERDICTS = [VERDICTS.LIVE_LITERAL, VERDICTS.LIVE_SHAPE];

/** Verdicts that mean "this repo has no way to reach this key". */
const UNUSED_VERDICTS = [
  VERDICTS.UNUSED_UNREACHABLE,
  VERDICTS.UNUSED_CATCH_ALL,
  VERDICTS.UNUSED_TIGHT_SHAPE,
];

/** The fifteen tier bullets `orgTiers.data.ts` replaced with plain strings. */
const ORG_TIER_BULLET_KEYS = ["employer", "partner", "funder"].flatMap((tier) =>
  [1, 2, 3, 4, 5].map(
    (index) => `marketing:forOrgs.tiers.${tier}.list${index}`,
  ),
);

let result;

beforeAll(() => {
  result = analyse();
}, 120_000);

/**
 * The verdict for a pinned fixture key, refusing to run the real assertion if
 * the key has since been deleted from the catalogs.
 *
 * A deleted fixture is a FIXTURE problem, and the failure has to say so.
 * Without this, "the key is gone" and "the tool broke" produce the same red
 * test, and whoever reads it next reaches for the tool.
 */
function verdictFor(key) {
  const verdict = classifyKey(result, key);
  if (verdict === VERDICTS.ABSENT) {
    throw new Error(
      `FIXTURE OUT OF DATE. The tool is fine; "${key}" is no longer in the ` +
        `EN catalogs, so it can no longer pin anything. Someone deleted it ` +
        `(quite possibly on purpose). Replace it in ` +
        `scripts/report-unused-i18n.test.mjs with another key that exercises ` +
        `the same construct, and say in the comment which construct that is.`,
    );
  }
  return verdict;
}

describe("report-unused-i18n: keys that must be reported UNUSED", () => {
  it.each(ORG_TIER_BULLET_KEYS)(
    "reports %s unused: the tier bullets come from orgTiers.data.ts as plain strings now",
    (key) => {
      expect(UNUSED_VERDICTS).toContain(verdictFor(key));
    },
  );

  it("reports the whole family of fifteen tier bullets unused", () => {
    const stillLive = ORG_TIER_BULLET_KEYS.filter((key) =>
      LIVE_VERDICTS.includes(verdictFor(key)),
    );
    // The original failure was partial: three of fifteen caught, twelve missed.
    // Asserting the whole family at once is what makes a partial catch red.
    expect(stillLive).toEqual([]);
  });
});

describe("report-unused-i18n: keys that must be reported LIVE", () => {
  it("keeps forOrgs.cta.list1 live: the neighbour that once excused the tier bullets", () => {
    expect(LIVE_VERDICTS).toContain(verdictFor("marketing:forOrgs.cta.list1"));
  });

  it("keeps prototypeComingSoon.browseCta live: a plain literal, used in five places", () => {
    expect(LIVE_VERDICTS).toContain(
      verdictFor("gatherings:prototypeComingSoon.browseCta"),
    );
  });

  it("keeps privacy.retention.clears.gathering live: .map() over a literal array, composed in a named callback", () => {
    // privacy.data.tsx: `["gathering", …].map((id) => `retention.clears.${id}`)`
    // then `RETENTION_CLEARS_KEYS.map(leadBullet)`, where `leadBullet` renders
    // `marketing:privacy.${key}`. Both hops have to resolve.
    expect(LIVE_VERDICTS).toContain(
      verdictFor("marketing:privacy.retention.clears.gathering"),
    );
  });

  it("keeps moderationHealth.notification.critical.meta live: a helper that returns from several branches", () => {
    // formatNotification.ts: `moderationQueueAlertKey()` picks `level` across a
    // conditional and returns one template; the caller appends `.meta`.
    expect(LIVE_VERDICTS).toContain(
      verdictFor("admin:moderationHealth.notification.critical.meta"),
    );
  });

  it("never calls a key live on the strength of a test file alone", () => {
    // `common:greeting.welcome` is named only by Translation.test.tsx. Asserted
    // as "not live" rather than "test-only" so deleting that test moves it to
    // tier 1A without turning this red for the wrong reason.
    expect(LIVE_VERDICTS).not.toContain(verdictFor("common:greeting.welcome"));
  });
});

describe("report-unused-i18n: the curried key prefix (the 1A miss)", () => {
  // THE CONSTRUCT, at src/features/governance/TransparencySections.tsx:22:
  //
  //   function labelLookup(allowedKeys, translate, prefix) {
  //     return (key) =>
  //       allowedKeys.includes(key) ? translate(`${prefix}${key}`) : undefined;
  //   }
  //
  // called three times with a bare prefix string literal
  // ("governance:transparency.action.", ".category.", ".outcome.") and an
  // `as const` allow-list from ./transparencyLabels.ts.
  //
  // BOTH halves of that template are parameters, so the constant evaluator
  // resolved nothing, `buildPattern` threw away the all-holes value as
  // not-a-key, and no shape reached these keys at all. Seventeen keys that
  // render three count tables on the PUBLISHED Transparency Report were
  // reported in tier 1A, the tier a deletion pass is meant to trust blindly.
  // Deleting them would have blanked those tables with no error anywhere.
  //
  // Rule 8 in report-unused-i18n.mjs is what catches it now: a literal ending
  // on `.` or `:` that is a proper prefix of a catalog key becomes the shape
  // `prefix*`, with nothing proved about where the suffix comes from.
  //
  // IF YOU ARE HERE BECAUSE THIS TEST IS RED after simplifying the prefix
  // handling: the simplification is wrong. Restore rule 8 or replace it with
  // something that reaches these keys.
  const curriedPrefixKeys = [
    "governance:transparency.action.warn",
    "governance:transparency.category.space_safety",
    "governance:transparency.outcome.upheld",
  ];

  it.each(curriedPrefixKeys)("keeps %s live", (key) => {
    expect(LIVE_VERDICTS).toContain(verdictFor(key));
  });

  it.each(curriedPrefixKeys)("never puts %s back in tier 1A", (key) => {
    // The load-bearing half, asserted separately from "live" so that a change
    // demoting these to 1B or 1C reads as a yield regression rather than as
    // the safety failure that 1A would be.
    expect(verdictFor(key)).not.toBe(VERDICTS.UNUSED_UNREACHABLE);
  });
});

describe("report-unused-i18n: the backend-only family belongs in tier 1C", () => {
  // `AdminSafeSpaceNominationDrawer.tsx` renders
  // `t(`safety:governance.audit.${entry.action}`)`, and `action` is typed
  // `string` on the audit DTO, so these codes are spelled nowhere in the
  // frontend. They are LIVE. The tool cannot know that, and the honest place
  // for a key it cannot know about is the small hand-read tier, never 1A.
  const backendOnlyKeys = [
    "safety:governance.audit.badge_restored",
    "safety:governance.audit.flag_raised",
    "safety:governance.audit.nomination_declined",
  ];

  it.each(backendOnlyKeys)("puts %s in tier 1C", (key) => {
    expect(verdictFor(key)).toBe(VERDICTS.UNUSED_TIGHT_SHAPE);
  });

  it.each(backendOnlyKeys)("never puts %s in tier 1A", (key) => {
    // The load-bearing half. 1A is the tier the deletion pass trusts blindly;
    // a key that is live through a backend value must never reach it.
    expect(verdictFor(key)).not.toBe(VERDICTS.UNUSED_UNREACHABLE);
  });
});

describe("report-unused-i18n: invariants that hold whatever the catalogs say", () => {
  it("parses every scanned file", () => {
    // A file the parser chokes on yields a partial AST, which silently drops
    // the literals it holds and can turn a live key into a reported-dead one.
    // This is the tool's one quiet failure mode, so it is asserted rather than
    // left to the report's warning.
    expect(result.unparseableFiles).toEqual([]);
  });

  it("puts every catalog key in exactly one bucket", () => {
    const bucketNames = [
      "live",
      "dynamic",
      "unreachable",
      "unproducedBroad",
      "unproducedTight",
      "testOnly",
    ];
    for (const [namespace, catalog] of result.catalogs) {
      const bucketed = bucketNames.reduce(
        (sum, name) => sum + result.buckets[name].get(namespace).length,
        0,
      );
      // Relative, so it cannot go stale as the catalogs move.
      expect({ namespace, bucketed }).toEqual({
        namespace,
        bucketed: catalog.size,
      });
    }
  });

  it("scans the product and the tests as separate populations", () => {
    expect(result.productFileCount).toBeGreaterThan(0);
    expect(result.testFileCount).toBeGreaterThan(0);
  });
});
