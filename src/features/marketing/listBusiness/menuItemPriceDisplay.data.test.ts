import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import type { ListingMenuItem } from "./listingMenu.data";
import { menuItemPriceDisplay } from "./menuItemPriceDisplay.data";

const english = createFormatters("en");

function item(overrides: Partial<ListingMenuItem>): ListingMenuItem {
  return {
    name: "Douro",
    price: "",
    description: "",
    dietary: [],
    ...overrides,
  };
}

describe("menuItemPriceDisplay", () => {
  it("shows a plain price as a single formatted amount", () => {
    expect(
      menuItemPriceDisplay(item({ price: "4.5" }), "EUR", english),
    ).toEqual({
      kind: "single",
      text: "€4.50",
    });
  });

  it("shows nothing when there is no price of any kind", () => {
    expect(menuItemPriceDisplay(item({}), "EUR", english)).toEqual({
      kind: "none",
    });
    expect(
      menuItemPriceDisplay(
        item({ price: " ", priceGlass: " ", priceBottle: "" }),
        "EUR",
        english,
      ),
    ).toEqual({ kind: "none" });
  });

  it("shows glass and bottle together, in the menu currency", () => {
    expect(
      menuItemPriceDisplay(
        item({ priceGlass: "12", priceBottle: "48.5" }),
        "GBP",
        english,
      ),
    ).toEqual({ kind: "glassBottle", glass: "£12.00", bottle: "£48.50" });
  });

  it("shows a lone glass price as glass only", () => {
    expect(
      menuItemPriceDisplay(item({ priceGlass: "5" }), "EUR", english),
    ).toEqual({ kind: "glassOnly", glass: "€5.00" });
  });

  it("shows a lone bottle price as bottle only", () => {
    expect(
      menuItemPriceDisplay(
        item({ priceGlass: "", priceBottle: "30" }),
        "EUR",
        english,
      ),
    ).toEqual({ kind: "bottleOnly", bottle: "€30.00" });
  });

  it("lets a glass or bottle price win over the price", () => {
    expect(
      menuItemPriceDisplay(
        item({ price: "9", priceBottle: "30" }),
        "EUR",
        english,
      ),
    ).toEqual({ kind: "bottleOnly", bottle: "€30.00" });
  });

  it("shows a legacy free-text price as written", () => {
    expect(
      menuItemPriceDisplay(item({ price: " 4 EUR / 7 EUR " }), "EUR", english),
    ).toEqual({ kind: "single", text: "4 EUR / 7 EUR" });
    expect(
      menuItemPriceDisplay(
        item({ priceGlass: "market price" }),
        "EUR",
        english,
      ),
    ).toEqual({ kind: "glassOnly", glass: "market price" });
  });
});
