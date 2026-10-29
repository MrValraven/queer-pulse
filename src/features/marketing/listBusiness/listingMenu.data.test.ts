import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import {
  applyCategoryPricingDefault,
  defaultPricingMode,
  emptyMenuDraft,
  isBlankMenuItem,
  isMenuLinkValid,
  menuForDisplay,
  menuForPayload,
  menuItemCount,
  menuItemProblem,
  menuSectionProblem,
  menuSubsectionProblem,
  menuValid,
  moveRowById,
  newMenuSectionRow,
  newMenuSubsectionRow,
  hasPricingContent,
  pricingModeOf,
  toMenuDraft,
  withMenuSubsections,
  type ListingMenu,
  type ListingMenuDraft,
} from "./listingMenu.data";

type SubsectionItemInput = {
  name: string;
  price?: string;
  priceGlass?: string;
  priceBottle?: string;
};

/** A wine menu: one "Wines" section holding the given sub-sections. */
function menuWithSubsections(
  subsections: { title: string; items: SubsectionItemInput[] }[],
  sectionTitle = "Wines",
): ListingMenuDraft {
  return toMenuDraft({
    sections: [
      {
        title: sectionTitle,
        items: [],
        subsections: subsections.map((subsection) => ({
          title: subsection.title,
          items: subsection.items.map((item) => ({
            price: "",
            priceGlass: "",
            priceBottle: "",
            ...item,
            description: "",
            dietary: [],
          })),
        })),
      },
    ],
    file: null,
    link: "",
  });
}

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

describe("newMenuSectionRow and newMenuSubsectionRow", () => {
  it("starts a section with one blank item and no sub-sections", () => {
    const section = newMenuSectionRow();
    expect(section.items).toHaveLength(1);
    expect(section.subsections).toEqual([]);
  });

  it("starts a sub-section with one blank item holding empty glass and bottle prices", () => {
    const subsection = newMenuSubsectionRow();
    expect(subsection.title).toBe("");
    expect(subsection.items).toHaveLength(1);
    expect(subsection.items[0]).toMatchObject({
      name: "",
      price: "",
      priceGlass: "",
      priceBottle: "",
    });
  });
});

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
    expect(menu.currency).toBe("EUR");
  });

  it("adopts a known currency and falls back to EUR for anything else", () => {
    expect(toMenuDraft({ currency: "BRL" }).currency).toBe("BRL");
    expect(toMenuDraft({ currency: "JPY" }).currency).toBe("EUR");
    expect(toMenuDraft({ currency: 5 }).currency).toBe("EUR");
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

  it("gives a menu saved before sub-sections an empty sub-section list", () => {
    const menu = toMenuDraft({
      sections: [{ title: "Coffee", items: [] }],
    });
    expect(menu.sections[0]!.subsections).toEqual([]);
  });

  it("adopts sub-sections, their items and their glass and bottle prices", () => {
    const menu = toMenuDraft({
      sections: [
        {
          title: "Wines",
          items: [],
          subsections: [
            {
              title: "Red",
              items: [
                {
                  name: "Douro",
                  price: "",
                  priceGlass: "4.50",
                  priceBottle: 7,
                  description: "",
                  dietary: ["vegan"],
                },
              ],
            },
            "junk",
          ],
        },
      ],
    });
    const [red, junk] = menu.sections[0]!.subsections;
    expect(red!.title).toBe("Red");
    expect(red!.id).toBeTruthy();
    expect(red!.items[0]).toMatchObject({
      name: "Douro",
      priceGlass: "4.50",
      priceBottle: "",
      dietary: ["vegan"],
    });
    expect(junk).toMatchObject({ title: "", items: [] });
    expect(red!.id).not.toBe(junk!.id);
  });

  it("keeps no glass or bottle price on a direct item", () => {
    const menu = toMenuDraft({
      sections: [
        {
          title: "Coffee",
          items: [{ name: "Bica", price: "1", priceGlass: "2" }],
        },
      ],
    });
    expect(menu.sections[0]!.items[0]).not.toHaveProperty("priceGlass");
  });
});

describe("withMenuSubsections", () => {
  it("adds an empty sub-section list to a section saved before sub-sections", () => {
    const legacy = {
      sections: [{ title: "Coffee", items: [] }],
      file: null,
      link: "",
      currency: "EUR",
    } as unknown as ListingMenu;
    const healed = withMenuSubsections(legacy);
    expect(healed.sections[0]!.subsections).toEqual([]);
    expect(healed.currency).toBe("EUR");
  });

  it("keeps the sub-sections a section already holds", () => {
    const subsections = [{ title: "Red", items: [] }];
    const menu: ListingMenu = {
      sections: [{ title: "Wines", items: [], subsections }],
      file: null,
      link: "",
      currency: "EUR",
    };
    expect(withMenuSubsections(menu).sections[0]!.subsections).toEqual(
      subsections,
    );
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

  it("names a price made only of separators as a format problem", () => {
    const item = (price: string) => ({
      name: "Bica",
      price,
      description: "",
      dietary: [],
    });
    expect(menuItemProblem(item("."))).toBe("priceFormat");
    expect(menuItemProblem(item(""))).toBe("price");
    expect(menuItemProblem({ ...item("1"), name: " " })).toBe("name");
    expect(menuItemProblem(item("2.5"))).toBeNull();
  });

  it("accepts a legacy free-text price, which saves unchanged", () => {
    const item = {
      name: "Menu of the day",
      price: "4 EUR / 7 EUR",
      description: "",
      dietary: [],
    };
    expect(menuItemProblem(item)).toBeNull();
    expect(
      menuValid(
        menuWith([
          { title: "Lunch", items: [{ name: "Soup", price: "market price" }] },
        ]),
      ),
    ).toBe(true);
  });

  it("treats an item with only a glass or a bottle price as started", () => {
    const item = {
      name: "",
      price: "",
      priceGlass: "5",
      description: "",
      dietary: [],
    };
    expect(isBlankMenuItem(item)).toBe(false);
    expect(isBlankMenuItem({ ...item, priceGlass: " " })).toBe(true);
    expect(isBlankMenuItem({ ...item, priceGlass: "", priceBottle: "9" })).toBe(
      false,
    );
  });

  it("checks a sub-section item per scope", () => {
    const item = {
      name: "Douro",
      price: "",
      priceGlass: "",
      priceBottle: "",
      description: "",
      dietary: [],
    };
    expect(menuItemProblem(item)).toBe("price");
    expect(menuItemProblem(item, "subsection")).toBeNull();
    expect(
      menuItemProblem({ ...item, priceGlass: "4.5" }, "subsection"),
    ).toBeNull();
    expect(
      menuItemProblem({ ...item, name: " ", priceGlass: "4.5" }, "subsection"),
    ).toBe("name");
    expect(
      menuItemProblem({ ...item, name: "", priceBottle: "20" }, "subsection"),
    ).toBe("name");
    expect(menuItemProblem({ ...item, priceGlass: "." }, "subsection")).toBe(
      "glassFormat",
    );
    expect(menuItemProblem({ ...item, priceBottle: "," }, "subsection")).toBe(
      "bottleFormat",
    );
    expect(
      menuItemProblem(
        { ...item, priceGlass: "glass of the day" },
        "subsection",
      ),
    ).toBeNull();
  });

  it("flags a sub-section with a started item and no title", () => {
    const menu = menuWithSubsections([
      { title: " ", items: [{ name: "Douro", priceGlass: "4.50" }] },
    ]);
    const subsection = menu.sections[0]!.subsections[0]!;
    expect(menuSubsectionProblem(subsection)).toBe("title");
    expect(menuValid(menu)).toBe(false);
  });

  it("does not flag an untitled sub-section whose items are all blank", () => {
    const menu = menuWithSubsections([{ title: "", items: [{ name: "" }] }]);
    expect(menuSubsectionProblem(menu.sections[0]!.subsections[0]!)).toBeNull();
    expect(menuValid(menu)).toBe(true);
  });

  it("asks an untitled section for a title when only a sub-section item is started", () => {
    const menu = menuWithSubsections(
      [{ title: "Red", items: [{ name: "Douro", priceBottle: "20" }] }],
      " ",
    );
    expect(menuSectionProblem(menu.sections[0]!)).toBe("title");
    expect(menuValid(menu)).toBe(false);
  });

  it("accepts a sub-section item with no price at all", () => {
    expect(
      menuValid(
        menuWithSubsections([{ title: "Red", items: [{ name: "Douro" }] }]),
      ),
    ).toBe(true);
  });

  it("is invalid when a sub-section item has a bad glass price", () => {
    expect(
      menuValid(
        menuWithSubsections([
          { title: "Red", items: [{ name: "Douro", priceGlass: "." }] },
        ]),
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

  it("counts sub-section items too", () => {
    const menu = menuWithSubsections([
      { title: "Red", items: [{ name: "Douro" }, { name: "" }] },
      { title: "White", items: [{ name: "Vinho Verde" }] },
    ]);
    menu.sections[0]!.items = [
      ...menuWith([{ title: "x", items: [{ name: "Water", price: "1" }] }])
        .sections[0]!.items,
    ];
    expect(menuItemCount(menu)).toBe(4);
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
          subsections: [],
        },
      ],
      file: null,
      link: "",
      currency: "EUR",
    });
  });

  it("writes plain amounts in canonical form and keeps legacy text verbatim", () => {
    const menu = {
      ...menuWith([
        {
          title: "Coffee",
          items: [
            { name: "Bica", price: "1.5" },
            { name: "Galão", price: "2." },
            { name: "Nata", price: ".5" },
            { name: "Special", price: " market price " },
          ],
        },
      ]),
      currency: "GBP" as const,
    };
    const payload = menuForPayload(menu);
    expect(payload.currency).toBe("GBP");
    expect(payload.sections[0]!.items.map((item) => item.price)).toEqual([
      "1.50",
      "2",
      "0.50",
      "market price",
    ]);
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
        subsections: [],
      },
    ]);
  });

  it("sends a sub-section with canonical glass and bottle prices", () => {
    const menu = menuWithSubsections([
      {
        title: " Red ",
        items: [
          { name: " Douro ", priceGlass: " 4.5 ", priceBottle: "18," },
          { name: "Dão", priceBottle: "22" },
          { name: "House red", priceGlass: "glass of the day" },
        ],
      },
    ]);
    expect(menuForPayload(menu).sections).toEqual([
      {
        title: "Wines",
        items: [],
        subsections: [
          {
            title: "Red",
            items: [
              {
                name: "Douro",
                price: "",
                priceGlass: "4.50",
                priceBottle: "18",
                description: "",
                dietary: [],
              },
              {
                name: "Dão",
                price: "",
                priceBottle: "22",
                description: "",
                dietary: [],
              },
              {
                name: "House red",
                price: "",
                priceGlass: "glass of the day",
                description: "",
                dietary: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("omits empty glass and bottle keys", () => {
    const menu = menuWithSubsections([
      { title: "Red", items: [{ name: "Douro", price: "9", priceGlass: " " }] },
    ]);
    const item = menuForPayload(menu).sections[0]!.subsections[0]!.items[0]!;
    expect(item).not.toHaveProperty("priceGlass");
    expect(item).not.toHaveProperty("priceBottle");
    expect(item.price).toBe("9");
  });

  it("never sends a glass or bottle price on a direct item", () => {
    const menu = menuWith([
      { title: "Coffee", items: [{ name: "Bica", price: "1" }] },
    ]);
    menu.sections[0]!.items[0] = {
      ...menu.sections[0]!.items[0]!,
      priceGlass: "2",
      priceBottle: "3",
    };
    const item = menuForPayload(menu).sections[0]!.items[0]!;
    expect(item).not.toHaveProperty("priceGlass");
    expect(item).not.toHaveProperty("priceBottle");
  });

  it("drops an empty sub-section and keeps a section that only has sub-sections", () => {
    const menu = menuWithSubsections([
      { title: "Empty", items: [{ name: "" }] },
      { title: "Red", items: [{ name: "Douro", priceGlass: "4" }] },
    ]);
    const sections = menuForPayload(menu).sections;
    expect(sections).toHaveLength(1);
    expect(sections[0]!.items).toEqual([]);
    expect(
      sections[0]!.subsections.map((subsection) => subsection.title),
    ).toEqual(["Red"]);
  });

  it("drops a section whose sub-sections are all empty", () => {
    const menu = menuWithSubsections([{ title: "Red", items: [{ name: "" }] }]);
    expect(menuForPayload(menu).sections).toEqual([]);
  });

  it("drops incomplete sub-section items and untitled sub-sections when told to", () => {
    const menu = menuWithSubsections([
      {
        title: "Red",
        items: [
          { name: "", priceGlass: "4" },
          { name: "Bad glass", priceGlass: "." },
          { name: "Douro", priceGlass: "4" },
        ],
      },
      { title: "", items: [{ name: "Dão", priceBottle: "20" }] },
    ]);
    const sections = menuForPayload(menu, {
      shouldDropIncomplete: true,
    }).sections;
    expect(sections).toHaveLength(1);
    expect(sections[0]!.subsections).toHaveLength(1);
    expect(sections[0]!.subsections[0]!.title).toBe("Red");
    expect(sections[0]!.subsections[0]!.items.map((item) => item.name)).toEqual(
      ["Douro"],
    );
  });

  it("drops a section that loses its only sub-section to the incomplete filter", () => {
    const menu = menuWithSubsections([
      { title: "", items: [{ name: "Dão", priceBottle: "20" }] },
    ]);
    expect(
      menuForPayload(menu, { shouldDropIncomplete: true }).sections,
    ).toEqual([]);
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

  it("carries the currency through", () => {
    expect(menuForDisplay({ sections: [], currency: "CHF" }).currency).toBe(
      "CHF",
    );
    expect(menuForDisplay(undefined).currency).toBe("EUR");
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

  it("round-trips sub-sections through the display shape", () => {
    const wire = menuForPayload(
      menuWithSubsections([
        {
          title: "Red",
          items: [{ name: "Douro", priceGlass: "4.50", priceBottle: "18.00" }],
        },
      ]),
    );
    const displayed = menuForDisplay(wire);
    expect(displayed.sections).toEqual(wire.sections);
  });

  it("gives a menu without sub-sections an empty list on every section", () => {
    const menu = menuForDisplay({
      sections: [
        {
          title: "Coffee",
          items: [{ name: "Bica", price: "1", description: "", dietary: [] }],
        },
      ],
    });
    expect(menu.sections[0]!.subsections).toEqual([]);
  });
});

describe("hasPricingContent", () => {
  it("counts a sub-section item as menu content", () => {
    const menu = menuWithSubsections([
      { title: "", items: [{ name: "", priceBottle: "20" }] },
    ]);
    menu.sections[0]!.title = "";
    expect(hasPricingContent({ menu })).toBe(true);
  });

  it("counts a typed sub-section title", () => {
    const menu = menuWithSubsections([{ title: "Red", items: [{ name: "" }] }]);
    menu.sections[0]!.title = "";
    expect(hasPricingContent({ menu })).toBe(true);
  });

  it("is false for blank sub-sections", () => {
    const menu = menuWithSubsections([{ title: "", items: [{ name: "" }] }]);
    menu.sections[0]!.title = "";
    expect(hasPricingContent({ menu })).toBe(false);
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
