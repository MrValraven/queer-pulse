const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The `YYYY-MM-DD` day `days` calendar days after `day` (negative goes
 *  back), by UTC date arithmetic on the text so no time zone shift can skip
 *  or repeat a day. Text that is no `YYYY-MM-DD` day comes back unchanged. */
export function addCalendarDays(day: string, days: number): string {
  const match = DAY_PATTERN.exec(day);
  if (match === null) return day;
  const shifted = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days),
  );
  return shifted.toISOString().slice(0, 10);
}

/** The due day of a task made from a checklist step (contract 7.5): null
 *  for a step with no day, else the event day minus `daysBefore` calendar
 *  days, so `-1` is the day after the event. The backend's
 *  `cultural-guide-sections.ts` answers the same. */
export function dueOnForStep(
  eventOn: string,
  daysBefore: number | null,
): string | null {
  if (daysBefore === null) return null;
  return addCalendarDays(eventOn, -daysBefore);
}
