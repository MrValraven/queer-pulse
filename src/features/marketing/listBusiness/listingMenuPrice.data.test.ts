import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import {
  canonicalMenuPrice,
  DEFAULT_LISTING_MENU_CURRENCY,
  formatMenuPrice,
  isLegacyMenuPrice,
  LISTING_MENU_CURRENCIES,
  menuCurrencyAffix,
  menuCurrencyOf,
  menuCurrencyOptions,
  menuPriceForInput,
  menuPriceKind,
  sanitizeMenuPriceInput,
} from "./listingMenuPrice.data";

describe("menuCurrencyOf", () => {
  it("keeps a supported code and falls back to EUR for anything else", () => {
    expect(menuCurrencyOf("GBP")).toBe("GBP");
    expect(menuCurrencyOf("JPY")).toBe("EUR");
    expect(menuCurrencyOf("eur")).toBe("EUR");
    expect(menuCurrencyOf(undefined)).toBe("EUR");
    expect(menuCurrencyOf(null)).toBe("EUR");
    expect(menuCurrencyOf(3)).toBe("EUR");
    expect(DEFAULT_LISTING_MENU_CURRENCY).toBe("EUR");
  });
});

describe("sanitizeMenuPriceInput", () => {
  it("keeps digits and turns a comma decimal into a point", () => {
    expect(sanitizeMenuPriceInput("2,5")).toBe("2.5");
    expect(sanitizeMenuPriceInput("2.50")).toBe("2.50");
    expect(sanitizeMenuPriceInput("12")).toBe("12");
  });

  it("keeps an in-progress separator so the member can keep typing", () => {
    expect(sanitizeMenuPriceInput("2.")).toBe("2.");
    expect(sanitizeMenuPriceInput("2,")).toBe("2.");
    expect(sanitizeMenuPriceInput(".")).toBe(".");
  });

  it("treats the last separator as the decimal and drops earlier ones", () => {
    expect(sanitizeMenuPriceInput("1.234,50")).toBe("1234.50");
    expect(sanitizeMenuPriceInput("1,234.50")).toBe("1234.50");
  });

  it("strips letters, signs and spaces", () => {
    expect(sanitizeMenuPriceInput("-4 EUR")).toBe("4");
    expect(sanitizeMenuPriceInput("abc")).toBe("");
    expect(sanitizeMenuPriceInput("€ 3,5")).toBe("3.5");
  });

  it("caps at six integer digits and two fraction digits", () => {
    expect(sanitizeMenuPriceInput("12345678")).toBe("123456");
    expect(sanitizeMenuPriceInput("1.999")).toBe("1.99");
  });

  it("collapses leading zeros", () => {
    expect(sanitizeMenuPriceInput("007")).toBe("7");
    expect(sanitizeMenuPriceInput("000")).toBe("0");
    expect(sanitizeMenuPriceInput("0.5")).toBe("0.5");
    expect(sanitizeMenuPriceInput("05,5")).toBe("5.5");
  });
});

describe("menuPriceKind", () => {
  it("tells apart empty, number, incomplete and legacy", () => {
    expect(menuPriceKind("")).toBe("empty");
    expect(menuPriceKind("   ")).toBe("empty");
    expect(menuPriceKind("3")).toBe("number");
    expect(menuPriceKind("2.50")).toBe("number");
    expect(menuPriceKind("2,5")).toBe("number");
    expect(menuPriceKind("2.")).toBe("number");
    expect(menuPriceKind(".5")).toBe("number");
    expect(menuPriceKind(".")).toBe("incomplete");
    expect(menuPriceKind(",")).toBe("incomplete");
    expect(menuPriceKind("market price")).toBe("legacy");
    expect(menuPriceKind("4 EUR / 7 EUR")).toBe("legacy");
    expect(menuPriceKind("2 EUR")).toBe("legacy");
  });

  it("treats digit strings no canonical price can hold as legacy", () => {
    expect(menuPriceKind("1.2.3")).toBe("legacy");
    expect(menuPriceKind("2.555")).toBe("legacy");
    expect(menuPriceKind("1234567")).toBe("legacy");
  });

  it("isLegacyMenuPrice is true only for the legacy kind", () => {
    expect(isLegacyMenuPrice("market price")).toBe(true);
    expect(isLegacyMenuPrice("2.50")).toBe(false);
    expect(isLegacyMenuPrice("")).toBe(false);
    expect(isLegacyMenuPrice(".")).toBe(false);
  });
});

describe("canonicalMenuPrice", () => {
  it("writes a whole amount with no decimals and a fraction with two", () => {
    expect(canonicalMenuPrice("3")).toBe("3");
    expect(canonicalMenuPrice("2.")).toBe("2");
    expect(canonicalMenuPrice(".5")).toBe("0.50");
    expect(canonicalMenuPrice("2.5")).toBe("2.50");
    expect(canonicalMenuPrice("02.50")).toBe("2.50");
    expect(canonicalMenuPrice("2,5")).toBe("2.50");
    expect(canonicalMenuPrice(" 4.05 ")).toBe("4.05");
  });

  it("returns null for anything that is not a plain amount", () => {
    expect(canonicalMenuPrice("")).toBeNull();
    expect(canonicalMenuPrice(".")).toBeNull();
    expect(canonicalMenuPrice("market price")).toBeNull();
  });
});

describe("menuPriceForInput", () => {
  it("swaps the point for the locale separator", () => {
    expect(menuPriceForInput("2.50", ",")).toBe("2,50");
    expect(menuPriceForInput("2.50", ".")).toBe("2.50");
    expect(menuPriceForInput("2.", ",")).toBe("2,");
    expect(menuPriceForInput("3", ",")).toBe("3");
  });

  it("shows an empty input for a legacy price", () => {
    expect(menuPriceForInput("market price", ",")).toBe("");
    expect(menuPriceForInput("4 EUR / 7 EUR", ".")).toBe("");
  });
});

describe("formatMenuPrice", () => {
  const english = createFormatters("en");
  const portuguese = createFormatters("pt-PT");

  it("formats a plain amount in the menu currency with two decimals", () => {
    expect(formatMenuPrice("2.5", "EUR", english)).toBe("€2.50");
    expect(formatMenuPrice("3", "GBP", english)).toBe("£3.00");
    expect(formatMenuPrice("2.50", "EUR", portuguese)).toContain("2,50");
    expect(formatMenuPrice("2.50", "EUR", portuguese)).toContain("€");
  });

  it("shows legacy text raw, trimmed, with no currency", () => {
    expect(formatMenuPrice(" market price ", "EUR", english)).toBe(
      "market price",
    );
    expect(formatMenuPrice("4 EUR / 7 EUR", "GBP", english)).toBe(
      "4 EUR / 7 EUR",
    );
  });
});

describe("menuCurrencyAffix", () => {
  it("puts the euro mark before the number in English and after it in Portuguese", () => {
    expect(menuCurrencyAffix("en", "EUR")).toEqual({
      symbol: "€",
      isSymbolAfter: false,
    });
    expect(menuCurrencyAffix("pt-PT", "EUR")).toEqual({
      symbol: "€",
      isSymbolAfter: true,
    });
  });

  it("reads the mark of a non-euro currency", () => {
    expect(menuCurrencyAffix("en", "GBP").symbol).toBe("£");
    expect(menuCurrencyAffix("en", "USD").symbol).toBe("$");
  });
});

describe("menuCurrencyOptions", () => {
  it("lists every currency in the contract order, EUR first", () => {
    const options = menuCurrencyOptions("en");
    expect(options.map((option) => option.value)).toEqual([
      ...LISTING_MENU_CURRENCIES,
    ]);
    expect(options[0]!.value).toBe("EUR");
  });

  it("names each currency in the locale and combines mark and name", () => {
    const euro = menuCurrencyOptions("en")[0]!;
    expect(euro.symbol).toBe("€");
    expect(euro.name).toBe("Euro");
    expect(euro.label).toBe("€ Euro");
  });
});
