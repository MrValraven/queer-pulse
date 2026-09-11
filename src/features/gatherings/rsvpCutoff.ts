import { useEffect, useState } from "react";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { eventZoneFormat } from "./eventTimezone";

/**
 * Reading a gathering's RSVP cutoff on the detail page (Create Gathering v2).
 *
 * The instant itself comes from the server (`GatheringDetail.rsvpClosesAt`),
 * which is also what refuses a late RSVP. Everything here is about saying it:
 * whether the cutoff has passed, and how to put the closing time in words.
 */

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

/** `setTimeout` keeps its delay in a signed 32-bit integer, and a longer delay
 *  fires at once. A cutoff further out than this waits for the next render. */
const MAX_TIMER_DELAY_MS = 2_147_483_647;

/** A small cushion after the cutoff, so the re-render lands on the far side of
 *  the instant on a timer that fires a hair early. */
const CUTOFF_TIMER_MARGIN_MS = 250;

/** Has the RSVP cutoff passed? A gathering with no cutoff stays open until the
 *  ordinary "has it ended" rule closes it. */
export function hasRsvpCutoffPassed(
  closesAt: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  return closesAt != null && now.getTime() >= closesAt.getTime();
}

/**
 * The same answer, kept honest while the page stays open.
 *
 * A member can sit on a gathering page across the cutoff. The server refuses
 * the late RSVP either way, and this schedules one re-render at the closing
 * instant so the control switches to its closed state before anyone presses
 * a button that can no longer work.
 */
export function useHasRsvpCutoffPassed(
  closesAt: Date | null | undefined,
): boolean {
  const closesAtTime = closesAt ? closesAt.getTime() : null;
  const [, setCutoffRenderCount] = useState(0);

  useEffect(() => {
    if (closesAtTime === null) return;
    const remainingMs = closesAtTime - Date.now();
    if (remainingMs <= 0 || remainingMs > MAX_TIMER_DELAY_MS) return;
    const timer = window.setTimeout(
      () => setCutoffRenderCount((count) => count + 1),
      remainingMs + CUTOFF_TIMER_MARGIN_MS,
    );
    return () => window.clearTimeout(timer);
  }, [closesAtTime]);

  return hasRsvpCutoffPassed(closesAt);
}

/** The closing date and time on the gathering's own clock, as catalog values. */
function closingDateValues(
  closesAt: Date,
  fmt: Formatters,
  timezone: string | undefined,
): { date: string; time: string } {
  const zone = eventZoneFormat(timezone, closesAt);
  return {
    date: fmt.date(closesAt, {
      day: "numeric",
      month: "short",
      ...zone.dateOptions,
    }),
    time: fmt.time(closesAt, zone.timeOptions),
  };
}

/**
 * "RSVPs close in 3 hours" inside the last day, and "RSVPs close on 12 Jun
 * at 19:30" further out.
 *
 * Relative wording is kept to the final day on purpose. Past that, a count of
 * days rounds across midnight and reads as the wrong day, so the date and time
 * are named on the gathering's own clock. Counts round down, so the line
 * states at most the time left.
 *
 * Once the cutoff has passed, the only reader still offered the RSVP buttons
 * is an organiser, whom the server exempts, so the line says when RSVPs
 * closed for everyone else.
 */
export function rsvpClosesText(
  closesAt: Date,
  fmt: Formatters,
  t: TFunction,
  timezone: string | undefined,
  now: Date = new Date(),
): string {
  const remainingMs = closesAt.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return t(
      "gatherings:rsvpControl.closedForOthersOn",
      closingDateValues(closesAt, fmt, timezone),
    );
  }
  if (remainingMs > 0 && remainingMs < MILLISECONDS_PER_HOUR) {
    const minutes = Math.max(
      1,
      Math.floor(remainingMs / MILLISECONDS_PER_MINUTE),
    );
    return t("gatherings:rsvpControl.closesIn", {
      relative: fmt.relativeTime(minutes, "minute"),
    });
  }
  if (remainingMs > 0 && remainingMs < MILLISECONDS_PER_DAY) {
    const hours = Math.floor(remainingMs / MILLISECONDS_PER_HOUR);
    return t("gatherings:rsvpControl.closesIn", {
      relative: fmt.relativeTime(hours, "hour"),
    });
  }
  return t(
    "gatherings:rsvpControl.closesOn",
    closingDateValues(closesAt, fmt, timezone),
  );
}

/** "The host stopped taking RSVPs on 12 Jun at 19:30." for the closed panel. */
export function rsvpClosedText(
  closesAt: Date,
  fmt: Formatters,
  t: TFunction,
  timezone: string | undefined,
): string {
  return t(
    "gatherings:rsvpControl.rsvpClosedNote",
    closingDateValues(closesAt, fmt, timezone),
  );
}
