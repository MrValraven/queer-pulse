import { useEffect, useRef, useState } from "react";
import { useRowDragReorder } from "../subprofiles/useRowDragReorder";
import type { ShelfResource } from "./api/useCommunityResources";

/** Moves `items[from]` to index `to`, leaving every other row's relative order
 *  unchanged. */
function movedTo<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

const orderKeyOf = (resources: ShelfResource[]) =>
  resources.map((resource) => resource.id ?? resource.title).join("|");

/**
 * The shelf's working order while a staff member is rearranging it.
 *
 * Reordering is optimistic on purpose: a drag that had to wait for a round
 * trip per swap would stutter under the finger. The server list stays the
 * source of truth and re-seeds this whenever it changes, so a refused write
 * simply snaps back on the next read. The re-seed happens DURING render (the
 * "adjust state when a prop changes" pattern) rather than in an effect, so the
 * new order paints in the same commit instead of one frame late.
 *
 * A drag fires one swap per midpoint crossed, so committing per swap would
 * send a burst of writes for one gesture. The commit is deferred to the moment
 * the drag ends (`draggingIndex` falling back to null); the arrow buttons,
 * which are one discrete move each, commit straight away.
 */
export function useResourceShelfOrder(
  resources: ShelfResource[],
  commitOrder: (resourceIds: string[]) => void,
) {
  const [orderedResources, setOrderedResources] = useState(resources);
  // The server order this hook last took as its starting point. Compared by
  // value, not by array identity, so a parent re-render with an equivalent
  // list never throws away a drag in progress.
  const [seededOrderKey, setSeededOrderKey] = useState(() =>
    orderKeyOf(resources),
  );
  const serverOrderKey = orderKeyOf(resources);
  if (seededOrderKey !== serverOrderKey) {
    setSeededOrderKey(serverOrderKey);
    setOrderedResources(resources);
  }

  // The order last SENT to the server, so a drag that ends where it started
  // costs nothing. Only ever written from a callback or an effect, never
  // during render.
  const lastSentOrderKeyRef = useRef(serverOrderKey);

  const commit = (next: ShelfResource[]) => {
    const nextOrderKey = orderKeyOf(next);
    if (nextOrderKey === lastSentOrderKeyRef.current) return;
    lastSentOrderKeyRef.current = nextOrderKey;
    // Every id, exactly once, in the order shown — the only shape the reorder
    // endpoint accepts. Rows without an id are demo fixtures, which the editor
    // never renders, so this filter can only be a no-op in practice.
    commitOrder(
      next
        .map((resource) => resource.id)
        .filter((id): id is string => Boolean(id)),
    );
  };

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setOrderedResources((current) => movedTo(current, from, to)),
  );

  // Commit once the pointer is released, not once per midpoint crossed.
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    const isDragging = draggingIndex !== null;
    if (wasDraggingRef.current && !isDragging) commit(orderedResources);
    wasDraggingRef.current = isDragging;
    // `commit` closes over the current props and is stable in behaviour; the
    // drag state plus the order it settled on are the real inputs here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingIndex, orderedResources]);

  /** The keyboard and assistive-tech path: one discrete move, committed now. */
  const moveBy = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= orderedResources.length) return;
    const next = movedTo(orderedResources, index, target);
    setOrderedResources(next);
    commit(next);
  };

  return {
    orderedResources,
    containerRef,
    draggingIndex,
    gripHandlers,
    moveBy,
  };
}
