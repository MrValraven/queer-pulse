import { useMemo } from "react";
import { useTranslation } from "./useTranslation";
import { intlLocale } from "./locale";

/** The `Intl` measurement units this app formats. Extend as call sites need. */
export type FormatUnit = "second" | "minute" | "hour" | "day";

/** Every `formatToParts` type that belongs to the NUMBER rather than the unit
 *  mark around it. Used to split "12 min" back into "12" and " min". */
const NUMERIC_PART_TYPES = new Set<Intl.NumberFormatPartTypes>([
  "integer",
  "group",
  "decimal",
  "fraction",
  "minusSign",
  "plusSign",
  "nan",
  "infinity",
  "exponentInteger",
  "exponentMinusSign",
  "exponentSeparator",
]);

export interface Formatters {
  /** Localized date. Defaults to a medium `d de MMMM de yyyy` style in PT. */
  date: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string;
  /** Localized time. Defaults to 24h `HH:mm` in PT, matching pt-PT convention. */
  time: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string;
  /** Localized number (decimal comma + space grouping in PT). */
  number: (value: number, options?: Intl.NumberFormatOptions) => string;
  /** Currency, EUR by default (`1 234,56 €` in PT, `€1,234.56` in EN).
   *  `options` passes through to `Intl.NumberFormat` — e.g.
   *  `{ notation: "compact" }` for `"18 mil €"` (PT) / `"€18K"` (EN) instead
   *  of a hand-rolled, EN-only-correct `"€18k"` prefix string. */
  currency: (
    value: number,
    currency?: string,
    options?: Intl.NumberFormatOptions,
  ) => string;
  /** Relative time, e.g. `há 2 dias` / `2 days ago`. */
  relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  /** A measurement with its unit, e.g. `12 min` / `3.2 hr` (en) or `12 min` /
   *  `3,2 h` (pt). `Intl` owns the mark, the separator, AND the plural form,
   *  so no catalog key ever has to spell "hour"/"hours" again. */
  unit: (
    value: number,
    unit: FormatUnit,
    options?: Intl.NumberFormatOptions,
  ) => string;
  /** The unit mark alone, with the separator that precedes it (`" min"`), for
   *  a display that renders the number itself apart from its unit, like a
   *  counting-up stat tile. Returns "" in a locale that puts the mark BEFORE
   *  the number; the app ships en and pt, which both put it after. */
  unitSuffix: (
    value: number,
    unit: FormatUnit,
    options?: Intl.NumberFormatOptions,
  ) => string;
}

const DEFAULT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};
const DEFAULT_TIME: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

/**
 * Build a set of `Intl`-backed formatters bound to a BCP-47 locale. Pure — no
 * React — so it is reusable outside components (data prep, tests). PT gets a
 * 24-hour clock, decimal comma, and `€` suffix automatically from `Intl`.
 */
export function createFormatters(locale: string): Formatters {
  return {
    date: (value, options) =>
      new Intl.DateTimeFormat(locale, options ?? DEFAULT_DATE).format(value),
    time: (value, options) =>
      new Intl.DateTimeFormat(locale, {
        ...DEFAULT_TIME,
        hourCycle: locale.startsWith("pt") ? "h23" : undefined,
        ...options,
      }).format(value),
    number: (value, options) =>
      new Intl.NumberFormat(locale, options).format(value),
    currency: (value, currency = "EUR", options) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        ...options,
      }).format(value),
    relativeTime: (value, unit) =>
      new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
        value,
        unit,
      ),
    unit: (value, unit, options) =>
      unitFormat(locale, unit, options).format(value),
    unitSuffix: (value, unit, options) => {
      const parts = unitFormat(locale, unit, options).formatToParts(value);
      const lastNumericIndex = parts.reduce(
        (last, part, index) =>
          NUMERIC_PART_TYPES.has(part.type) ? index : last,
        -1,
      );
      return parts
        .slice(lastNumericIndex + 1)
        .map((part) => part.value)
        .join("");
    },
  };
}

function unitFormat(
  locale: string,
  unit: FormatUnit,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "short",
    ...options,
  });
}

/**
 * Locale-aware `Intl` formatters bound to the active language. Consolidates the
 * ad-hoc `toLocale*` call sites onto one helper (spec 13 §5).
 *
 * @example
 * const fmt = useFormat();
 * fmt.currency(1234.5);      // pt → "1234,50 €"   en → "€1,234.50"
 * fmt.date(new Date());      // pt → "10 de julho de 2026"
 */
export function useFormat(): Formatters {
  const { language } = useTranslation();
  return useMemo(() => createFormatters(intlLocale(language)), [language]);
}
