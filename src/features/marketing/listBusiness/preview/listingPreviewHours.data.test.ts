import { describe, expect, it } from "vitest";
import type { Language, TFunction } from "../../../../shared/i18n/types";
import { emptyHours, type DayHours } from "../listBusiness.data";
import { listingHoursSummary } from "./listingPreviewHours.data";

const DAY = "marketing:listBusiness.day";
const HOURS = "marketing:listBusiness.livePreview.hours";

/** The catalog lines the summary reads, as each language writes them. */
const CATALOG: Record<Language, Record<string, string>> = {
  en: {
    [`${DAY}.mon`]: "Monday",
    [`${DAY}.tue`]: "Tuesday",
    [`${DAY}.wed`]: "Wednesday",
    [`${DAY}.thu`]: "Thursday",
    [`${DAY}.fri`]: "Friday",
    [`${DAY}.sat`]: "Saturday",
    [`${DAY}.sun`]: "Sunday",
    [`${HOURS}.dayRange`]: "{from} to {to}",
    [`${HOURS}.group`]: "{days}: {hours}",
    [`${HOURS}.pair`]: "{first} and {second}",
  },
  pt: {
    [`${DAY}.mon`]: "Segunda-feira",
    [`${DAY}.tue`]: "Terça-feira",
    [`${DAY}.wed`]: "Quarta-feira",
    [`${DAY}.thu`]: "Quinta-feira",
    [`${DAY}.fri`]: "Sexta-feira",
    [`${DAY}.sat`]: "Sábado",
    [`${DAY}.sun`]: "Domingo",
    [`${HOURS}.dayRange`]: "de {from} a {to}",
    [`${HOURS}.group`]: "{days}: {hours}",
    [`${HOURS}.pair`]: "{first} e {second}",
  },
};

function translatorFor(language: Language): TFunction {
  return (key, options) =>
    Object.entries(options ?? {}).reduce(
      (text, [token, value]) => text.replaceAll(`{${token}}`, String(value)),
      CATALOG[language][key] ?? key,
    );
}

/** Weekdays 09:00 to 18:00 and a short Saturday. */
function weekHours(): Record<string, DayHours> {
  const hours = emptyHours();
  for (const dayId of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
    hours[dayId] = { open: true, intervals: [{ from: "09:00", to: "18:00" }] };
  }
  hours.Sat = { open: true, intervals: [{ from: "10:00", to: "14:00" }] };
  return hours;
}

/** Weekdays 09:00 to 18:00, with Saturday and Sunday sharing a short slot: a
 *  contiguous two-day group. */
function weekWithWeekendHours(): Record<string, DayHours> {
  const hours = weekHours();
  hours.Sun = { open: true, intervals: [{ from: "10:00", to: "14:00" }] };
  return hours;
}

/** Monday and Wednesday sharing the same hours, with no other day open: a
 *  non-contiguous two-day group. */
function mondayAndWednesdayHours(): Record<string, DayHours> {
  const hours = emptyHours();
  hours.Mon = { open: true, intervals: [{ from: "09:00", to: "18:00" }] };
  hours.Wed = { open: true, intervals: [{ from: "09:00", to: "18:00" }] };
  return hours;
}

/** Monday, Wednesday and Friday sharing the same hours: three non-contiguous
 *  days, joined with commas between each one. */
function mondayWednesdayFridayHours(): Record<string, DayHours> {
  const hours = emptyHours();
  for (const dayId of ["Mon", "Wed", "Fri"]) {
    hours[dayId] = { open: true, intervals: [{ from: "09:00", to: "18:00" }] };
  }
  return hours;
}

describe("listingHoursSummary", () => {
  it("keeps English weekday names capitalised", () => {
    expect(listingHoursSummary(weekHours(), translatorFor("en"), "en")).toBe(
      "Monday to Friday: 09:00–18:00; Saturday: 10:00–14:00",
    );
  });

  it("writes Portuguese weekdays in lowercase, capitalising only the line's start", () => {
    expect(listingHoursSummary(weekHours(), translatorFor("pt"), "pt")).toBe(
      "De segunda-feira a sexta-feira: 09:00–18:00; sábado: 10:00–14:00",
    );
  });

  it("capitalises a Portuguese line that opens on a weekday name", () => {
    const hours = emptyHours();
    hours.Sat = { open: true, intervals: [{ from: "10:00", to: "14:00" }] };
    expect(listingHoursSummary(hours, translatorFor("pt"), "pt")).toBe(
      "Sábado: 10:00–14:00",
    );
  });

  it("is null when no day has hours", () => {
    expect(listingHoursSummary(emptyHours(), translatorFor("pt"), "pt")).toBe(
      null,
    );
  });

  it("joins a contiguous two-day group with a translated 'and'", () => {
    expect(
      listingHoursSummary(weekWithWeekendHours(), translatorFor("en"), "en"),
    ).toBe("Monday to Friday: 09:00–18:00; Saturday and Sunday: 10:00–14:00");
  });

  it("joins a contiguous two-day group with 'e' in Portuguese", () => {
    expect(
      listingHoursSummary(weekWithWeekendHours(), translatorFor("pt"), "pt"),
    ).toBe(
      "De segunda-feira a sexta-feira: 09:00–18:00; sábado e domingo: 10:00–14:00",
    );
  });

  it("joins a non-contiguous two-day group with 'and' too", () => {
    expect(
      listingHoursSummary(mondayAndWednesdayHours(), translatorFor("en"), "en"),
    ).toBe("Monday and Wednesday: 09:00–18:00");
  });

  it("keeps commas between three or more non-contiguous days", () => {
    expect(
      listingHoursSummary(
        mondayWednesdayFridayHours(),
        translatorFor("en"),
        "en",
      ),
    ).toBe("Monday, Wednesday, Friday: 09:00–18:00");
  });
});
