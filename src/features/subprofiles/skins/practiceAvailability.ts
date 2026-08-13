import type { PracticeAvailState } from "../api/subprofiles.api";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface AvailCellVM {
  day: number;
  month: string;
  state: PracticeAvailState;
}

/**
 * Practice skin (therapist): derives a 4×7 calendar grid from the persisted
 * `skinData.availability` — `startDate` (a Monday) + 28 tri-state `cells` in
 * row-major (week, day-of-week) order. Day numbers and month labels are
 * computed from `startDate` rather than persisted, so the grid always reads
 * as calendar-accurate. `null` when `availability` is absent or malformed
 * (wrong cell count / unparsable date) — callers render nothing in that case.
 */
export function deriveCalendar(
  availability:
    | { startDate: string; slotTime: string; cells: PracticeAvailState[] }
    | null
    | undefined,
): { weeks: AvailCellVM[][]; slotTime: string } | null {
  if (!availability || availability.cells.length !== 28) return null;
  const start = new Date(`${availability.startDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return null;

  const weeks: AvailCellVM[][] = [];
  for (let week = 0; week < 4; week++) {
    const row: AvailCellVM[] = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const index = week * 7 + dayOfWeek;
      const date = new Date(start.getTime() + index * 86400000);
      row.push({
        day: date.getUTCDate(),
        month: MONTHS[date.getUTCMonth()]!,
        state: availability.cells[index]!,
      });
    }
    weeks.push(row);
  }
  return { weeks, slotTime: availability.slotTime };
}
