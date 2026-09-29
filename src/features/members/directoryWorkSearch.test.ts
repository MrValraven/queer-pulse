import { describe, expect, it } from "vitest";
import { workIdsMatchingSearch } from "./directoryWorkSearch";
import type { LabelResolver } from "./workFieldPicker.data";

/** A stand-in for `t`: a few labels, some with accents. Any key outside the
 *  map resolves to an empty label, which no search term matches. */
const FAKE_LABELS: Record<string, string> = {
  "members:directory.discipline.design": "Design",
  "members:directory.discipline.healthcare": "Saúde",
  "members:directory.discipline.care": "Enfermagem e cuidados",
  "members:directory.profession.graphicDesigner": "Graphic designer",
  "members:directory.profession.nurse": "Nurse",
  "members:directory.profession.gp": "Médica de família",
};

const resolveLabel: LabelResolver = (labelKey) => FAKE_LABELS[labelKey] ?? "";

describe("workIdsMatchingSearch", () => {
  it("matches a term at the start of a word in the label", () => {
    expect(workIdsMatchingSearch("nur", resolveLabel).professionIds).toEqual([
      "nurse",
    ]);
    expect(workIdsMatchingSearch("famil", resolveLabel).professionIds).toEqual([
      "gp",
    ]);
  });

  it("folds accents and case on both the term and the label", () => {
    expect(workIdsMatchingSearch("saude", resolveLabel).disciplineIds).toEqual([
      "healthcare",
    ]);
    expect(workIdsMatchingSearch("MEDICA", resolveLabel).professionIds).toEqual(
      ["gp"],
    );
    expect(workIdsMatchingSearch("enferm", resolveLabel).disciplineIds).toEqual(
      ["care"],
    );
  });

  it("returns empty lists for terms shorter than three characters", () => {
    expect(workIdsMatchingSearch("ic", resolveLabel)).toEqual({
      disciplineIds: [],
      professionIds: [],
    });
    expect(workIdsMatchingSearch("  sa ", resolveLabel)).toEqual({
      disciplineIds: [],
      professionIds: [],
    });
  });

  it("ignores a term that only appears in the middle of a word", () => {
    expect(workIdsMatchingSearch("urse", resolveLabel)).toEqual({
      disciplineIds: [],
      professionIds: [],
    });
  });

  it("matches a multi-word term that starts on a word boundary", () => {
    expect(
      workIdsMatchingSearch("graphic des", resolveLabel).professionIds,
    ).toEqual(["graphicDesigner"]);
    expect(
      workIdsMatchingSearch("graphic  des", resolveLabel).professionIds,
    ).toEqual(["graphicDesigner"]);
  });

  it("returns the discipline id when a field label matches", () => {
    expect(workIdsMatchingSearch("design", resolveLabel)).toEqual({
      disciplineIds: ["design"],
      professionIds: ["graphicDesigner"],
    });
  });

  it("returns the profession id when a profession label matches", () => {
    expect(workIdsMatchingSearch("nurse", resolveLabel)).toEqual({
      disciplineIds: [],
      professionIds: ["nurse"],
    });
  });
});
