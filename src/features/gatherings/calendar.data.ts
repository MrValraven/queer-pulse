// Calendar month/weekday labels are never hand-rolled — `CalendarGrid` derives
// them locale-correctly through `useFormat()`. `CALENDAR_TODAY` is the real
// current day (normalized to local midnight so day-equality and the "upcoming"
// filter behave), used to ring today's cell and gate upcoming events.
export const CALENDAR_TODAY = (() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
})();

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
