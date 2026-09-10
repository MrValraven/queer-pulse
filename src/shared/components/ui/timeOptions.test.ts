import { describe, it, expect } from "vitest";
import { shared as sharedEn } from "../../i18n/catalogs/en/shared";
import { shared as sharedPt } from "../../i18n/catalogs/pt/shared";
import { parseKey, resolveEntry } from "../../i18n/translate";
import type { Catalog, TFunction, TranslateOptions } from "../../i18n/types";
import {
  durationMinutes,
  formatDuration,
  formatSpanDuration,
} from "./timeOptions";

/**
 * A `t` backed by the REAL catalog rather than a hand-written stub, so a
 * missing or misspelt key fails here instead of shipping a raw key onto the
 * span note under the create wizard's schedule fields. It resolves through
 * `resolveEntry`, which is what the app's own translator calls, so the `_one`
 * / `_other` plural selection under test is the production one.
 */
function translatorFor(catalog: Catalog, locale: string): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const resolved = resolveEntry(catalog, path, locale, options);
    if (resolved === undefined) throw new Error(`missing catalog key: ${key}`);
    return resolved;
  };
}

const translateEn = translatorFor(sharedEn, "en");
const translatePt = translatorFor(sharedPt, "pt-PT");

const MINUTES_PER_DAY = 24 * 60;

describe("formatSpanDuration", () => {
  it("reads a span under an hour as minutes alone", () => {
    expect(formatSpanDuration(45, translateEn)).toBe("45m");
    expect(formatSpanDuration(45, translatePt)).toBe("45min");
  });

  it("reads a span under a day as hours and minutes, with no day part", () => {
    expect(formatSpanDuration(5 * 60, translateEn)).toBe("5h");
    expect(formatSpanDuration(5 * 60 + 30, translateEn)).toBe("5h 30m");
    expect(formatSpanDuration(23 * 60 + 59, translateEn)).toBe("23h 59m");
  });

  it("matches formatDuration exactly below a day, so the two never drift", () => {
    for (const minutes of [0, 1, 59, 60, 61, 600, MINUTES_PER_DAY - 1]) {
      expect(formatSpanDuration(minutes, translateEn)).toBe(
        formatDuration(minutes, translateEn),
      );
    }
  });

  it("reads exactly one day as a singular day and nothing else", () => {
    expect(formatSpanDuration(MINUTES_PER_DAY, translateEn)).toBe("1 day");
    expect(formatSpanDuration(MINUTES_PER_DAY, translatePt)).toBe("1 dia");
  });

  it("reads whole days with no remainder as days alone", () => {
    expect(formatSpanDuration(3 * MINUTES_PER_DAY, translateEn)).toBe("3 days");
    expect(formatSpanDuration(3 * MINUTES_PER_DAY, translatePt)).toBe("3 dias");
  });

  it("reads several days with a remainder as days plus the rest", () => {
    // 77 hours: the three-day festival that used to print as "77h".
    const threeDaysFiveHours = 3 * MINUTES_PER_DAY + 5 * 60;
    expect(formatSpanDuration(threeDaysFiveHours, translateEn)).toBe(
      "3 days 5h",
    );
    expect(formatSpanDuration(threeDaysFiveHours, translatePt)).toBe(
      "3 dias e 5h",
    );
    expect(formatSpanDuration(MINUTES_PER_DAY + 2 * 60 + 30, translateEn)).toBe(
      "1 day 2h 30m",
    );
  });

  it("rounds a fractional span and never renders a negative one", () => {
    expect(formatSpanDuration(90.4, translateEn)).toBe("1h 30m");
    expect(formatSpanDuration(-120, translateEn)).toBe("0m");
  });

  it("leaves the single-day durationMinutes contract untouched", () => {
    // 22:00 to 01:00 is three hours, which is still what the time list offers.
    expect(durationMinutes(22 * 60, 1 * 60)).toBe(3 * 60);
    expect(formatDuration(durationMinutes(22 * 60, 1 * 60), translateEn)).toBe(
      "3h",
    );
  });
});
