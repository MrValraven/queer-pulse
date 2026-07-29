import { useCallback, useState } from "react";

let rowKeyCounter = 0;
function nextRowKey(): string {
  rowKeyCounter += 1;
  return `row-${rowKeyCounter}`;
}

/**
 * Stable per-row React keys for list editors (board / groups / skills) whose
 * data items carry no id of their own. Editing a row replaces its item object
 * (spread copy), so keying by the object reference — or worse, the array index —
 * would remount the row and drop input focus mid-keystroke. Instead we keep an
 * id list in state and mutate it in lockstep with the editor's own add/remove:
 *
 *   const { keys, appendKey, removeKeyAt } = useRowKeys(items.length);
 *   // add:    appendKey();      onChange([...items, blank]);
 *   // remove: removeKeyAt(idx); onChange(items.filter((_, i) => i !== idx));
 *
 * The editor is the sole mutator while mounted, so `keys` stays aligned with the
 * item list; `initialLength` seeds the ids for the rows present on mount.
 */
export function useRowKeys(initialLength: number) {
  const [keys, setKeys] = useState<string[]>(() =>
    Array.from({ length: initialLength }, () => nextRowKey()),
  );

  const appendKey = useCallback(
    () => setKeys((previous) => [...previous, nextRowKey()]),
    [],
  );

  const removeKeyAt = useCallback(
    (index: number) =>
      setKeys((previous) =>
        previous.filter((_, position) => position !== index),
      ),
    [],
  );

  return { keys: keys as readonly string[], appendKey, removeKeyAt };
}
