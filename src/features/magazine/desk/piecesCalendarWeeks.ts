/**
 * Where each piece lands on the desk calendar: the weeks from this Monday to
 * the issue's close, with every visible piece placed on its due day or in one
 * of three lanes above the grid (no date yet, due before this week, due past
 * the last week drawn). A scheduled piece with no due date lands on the day
 * it goes live. Every piece lands in exactly one place, so the
 * calendar never hides work the table shows.
 *
 * Pure logic with no `t()` and no formatting: days are ISO calendar dates
 * (`YYYY-MM-DD`) read on the viewer's own calendar, and the render site turns
 * them into words.
 */

import type { Editor, Piece } from "../data/desk.data";
import { isoCalendarDate } from "../api/pieces.adapters";
import { describeDue } from "./deskDue";
import { isPieceScheduled } from "./pieceSchedule";
import type { DeskTone } from "./deskTones";
import {
  describeWaitingOn,
  isWaitingOnViewer,
  pieceHolder,
  type DeskWaitingOnDisplay,
} from "./deskWaitingOn";

/** The longest range the calendar draws, in week rows. */
export const CALENDAR_MAX_WEEKS = 6;
/** How many week rows show when the issue has no close date. */
export const CALENDAR_OPEN_WEEKS = 4;
const DAYS_PER_WEEK = 7;

/** One piece as the calendar shows it. */
export interface CalendarEntry {
  piece: Piece;
  /** The ISO due day, when the piece has one. */
  dueDate: string | null;
  /** The ISO day a scheduled piece goes live on the site, or null when it
   *  is not scheduled. */
  goesLiveOn: string | null;
  /** Who holds the piece, as a tone for its dot. */
  waitTone: DeskTone;
  /** Who holds the piece, as the table's "Waiting on" names them; null
   *  when nobody does, so the chip has nothing to say. */
  waitingOn: DeskWaitingOnDisplay | null;
  isLate: boolean;
  /** Waiting on the viewer: the same test as the "your turn" focus chip. */
  isYourTurn: boolean;
  /** Due after the issue closes: the collision the calendar exists to show. */
  isAfterClose: boolean;
}

export interface CalendarDay {
  isoDate: string;
  /** Local midnight of the day, for the formatter. */
  date: Date;
  entries: CalendarEntry[];
  isToday: boolean;
  isPast: boolean;
  isCloseDay: boolean;
  isPublishDay: boolean;
  isAfterClose: boolean;
}

export interface CalendarWeek {
  /** The Monday's ISO date: stable and unique, so it keys the row. */
  id: string;
  days: CalendarDay[];
}

export interface CalendarLayout {
  weeks: CalendarWeek[];
  /** Pieces with no due date (and no go-live day). */
  undated: CalendarEntry[];
  /** Pieces due before the first Monday drawn. */
  earlier: CalendarEntry[];
  /** Pieces due after the last Sunday drawn. */
  later: CalendarEntry[];
  closesOn: string | null;
  publishesOn: string | null;
}

/** Local midnight `offset` days after `day`. Built from its parts so a DST
 *  change never shifts the calendar day. */
export function addCalendarDays(day: Date, offset: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + offset);
}

/** The ISO calendar date of `day` on the viewer's own calendar. */
export function toIsoDay(day: Date): string {
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${date}`;
}

/** Local midnight of an ISO calendar day. A bare `YYYY-MM-DD` handed to
 *  `new Date()` reads as UTC and lands a day early west of Greenwich. */
export function fromIsoDay(isoDate: string): Date {
  const [yearText, monthText, dayText] = isoDate.split("-");
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

/** Local midnight of the Monday that starts `day`'s week. */
export function mondayOf(day: Date): Date {
  const daysSinceMonday = (day.getDay() + 6) % DAYS_PER_WEEK;
  return addCalendarDays(day, -daysSinceMonday);
}

/** The facts a piece's calendar entry reads from the viewer's side. */
interface CalendarViewer {
  /** The viewer's editor id, or "" while it is unknown. */
  me: string;
  editors: readonly Editor[];
}

function toEntry(
  piece: Piece,
  today: Date,
  closesOn: string | null,
  viewer: CalendarViewer,
): CalendarEntry {
  // The same reading `describeDue` uses, so the table and the calendar agree.
  const dueDate = piece.dueDate ?? isoCalendarDate(piece.due) ?? null;
  // `today` is local midnight, so a piece going live later today still
  // counts as scheduled and lands on today.
  const goesLiveOn =
    piece.publishedAt && isPieceScheduled(piece, today.getTime())
      ? toIsoDay(new Date(piece.publishedAt))
      : null;
  const isAfterClose =
    dueDate !== null &&
    closesOn !== null &&
    dueDate > closesOn &&
    piece.stage !== "Published";
  // The table's own "Waiting on" rule, so the dot, the spoken label and the
  // "your turn" edge match the row, the board and the peek.
  const waitingOn = describeWaitingOn(piece, viewer.me, viewer.editors);
  return {
    piece,
    dueDate,
    goesLiveOn,
    waitTone: waitingOn.tone,
    waitingOn: pieceHolder(piece) === "nobody" ? null : waitingOn,
    isLate: describeDue(piece, today).isLate,
    isYourTurn: isWaitingOnViewer(piece, viewer.me),
    isAfterClose,
  };
}

/** The day the calendar files an entry on: its due day, or for a scheduled
 *  piece with no due date, the day it goes live. */
function placementDate(entry: CalendarEntry): string | null {
  return entry.dueDate ?? entry.goesLiveOn;
}

/** How many week rows to draw from `firstMonday`: through the week holding
 *  the later of the close and the latest due day, capped; with no close date,
 *  a fixed stretch. Never fewer than one. */
function weekCount(
  firstMonday: Date,
  closesOn: string | null,
  latestDueDate: string | null,
): number {
  if (!closesOn) return CALENDAR_OPEN_WEEKS;
  const lastDay =
    latestDueDate && latestDueDate > closesOn ? latestDueDate : closesOn;
  const firstMondayIso = toIsoDay(firstMonday);
  if (lastDay < firstMondayIso) return 1;
  const lastMonday = mondayOf(fromIsoDay(lastDay));
  const weeks =
    Math.round(
      (lastMonday.getTime() - firstMonday.getTime()) /
        (DAYS_PER_WEEK * 24 * 60 * 60 * 1000),
    ) + 1;
  return Math.min(Math.max(weeks, 1), CALENDAR_MAX_WEEKS);
}

/**
 * Places `pieces` on the weeks from the Monday of `today`'s week. Pieces keep
 * their input order inside a day and a lane, so the desk's sort still decides
 * what reads first. `closesOn` and `publishesOn` are ISO calendar days;
 * anything else counts as unknown. `me` (the viewer's editor id) marks the
 * pieces waiting on them, and `editors` names a colleague a piece waits on.
 */
export function buildCalendarWeeks(
  pieces: Piece[],
  today: Date,
  closesOn: string | null,
  publishesOn: string | null,
  me?: string,
  editors: readonly Editor[] = [],
): CalendarLayout {
  const closeDay = isoCalendarDate(closesOn) ?? null;
  const publishDay = isoCalendarDate(publishesOn) ?? null;
  const todayIso = toIsoDay(today);
  const firstMonday = mondayOf(today);
  const firstMondayIso = toIsoDay(firstMonday);
  const viewer: CalendarViewer = { me: me ?? "", editors };
  const entries = pieces.map((piece) =>
    toEntry(piece, today, closeDay, viewer),
  );

  const latestDueDate = entries.reduce<string | null>((latest, entry) => {
    const placedOn = placementDate(entry);
    return placedOn && (latest === null || placedOn > latest)
      ? placedOn
      : latest;
  }, null);
  const dayCount =
    weekCount(firstMonday, closeDay, latestDueDate) * DAYS_PER_WEEK;
  const lastDayIso = toIsoDay(addCalendarDays(firstMonday, dayCount - 1));

  const entriesByDay = new Map<string, CalendarEntry[]>();
  const layout: CalendarLayout = {
    weeks: [],
    undated: [],
    earlier: [],
    later: [],
    closesOn: closeDay,
    publishesOn: publishDay,
  };
  for (const entry of entries) {
    const placedOn = placementDate(entry);
    if (placedOn === null) layout.undated.push(entry);
    else if (placedOn < firstMondayIso) layout.earlier.push(entry);
    else if (placedOn > lastDayIso) layout.later.push(entry);
    else {
      const dayEntries = entriesByDay.get(placedOn) ?? [];
      dayEntries.push(entry);
      entriesByDay.set(placedOn, dayEntries);
    }
  }

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
    const date = addCalendarDays(firstMonday, dayIndex);
    const isoDate = toIsoDay(date);
    if (dayIndex % DAYS_PER_WEEK === 0) {
      layout.weeks.push({ id: isoDate, days: [] });
    }
    layout.weeks[layout.weeks.length - 1]?.days.push({
      isoDate,
      date,
      entries: entriesByDay.get(isoDate) ?? [],
      isToday: isoDate === todayIso,
      isPast: isoDate < todayIso,
      isCloseDay: isoDate === closeDay,
      isPublishDay: isoDate === publishDay,
      isAfterClose: closeDay !== null && isoDate > closeDay,
    });
  }
  return layout;
}

/** Every piece in the order the calendar draws it: the lanes above the grid
 *  (no date, earlier, later), then the grid day by day. The phone agenda
 *  keeps the same order. j/k and the peek's steps walk this list, so the
 *  keyboard moves down the screen. */
export function calendarPieceOrder(layout: CalendarLayout): Piece[] {
  const gridEntries = layout.weeks.flatMap((week) =>
    week.days.flatMap((day) => day.entries),
  );
  return [
    ...layout.undated,
    ...layout.earlier,
    ...layout.later,
    ...gridEntries,
  ].map((entry) => entry.piece);
}

/** The last day the grid draws (a Sunday), or `undefined` with no weeks. */
export function lastCalendarDay(
  layout: CalendarLayout,
): CalendarDay | undefined {
  const lastWeek = layout.weeks[layout.weeks.length - 1];
  return lastWeek?.days[lastWeek.days.length - 1];
}

/** The days the phone agenda lists: every day that holds a piece, plus the
 *  close day so the deadline always shows. */
export function agendaDays(layout: CalendarLayout): CalendarDay[] {
  return layout.weeks
    .flatMap((week) => week.days)
    .filter((day) => day.entries.length > 0 || day.isCloseDay);
}
