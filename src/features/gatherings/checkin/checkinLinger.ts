import type { AttendeeRow } from "../api/events.adapters";

/**
 * A row the host just checked in stays where it is, showing its new
 * "Arrived" chip, for this long before it moves to the Arrived group. Long
 * enough to see the confirmation land, short enough not to block the next tap.
 */
export const DOOR_LINGER_MS = 900;

/**
 * Splits the door's rows into the two groups, holding each lingering row in
 * "still to arrive" (with its new stamp, so it shows the Arrived chip) and
 * out of "arrived" until the linger ends.
 */
export function splitLingering(
  expectedRows: AttendeeRow[],
  arrivedRows: AttendeeRow[],
  lingering: ReadonlyMap<string, AttendeeRow>,
): { expected: AttendeeRow[]; arrived: AttendeeRow[] } {
  const expected = expectedRows
    .filter((attendee) => !attendee.checkedInAt || lingering.has(attendee.slug))
    .map((attendee) => lingering.get(attendee.slug) ?? attendee);
  const presentSlugs = new Set(expected.map((attendee) => attendee.slug));
  for (const lingeringRow of lingering.values()) {
    if (presentSlugs.has(lingeringRow.slug)) continue;
    const insertAt = expected.findIndex(
      (attendee) => attendee.name.localeCompare(lingeringRow.name) > 0,
    );
    if (insertAt === -1) expected.push(lingeringRow);
    else expected.splice(insertAt, 0, lingeringRow);
  }
  const arrived = arrivedRows.filter(
    (attendee) => attendee.checkedInAt != null && !lingering.has(attendee.slug),
  );
  return { expected, arrived };
}
