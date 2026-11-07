import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { useRowDragReorder } from "../../../subprofiles/useRowDragReorder";
import { moveVjItem } from "../vjReorder";
import { orderVjItemsByIds, vjOrderKeyOf } from "./vjListOrder";

export interface VjListOrderOptions<Item> {
  items: readonly Item[];
  idOf: (item: Item) => string;
  /** Saves the full order shown; rejects with the refusal. */
  save: (orderedIds: string[]) => Promise<unknown>;
  /** The status line once a move lands: the moved item and its new 0-based index. */
  statusOf: (movedItem: Item, newIndex: number) => string;
}

export interface VjListOrder<Item> {
  /** The items in the order the list shows: a move in flight or a drag in
   *  progress, else the order the server holds. */
  orderedItems: Item[];
  /** Moves one item a step and saves at once (the up and down buttons). */
  moveBy: (index: number, direction: -1 | 1) => void;
  draggingIndex: number | null;
  gripHandlers: (index: number) => {
    onPointerDown: (event: ReactPointerEvent) => void;
  };
  /** Goes on the `<ol>` that holds only the rows, in render order. */
  listRef: RefObject<HTMLOListElement | null>;
  /** The refusal of the last save, or null. */
  error: unknown;
  /** The words for the `role="status"` line after a save, or null. */
  status: string | null;
  isSaving: boolean;
}

/**
 * The working order of a saved list (scenes, set lists, set list items): the
 * pack rail's rules with the endpoint lifted out. A drag reorders locally, one
 * swap per midpoint crossed, and saves once when the pointer lets go; an up or
 * down button moves one step and saves at once. The server order stays the
 * source of truth: a new server order replaces the local one, and a refused
 * save goes back to it and keeps the refusal in `error`. Only the newest save
 * may answer, so a slow earlier one never undoes a later move.
 */
export function useVjListOrder<Item>({
  items,
  idOf,
  save,
  statusOf,
}: VjListOrderOptions<Item>): VjListOrder<Item> {
  const serverOrderKey = vjOrderKeyOf(items.map(idOf));
  const [localIds, setLocalIds] = useState<string[] | null>(null);
  const [seededOrderKey, setSeededOrderKey] = useState(serverOrderKey);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [savingCount, setSavingCount] = useState(0);
  const latestSaveRef = useRef(0);
  // The order the newest save sent and how many saves are on their way: while
  // one is, the server will hold that order, so a move back to the order the
  // server answered last still has to be sent.
  const lastSentKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(0);

  // A new server order (a save landing, another tab) replaces the local one,
  // during render so the rows paint in the same commit. While a newer save is
  // on its way, an older answer leaves the local order showing.
  if (seededOrderKey !== serverOrderKey) {
    setSeededOrderKey(serverOrderKey);
    if (savingCount === 0) setLocalIds(null);
  }

  const orderedItems = orderVjItemsByIds(items, localIds, idOf);

  const saveOrder = (nextItems: Item[], movedItem: Item | null) => {
    const nextIds = nextItems.map(idOf);
    const nextKey = vjOrderKeyOf(nextIds);
    const pendingKey = inFlightRef.current > 0 ? lastSentKeyRef.current : null;
    if (nextKey === (pendingKey ?? serverOrderKey)) return;
    const saveNumber = latestSaveRef.current + 1;
    latestSaveRef.current = saveNumber;
    lastSentKeyRef.current = nextKey;
    inFlightRef.current += 1;
    setError(null);
    setSavingCount((count) => count + 1);
    void (async () => {
      try {
        await save(nextIds);
        if (latestSaveRef.current !== saveNumber || movedItem === null) return;
        const movedId = idOf(movedItem);
        setStatus(
          statusOf(
            movedItem,
            nextIds.findIndex((itemId) => itemId === movedId),
          ),
        );
      } catch (cause) {
        if (latestSaveRef.current !== saveNumber) return;
        // Refused: the server keeps the order it answered last.
        lastSentKeyRef.current = null;
        setLocalIds(null);
        setStatus(null);
        setError(cause);
      } finally {
        inFlightRef.current -= 1;
        setSavingCount((count) => count - 1);
      }
    })();
  };

  const move = (from: number, to: number) => {
    setLocalIds((currentIds) =>
      moveVjItem(
        orderVjItemsByIds(items, currentIds, idOf).map(idOf),
        from,
        to,
      ),
    );
  };

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(move);

  // Remember which item is held, and save once the drag lets go.
  const movedItemRef = useRef<Item | null>(null);
  const orderedKey = vjOrderKeyOf(orderedItems.map(idOf));
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    const isDragging = draggingIndex !== null;
    if (isDragging) {
      movedItemRef.current =
        orderedItems[draggingIndex] ?? movedItemRef.current;
    }
    if (wasDraggingRef.current && !isDragging) {
      saveOrder(orderedItems, movedItemRef.current);
      movedItemRef.current = null;
    }
    wasDraggingRef.current = isDragging;
    // The drag state and the order it settled on are the real inputs; the
    // item objects and `saveOrder` follow them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingIndex, orderedKey]);

  const moveBy = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedItems.length) return;
    const nextItems = moveVjItem(orderedItems, index, targetIndex);
    setLocalIds(nextItems.map(idOf));
    saveOrder(nextItems, orderedItems[index] ?? null);
  };

  return {
    orderedItems,
    moveBy,
    draggingIndex,
    gripHandlers,
    // The drag controller reads only the list's children and their boxes, so
    // the hook's div ref serves an ordered list as well.
    listRef: containerRef as unknown as RefObject<HTMLOListElement | null>,
    error,
    status,
    isSaving: savingCount > 0,
  };
}
