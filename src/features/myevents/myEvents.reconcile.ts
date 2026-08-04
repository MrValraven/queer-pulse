/**
 * Reconcile-by-id helpers for the My Events dashboard's local mirror of a
 * react-query source list.
 *
 * The dashboard copies the fetched `events`/`notifs` into local state so RSVP,
 * bulk-remove, and read toggles can update rows optimistically. The hazard is
 * the query-mirror antipattern: a *background* refetch (window refocus,
 * reconnect, or an `eventKeys` invalidation from another mutation) produces a
 * fresh source array, and a naive `setState(source)` resync clobbers every
 * in-flight optimistic edit the user just made — the row snaps back to server
 * truth mid-interaction.
 *
 * These helpers reconcile the incoming source against local state **by id**:
 * an untouched row adopts fresh server truth, while a row the user has locally
 * edited (tracked in `dirtyIds`) keeps its optimistic value until the session
 * ends. No mutation is lost to a background refetch.
 */

/**
 * Records which ids diverged from the previous state after a *local* edit —
 * rows whose object identity changed (edited), rows that are new (added), and
 * rows that disappeared (removed). Route the SERVER resync through the raw
 * setter, never this, so a resync never marks anything dirty.
 */
export function trackDirty<T extends { id: string }>(
  previous: T[],
  next: T[],
  dirtyIds: Set<string>,
): void {
  const previousById = new Map(previous.map((row) => [row.id, row]));
  const nextIds = new Set<string>();
  for (const nextRow of next) {
    nextIds.add(nextRow.id);
    // A changed reference means the row was optimistically edited; an id absent
    // from `previous` means it was optimistically added.
    if (previousById.get(nextRow.id) !== nextRow) dirtyIds.add(nextRow.id);
  }
  // Ids present before but gone now were optimistically removed.
  for (const previousRow of previous) {
    if (!nextIds.has(previousRow.id)) dirtyIds.add(previousRow.id);
  }
}

/**
 * Merges a freshly-fetched `server` list into `local` state without overwriting
 * any row flagged in `dirtyIds`:
 *
 * - server row, not dirty  → adopt it (fresh truth for an untouched row)
 * - server row, dirty, still local → keep the local (in-flight) version
 * - server row, dirty, gone from local → it was removed locally; stays removed
 * - local row, dirty, absent server-side → optimistic local-only addition; kept
 * - local row, not dirty, absent server-side → server dropped it; dropped here too
 *
 * Server order is preserved; local-only optimistic additions trail at the end,
 * mirroring where a just-created row would sit before a refetch reorders it.
 */
export function reconcileById<T extends { id: string }>(
  local: T[],
  server: T[],
  dirtyIds: ReadonlySet<string>,
): T[] {
  const localById = new Map(local.map((row) => [row.id, row]));
  const serverIds = new Set(server.map((row) => row.id));
  const result: T[] = [];
  for (const serverRow of server) {
    if (!dirtyIds.has(serverRow.id)) {
      result.push(serverRow);
      continue;
    }
    const localRow = localById.get(serverRow.id);
    if (localRow) result.push(localRow);
    // else: removed locally while dirty → omit so it stays removed
  }
  for (const localRow of local) {
    if (dirtyIds.has(localRow.id) && !serverIds.has(localRow.id)) {
      result.push(localRow);
    }
  }
  return result;
}
