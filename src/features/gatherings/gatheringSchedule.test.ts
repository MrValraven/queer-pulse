import { beforeAll, describe, expect, it } from "vitest";
import { gatheringWhen } from "./gatheringSchedule";
import { createFormatters } from "../../shared/i18n/format";
import { catalogs, loadNamespace } from "../../shared/i18n/catalogs";
import type { Catalog, TFunction } from "../../shared/i18n/types";

/**
 * A gathering can run past midnight (23:00 to 04:00) or across several days.
 * `gatheringWhen` is the one place that decides how that reads, so these cover
 * the four shapes a schedule can take plus the two judgements that are easy to
 * get wrong: which calendar day an instant falls on when the reader sits in
 * another zone, and what "next day" means for an end exactly 24 hours out.
 */

/**
 * A minimal `t` over the real `en` catalog, matching `landlord.adapters.test.ts`,
 * so a key that goes missing fails here too.
 */
let gatheringsCatalog: Catalog = catalogs.en.gatherings;
beforeAll(async () => {
  gatheringsCatalog = await loadNamespace("en", "gatherings");
});

const t: TFunction = (key, options) => {
  const [, path] = key.split(":");
  const value = gatheringsCatalog[path ?? ""] ?? key;
  return Object.entries(options ?? {}).reduce(
    (accumulated, [token, replacement]) =>
      accumulated.replace(`{${token}}`, String(replacement)),
    value,
  );
};
const fmt = createFormatters("en-GB");

/** What `eventZoneFormat` hands a call site for a gathering held in Lisbon. */
const LISBON_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/Lisbon",
};
const LISBON_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: "Europe/Lisbon",
};

// Lisbon runs UTC+1 in October, so these instants are one hour later there.
/** 19:00 on Friday 16 October 2026, Lisbon. */
const FRIDAY_EVENING = new Date("2026-10-16T18:00:00.000Z");
/** 22:00 the same Friday. */
const FRIDAY_LATE = new Date("2026-10-16T21:00:00.000Z");
/** 23:00 the same Friday. */
const FRIDAY_NIGHT = new Date("2026-10-16T22:00:00.000Z");
/** 04:00 on Saturday 17 October 2026, Lisbon. */
const SATURDAY_SMALL_HOURS = new Date("2026-10-17T03:00:00.000Z");
/** 04:00 on Sunday 18 October 2026, Lisbon. */
const SUNDAY_SMALL_HOURS = new Date("2026-10-18T03:00:00.000Z");

describe("gatheringWhen", () => {
  it("prints a single date and a single time when there is no stated end", () => {
    const when = gatheringWhen(
      FRIDAY_EVENING,
      null,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    expect(when.dateText).toBe("Fri 16 Oct");
    expect(when.timeText).toBe("19:00");
    expect(when.isMultiDay).toBe(false);
    expect(when.isNextDay).toBe(false);
    expect(when.nextDayNote).toBeNull();
  });

  it("treats an absent end the same as a null one", () => {
    const when = gatheringWhen(
      FRIDAY_EVENING,
      undefined,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    expect(when.timeText).toBe("19:00");
    expect(when.nextDayNote).toBeNull();
  });

  it("prints a time range and no note when the gathering ends the same day", () => {
    const when = gatheringWhen(
      FRIDAY_EVENING,
      FRIDAY_LATE,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    expect(when.dateText).toBe("Fri 16 Oct");
    expect(when.timeText).toBe("19:00 – 22:00");
    expect(when.isMultiDay).toBe(false);
    expect(when.isNextDay).toBe(false);
    expect(when.nextDayNote).toBeNull();
  });

  it("keeps the start date and adds a note when the gathering ends the next day", () => {
    const when = gatheringWhen(
      FRIDAY_NIGHT,
      SATURDAY_SMALL_HOURS,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    // "23:00 – 04:00" alone reads as ending nineteen hours before it began.
    expect(when.dateText).toBe("Fri 16 Oct");
    expect(when.timeText).toBe("23:00 – 04:00");
    expect(when.isMultiDay).toBe(true);
    expect(when.isNextDay).toBe(true);
    expect(when.nextDayNote).toBe("(next day)");
  });

  it("prints a date range and no note when the gathering ends later still", () => {
    const when = gatheringWhen(
      FRIDAY_NIGHT,
      SUNDAY_SMALL_HOURS,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    // The month belongs once, at the close, and a weekday on each end of a
    // span is noise. The clock range carries the rest.
    expect(when.dateText).toBe("16 to 18 Oct");
    expect(when.timeText).toBe("23:00 – 04:00");
    expect(when.isMultiDay).toBe(true);
    expect(when.isNextDay).toBe(false);
    expect(when.nextDayNote).toBeNull();
  });

  it("names the day range even when the caller asks only for a weekday", () => {
    // The co-host invite card formats its schedule line as "Fri 23:00". Across
    // several days "Fri to Sun" would say nothing about which weekend it is,
    // so the range falls back to naming the dates.
    const when = gatheringWhen(FRIDAY_NIGHT, SUNDAY_SMALL_HOURS, fmt, t, {
      weekday: "short",
      timeZone: "Europe/Lisbon",
    });
    expect(when.dateText).toBe("16 to 18 Oct");
  });

  it("judges the calendar day in the gathering's own zone", () => {
    // 21:00 Friday to 01:00 Saturday in Lisbon is 17:00 to 21:00 on the SAME
    // Friday in São Paulo. Whichever zone the caller's options carry is the
    // one that decides, so a member reading from Brazil is told the host's
    // day rather than their own.
    const startAt = new Date("2026-10-16T20:00:00.000Z");
    const endAt = new Date("2026-10-17T00:00:00.000Z");

    const inLisbon = gatheringWhen(
      startAt,
      endAt,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    expect(inLisbon.timeText).toBe("21:00 – 01:00");
    expect(inLisbon.isNextDay).toBe(true);
    expect(inLisbon.nextDayNote).toBe("(next day)");

    const inSaoPaulo = gatheringWhen(
      startAt,
      endAt,
      fmt,
      t,
      { ...LISBON_DATE_OPTIONS, timeZone: "America/Sao_Paulo" },
      { timeZone: "America/Sao_Paulo" },
    );
    expect(inSaoPaulo.timeText).toBe("17:00 – 21:00");
    expect(inSaoPaulo.isMultiDay).toBe(false);
    expect(inSaoPaulo.isNextDay).toBe(false);
    expect(inSaoPaulo.nextDayNote).toBeNull();
  });

  it("keeps the cancelled card's option shape on the gathering's own clock", () => {
    // `LiveCancelledEventCard` asks only for a weekday on the date side and
    // spreads `eventZoneFormat` into both bags, the same overnight instants as
    // the pair above. It has to reach the same verdict as the detail page,
    // otherwise one member sees two different nights for one gathering.
    const startAt = new Date("2026-10-16T20:00:00.000Z");
    const endAt = new Date("2026-10-17T00:00:00.000Z");

    const inLisbon = gatheringWhen(
      startAt,
      endAt,
      fmt,
      t,
      { weekday: "short", timeZone: "Europe/Lisbon" },
      { timeZone: "Europe/Lisbon" },
    );
    expect(inLisbon.dateText).toBe("Fri");
    expect(inLisbon.timeText).toBe("21:00 – 01:00");
    expect(inLisbon.isNextDay).toBe(true);
    expect(inLisbon.nextDayNote).toBe("(next day)");

    const inSaoPaulo = gatheringWhen(
      startAt,
      endAt,
      fmt,
      t,
      { weekday: "short", timeZone: "America/Sao_Paulo" },
      { timeZone: "America/Sao_Paulo" },
    );
    expect(inSaoPaulo.timeText).toBe("17:00 – 21:00");
    expect(inSaoPaulo.isNextDay).toBe(false);
    expect(inSaoPaulo.nextDayNote).toBeNull();
  });

  it("keeps the day verdict and the clock digits on one zone", () => {
    // A caller that fills only the time bag still gets a verdict that agrees
    // with the times it renders, so a half-filled call cannot print a note
    // that contradicts the digits beside it.
    const startAt = new Date("2026-10-16T20:00:00.000Z");
    const endAt = new Date("2026-10-17T00:00:00.000Z");
    const when = gatheringWhen(startAt, endAt, fmt, t, undefined, {
      timeZone: "America/Sao_Paulo",
    });
    expect(when.timeText).toBe("17:00 – 21:00");
    expect(when.isMultiDay).toBe(false);
    expect(when.nextDayNote).toBeNull();
  });

  it("counts an end exactly 24 hours out as the next day", () => {
    // "Next day" is read by CALENDAR DATE: 19:00 Friday to 19:00 Saturday
    // lands on the day after the start, so this is multi-day AND next-day, and
    // the note is what tells the reader the two 19:00s are different days.
    const when = gatheringWhen(
      FRIDAY_EVENING,
      new Date("2026-10-17T18:00:00.000Z"),
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      LISBON_TIME_OPTIONS,
    );
    expect(when.dateText).toBe("Fri 16 Oct");
    expect(when.timeText).toBe("19:00 – 19:00");
    expect(when.isMultiDay).toBe(true);
    expect(when.isNextDay).toBe(true);
    expect(when.nextDayNote).toBe("(next day)");
  });

  it("labels the zone once, at the close of a time range", () => {
    // `eventZoneFormat` adds `timeZoneName` only when the gathering's clock
    // differs from the reader's. Saying it on both ends is noise.
    const when = gatheringWhen(
      FRIDAY_NIGHT,
      SATURDAY_SMALL_HOURS,
      fmt,
      t,
      LISBON_DATE_OPTIONS,
      { timeZone: "Europe/Lisbon", timeZoneName: "short" },
    );
    expect(when.timeText).toBe("23:00 – 04:00 WEST");
  });

  it("falls back to a weekday and a short date when given no options", () => {
    const when = gatheringWhen(FRIDAY_EVENING, null, fmt, t);
    // No zone in play, so this reads on whatever clock the test process runs.
    expect(when.dateText).toMatch(/Oct/);
    expect(when.isMultiDay).toBe(false);
  });
});
