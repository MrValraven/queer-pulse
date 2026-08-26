import { describe, expect, it } from "vitest";
import { PERSONA_REPORT_REASONS } from "./subprofileReportModal.data";
import { SUBJECT_REASONS } from "../safety/reportReasons";

/**
 * The persona report modal curates its own wording, so its options do not map
 * one-to-one onto reason codes: several persona-specific concerns share
 * `other`. That is deliberate, and it is also what hid the drift, because a
 * list where repeats are expected does not look short. `discrimination` was
 * missing entirely, so a persona that demeans people or misgenders them could
 * be filed only as "Something else" (Low severity, seven days) where
 * `discrimination` derives Medium and three days.
 *
 * These assertions compare the curated list to the taxonomy in both
 * directions, which is the check that would have caught it.
 */

const SUBJECT_TYPE = "subprofile" as const;

describe("the persona report modal's reasons", () => {
  it("offers every reason the taxonomy supports for a persona", () => {
    const offered = new Set(
      PERSONA_REPORT_REASONS.map((option) => option.reasonCode),
    );
    for (const code of SUBJECT_REASONS[SUBJECT_TYPE]) {
      expect(
        offered,
        `the persona report modal must offer "${code}"`,
      ).toContain(code);
    }
  });

  // The other direction. `housing_scam` is the live example: it reads well for
  // "not a real practice or service", and the backend rejects it for a
  // `subprofile` subject, which is why that option maps to `other` instead.
  it("only offers codes valid for a subprofile subject", () => {
    for (const option of PERSONA_REPORT_REASONS) {
      expect(
        SUBJECT_REASONS[SUBJECT_TYPE],
        `"${option.reasonCode}" is not valid for a "${SUBJECT_TYPE}" subject`,
      ).toContain(option.reasonCode);
    }
  });

  // Options may share a `reasonCode`, so the radio value has to be the key.
  it("gives every option a unique key", () => {
    const keys = PERSONA_REPORT_REASONS.map((option) => option.key);
    expect(keys).toHaveLength(new Set(keys).size);
  });

  // Only the codes with no dedicated option of their own may fall back to
  // `other`. A code the taxonomy carries must never be collapsed into it,
  // which is precisely how `discrimination` went missing.
  it("never collapses a taxonomy code onto the catch-all", () => {
    const dedicated = new Set(
      PERSONA_REPORT_REASONS.filter(
        (option) => option.reasonCode !== "other",
      ).map((option) => option.reasonCode),
    );
    for (const code of SUBJECT_REASONS[SUBJECT_TYPE]) {
      if (code === "other") continue;
      expect(
        dedicated,
        `"${code}" has no option of its own and falls through to "other"`,
      ).toContain(code);
    }
  });

  it("keeps the catch-all last so it stays a fallback", () => {
    expect(PERSONA_REPORT_REASONS.at(-1)?.reasonCode).toBe("other");
  });

  it("gives every option a namespaced label key", () => {
    for (const option of PERSONA_REPORT_REASONS) {
      expect(option.labelKey).toMatch(/^subprofiles:reportModal\.reasons\./);
    }
  });
});
