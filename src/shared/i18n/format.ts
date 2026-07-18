import { useMemo } from "react";
import { useTranslation } from "./useTranslation";
import { intlLocale } from "./locale";

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
  };
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
