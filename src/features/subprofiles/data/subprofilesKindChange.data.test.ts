import { afterEach, describe, expect, it } from "vitest";
import {
  DEMO_SUBPROFILES,
  mockChangeSubprofileKind,
  mockSubprofileById,
  resetDemoEditVersionsForTests,
  resetDemoKindChangesForTests,
  toCardDto,
  toOwnerDto,
  toPublicDto,
} from "./subprofiles.data";

/**
 * A demo type change sets the persona's `kind` and leaves its items stored.
 * Every DTO the demo hands out shows only the sections the current kind
 * shows, so a switch back brings the hidden items back unchanged.
 */

const PERSONA_ID = "sp-rui-dev";

afterEach(resetDemoKindChangesForTests);
afterEach(resetDemoEditVersionsForTests);

describe("demo persona type change", () => {
  it("no demo fixture carries items outside its kind's sections", () => {
    for (const persona of DEMO_SUBPROFILES)
      expect(toOwnerDto(persona).items).toHaveLength(persona.items.length);
  });

  it("hides the old sections on every demo DTO after a switch", () => {
    const persona = DEMO_SUBPROFILES.find(
      (candidate) => candidate.id === PERSONA_ID,
    )!;
    const hiddenSectionTags = new Set(
      persona.items
        .filter(
          (item) =>
            item.section === "projects" || item.section === "open_source",
        )
        .flatMap((item) => item.tags ?? []),
    );

    mockChangeSubprofileKind(PERSONA_ID, "ceramicist");

    expect(
      toOwnerDto(persona).items.some((item) => item.section === "projects"),
    ).toBe(false);
    expect(
      toPublicDto(persona).items.some((item) => item.section === "open_source"),
    ).toBe(false);
    // Rui's open_source item carries no tags, so the card is checked for any
    // tag the hidden sections carried.
    expect(
      toCardDto(persona).tags.some((tag) => hiddenSectionTags.has(tag)),
    ).toBe(false);
  });

  it("a switch and a switch back return exactly the items shown before", () => {
    const before = mockSubprofileById(PERSONA_ID)!.items;
    mockChangeSubprofileKind(PERSONA_ID, "ceramicist");
    mockChangeSubprofileKind(PERSONA_ID, "developer");
    expect(mockSubprofileById(PERSONA_ID)!.items).toEqual(before);
  });

  it("answers null for an id the registry does not hold", () => {
    expect(mockChangeSubprofileKind("sp-missing", "dj")).toBeNull();
  });
});
