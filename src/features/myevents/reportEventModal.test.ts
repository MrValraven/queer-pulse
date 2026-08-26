import { describe, expect, it } from "vitest";
import { EVENT_REPORT_REASONS } from "./reportEventModal.data";
import { SUBJECT_REASONS } from "../safety/reportReasons";

/**
 * The report-an-event modal hand-curates its reason list beside the shared
 * taxonomy it claims to mirror, and nothing compared the two. The list drifted:
 * it offered `hate_speech`, `venue_safety`, `spam`, `off_topic` and `other`,
 * while `SUBJECT_REASONS.event` also carries `harassment` and
 * `discrimination`. A discriminatory gathering could therefore be filed only
 * as "Something else" (Low severity, seven days) where `discrimination`
 * derives Medium and three days.
 *
 * It produced no compiler error, no lint warning, no runtime error, and
 * nothing looked wrong on screen. These assertions are the check that would
 * have caught it, and they are the reason the list lives in its own module.
 */

const SUBJECT_TYPE = "event" as const;

describe("the report-an-event modal's reasons", () => {
  it("offers every reason the taxonomy supports for an event", () => {
    const offered = new Set(EVENT_REPORT_REASONS.map((option) => option.code));
    for (const code of SUBJECT_REASONS[SUBJECT_TYPE]) {
      expect(
        offered,
        `the report-an-event modal must offer "${code}"`,
      ).toContain(code);
    }
  });

  // The other direction. An offered code the backend does not accept for an
  // `event` subject builds a submission the server rejects.
  it("only offers codes valid for an event subject", () => {
    for (const option of EVENT_REPORT_REASONS) {
      expect(
        SUBJECT_REASONS[SUBJECT_TYPE],
        `"${option.code}" is not valid for an "${SUBJECT_TYPE}" subject`,
      ).toContain(option.code);
    }
  });

  it("offers each code exactly once", () => {
    const codes = EVENT_REPORT_REASONS.map((option) => option.code);
    expect(codes).toHaveLength(new Set(codes).size);
  });

  it("keeps the catch-all last so it stays a fallback", () => {
    expect(EVENT_REPORT_REASONS.at(-1)?.code).toBe("other");
  });

  it("gives every option a namespaced label key", () => {
    for (const option of EVENT_REPORT_REASONS) {
      expect(option.key).toMatch(/^myevents:reportModal\.reason\./);
    }
  });
});
