/**
 * Undo primitives for the moderation queue (FE-ADM-15).
 *
 * **Invariant: Undo restores BY ID into the CURRENT list.** Replaying a whole
 * array snapshot is what caused the bug these helpers close. The queue's undo
 * window is 5.6s, which is long enough
 * for a moderator to dismiss report A, dismiss report B, and only then click
 * Undo on A. Restoring `setOpen(snapshotTakenBeforeA)` puts B back too, even
 * though B's own deferred commit is still scheduled and about to resolve it
 * server-side. The moderator then sees an open row that is already gone, acts on
 * it a second time, and the member gets a duplicate audit entry and a second
 * notification.
 *
 * Capturing only the rows one action removed, plus where each sat, lets Undo
 * splice exactly those rows back into whatever the list looks like now, so a
 * concurrent action's removal survives untouched.
 */

/** One row lifted out of a list, with the index it sat at when it was removed. */
export interface RemovedRow<Row> {
  index: number;
  row: Row;
}

/** Snapshot the rows `ids` refers to, together with their positions. */
export function captureRemovedRows<Row extends { id: string }>(
  rows: Row[],
  ids: string[],
): RemovedRow<Row>[] {
  const removingIds = new Set(ids);
  const captured: RemovedRow<Row>[] = [];
  rows.forEach((row, index) => {
    if (removingIds.has(row.id)) captured.push({ index, row });
  });
  return captured;
}

/**
 * Splice `removed` back into `list` at their original positions. Applied in
 * ascending index order so each earlier re-insert has already shifted the array
 * by the time the next one lands, and clamped to the list length because a
 * concurrent action may have shortened it in the meantime. Rows already present
 * are skipped, so a double-Undo can never duplicate a row.
 */
export function withRowsRestored<Row extends { id: string }>(
  list: Row[],
  removed: RemovedRow<Row>[],
): Row[] {
  const presentIds = new Set(list.map((row) => row.id));
  const restored = [...list];
  [...removed]
    .filter((entry) => !presentIds.has(entry.row.id))
    .sort((first, second) => first.index - second.index)
    .forEach((entry) => {
      restored.splice(Math.min(entry.index, restored.length), 0, entry.row);
    });
  return restored;
}

/** What one optimistic removal hands back to its Undo handler: the rows it
 *  took out, and a way to cancel its own still-pending leave-animation timer
 *  without disturbing any other in-flight action's. */
export interface RemovalHandle<Row> {
  removed: RemovedRow<Row>[];
  cancel: () => void;
}
