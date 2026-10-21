import { useCallback, useId, useMemo, useRef, useState } from "react";

/** A list's multi-select state, handed to every `StudioTrackRow` in the list
 *  and to the `StudioSelectionBar` above the player. */
export interface StudioRowSelection {
  /** Selection mode is on: rows show their checkbox and a press toggles. */
  isSelecting: boolean;
  /** The picked ids, always a subset of the list's current ids. */
  selectedIds: ReadonlySet<string>;
  /** The picked ids in list order, ready for a bulk action. */
  orderedSelectedIds: string[];
  /** Every row in the list is picked (false for an empty list). */
  isAllSelected: boolean;
  isSelected: (id: string) => boolean;
  /** Flips one row. With `withShift`, every row between the last toggled
   *  row and this one takes the state this row lands on. Turns selection
   *  mode on when it is off. */
  toggle: (id: string, withShift?: boolean) => void;
  selectAll: () => void;
  /** Empties the selection and leaves selection mode. */
  clear: () => void;
  /** Turns selection mode on, optionally with one row already picked. */
  start: (initialId?: string) => void;
  /** The last row toggled or picked, kept through `clear`, so focus can go
   *  back to it when selection mode ends. Null when none was. */
  getFocusAnchorId: () => string | null;
  /** Where that row sat in the list, so focus can land on its nearest
   *  neighbour when a bulk removal took it away. */
  getFocusAnchorIndex: () => number;
  /** Tags this list's rows (`data-selection-list`), so the bar finds them
   *  and no other list on the page. */
  listId: string;
}

/** Joins ids into one dependency key; no id carries a control character. */
const ID_SEPARATOR = "\u0000";

function rangeBetween(ids: string[], fromId: string, toId: string): string[] {
  const fromIndex = ids.indexOf(fromId);
  const toIndex = ids.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1) return [toId];
  const [startIndex, endIndex] =
    fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
  return ids.slice(startIndex, endIndex + 1);
}

/** Multi-select over a list of row ids (track ids, or entry ids where one
 *  track can sit twice). Ids that leave the list (a removal, a filter) drop
 *  out of the selection on their own, so a bulk action never reaches a row
 *  the member can no longer see. */
export function useStudioRowSelection(ids: string[]): StudioRowSelection {
  const [isSelecting, setIsSelecting] = useState(false);
  const [pickedIds, setPickedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const anchorIdRef = useRef<string | null>(null);
  const focusAnchorIdRef = useRef<string | null>(null);
  const focusAnchorIndexRef = useRef(0);

  // Callers build `ids` afresh each render; the joined key keeps the
  // callbacks below stable until the list itself changes.
  const idsKey = ids.join(ID_SEPARATOR);
  const orderedIds = useMemo(
    () => (idsKey === "" ? [] : idsKey.split(ID_SEPARATOR)),
    [idsKey],
  );
  const { selectedIds, orderedSelectedIds } = useMemo(() => {
    const visible = orderedIds.filter((id) => pickedIds.has(id));
    return { selectedIds: new Set(visible), orderedSelectedIds: visible };
  }, [orderedIds, pickedIds]);

  const toggle = useCallback(
    (id: string, withShift = false) => {
      // Read the anchor now: the updater runs after the ref moves to `id`.
      const anchorId = anchorIdRef.current;
      setIsSelecting(true);
      setPickedIds((previous) => {
        const next = new Set(previous);
        const shouldSelect = !previous.has(id);
        const affectedIds =
          withShift && anchorId !== null
            ? rangeBetween(orderedIds, anchorId, id)
            : [id];
        for (const affectedId of affectedIds) {
          if (shouldSelect) next.add(affectedId);
          else next.delete(affectedId);
        }
        return next;
      });
      anchorIdRef.current = id;
      focusAnchorIdRef.current = id;
      focusAnchorIndexRef.current = Math.max(0, orderedIds.indexOf(id));
    },
    [orderedIds],
  );

  const selectAll = useCallback(() => {
    setIsSelecting(true);
    setPickedIds(new Set(orderedIds));
  }, [orderedIds]);

  const clear = useCallback(() => {
    anchorIdRef.current = null;
    setIsSelecting(false);
    setPickedIds(new Set());
  }, []);

  const start = useCallback(
    (initialId?: string) => {
      setIsSelecting(true);
      if (initialId === undefined) return;
      anchorIdRef.current = initialId;
      focusAnchorIdRef.current = initialId;
      focusAnchorIndexRef.current = Math.max(0, orderedIds.indexOf(initialId));
      setPickedIds((previous) => new Set(previous).add(initialId));
    },
    [orderedIds],
  );

  const listId = useId();
  const getFocusAnchorId = useCallback(() => focusAnchorIdRef.current, []);
  const getFocusAnchorIndex = useCallback(
    () => focusAnchorIndexRef.current,
    [],
  );

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const isAllSelected =
    orderedIds.length > 0 && orderedSelectedIds.length === orderedIds.length;

  return useMemo(
    () => ({
      isSelecting,
      selectedIds,
      orderedSelectedIds,
      isAllSelected,
      isSelected,
      toggle,
      selectAll,
      clear,
      start,
      getFocusAnchorId,
      getFocusAnchorIndex,
      listId,
    }),
    [
      isSelecting,
      selectedIds,
      orderedSelectedIds,
      isAllSelected,
      isSelected,
      toggle,
      selectAll,
      clear,
      start,
      getFocusAnchorId,
      getFocusAnchorIndex,
      listId,
    ],
  );
}
