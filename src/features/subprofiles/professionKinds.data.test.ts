import { describe, expect, it } from "vitest";
import {
  PROFESSION_IDS_BY_FIELD,
  UNLISTED_FIELD_IDS,
} from "../members/workTaxonomy.data";
import { KIND_SECTIONS } from "./subprofile-kinds";
import {
  PERSONA_KINDS_BY_PROFESSION,
  PROFESSIONS_WITHOUT_PERSONA_KIND,
  personaKindsForProfessions,
} from "./professionKinds.data";

const listedProfessions = Object.entries(PROFESSION_IDS_BY_FIELD)
  .filter(([fieldId]) => !UNLISTED_FIELD_IDS.includes(fieldId))
  .flatMap(([, ids]) => ids);
const unlistedProfessions = Object.entries(PROFESSION_IDS_BY_FIELD)
  .filter(([fieldId]) => UNLISTED_FIELD_IDS.includes(fieldId))
  .flatMap(([, ids]) => ids);
const mapped = Object.keys(PERSONA_KINDS_BY_PROFESSION);

describe("profession → persona kind crosswalk", () => {
  it("decides every listed profession exactly once", () => {
    const decided = [...mapped, ...PROFESSIONS_WITHOUT_PERSONA_KIND];
    const undecided = listedProfessions.filter((id) => !decided.includes(id));
    expect(undecided).toEqual([]);
    const twice = mapped.filter((id) =>
      PROFESSIONS_WITHOUT_PERSONA_KIND.includes(id),
    );
    expect(twice).toEqual([]);
    expect(new Set(PROFESSIONS_WITHOUT_PERSONA_KIND).size).toBe(
      PROFESSIONS_WITHOUT_PERSONA_KIND.length,
    );
  });

  it("names only real professions", () => {
    const unknown = [...mapped, ...PROFESSIONS_WITHOUT_PERSONA_KIND].filter(
      (id) => !listedProfessions.includes(id),
    );
    expect(unknown).toEqual([]);
  });

  it("never mentions a profession from an unlisted field", () => {
    for (const id of unlistedProfessions) {
      expect(mapped).not.toContain(id);
      expect(PROFESSIONS_WITHOUT_PERSONA_KIND).not.toContain(id);
    }
  });

  it("points only at real kinds, with at least one each and no repeats", () => {
    for (const [professionId, kinds] of Object.entries(
      PERSONA_KINDS_BY_PROFESSION,
    )) {
      expect(kinds.length, professionId).toBeGreaterThan(0);
      expect(new Set(kinds).size, professionId).toBe(kinds.length);
      for (const kind of kinds) {
        expect(Object.keys(KIND_SECTIONS), professionId).toContain(kind);
      }
    }
  });

  it("sends content creators and radio presenters to the new kinds", () => {
    expect(PERSONA_KINDS_BY_PROFESSION.contentCreator?.[0]).toBe(
      "video_creator",
    );
    expect(PERSONA_KINDS_BY_PROFESSION.radioPresenter?.[0]).toBe("radio_host");
    expect(PERSONA_KINDS_BY_PROFESSION.podcaster?.[0]).toBe("podcaster");
  });
});

describe("personaKindsForProfessions", () => {
  it("keeps the member's order, then the map's, without repeats", () => {
    expect(
      personaKindsForProfessions(["radioPresenter", "podcaster", "dj"]),
    ).toEqual(["radio_host", "podcaster", "podcast_producer", "dj"]);
  });

  it("skips unmapped and unknown ids", () => {
    expect(personaKindsForProfessions(["accountant", "nope"])).toEqual([]);
  });

  it("never suggests anything for an unlisted field", () => {
    expect(personaKindsForProfessions(unlistedProfessions)).toEqual([]);
  });
});
