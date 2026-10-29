import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { ListingDraft } from "./listBusiness.data";
import {
  emptyMenuDraft,
  MAX_LISTING_MENU_ITEMS,
  MAX_LISTING_MENU_SUBSECTIONS,
  newMenuItemRow,
  newMenuSectionRow,
  newMenuSubsectionRow,
  type ListingMenuDraft,
  type ListingMenuSectionRow,
} from "./listingMenu.data";
import { useMenuSubsectionSetters } from "./useMenuSubsectionSetters";

function namedItem(name: string) {
  return { ...newMenuItemRow(), name };
}

function sectionWithSubsections(titles: string[]): ListingMenuSectionRow {
  return {
    ...newMenuSectionRow(),
    title: "Wines",
    subsections: titles.map((title) => ({
      ...newMenuSubsectionRow(),
      title,
    })),
  };
}

function setup(sections: ListingMenuSectionRow[]) {
  const menu: ListingMenuDraft = { ...emptyMenuDraft(), sections };
  return renderHook(() => {
    const [draft, setDraft] = useState(() => ({ menu }) as ListingDraft);
    return { draft, setters: useMenuSubsectionSetters(setDraft) };
  });
}

function sectionOf(result: { current: { draft: ListingDraft } }, index = 0) {
  return result.current.draft.menu!.sections[index]!;
}

describe("useMenuSubsectionSetters sub-sections", () => {
  it("adds a sub-section with one blank item to the right section only", () => {
    const first = sectionWithSubsections([]);
    const second = sectionWithSubsections([]);
    const { result } = setup([first, second]);
    act(() => result.current.setters.addMenuSubsection(second.id));
    expect(sectionOf(result, 0).subsections).toHaveLength(0);
    expect(sectionOf(result, 1).subsections).toHaveLength(1);
    expect(sectionOf(result, 1).subsections[0]!.items).toHaveLength(1);
  });

  it("does not add a ninth sub-section", () => {
    const titles = Array.from(
      { length: MAX_LISTING_MENU_SUBSECTIONS },
      (_, index) => `Sub ${index}`,
    );
    const section = sectionWithSubsections(titles);
    const { result } = setup([section]);
    const before = sectionOf(result).subsections;
    act(() => result.current.setters.addMenuSubsection(section.id));
    expect(sectionOf(result).subsections).toBe(before);
  });

  it("does not add a sub-section once the item ceiling is reached", () => {
    const section = sectionWithSubsections(["Red"]);
    section.items = Array.from({ length: MAX_LISTING_MENU_ITEMS - 1 }, () =>
      newMenuItemRow(),
    );
    const { result } = setup([section]);
    act(() => result.current.setters.addMenuSubsection(section.id));
    expect(sectionOf(result).subsections).toHaveLength(1);
  });

  it("sets a sub-section title by id", () => {
    const section = sectionWithSubsections(["Red", "White"]);
    const white = section.subsections[1]!;
    const { result } = setup([section]);
    act(() =>
      result.current.setters.setMenuSubsectionTitle(
        section.id,
        white.id,
        "Rosé",
      ),
    );
    expect(sectionOf(result).subsections.map((row) => row.title)).toEqual([
      "Red",
      "Rosé",
    ]);
  });

  it("removes a sub-section by id", () => {
    const section = sectionWithSubsections(["Red", "White"]);
    const { result } = setup([section]);
    act(() =>
      result.current.setters.removeMenuSubsection(
        section.id,
        section.subsections[0]!.id,
      ),
    );
    expect(sectionOf(result).subsections.map((row) => row.title)).toEqual([
      "White",
    ]);
  });

  it("moves a sub-section down and back up", () => {
    const section = sectionWithSubsections(["Red", "White", "Rosé"]);
    const red = section.subsections[0]!;
    const { result } = setup([section]);
    act(() => result.current.setters.moveMenuSubsection(section.id, red.id, 1));
    expect(sectionOf(result).subsections.map((row) => row.title)).toEqual([
      "White",
      "Red",
      "Rosé",
    ]);
    act(() =>
      result.current.setters.moveMenuSubsection(section.id, red.id, -1),
    );
    expect(sectionOf(result).subsections.map((row) => row.title)).toEqual([
      "Red",
      "White",
      "Rosé",
    ]);
  });

  it("leaves the sub-section array untouched when a move goes off either end", () => {
    const section = sectionWithSubsections(["Red", "White"]);
    const { result } = setup([section]);
    const before = sectionOf(result).subsections;
    act(() =>
      result.current.setters.moveMenuSubsection(
        section.id,
        section.subsections[0]!.id,
        -1,
      ),
    );
    expect(sectionOf(result).subsections).toBe(before);
    act(() =>
      result.current.setters.moveMenuSubsection(
        section.id,
        section.subsections[1]!.id,
        1,
      ),
    );
    expect(sectionOf(result).subsections).toBe(before);
  });
});

describe("useMenuSubsectionSetters items", () => {
  it("adds an item to the right sub-section only", () => {
    const section = sectionWithSubsections(["Red", "White"]);
    const white = section.subsections[1]!;
    const { result } = setup([section]);
    act(() => result.current.setters.addSubsectionItem(section.id, white.id));
    expect(sectionOf(result).subsections[0]!.items).toHaveLength(1);
    expect(sectionOf(result).subsections[1]!.items).toHaveLength(2);
  });

  it("does not add an item once the item ceiling is reached", () => {
    const section = sectionWithSubsections(["Red"]);
    section.items = Array.from({ length: MAX_LISTING_MENU_ITEMS - 1 }, () =>
      newMenuItemRow(),
    );
    const red = section.subsections[0]!;
    const { result } = setup([section]);
    const before = sectionOf(result).subsections[0]!.items;
    act(() => result.current.setters.addSubsectionItem(section.id, red.id));
    expect(sectionOf(result).subsections[0]!.items).toBe(before);
  });

  it("patches glass and bottle prices on one item", () => {
    const section = sectionWithSubsections(["Red"]);
    const red = section.subsections[0]!;
    red.items = [namedItem("Malbec"), namedItem("Syrah")];
    const { result } = setup([section]);
    act(() =>
      result.current.setters.setSubsectionItemField(
        section.id,
        red.id,
        red.items[1]!.id,
        { priceGlass: "6.00", priceBottle: "24.00" },
      ),
    );
    const [malbec, syrah] = sectionOf(result).subsections[0]!.items;
    expect(malbec!.priceGlass).toBeUndefined();
    expect(syrah).toMatchObject({
      name: "Syrah",
      priceGlass: "6.00",
      priceBottle: "24.00",
    });
  });

  it("toggles a dietary label on and off", () => {
    const section = sectionWithSubsections(["Red"]);
    const red = section.subsections[0]!;
    const itemId = red.items[0]!.id;
    const { result } = setup([section]);
    act(() =>
      result.current.setters.toggleSubsectionItemDietary(
        section.id,
        red.id,
        itemId,
        "vegan",
      ),
    );
    expect(sectionOf(result).subsections[0]!.items[0]!.dietary).toEqual([
      "vegan",
    ]);
    act(() =>
      result.current.setters.toggleSubsectionItemDietary(
        section.id,
        red.id,
        itemId,
        "vegan",
      ),
    );
    expect(sectionOf(result).subsections[0]!.items[0]!.dietary).toEqual([]);
  });

  it("removes a sub-section item by id", () => {
    const section = sectionWithSubsections(["Red"]);
    const red = section.subsections[0]!;
    red.items = [namedItem("Malbec"), namedItem("Syrah")];
    const { result } = setup([section]);
    act(() =>
      result.current.setters.removeSubsectionItem(
        section.id,
        red.id,
        red.items[0]!.id,
      ),
    );
    expect(
      sectionOf(result).subsections[0]!.items.map((item) => item.name),
    ).toEqual(["Syrah"]);
  });

  it("moves a sub-section item, and a move off the end returns the same array", () => {
    const section = sectionWithSubsections(["Red"]);
    const red = section.subsections[0]!;
    red.items = [namedItem("Malbec"), namedItem("Syrah")];
    const { result } = setup([section]);
    const before = sectionOf(result).subsections[0]!.items;
    act(() =>
      result.current.setters.moveSubsectionItem(
        section.id,
        red.id,
        red.items[0]!.id,
        -1,
      ),
    );
    expect(sectionOf(result).subsections[0]!.items).toBe(before);
    act(() =>
      result.current.setters.moveSubsectionItem(
        section.id,
        red.id,
        red.items[0]!.id,
        1,
      ),
    );
    expect(
      sectionOf(result).subsections[0]!.items.map((item) => item.name),
    ).toEqual(["Syrah", "Malbec"]);
  });

  it("ignores ids that match no section or sub-section", () => {
    const section = sectionWithSubsections(["Red"]);
    const { result } = setup([section]);
    act(() => result.current.setters.addSubsectionItem(section.id, "missing"));
    act(() => result.current.setters.addMenuSubsection("missing"));
    expect(sectionOf(result).subsections).toHaveLength(1);
    expect(sectionOf(result).subsections[0]!.items).toHaveLength(1);
  });
});
