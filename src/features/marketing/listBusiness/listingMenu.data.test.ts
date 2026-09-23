import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import {
  applyCategoryPricingDefault,
  defaultPricingMode,
  emptyMenuDraft,
  isMenuLinkValid,
  menuForDisplay,
  menuForPayload,
  menuItemCount,
  menuSectionProblem,
  menuValid,
  moveRowById,
  pricingModeOf,
  toMenuDraft,
  type ListingMenuDraft,
} from "./listingMenu.data";

function menuWith(
  sections: { title: string; items: { name: string; price: string }[] }[],
): ListingMenuDraft {
  return toMenuDraft({
    sections: sections.map((section) => ({
      title: section.title,
      items: section.items.map((item) => ({
        ...item,
        description: "",
        dietary: [],
      })),
    })),
    file: null,
    link: "",
  });
}

describe("defaultPricingMode", () => {
  it("picks menu for food and nightlife, including legacy labels", () => {
    expect(defaultPricingMode(["food"])).toBe("menu");
    expect(defaultPricingMode(["Food & drink"])).toBe("menu");
    expect(defaultPricingMode(["bar"])).toBe("menu");
    expect(defaultPricingMode(["grooming"])).toBe("services");
    expect(defaultPricingMode([])).toBe("services");
  });
});

describe("pricingModeOf", () => {
  it("falls back to the category default when a legacy draft has no mode", () => {
    expect(pricingModeOf({ cats: ["food"] })).toBe("menu");
    expect(pricingModeOf({ cats: ["food"], pricingMode: "services" })).toBe(
      "services",
    );
    expect(pricingModeOf({ cats: ["food"], pricingMode: "bogus" })).toBe(
      "menu",
    );
  });
});

describe("toMenuDraft", () => {
  it("adopts nothing as an empty menu", () => {
    const menu = toMenuDraft(undefined);
    expect(menu.sections).toEqual([]);
    expect(menu.file).toBeNull();
    expect(menu.link).toBe("");
  });

  it("mints a unique id per section and per item and drops unknown dietary labels", () => {
    const menu = toMenuDraft({
      sections: [
        {
          title: "Coffee",
          items: [
            {
              name: "Bica",
              price: "1",
              description: "",
              dietary: ["vegan", "halal"],
            },
          ],
        },
      ],
      file: null,
      link: "",
    });
    expect(menu.sections[0]!.id).toBeTruthy();
    expect(menu.sections[0]!.items[0]!.id).toBeTruthy();
    expect(menu.sections[0]!.items[0]!.dietary).toEqual(["vegan"]);
  });
});

describe("validity", () => {
  it("flags a section with a started item and no title", () => {
    const menu = menuWith([
      { title: " ", items: [{ name: "Bica", price: "1" }] },
    ]);
    expect(menuSectionProblem(menu.sections[0]!)).toBe("title");
    expect(menuValid(menu)).toBe(false);
  });

  it("does not flag an untitled section whose items are all blank", () => {
    const menu = menuWith([{ title: "", items: [{ name: "", price: "" }] }]);
    expect(menuValid(menu)).toBe(true);
  });

  it("flags an item with a name and no price", () => {
    expect(
      menuValid(
        menuWith([{ title: "Coffee", items: [{ name: "Bica", price: "" }] }]),
      ),
    ).toBe(false);
  });

  it("counts items across sections, blank rows included", () => {
    const menu = menuWith([
      {
        title: "A",
        items: [
          { name: "x", price: "1" },
          { name: "", price: "" },
        ],
      },
      { title: "B", items: [{ name: "y", price: "2" }] },
    ]);
    expect(menuItemCount(menu)).toBe(3);
  });
});

describe("menuForPayload", () => {
  it("strips ids, trims, drops blank items and empty sections", () => {
    const menu = menuWith([
      {
        title: " Coffee ",
        items: [
          { name: " Bica ", price: " 1 " },
          { name: "", price: "" },
        ],
      },
      { title: "Empty", items: [{ name: "", price: "" }] },
    ]);
    expect(menuForPayload(menu)).toEqual({
      sections: [
        {
          title: "Coffee",
          items: [{ name: "Bica", price: "1", description: "", dietary: [] }],
        },
      ],
      file: null,
      link: "",
    });
  });

  it("drops incomplete items and untitled sections when told to", () => {
    const menu = menuWith([
      {
        title: "Coffee",
        items: [
          { name: "Bica", price: "" },
          { name: "Galão", price: "1.60" },
        ],
      },
      { title: "", items: [{ name: "Nata", price: "1.30" }] },
    ]);
    expect(
      menuForPayload(menu, { shouldDropIncomplete: true }).sections,
    ).toEqual([
      {
        title: "Coffee",
        items: [{ name: "Galão", price: "1.60", description: "", dietary: [] }],
      },
    ]);
  });
});

describe("isMenuLinkValid", () => {
  it("accepts an empty link, the field being optional", () => {
    expect(isMenuLinkValid("")).toBe(true);
    expect(isMenuLinkValid("   ")).toBe(true);
  });

  it("accepts a domain-only link with no scheme", () => {
    expect(isMenuLinkValid("cafe.pt/menu")).toBe(true);
  });

  it("accepts a link with an explicit scheme", () => {
    expect(isMenuLinkValid("https://cafe.pt/menu")).toBe(true);
  });

  it("rejects text that is not a web address", () => {
    expect(isMenuLinkValid("not a link")).toBe(false);
  });
});

describe("menuForDisplay", () => {
  it("keeps file.contentType, unlike menuForPayload", () => {
    const menu = menuForDisplay({
      sections: [],
      file: {
        url: "listing-menus/a/b.pdf",
        contentType: "application/pdf",
        fileName: "Menu.pdf",
      },
      link: "",
    });
    expect(menu.file).toEqual({
      url: "listing-menus/a/b.pdf",
      contentType: "application/pdf",
      fileName: "Menu.pdf",
    });
  });

  it("drops incomplete items and untitled sections, like the hidden payload", () => {
    const menu = menuForDisplay({
      sections: [
        {
          title: "Coffee",
          items: [{ name: "Bica", price: "", description: "", dietary: [] }],
        },
      ],
      file: null,
      link: "",
    });
    expect(menu.sections).toEqual([]);
  });
});

describe("applyCategoryPricingDefault", () => {
  it("re-defaults the mode when categories change and nothing is typed", () => {
    const previous = { ...blankDraft(), cats: [] as string[] };
    const next = applyCategoryPricingDefault(previous, {
      ...previous,
      cats: ["food"],
    });
    expect(next.pricingMode).toBe("menu");
  });

  it("keeps the owner's mode once either list has content", () => {
    const previous = {
      ...blankDraft(),
      pricingMode: "services" as const,
      menu: menuWith([
        { title: "Coffee", items: [{ name: "Bica", price: "1" }] },
      ]),
    };
    const next = applyCategoryPricingDefault(previous, {
      ...previous,
      cats: ["grooming"],
    });
    expect(next.pricingMode).toBe("services");
  });

  it("leaves the draft alone when categories did not change", () => {
    const previous = {
      ...blankDraft(),
      cats: ["food"],
      pricingMode: "services" as const,
    };
    const next = applyCategoryPricingDefault(previous, {
      ...previous,
      name: "Café",
    });
    expect(next.pricingMode).toBe("services");
  });
});

describe("moveRowById", () => {
  it("swaps with the neighbour and no-ops off either end", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(moveRowById(rows, "b", -1).map((row) => row.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(moveRowById(rows, "a", -1)).toBe(rows);
    expect(moveRowById(rows, "c", 1)).toBe(rows);
  });
});

it("emptyMenuDraft returns a fresh object each call", () => {
  expect(emptyMenuDraft()).not.toBe(emptyMenuDraft());
});
