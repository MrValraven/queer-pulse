import { describe, expect, it } from "vitest";
import { CATEGORIES, subjectTypeForCategory } from "./reportCategories";
import { SUBJECT_REASONS } from "./reportReasons";

/**
 * The standalone public report form at `/report` is the platform's most
 * reachable reporting surface, and it curates its own category list rather
 * than looking one up by subject type, because it has no subject picker: one
 * code routes to a `venue` subject and the rest to a `member` one.
 *
 * That curation is where `outing` and `doxxing` went missing. They are the
 * only two codes the backend maps to emergency severity (1-hour SLA, the
 * queue's emergency band), so a member being outed could file at best
 * `harassment` (24 hours) and at worst "Something else" (seven days).
 *
 * These assert the curated list against the taxonomy, which is the check that
 * would have caught it.
 */

const MEMBER_ROUTED = SUBJECT_REASONS.member;

describe("the standalone report form's categories", () => {
  it.each(["outing", "doxxing"])(
    "offers %s, the emergency-severity codes",
    (code) => {
      expect(CATEGORIES.map((category) => category.code)).toContain(code);
    },
  );

  // The real guard. Anything `SUBJECT_REASONS.member` offers must be offerable
  // here too, or this form silently offers less than the taxonomy says a
  // member subject supports.
  it("offers every reason a member subject supports", () => {
    const offered = new Set(CATEGORIES.map((category) => category.code));
    for (const code of MEMBER_ROUTED) {
      expect(offered, `the /report form must offer "${code}"`).toContain(code);
    }
  });

  // Every code must be one the backend accepts for the subject it routes to,
  // or the form builds a submission the server rejects.
  it("only offers codes valid for the subject each one routes to", () => {
    for (const category of CATEGORIES) {
      const subjectType = subjectTypeForCategory(category.code);
      expect(
        SUBJECT_REASONS[subjectType],
        `"${category.code}" routes to "${subjectType}", which does not accept it`,
      ).toContain(category.code);
    }
  });

  it("gives every category a label key", () => {
    for (const category of CATEGORIES) {
      expect(category.labelKey).toMatch(/^safety:report\.category\./);
    }
  });
});
