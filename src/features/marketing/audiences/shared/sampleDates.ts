/**
 * Dates for sample content, counted from today so a sample gig or event is
 * always upcoming, however long after the build someone opens the page.
 */

function shiftedDate(today: Date, daysFromToday: number): Date {
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysFromToday,
  );
}

/** The local calendar day `daysFromToday` away, as `YYYY-MM-DD`. */
export function sampleIsoDate(today: Date, daysFromToday: number): string {
  const day = shiftedDate(today, daysFromToday);
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${dayOfMonth}`;
}

/** A local date and time `daysFromToday` away, at `hour:minute`. */
export function sampleDateTime(
  today: Date,
  daysFromToday: number,
  hour: number,
  minute = 0,
): Date {
  const day = shiftedDate(today, daysFromToday);
  day.setHours(hour, minute, 0, 0);
  return day;
}
