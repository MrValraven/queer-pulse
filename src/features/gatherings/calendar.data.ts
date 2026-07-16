// Calendar month/weekday labels are never hand-rolled — `CalendarGrid` derives
// them locale-correctly through `useFormat()`. `CALENDAR_TODAY` stays here: a
// fixed "today" for the prototype's calendar demo, not translatable copy.
export const CALENDAR_TODAY = new Date(2026, 5, 3);

/**
 * A Monday-start reference week (2024-01-01 was a Monday) used only to derive
 * locale-correct weekday initials from `fmt.date(d, { weekday: "short" })` —
 * never a hardcoded English Mon/Tue array.
 */
export const WEEKDAY_REFERENCE: Date[] = [
  new Date(2024, 0, 1),
  new Date(2024, 0, 2),
  new Date(2024, 0, 3),
  new Date(2024, 0, 4),
  new Date(2024, 0, 5),
  new Date(2024, 0, 6),
  new Date(2024, 0, 7),
];
