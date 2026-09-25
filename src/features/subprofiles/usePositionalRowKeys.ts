import { useCallback, useState } from "react";

let counter = 0;
const nextKey = () => `row-${(counter += 1)}`;

const makeKeys = (length: number): string[] =>
  Array.from({ length }, () => nextKey());

export interface PositionalRowKeys {
  /** One stable key per row, in row order. */
  keys: string[];
  /** Permute two rows' keys, alongside the same swap on the data. */
  swap: (from: number, to: number) => void;
  /** Drop one row's key, alongside removing that row from the data. */
  removeAt: (index: number) => void;
  /** Mint `count` keys at `index`, alongside inserting that many rows there
   *  (an append is `insertAt(length)`). */
  insertAt: (index: number, count?: number) => void;
  /** Keys minted by `insertAt`, so a row the person added can ease in while
   *  rows present on the first render, or reseeded from the server, do not. */
  insertedKeys: ReadonlySet<string>;
}

/**
 * Stable React keys for a positional list whose rows carry no id of their own.
 *
 * The skin-block editors persist their lists as bare `string[]` /
 * `Record<string, string>[]` inside the `skinData` jsonb, which is PATCHed
 * verbatim, so the repo's usual client-only `_uid` field would leak into the
 * saved payload. Keys live beside the data instead, and are permuted with it.
 *
 * Keying those rows by array index while supporting drag-reorder meant React
 * kept each DOM node in place and rewrote its value: reordering while an input
 * was focused left the caret sitting in a box that had silently become a
 * different row. `swap`/`removeAt`/`insertAt` must be called alongside the
 * matching data change; a list replaced from the server is reconciled by
 * length on the next render.
 */
export function usePositionalRowKeys(length: number): PositionalRowKeys {
  const [storedKeys, setKeys] = useState<string[]>(() => makeKeys(length));
  const [insertedKeys, setInsertedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // Adjust-while-rendering (the repo's snap pattern) so a row added, or a list
  // reseeded from the server, has its keys ready on this same paint. The
  // resized array is used directly rather than waiting for the state update,
  // so no row is ever rendered with an undefined key.
  const keys =
    storedKeys.length === length
      ? storedKeys
      : length > storedKeys.length
        ? [...storedKeys, ...makeKeys(length - storedKeys.length)]
        : storedKeys.slice(0, length);
  if (keys !== storedKeys) setKeys(keys);

  const swap = useCallback((from: number, to: number) => {
    setKeys((previous) => {
      if (
        from < 0 ||
        to < 0 ||
        from >= previous.length ||
        to >= previous.length
      ) {
        return previous;
      }
      const next = [...previous];
      [next[from], next[to]] = [next[to]!, next[from]!];
      return next;
    });
  }, []);

  const removeAt = useCallback((index: number) => {
    setKeys((previous) => previous.filter((_, at) => at !== index));
  }, []);

  // The keys are minted here, outside the updaters, so both stay pure.
  const insertAt = useCallback((index: number, count = 1) => {
    if (count < 1) return;
    const minted = makeKeys(count);
    setKeys((previous) => {
      const position = Math.max(0, Math.min(index, previous.length));
      return [
        ...previous.slice(0, position),
        ...minted,
        ...previous.slice(position),
      ];
    });
    setInsertedKeys((previous) => new Set([...previous, ...minted]));
  }, []);

  return { keys, swap, removeAt, insertAt, insertedKeys };
}
