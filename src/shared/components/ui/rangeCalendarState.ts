/**
 * Pure classification of a single grid cell's range state for `RangeCalendar`:
 * which of `.rangeStart` / `.rangeEnd` / `.inRange` / `.previewRange` (see
 * `Calendar.module.css`) a given date should carry, given the committed
 * `start`/`end` (from the controlled `value`) and the in-progress
 * `anchor`/`hovered` pair (the uncommitted first click + pointer position).
 * Split out of `RangeCalendar.tsx` to keep that component under the line
 * budget, mirroring how `calendarWeekday.ts`/`calendarHeaderOptions.ts` split
 * pure helpers out of `Calendar.tsx`/`CalendarHeader.tsx`.
 */

import { compareDate, isSameDate, type PlainDate } from "./plainDate";

export interface RangeCellState {
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isPreviewRange: boolean;
}

const NONE: RangeCellState = {
  isRangeStart: false,
  isRangeEnd: false,
  isInRange: false,
  isPreviewRange: false,
};

/**
 * While a selection is in progress (`anchor` set, second endpoint not yet
 * picked), the anchor itself always reads as `.rangeStart` regardless of
 * hover direction; the provisional span to the hovered date (inclusive, in
 * whichever direction the pointer is on) reads as `.previewRange`. Swapping
 * `start`/`end` into chronological order only happens once the pair commits
 * (see `RangeCalendar`'s `handleRangeSelect`), not during hover preview.
 */
export function classifyRangeCell(
  date: PlainDate,
  start: PlainDate | null,
  end: PlainDate | null,
  anchor: PlainDate | null,
  hovered: PlainDate | null,
): RangeCellState {
  if (anchor) {
    if (isSameDate(date, anchor)) return { ...NONE, isRangeStart: true };
    if (hovered) {
      const low = compareDate(anchor, hovered) <= 0 ? anchor : hovered;
      const high = compareDate(anchor, hovered) <= 0 ? hovered : anchor;
      if (compareDate(date, low) >= 0 && compareDate(date, high) <= 0) {
        return { ...NONE, isPreviewRange: true };
      }
    }
    return NONE;
  }
  if (start && isSameDate(date, start)) return { ...NONE, isRangeStart: true };
  if (end && isSameDate(date, end)) return { ...NONE, isRangeEnd: true };
  if (
    start &&
    end &&
    compareDate(date, start) > 0 &&
    compareDate(date, end) < 0
  ) {
    return { ...NONE, isInRange: true };
  }
  return NONE;
}

/** The accessible-name state suffix for a range cell (e.g. ", today, start
 *  date"), appended to the full localized date in `RangeCalendarMonth`. Split
 *  out alongside `classifyRangeCell` to keep that component under the line
 *  budget. */
export function rangeLabelSuffix(
  cellState: RangeCellState,
  translateState: (key: "today" | "unavailable") => string,
  translateRange: (key: "startDate" | "endDate") => string,
  isToday: boolean,
  isDisabled: boolean,
): string {
  const suffixes: string[] = [];
  if (isToday) suffixes.push(translateState("today"));
  if (cellState.isRangeStart) suffixes.push(translateRange("startDate"));
  if (cellState.isRangeEnd) suffixes.push(translateRange("endDate"));
  if (isDisabled) suffixes.push(translateState("unavailable"));
  return suffixes.join(", ");
}
