import type { AttendeeRow } from "../api/events.adapters";

/**
 * A guest's row as the door holds it right now, so the open details follow
 * a check-in from the dialog, a scan or another host. A lingering row comes
 * first because it carries the stamp this device just made; the roster's
 * first page backs up the groups, since "Arrived" is not fetched while it is
 * folded and a guest another host checks in leaves "Still to arrive".
 */
export function findGuestRow(
  slug: string,
  sources: {
    lingeringRows: ReadonlyMap<string, AttendeeRow>;
    expectedRows: AttendeeRow[];
    arrivedRows: AttendeeRow[];
    rosterRows: AttendeeRow[];
  },
): AttendeeRow | undefined {
  const isGuest = (row: AttendeeRow) => row.slug === slug;
  return (
    sources.lingeringRows.get(slug) ??
    sources.expectedRows.find(isGuest) ??
    sources.arrivedRows.find(isGuest) ??
    sources.rosterRows.find(isGuest)
  );
}
