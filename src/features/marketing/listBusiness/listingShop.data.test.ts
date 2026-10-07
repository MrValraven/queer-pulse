import { describe, expect, it } from "vitest";
import {
  effectivePricingMode,
  pricingModeChoices,
  shopItemProblem,
  shopItemsForPayload,
  shopPhotoDisplayUrl,
  toShopItemRows,
} from "./listingShop.data";

describe("toShopItemRows", () => {
  it("keeps an id the server sent and mints one where it is missing", () => {
    const rows = toShopItemRows([
      { id: "item-1", name: "Zine", price: "6 EUR", link: "", photo: null },
      { name: "Tote" },
    ]);
    expect(rows[0]?.id).toBe("item-1");
    expect(rows[1]?.id).toMatch(/[0-9a-f-]{36}/);
    expect(rows[1]?.photo).toBeNull();
  });

  it("reads a missing list as none and caps at six", () => {
    expect(toShopItemRows(undefined)).toEqual([]);
    expect(
      toShopItemRows(Array.from({ length: 9 }, () => ({ name: "x" }))),
    ).toHaveLength(6);
  });
});

describe("shopItemProblem", () => {
  const item = { id: "a", name: "Zine", price: "", link: "", photo: null };

  it("never flags a blank row", () => {
    expect(shopItemProblem({ ...item, name: "" })).toBeNull();
  });

  it("asks for a name once anything else is filled", () => {
    expect(shopItemProblem({ ...item, name: "", price: "6 EUR" })).toBe("name");
  });

  it("flags a link that is no web address", () => {
    expect(shopItemProblem({ ...item, link: "not a link" })).toBe("link");
    expect(shopItemProblem({ ...item, link: "fiosolto.pt/zine" })).toBeNull();
    expect(shopItemProblem({ ...item, link: "fiosolto.pt/a\\zine" })).toBe(
      "link",
    );
  });
});

describe("shopItemsForPayload", () => {
  const rows = [
    { id: "a", name: " Zine ", price: " 6 EUR ", link: "", photo: null },
    { id: "b", name: "", price: "", link: "", photo: null },
    { id: "c", name: "", price: "9 EUR", link: "", photo: null },
  ];

  it("drops blank rows and trims, keeping ids", () => {
    expect(shopItemsForPayload(rows, { shouldDropIncomplete: false })).toEqual([
      { id: "a", name: "Zine", price: "6 EUR", link: "", photo: null },
      { id: "c", name: "", price: "9 EUR", link: "", photo: null },
    ]);
  });

  it("also drops rows with a problem while the shop is the hidden list", () => {
    expect(
      shopItemsForPayload(rows, { shouldDropIncomplete: true }).map(
        (row) => row.id,
      ),
    ).toEqual(["a"]);
  });
});

describe("the pricing mode a listing can have", () => {
  it("falls back from shop to the category default once nothing sells online", () => {
    expect(
      effectivePricingMode({
        pricingMode: "shop",
        cats: ["food"],
        online: false,
      }),
    ).toBe("menu");
    expect(
      effectivePricingMode({
        pricingMode: "shop",
        cats: ["food"],
        online: false,
        hasOnlineShop: true,
      }),
    ).toBe("shop");
  });

  it("offers services and shop online, all three to a place that sells online", () => {
    expect(pricingModeChoices({ cats: [], online: true })).toEqual([
      "services",
      "shop",
    ]);
    expect(
      pricingModeChoices({ cats: [], online: false, hasOnlineShop: true }),
    ).toEqual(["services", "menu", "shop"]);
    expect(pricingModeChoices({ cats: [], online: false })).toEqual([
      "services",
      "menu",
    ]);
  });

  it("keeps a stored menu offered on an online listing until it is switched away", () => {
    expect(
      pricingModeChoices({ pricingMode: "menu", cats: ["food"], online: true }),
    ).toEqual(["services", "shop", "menu"]);
  });
});

describe("shopPhotoDisplayUrl", () => {
  it("passes a served or local URL through and resolves a bare key", () => {
    expect(shopPhotoDisplayUrl("https://x.pt/a.jpg")).toBe(
      "https://x.pt/a.jpg",
    );
    expect(shopPhotoDisplayUrl("blob:abc")).toBe("blob:abc");
    expect(shopPhotoDisplayUrl("listing-photos/a.jpg")).toMatch(
      /\/files\/listing-photos\/a\.jpg$/,
    );
    expect(shopPhotoDisplayUrl("")).toBeNull();
  });
});
