import { describe, expect, it } from "vitest";
import {
  isWideMenuSection,
  WIDE_MENU_ITEM_NAME_LENGTH,
} from "./isWideMenuSection";
import type {
  ListingMenuItem,
  ListingMenuSection,
} from "./listBusiness/listingMenu.data";

function item(overrides: Partial<ListingMenuItem> = {}): ListingMenuItem {
  return {
    name: "Lager",
    price: "3",
    description: "",
    dietary: [],
    ...overrides,
  };
}

function section(
  overrides: Partial<ListingMenuSection> = {},
): ListingMenuSection {
  return { title: "Beer", items: [item()], subsections: [], ...overrides };
}

describe("isWideMenuSection", () => {
  it("keeps short name and price rows in one column", () => {
    expect(
      isWideMenuSection(section({ items: [item(), item({ name: "IPA" })] })),
    ).toBe(false);
  });

  it("keeps an empty section in one column", () => {
    expect(isWideMenuSection(section({ items: [] }))).toBe(false);
  });

  it("spans both columns when the section has a sub-section", () => {
    expect(
      isWideMenuSection(
        section({ subsections: [{ title: "Red", items: [item()] }] }),
      ),
    ).toBe(true);
  });

  it("spans both columns when an item has a description", () => {
    expect(
      isWideMenuSection(section({ items: [item({ description: "Cold" })] })),
    ).toBe(true);
  });

  it("ignores a blank description", () => {
    expect(
      isWideMenuSection(section({ items: [item({ description: "  " })] })),
    ).toBe(false);
  });

  it("spans both columns for a glass and bottle price pair", () => {
    expect(
      isWideMenuSection(
        section({ items: [item({ priceGlass: "5", priceBottle: "22" })] }),
      ),
    ).toBe(true);
  });

  it("stays narrow when only one of glass or bottle is set", () => {
    expect(
      isWideMenuSection(section({ items: [item({ priceGlass: "5" })] })),
    ).toBe(false);
  });

  it("spans both columns for a very long item name", () => {
    const longName = "a".repeat(WIDE_MENU_ITEM_NAME_LENGTH + 1);
    const limitName = "a".repeat(WIDE_MENU_ITEM_NAME_LENGTH);
    expect(
      isWideMenuSection(section({ items: [item({ name: longName })] })),
    ).toBe(true);
    expect(
      isWideMenuSection(section({ items: [item({ name: limitName })] })),
    ).toBe(false);
  });
});
