import { describe, expect, it } from "vitest";
import {
  DIRECTORY_DISCIPLINES,
  DIRECTORY_PROFESSIONS,
  DISCIPLINES,
  EMPTY_FILTERS,
  PROFESSIONS_BY_FIELD,
  appliedChips,
  directoryProfessionsForFields,
  professionsForFields,
  reconcileProfessions,
} from "./memberDirectoryFilter.data";
import { workIdsMatchingSearch } from "./directoryWorkSearch";
import { matchingProfessionGroups } from "./workFieldPicker.data";
import type { LabelResolver } from "./workFieldPicker.data";

/** The six professions of the unlisted "Sex work & adult content" field. */
const ADULT_PROFESSION_IDS = [
  "sexWorker",
  "adultContentCreator",
  "camPerformer",
  "exoticDancer",
  "professionalDominant",
  "adultFilmPerformer",
];

/** A stand-in for `t` that resolves the unlisted field's own labels, so a test
 *  proves the search filters these ids out by construction rather than
 *  happening to never match them. Any key outside the map resolves to an
 *  empty label, which no search term matches. */
const EN_LABELS: Record<string, string> = {
  "members:directory.discipline.adultWork": "Sex work & adult content",
  "members:directory.profession.sexWorker": "Sex Worker",
};
const resolveEnLabel: LabelResolver = (labelKey) => EN_LABELS[labelKey] ?? "";

const PT_LABELS: Record<string, string> = {
  "members:directory.discipline.adultWork": "Trabalho sexual e conteúdo adulto",
  "members:directory.profession.sexWorker": "Trabalho sexual",
};
const resolvePtLabel: LabelResolver = (labelKey) => PT_LABELS[labelKey] ?? "";

describe("DIRECTORY_DISCIPLINES", () => {
  it("excludes the unlisted adultWork field", () => {
    expect(DIRECTORY_DISCIPLINES.some((d) => d.id === "adultWork")).toBe(false);
  });

  it("keeps the listed lifeStage field", () => {
    expect(DIRECTORY_DISCIPLINES.some((d) => d.id === "lifeStage")).toBe(true);
  });
});

describe("DIRECTORY_PROFESSIONS", () => {
  it("excludes every profession of the unlisted field", () => {
    const listedIds = new Set(DIRECTORY_PROFESSIONS.map((p) => p.id));
    for (const adultProfessionId of ADULT_PROFESSION_IDS)
      expect(listedIds.has(adultProfessionId)).toBe(false);
  });
});

describe("workIdsMatchingSearch and the unlisted field", () => {
  it('returns no adult ids for the query "sex worker"', () => {
    const result = workIdsMatchingSearch("sex worker", resolveEnLabel);
    expect(result.disciplineIds).not.toContain("adultWork");
    for (const adultProfessionId of ADULT_PROFESSION_IDS)
      expect(result.professionIds).not.toContain(adultProfessionId);
  });

  it('returns no adult ids for the query "trabalho sexual"', () => {
    const result = workIdsMatchingSearch("trabalho sexual", resolvePtLabel);
    expect(result.disciplineIds).not.toContain("adultWork");
    for (const adultProfessionId of ADULT_PROFESSION_IDS)
      expect(result.professionIds).not.toContain(adultProfessionId);
  });
});

describe("the picker's own search (workFieldPicker.data.ts)", () => {
  it('still finds sexWorker for "sex worker", unlike the directory search', () => {
    const groups = matchingProfessionGroups("sex worker", resolveEnLabel);
    const matchedIds = groups.flatMap((group) =>
      group.professions.map((profession) => profession.id),
    );
    expect(matchedIds).toContain("sexWorker");
  });
});

describe("reconcileProfessions and the unlisted field", () => {
  it("drops adultWork from disciplines and sexWorker from professions", () => {
    const result = reconcileProfessions({
      ...EMPTY_FILTERS,
      disciplines: ["lifeStage", "adultWork"],
      professions: ["student", "sexWorker"],
    });
    expect(result.disciplines).not.toContain("adultWork");
    expect(result.professions).not.toContain("sexWorker");
    expect(result.disciplines).toContain("lifeStage");
    expect(result.professions).toContain("student");
  });

  it("drops sexWorker even with no field selected", () => {
    const result = reconcileProfessions({
      ...EMPTY_FILTERS,
      disciplines: [],
      professions: ["sexWorker"],
    });
    expect(result.professions).not.toContain("sexWorker");
  });
});

describe("appliedChips and the unlisted field", () => {
  it("renders no chip for adultWork or sexWorker", () => {
    const chips = appliedChips(
      {
        ...EMPTY_FILTERS,
        disciplines: ["adultWork"],
        professions: ["sexWorker"],
      },
      resolveEnLabel,
    );
    expect(chips.some((chip) => chip.value === "adultWork")).toBe(false);
    expect(chips.some((chip) => chip.value === "sexWorker")).toBe(false);
  });

  it("still renders a chip for a listed field and profession", () => {
    const chips = appliedChips(
      {
        ...EMPTY_FILTERS,
        disciplines: ["lifeStage"],
        professions: [],
      },
      resolveEnLabel,
    );
    expect(chips.some((chip) => chip.value === "lifeStage")).toBe(true);
  });
});

describe("directoryProfessionsForFields and the unlisted field", () => {
  it("excludes the unlisted field's professions from the filter-side helper", () => {
    const result = directoryProfessionsForFields(["adultWork"]);
    expect(result.length).toBe(0);
  });

  it("falls back to the listed pool with no field selected", () => {
    const result = directoryProfessionsForFields([]);
    const ids = result.map((profession) => profession.id);
    for (const adultProfessionId of ADULT_PROFESSION_IDS)
      expect(ids).not.toContain(adultProfessionId);
  });

  it("the picker's professionsForFields still includes the unlisted field's professions", () => {
    const result = professionsForFields(["adultWork"]);
    const ids = result.map((profession) => profession.id);
    expect(ids).toContain("sexWorker");
  });
});

describe("taxonomy integrity", () => {
  it("gives every DISCIPLINES id a PROFESSIONS_BY_FIELD entry", () => {
    for (const discipline of DISCIPLINES)
      expect(PROFESSIONS_BY_FIELD[discipline.id]).toBeDefined();
  });

  it("never repeats a profession id across fields", () => {
    const allProfessionIds = Object.values(PROFESSIONS_BY_FIELD)
      .flat()
      .map((profession) => profession.id);
    expect(new Set(allProfessionIds).size).toBe(allProfessionIds.length);
  });
});
