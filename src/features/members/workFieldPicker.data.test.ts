import { describe, expect, it } from "vitest";
import { PROFESSIONS_BY_FIELD } from "./memberDirectoryFilter.data";
import {
  foldForSearch,
  matchingFields,
  matchingProfessionGroups,
  type LabelResolver,
} from "./workFieldPicker.data";

/** A stand-in for `t`: a handful of PT-style labels with accents. Any key
 *  outside the map resolves to an empty label, which no real query matches. */
const FAKE_LABELS: Record<string, string> = {
  "members:directory.discipline.design": "Design",
  "members:directory.discipline.healthcare": "Saúde",
  "members:directory.discipline.tech": "Tech",
  "members:directory.profession.graphicDesigner": "Design gráfico",
  "members:directory.profession.gp": "Médica de família",
  "members:directory.profession.nurse": "Enfermeira",
  "members:directory.profession.therapist": "Terapeuta",
  "members:directory.profession.dataScientist": "Cientista de dados",
};

const resolveLabel: LabelResolver = (labelKey) => FAKE_LABELS[labelKey] ?? "";

const idsOf = (options: { id: string }[]) => options.map((option) => option.id);

describe("foldForSearch", () => {
  it("strips accents, lowercases and trims", () => {
    expect(foldForSearch("  Médica ")).toBe("medica");
    expect(foldForSearch("SAÚDE")).toBe("saude");
  });
});

describe("matchingProfessionGroups", () => {
  it("matches an accented label from an unaccented query", () => {
    const groups = matchingProfessionGroups("medica", resolveLabel);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.fieldId).toBe("healthcare");
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(["gp"]);
  });

  it("ignores case in the query", () => {
    const groups = matchingProfessionGroups("ENFERMEIRA", resolveLabel);
    expect(groups.map((group) => group.fieldId)).toEqual(["healthcare"]);
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(["nurse"]);
  });

  it("orders groups by DISCIPLINES and drops fields with no match", () => {
    const groups = matchingProfessionGroups("ic", resolveLabel);
    expect(groups.map((group) => group.fieldId)).toEqual([
      "design",
      "healthcare",
    ]);
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(["graphicDesigner"]);
    expect(idsOf(groups[1]?.professions ?? [])).toEqual(["gp"]);
  });

  it("returns every profession of a field whose own label matches", () => {
    const groups = matchingProfessionGroups("saude", resolveLabel);
    expect(groups.map((group) => group.fieldId)).toEqual(["healthcare"]);
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(
      idsOf(PROFESSIONS_BY_FIELD.healthcare ?? []),
    );
  });

  it("keeps only the matching professions of fields whose label does not match", () => {
    // "te" matches the Tech label and the Terapeuta profession under Saúde.
    const groups = matchingProfessionGroups("te", resolveLabel);
    expect(groups.map((group) => group.fieldId)).toEqual([
      "healthcare",
      "tech",
    ]);
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(["therapist"]);
    expect(idsOf(groups[1]?.professions ?? [])).toEqual(
      idsOf(PROFESSIONS_BY_FIELD.tech ?? []),
    );
  });

  it("returns no groups when nothing matches", () => {
    expect(matchingProfessionGroups("xyz", resolveLabel)).toEqual([]);
  });
});

describe("matchingFields", () => {
  it("matches a field label case- and accent-insensitively", () => {
    expect(idsOf(matchingFields("SAUDE", resolveLabel))).toEqual([
      "healthcare",
    ]);
  });

  it("returns the parent field of a query that only matches a profession", () => {
    expect(idsOf(matchingFields("enferm", resolveLabel))).toEqual([
      "healthcare",
    ]);
  });

  it("keeps the selected fields alongside the matches, in DISCIPLINES order", () => {
    expect(idsOf(matchingFields("enferm", resolveLabel, ["tech"]))).toEqual([
      "healthcare",
      "tech",
    ]);
    expect(idsOf(matchingFields("xyz", resolveLabel, ["tech"]))).toEqual([
      "tech",
    ]);
  });

  it("returns nothing when no field or profession matches", () => {
    expect(matchingFields("xyz", resolveLabel)).toEqual([]);
  });
});
