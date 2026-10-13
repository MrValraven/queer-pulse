import { describe, expect, it } from "vitest";
import {
  DISCIPLINES,
  PROFESSIONS_BY_FIELD,
} from "./memberDirectoryFilter.data";
import {
  foldForSearch,
  matchingFields,
  matchingProfessionGroups,
  pickCountsByGroup,
  PICKER_FIELD_GROUPS,
  pickerFieldGroupOf,
  removeWorkPick,
  toggleWorkProfession,
  workPicks,
  type LabelResolver,
  type WorkPick,
} from "./workFieldPicker.data";
import { JOB_FIELD_GROUPS } from "./workTaxonomy.data";

/** A stand-in for `t`: a handful of PT-style labels with accents. Any key
 *  outside the map resolves to an empty label, which no real query matches. */
const FAKE_LABELS: Record<string, string> = {
  "members:directory.discipline.design": "Design",
  "members:directory.discipline.healthcare": "Saúde",
  "members:directory.discipline.finance": "Finanças",
  "members:directory.discipline.animals": "Animais",
  "members:directory.discipline.publicSector": "Setor público",
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
      "tech",
      "healthcare",
    ]);
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(
      idsOf(PROFESSIONS_BY_FIELD.tech ?? []),
    );
    expect(idsOf(groups[1]?.professions ?? [])).toEqual(["therapist"]);
  });

  it("brings a whole field only for a label match at the start of a word", () => {
    // "an" opens "Animais" and sits inside "Finanças".
    const groups = matchingProfessionGroups("an", resolveLabel);
    expect(groups.map((group) => group.fieldId)).toEqual(["animals"]);
    expect(idsOf(groups[0]?.professions ?? [])).toEqual(
      idsOf(PROFESSIONS_BY_FIELD.animals ?? []),
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

  it("leaves out the field of a query that only matches a profession", () => {
    expect(matchingFields("enferm", resolveLabel)).toEqual([]);
  });

  it("lists every field whose label has a word starting with the query, in DISCIPLINES order", () => {
    expect(idsOf(matchingFields("s", resolveLabel))).toEqual([
      "healthcare",
      "publicSector",
    ]);
  });

  it("matches a field label at the start of a word and passes over one inside a word", () => {
    // "an" opens "Animais" and sits inside "Finanças".
    expect(idsOf(matchingFields("an", resolveLabel))).toEqual(["animals"]);
  });

  it("folds accents for a later word of a field label", () => {
    expect(idsOf(matchingFields("publico", resolveLabel))).toEqual([
      "publicSector",
    ]);
    expect(matchingFields("blico", resolveLabel)).toEqual([]);
  });

  it("returns nothing when no field or profession matches", () => {
    expect(matchingFields("xyz", resolveLabel)).toEqual([]);
  });
});

describe("PICKER_FIELD_GROUPS", () => {
  const fieldIdsOf = (groupId: string) =>
    PICKER_FIELD_GROUPS.find((group) => group.id === groupId)?.fieldIds ?? [];

  it("files every field in exactly one group", () => {
    const groupedFieldIds = PICKER_FIELD_GROUPS.flatMap(
      (group) => group.fieldIds,
    );
    for (const field of DISCIPLINES) {
      expect(
        groupedFieldIds.filter((fieldId) => fieldId === field.id),
      ).toHaveLength(1);
    }
    expect([...groupedFieldIds].sort()).toEqual(idsOf(DISCIPLINES).sort());
  });

  it("keeps the job board's group order with life stage last", () => {
    expect(PICKER_FIELD_GROUPS.map((group) => group.id)).toEqual([
      ...JOB_FIELD_GROUPS.map((group) => group.id),
      "lifeStage",
    ]);
  });

  it("labels the job groups with the job board's keys and life stage with its own", () => {
    for (const group of PICKER_FIELD_GROUPS.slice(0, -1)) {
      expect(group.labelKey).toBe(`economy:jobs.fieldGroup.${group.id}`);
    }
    expect(PICKER_FIELD_GROUPS.at(-1)?.labelKey).toBe(
      "members:workPicker.group.lifeStage",
    );
  });

  it("places the four fields the job board leaves out", () => {
    expect(fieldIdsOf("business").at(-1)).toBe("ownBusiness");
    expect(fieldIdsOf("creativeMedia").at(-1)).toBe("games");
    const creativeMedia = fieldIdsOf("creativeMedia");
    expect(creativeMedia[creativeMedia.indexOf("performance") + 1]).toBe(
      "adultWork",
    );
    expect(fieldIdsOf("lifeStage")).toEqual(["lifeStage"]);
  });

  it("finds the group holding a field", () => {
    expect(pickerFieldGroupOf("healthcare")?.id).toBe("healthCare");
    expect(pickerFieldGroupOf("adultWork")?.id).toBe("creativeMedia");
    expect(pickerFieldGroupOf("lifeStage")?.id).toBe("lifeStage");
    expect(pickerFieldGroupOf("noSuchField")).toBeUndefined();
  });
});

describe("workPicks", () => {
  const keysOf = (picks: WorkPick[]) =>
    picks.map((pick) => `${pick.kind}:${pick.id}`);

  it("shows a field as its picked roles, or as itself while it has none", () => {
    const picks = workPicks({
      discipline: ["healthcare", "design", "tech"],
      profession: ["dataScientist", "nurse", "gp"],
    });
    expect(keysOf(picks)).toEqual([
      "profession:nurse",
      "profession:gp",
      "field:design",
      "profession:dataScientist",
    ]);
    expect(picks[0]?.fieldId).toBe("healthcare");
    expect(picks[2]?.labelKey).toBe("members:directory.discipline.design");
    expect(picks[3]?.labelKey).toBe(
      "members:directory.profession.dataScientist",
    );
  });

  it("is empty with nothing picked", () => {
    expect(workPicks({ discipline: [], profession: [] })).toEqual([]);
  });

  it("puts a role picked into a lone field chip's field at that chip's place", () => {
    const fieldOnly = {
      discipline: ["tech", "healthcare", "design"],
      profession: [],
    };
    expect(keysOf(workPicks(fieldOnly))).toEqual([
      "field:tech",
      "field:healthcare",
      "field:design",
    ]);
    const withRole = toggleWorkProfession(fieldOnly, "nurse");
    expect(keysOf(workPicks(withRole))).toEqual([
      "field:tech",
      "profession:nurse",
      "field:design",
    ]);
  });
});

describe("removeWorkPick", () => {
  const pickFor = (selection: Parameters<typeof workPicks>[0], id: string) => {
    const pick = workPicks(selection).find((candidate) => candidate.id === id);
    if (!pick) throw new Error(`no pick ${id}`);
    return pick;
  };

  it("keeps the field while another of its roles stays picked", () => {
    const selection = {
      discipline: ["healthcare"],
      profession: ["nurse", "gp"],
    };
    expect(removeWorkPick(selection, pickFor(selection, "nurse"))).toEqual({
      discipline: ["healthcare"],
      profession: ["gp"],
    });
  });

  it("drops the field along with its last picked role", () => {
    const selection = {
      discipline: ["healthcare", "tech"],
      profession: ["nurse", "dataScientist"],
    };
    expect(removeWorkPick(selection, pickFor(selection, "nurse"))).toEqual({
      discipline: ["tech"],
      profession: ["dataScientist"],
    });
  });

  it("drops a field chip's field", () => {
    const selection = { discipline: ["design", "tech"], profession: [] };
    expect(removeWorkPick(selection, pickFor(selection, "design"))).toEqual({
      discipline: ["tech"],
      profession: [],
    });
  });

  it("returns the selection unchanged for a role that is already gone", () => {
    const before = { discipline: ["healthcare"], profession: ["nurse"] };
    const stalePick = pickFor(before, "nurse");
    const after = { discipline: ["healthcare"], profession: [] };
    expect(removeWorkPick(after, stalePick)).toBe(after);
  });
});

describe("pickCountsByGroup", () => {
  it("counts each group's chips and leaves groups with none out", () => {
    const counts = pickCountsByGroup(
      workPicks({
        discipline: ["healthcare", "design", "tech"],
        profession: ["nurse", "gp", "dataScientist"],
      }),
    );
    expect(counts.get("healthCare")).toBe(2);
    expect(counts.get("creativeMedia")).toBe(1);
    expect(counts.get("techScience")).toBe(1);
    expect(counts.has("business")).toBe(false);
  });
});
