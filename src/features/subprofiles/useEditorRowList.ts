/**
 * Shared add/remove/patch/cap logic for the persona editor's `_uid`-keyed,
 * context-controlled row lists (social links, affiliations). Both editors hold
 * their rows in `SubprofileEditorContext` (no local state, no Save button — the
 * global savebar PUTs the whole list), so this hook owns no state of its own:
 * it just derives the mutation callbacks over the caller-supplied `rows`/
 * `setRows`, capped at `max`, seeding new rows via `makeEmpty()`.
 */
export function useEditorRowList<Row extends { _uid: string }>(
  rows: Row[],
  setRows: (rows: Row[]) => void,
  { max, makeEmpty }: { max: number; makeEmpty: () => Row },
): {
  patch: (uid: string, patchValue: Partial<Row>) => void;
  remove: (uid: string) => void;
  add: () => void;
  atMax: boolean;
} {
  const atMax = rows.length >= max;

  function patch(uid: string, patchValue: Partial<Row>) {
    setRows(rows.map((row) => (row._uid === uid ? { ...row, ...patchValue } : row)));
  }
  function remove(uid: string) {
    setRows(rows.filter((row) => row._uid !== uid));
  }
  function add() {
    if (atMax) return;
    setRows([...rows, makeEmpty()]);
  }

  return { patch, remove, add, atMax };
}
