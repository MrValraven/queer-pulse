import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { eventZoneFormat } from "../gatherings/eventTimezone";
import { gatheringWhen } from "../gatherings/gatheringSchedule";
import { atTime, endDateOf, timeStr } from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";

/** The day shape a My Events line falls back on: the compact card form. */
const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** The day shape the "(until 19 Oct)" note prints. A weekday would crowd a
 *  note that already sits at the end of a line. */
const UNTIL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** How a member's own event reads on a My Events line, in parts. */
export interface MyEventWhen {
  /** "Fri 17 Oct" on one day, "17 to 19 Oct" across several. */
  dateText: string;
  /** "23:00 – 04:00", or "21:00" with no stated end. */
  timeText: string;
  /** "(next day)" when the clock crosses midnight into the following morning.
   *  Null on a single day, and on a span of two days or more where the day
   *  range in `dateText` already says it. */
  nextDayNote: string | null;
  /** "(until 19 Oct)" across two days or more, for a line that prints the
   *  clock with no date beside it. Null otherwise. */
  untilNote: string | null;
  /** True when the gathering ends on a later calendar day than it starts. */
  isMultiDay: boolean;
}

/**
 * Read a `MyEvent`'s schedule as display parts.
 *
 * The span rule (does this cross midnight, how many days does it cover, how
 * does a day range read) comes from `gatheringWhen`, the one formatter the
 * gathering surfaces already share, so My Events says the same thing about the
 * same schedule.
 *
 * The clock digits stay the card's own `HH:MM` strings. Every other My Events
 * surface prints those same digits (the week calendar cell, the day-of run
 * sheet, the agenda sort), so formatting only these few lines through `Intl`
 * would put two clock shapes on one screen.
 */
export function myEventWhen(
  ev: MyEvent,
  fmt: Formatters,
  t: TFunction,
  dateOptions: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
): MyEventWhen {
  const timeText = timeStr(ev);
  const startsAt = atTime(ev, "start");
  // A stub invite row whose event summary the API left out has no date at all,
  // and `Intl` throws on an invalid one. Such a row still renders, with only
  // the clock it does have.
  if (Number.isNaN(startsAt.getTime())) {
    return {
      dateText: "",
      timeText,
      nextDayNote: null,
      untilNote: null,
      isMultiDay: false,
    };
  }

  const endInstant = ev.end ? atTime(ev, "end") : null;
  const endsAt =
    endInstant && !Number.isNaN(endInstant.getTime()) ? endInstant : null;
  const zone = eventZoneFormat(ev.timezone, startsAt);
  const when = gatheringWhen(
    startsAt,
    endsAt,
    fmt,
    t,
    { ...dateOptions, ...zone.dateOptions },
    zone.timeOptions,
  );

  return {
    dateText: when.dateText,
    timeText,
    nextDayNote: when.nextDayNote,
    untilNote:
      endsAt && when.isMultiDay && !when.isNextDay
        ? t("myevents:card.untilDate", {
            date: fmt.date(endsAt, {
              ...UNTIL_DATE_OPTIONS,
              ...zone.dateOptions,
            }),
          })
        : null,
    isMultiDay: when.isMultiDay,
  };
}

/**
 * The one note a clock range needs on a line with no date beside it:
 * "(next day)" across midnight, "(until 19 Oct)" across more days, null on a
 * single day.
 *
 * Its own function because it runs on every card in the list. A gathering that
 * opens and closes on one stored day can carry no note, so it answers before
 * building any `Intl` formatter. Those stored days are the same ones
 * `isOnDay`, `eventDays` and `inPill` read, so the short-circuit agrees with
 * the rest of the surface.
 */
export function myEventSpanNote(
  ev: MyEvent,
  fmt: Formatters,
  t: TFunction,
): string | null {
  if (!ev.end || endDateOf(ev) === ev.date) return null;
  const when = myEventWhen(ev, fmt, t);
  return when.nextDayNote ?? when.untilNote;
}

/** Join a clock range with the zone label and span note that qualify it,
 *  dropping whichever a surface has none of. */
export function joinWhenParts(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
