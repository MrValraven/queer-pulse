import { describe, expect, it } from "vitest";
import {
  JOB_FIELD_GROUPS,
  JOB_FIELD_IDS,
  PROFESSION_IDS_BY_FIELD,
  PROFILE_ONLY_FIELD_IDS,
  UNLISTED_FIELD_IDS,
  fieldLabelKey,
  isJobFieldId,
  jobFieldGroupOf,
  professionBelongsToField,
} from "./workTaxonomy.data";
import {
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  PROFESSIONS_BY_FIELD,
} from "./memberDirectoryFilter.data";

describe("work taxonomy mirror", () => {
  it("has 47 fields and 43 job fields", () => {
    expect(Object.keys(PROFESSION_IDS_BY_FIELD)).toHaveLength(47);
    expect(JOB_FIELD_IDS).toHaveLength(43);
  });

  it("keeps profile-only and unlisted fields off the job list", () => {
    for (const fieldId of [...PROFILE_ONLY_FIELD_IDS, ...UNLISTED_FIELD_IDS]) {
      expect(isJobFieldId(fieldId)).toBe(false);
    }
  });

  it("puts every job field in exactly one display group", () => {
    const grouped = JOB_FIELD_GROUPS.flatMap((group) => group.fieldIds);
    expect([...grouped].sort()).toEqual([...JOB_FIELD_IDS].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(jobFieldGroupOf("customerService")).toBe("business");
  });

  it("derives the directory option lists from the id arrays", () => {
    expect(DISCIPLINES.map((field) => field.id)).toEqual(
      Object.keys(PROFESSION_IDS_BY_FIELD),
    );
    expect(DISCIPLINES[0]?.labelKey).toBe(fieldLabelKey("design"));
    expect(
      PROFESSIONS_BY_FIELD.security?.map((profession) => profession.id),
    ).toContain("securityGuard");
    expect(FIELD_BY_PROFESSION.translator).toBe("languages");
    expect(professionBelongsToField("translator", "editorial")).toBe(false);
  });
});
