import { describe, expect, it } from "vitest";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../../api/subprofiles.adapters";
import type { SubprofileSection } from "../../api/subprofiles.api";
import { TATTOO_MAIN_BLOCKS } from "./tattooView";
import { TATTOO_LIGHTBOX_SECTIONS, getTattooWorks } from "./tattooWorks";

// Unrun per repo policy: verified statically.

function makeItem(
  id: string,
  section: SubprofileSection,
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView {
  return {
    id,
    section,
    title: id,
    createdAt: "2026-10-01T00:00:00.000Z",
    subtitle: "",
    description: "",
    url: "",
    imageUrl: `${id}.jpg`,
    date: "",
    meta: "",
    tags: [],
    isFeatured: false,
    collaborators: [],
    venue: null,
    doors: null,
    ticketUrl: null,
    gigState: null,
    medium: null,
    dimensions: null,
    edition: null,
    workState: null,
    structured: null,
    ...overrides,
  };
}

function makeSection(
  section: SubprofileSection,
  items: SubprofileItemView[],
): SubprofileSectionView {
  return {
    section,
    labelKey: `subprofiles:section.${section}`,
    icon: (() => null) as never,
    fields: [],
    items,
  };
}

const BLOCK_FOR_SECTION: Partial<Record<SubprofileSection, string>> = {
  flash: "flash",
  healed: "healed",
  scar_work: "scarWork",
  cover_ups: "coverUps",
  wanna_dos: "wannaDos",
  flash_days: "flashDays",
  shop: "shop",
};

describe("getTattooWorks", () => {
  it("lists the lightbox sections in the page's block order", () => {
    const blockPositions = TATTOO_LIGHTBOX_SECTIONS.map((section) =>
      TATTOO_MAIN_BLOCKS.indexOf(
        BLOCK_FOR_SECTION[section] as (typeof TATTOO_MAIN_BLOCKS)[number],
      ),
    );
    expect(blockPositions.every((position) => position >= 0)).toBe(true);
    expect([...blockPositions].sort((first, second) => first - second)).toEqual(
      blockPositions,
    );
  });

  it("orders plates by page block whatever the stored section order", () => {
    const sections = [
      makeSection("shop", [makeItem("print", "shop")]),
      makeSection("wanna_dos", [makeItem("snake", "wanna_dos")]),
      makeSection("cover_ups", [makeItem("rose", "cover_ups")]),
      makeSection("healed", [makeItem("fern", "healed")]),
      makeSection("flash", [
        makeItem("moth", "flash"),
        makeItem("bee", "flash"),
      ]),
      makeSection("scar_work", [makeItem("vine", "scar_work")]),
    ];
    expect(getTattooWorks(sections, null).map((item) => item.id)).toEqual([
      "moth",
      "bee",
      "fern",
      "vine",
      "rose",
      "snake",
      "print",
    ]);
  });

  it("leaves out items with no photo and the starred item", () => {
    const starred = makeItem("starred", "flash");
    const sections = [
      makeSection("flash", [starred, makeItem("moth", "flash")]),
      makeSection("wanna_dos", [
        makeItem("idea", "wanna_dos", { imageUrl: "" }),
        makeItem("snake", "wanna_dos"),
      ]),
      makeSection("healed", [
        makeItem("flagged", "healed", { isFeatured: true }),
      ]),
    ];
    expect(getTattooWorks(sections, starred.id).map((item) => item.id)).toEqual(
      ["moth", "snake"],
    );
  });

  it("keeps each item's identity so a tile resolves by indexOf", () => {
    const moth = makeItem("moth", "flash");
    const works = getTattooWorks([makeSection("flash", [moth])], null);
    expect(works.indexOf(moth)).toBe(0);
  });

  it("skips the gallery, which has its own lightbox", () => {
    const sections = [
      makeSection("gallery", [makeItem("photo", "gallery")]),
      makeSection("flash", [makeItem("moth", "flash")]),
    ];
    expect(getTattooWorks(sections, null).map((item) => item.id)).toEqual([
      "moth",
    ]);
  });
});
