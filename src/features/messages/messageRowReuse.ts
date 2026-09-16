// src/features/messages/messageRowReuse.ts
import type { MessageRow } from "./messageRows";
import type { MessageRun } from "./messageRuns";

/** True when two runs render identically: every own field of the run is the
 *  same value, with `items` compared element by element (it is a fresh array
 *  on every build, holding referentially stable messages). Generic over the
 *  run's fields for the same reason `isSameRow` is. */
function isSameRun(previous: MessageRun, next: MessageRun): boolean {
  if (previous === next) return true;
  const previousFields = previous as unknown as Record<string, unknown>;
  const nextFields = next as unknown as Record<string, unknown>;
  const fieldNames = Object.keys(nextFields);
  if (fieldNames.length !== Object.keys(previousFields).length) return false;
  for (const fieldName of fieldNames) {
    if (fieldName === "items") {
      if (previous.items.length !== next.items.length) return false;
      for (let index = 0; index < next.items.length; index += 1) {
        if (previous.items[index] !== next.items[index]) return false;
      }
      continue;
    }
    if (!Object.is(previousFields[fieldName], nextFields[fieldName])) {
      return false;
    }
  }
  return true;
}

/** True when two rows with the same key would render identically: every own
 *  field is the same value, and for a run, an equivalent run (see
 *  `isSameRun`). Generic over the row's fields (rather than a per-kind list)
 *  so a field a later change adds to a row kind is compared too, instead of
 *  being silently treated as equal. */
function isSameRow(previous: MessageRow, next: MessageRow): boolean {
  if (previous === next) return true;
  const previousFields = previous as unknown as Record<string, unknown>;
  const nextFields = next as unknown as Record<string, unknown>;
  const fieldNames = Object.keys(nextFields);
  if (fieldNames.length !== Object.keys(previousFields).length) return false;
  for (const fieldName of fieldNames) {
    if (fieldName === "run" && previous.kind === "run" && next.kind === "run") {
      if (!isSameRun(previous.run, next.run)) return false;
      continue;
    }
    if (!Object.is(previousFields[fieldName], nextFields[fieldName])) {
      return false;
    }
  }
  return true;
}

/**
 * Structural sharing for the virtualized row list. `buildMessageRows` makes a
 * brand new row (and run) object for every row on every cache patch, which
 * defeated `MessageAreaRow`'s and `MessageRunView`'s `memo` for every mounted
 * row on every socket frame. The returned function hands back the PREVIOUS
 * row object whenever the rebuilt one is equivalent (see `isSameRow`), and the
 * previous array itself when nothing changed at all, so only the rows whose
 * messages actually changed get a new reference.
 *
 * The cache is a pure memo: reusing an equivalent object is correct whether
 * or not the render that produced it committed, so a discarded concurrent or
 * StrictMode render can only make the next call reuse more, never render
 * something different. It holds only the last list, so it never grows across
 * thread switches.
 */
export function createMessageRowReuser(): (
  nextRows: MessageRow[],
) => MessageRow[] {
  let previousRows: MessageRow[] = [];
  let previousByKey = new Map<string, MessageRow>();
  return (nextRows) => {
    const nextByKey = new Map<string, MessageRow>();
    let isEveryRowReused = nextRows.length === previousRows.length;
    const stableRows = nextRows.map((nextRow, index) => {
      const previousRow = previousByKey.get(nextRow.key);
      const stableRow =
        previousRow !== undefined && isSameRow(previousRow, nextRow)
          ? previousRow
          : nextRow;
      if (stableRow !== previousRows[index]) isEveryRowReused = false;
      nextByKey.set(stableRow.key, stableRow);
      return stableRow;
    });
    if (isEveryRowReused) return previousRows;
    previousRows = stableRows;
    previousByKey = nextByKey;
    return stableRows;
  };
}
