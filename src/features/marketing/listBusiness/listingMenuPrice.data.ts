import type { Formatters } from "../../../shared/i18n/format";

/**
 * A menu has ONE currency and each item's price is a plain number. Prices a
 * member typed before this feature are free text ("market price",
 * "4 EUR / 7 EUR"): they are never converted. The editor shows an empty
 * numeric input beside a hint quoting the text, they still save unchanged,
 * and typing a number replaces them. The public page shows them raw.
 */

/** Mirrored from the backend DTO, EUR first so it is the default. */
export const LISTING_MENU_CURRENCIES = [
  "EUR",
  "GBP",
  "USD",
  "BRL",
  "CHF",
  "CAD",
] as const;
export type ListingMenuCurrency = (typeof LISTING_MENU_CURRENCIES)[number];
export const DEFAULT_LISTING_MENU_CURRENCY: ListingMenuCurrency = "EUR";

/** A currency from the wire or a resumed local draft; anything else is EUR. */
export function menuCurrencyOf(value: unknown): ListingMenuCurrency {
  return (
    LISTING_MENU_CURRENCIES.find((code) => code === value) ??
    DEFAULT_LISTING_MENU_CURRENCY
  );
}

/** Generous on purpose: a pasted "1.234,50 EUR" is sanitised, not cut. */
export const MENU_PRICE_INPUT_MAX = 12;

const MAX_INTEGER_DIGITS = 6;
const MAX_FRACTION_DIGITS = 2;
const NUMERIC_PRICE_RE = /^(?:\d{1,6}(?:[.,]\d{0,2})?|[.,]\d{1,2})$/;

/**
 * What the numeric input stores: digits and one decimal point. The LAST
 * separator is the decimal and earlier ones are dropped ("1.234,50" becomes
 * "1234.50"); at most 6 integer and 2 fraction digits; leading zeros collapse.
 * An in-progress "2," stays "2." so the member can keep typing.
 */
export function sanitizeMenuPriceInput(raw: string): string {
  const kept = raw.replace(/[^0-9.,]/g, "");
  const lastSeparatorIndex = Math.max(
    kept.lastIndexOf("."),
    kept.lastIndexOf(","),
  );
  const hasSeparator = lastSeparatorIndex >= 0;
  const integerSource = hasSeparator ? kept.slice(0, lastSeparatorIndex) : kept;
  const fractionSource = hasSeparator ? kept.slice(lastSeparatorIndex + 1) : "";
  const integerPart = integerSource
    .replace(/[.,]/g, "")
    .slice(0, MAX_INTEGER_DIGITS)
    .replace(/^0+(?=\d)/, "");
  if (!hasSeparator) return integerPart;
  const fractionPart = fractionSource
    .replace(/[.,]/g, "")
    .slice(0, MAX_FRACTION_DIGITS);
  return `${integerPart}.${fractionPart}`;
}

/**
 * `number`: a plain amount (also "2." and ".5"). `incomplete`: separators
 * only. `legacy`: free text from before this feature, or digits no canonical
 * form can hold (too many places).
 */
export type MenuPriceKind = "empty" | "number" | "incomplete" | "legacy";

export function menuPriceKind(text: string): MenuPriceKind {
  const trimmed = text.trim();
  if (trimmed === "") return "empty";
  if (NUMERIC_PRICE_RE.test(trimmed)) return "number";
  if (/^[.,]+$/.test(trimmed)) return "incomplete";
  return "legacy";
}

export function isLegacyMenuPrice(text: string): boolean {
  return menuPriceKind(text) === "legacy";
}

/** "2." gives "2", ".5" gives "0.50", "2.5" gives "2.50", "02.50" gives
 *  "2.50"; null unless the text is a plain amount. */
export function canonicalMenuPrice(text: string): string | null {
  if (menuPriceKind(text) !== "number") return null;
  const [integerSource = "", fractionSource = ""] = text
    .trim()
    .replace(",", ".")
    .split(".");
  const integerPart = integerSource.replace(/^0+(?=\d)/, "") || "0";
  if (fractionSource === "") return integerPart;
  return `${integerPart}.${fractionSource.padEnd(MAX_FRACTION_DIGITS, "0")}`;
}

/** What the input shows: the digits with the locale's decimal separator, and
 *  "" for a legacy price (the hint beside the input quotes it instead). */
export function menuPriceForInput(
  text: string,
  decimalSeparator: "." | ",",
): string {
  if (menuPriceKind(text) === "legacy") return "";
  return text.trim().replace(",", ".").replace(".", decimalSeparator);
}

/** A plain amount in the menu's currency through `fmt.currency` (always two
 *  decimals); anything else is shown as the member wrote it. */
export function formatMenuPrice(
  price: string,
  currency: ListingMenuCurrency,
  fmt: { currency: Formatters["currency"] },
): string {
  const canonical = canonicalMenuPrice(price);
  if (canonical === null) return price.trim();
  return fmt.currency(Number(canonical), currency, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** The currency mark and which side of the number the locale puts it, so the
 *  input can wear it as an adornment ("€ 4,50" in EN, "4,50 €" in PT). */
export function menuCurrencyAffix(
  locale: string,
  currency: ListingMenuCurrency,
): { symbol: string; isSymbolAfter: boolean } {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(1);
  const currencyIndex = parts.findIndex((part) => part.type === "currency");
  const integerIndex = parts.findIndex((part) => part.type === "integer");
  if (currencyIndex < 0) return { symbol: currency, isSymbolAfter: false };
  return {
    symbol: parts[currencyIndex]!.value,
    isSymbolAfter: currencyIndex > integerIndex,
  };
}

/** The picker's options in the locale's own words ("€ Euro"). */
export function menuCurrencyOptions(locale: string): {
  value: ListingMenuCurrency;
  symbol: string;
  name: string;
  label: string;
}[] {
  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames(locale, { type: "currency" });
  } catch {
    displayNames = null;
  }
  return LISTING_MENU_CURRENCIES.map((value) => {
    const { symbol } = menuCurrencyAffix(locale, value);
    const name = displayNames?.of(value) ?? value;
    return { value, symbol, name, label: `${symbol} ${name}` };
  });
}
