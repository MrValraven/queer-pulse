import { useState } from "react";

/**
 * Pairs the next list of row values with the keys of the previous list, so a
 * row keeps its key through an in-place edit. Matching runs in this order:
 *
 * 1. A next value equal to the previous value at the same index keeps that
 *    key, so clearing a row to `""` beside an existing empty row leaves both
 *    rows where they were.
 * 2. Any other next value equal to a still-unused previous value takes the
 *    first unused occurrence's key, so duplicates pair in order and a reorder
 *    moves rows with their keys.
 * 3. The next values still unmatched are edits. When as many previous keys
 *    are left over, they pair up in position order. When the counts differ,
 *    an unmatched row whose index also holds an unused previous key takes it.
 * 4. Every row left gets `nextFreshKey()`, which must never repeat a key.
 *
 * Pure: the same inputs and fresh-key sequence give the same keys.
 */
export function matchRowKeys(
  previousValues: string[],
  previousKeys: string[],
  nextValues: string[],
  nextFreshKey: () => string,
): string[] {
  const nextKeys: (string | undefined)[] = nextValues.map(() => undefined);
  const isPreviousUsed = previousValues.map(() => false);

  nextValues.forEach((value, index) => {
    if (index < previousValues.length && previousValues[index] === value) {
      nextKeys[index] = previousKeys[index];
      isPreviousUsed[index] = true;
    }
  });

  const unusedIndexesByValue = new Map<string, number[]>();
  previousValues.forEach((value, index) => {
    if (isPreviousUsed[index]) return;
    const indexes = unusedIndexesByValue.get(value) ?? [];
    indexes.push(index);
    unusedIndexesByValue.set(value, indexes);
  });
  nextValues.forEach((value, index) => {
    if (nextKeys[index] !== undefined) return;
    const previousIndex = unusedIndexesByValue.get(value)?.shift();
    if (previousIndex === undefined) return;
    nextKeys[index] = previousKeys[previousIndex];
    isPreviousUsed[previousIndex] = true;
  });

  const unmatchedNextIndexes = nextValues
    .map((_, index) => index)
    .filter((index) => nextKeys[index] === undefined);
  const unusedPreviousIndexes = previousValues
    .map((_, index) => index)
    .filter((index) => !isPreviousUsed[index]);

  if (unmatchedNextIndexes.length === unusedPreviousIndexes.length) {
    unmatchedNextIndexes.forEach((nextIndex, position) => {
      const previousIndex = unusedPreviousIndexes[position];
      if (previousIndex !== undefined) {
        nextKeys[nextIndex] = previousKeys[previousIndex];
      }
    });
  } else {
    const unusedPreviousIndexSet = new Set(unusedPreviousIndexes);
    for (const nextIndex of unmatchedNextIndexes) {
      if (unusedPreviousIndexSet.delete(nextIndex)) {
        nextKeys[nextIndex] = previousKeys[nextIndex];
      }
    }
  }

  return nextKeys.map((key) => key ?? nextFreshKey());
}

function haveSameValues(first: string[], second: string[]): boolean {
  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

interface RowKeyState {
  values: string[];
  keys: string[];
  /** How many fresh keys this list has handed out, so the next is unique. */
  freshKeyCount: number;
}

function freshKeys(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `row-${index}`);
}

/**
 * React keys for a list of free-text rows that survive an in-place edit.
 * `occurrenceKeys` builds a key from the value itself, so while the owner
 * types into a row its key changes on every keystroke, and AnimatePresence
 * folds the old row out and grows a new one in once per character. This hook
 * remembers the previous values and keys and pairs them with the new ones
 * through `matchRowKeys`: an edited row keeps its key, a removed row's key
 * exits, and an added row gets a fresh `row-<n>` key that is unique for the
 * component's lifetime.
 *
 * The previous render's values live in state and are compared during render
 * (React's "storing information from previous renders" pattern), so the keys
 * are right in the same render, with no effect and no ref read during render.
 */
export function useStableRowKeys(values: string[]): string[] {
  const [rowKeyState, setRowKeyState] = useState<RowKeyState>(() => ({
    values,
    keys: freshKeys(values.length),
    freshKeyCount: values.length,
  }));

  if (haveSameValues(rowKeyState.values, values)) return rowKeyState.keys;

  let freshKeyCount = rowKeyState.freshKeyCount;
  const keys = matchRowKeys(
    rowKeyState.values,
    rowKeyState.keys,
    values,
    () => `row-${freshKeyCount++}`,
  );
  setRowKeyState({ values, keys, freshKeyCount });
  return keys;
}
