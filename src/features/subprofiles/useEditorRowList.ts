import { useLayoutEffect, useRef, useState } from "react";

/**
 * Shared add/remove/patch/move/cap logic for the persona editor's `_uid`-keyed,
 * context-controlled row lists (social links, affiliations). Both editors hold
 * their rows in `SubprofileEditorContext` (no local state, no Save button: the
 * global savebar PUTs the whole list, in row order), so this hook owns no row
 * state of its own: it just derives the mutation callbacks over the
 * caller-supplied `rows`/`setRows`, capped at `max`, seeding new rows via
 * `makeEmpty()`. `isAddedRow` names the rows `add` created in this session,
 * so they can ease in while rows already there on the first render do not.
 */
export function useEditorRowList<Row extends { _uid: string }>(
  rows: Row[],
  setRows: (rows: Row[]) => void,
  { max, makeEmpty }: { max: number; makeEmpty: () => Row },
): {
  patch: (uid: string, patchValue: Partial<Row>) => void;
  remove: (uid: string) => void;
  add: () => void;
  move: (from: number, to: number) => void;
  atMax: boolean;
  isAddedRow: (uid: string) => boolean;
} {
  const atMax = rows.length >= max;
  const [addedUids, setAddedUids] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // The newest list, advanced synchronously by every write, so a second write
  // fired before the re-render (a fast drag's next swap, an edit right after a
  // move) builds on the first.
  const latestRowsRef = useRef(rows);
  useLayoutEffect(() => {
    latestRowsRef.current = rows;
  });

  function write(next: Row[]) {
    latestRowsRef.current = next;
    setRows(next);
  }

  function patch(uid: string, patchValue: Partial<Row>) {
    write(
      latestRowsRef.current.map((row) =>
        row._uid === uid ? { ...row, ...patchValue } : row,
      ),
    );
  }
  function remove(uid: string) {
    write(latestRowsRef.current.filter((row) => row._uid !== uid));
  }
  function add() {
    const current = latestRowsRef.current;
    if (current.length >= max) return;
    const row = makeEmpty();
    setAddedUids((previous) => new Set([...previous, row._uid]));
    write([...current, row]);
  }
  function move(from: number, to: number) {
    const current = latestRowsRef.current;
    if (from === to || from < 0 || from >= current.length) return;
    if (to < 0 || to >= current.length) return;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    write(next);
  }

  return {
    patch,
    remove,
    add,
    move,
    atMax,
    isAddedRow: (uid) => addedUids.has(uid),
  };
}
