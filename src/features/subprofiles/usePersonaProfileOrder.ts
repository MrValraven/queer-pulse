import { useEffect, useRef, useState } from "react";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useGridDragReorder } from "./useGridDragReorder";

/** Moves `items[from]` to index `to`, leaving every other card's relative
 *  order unchanged. */
function movedTo<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

const orderKeyOf = (personas: SubprofileView[]) =>
  personas.map((persona) => persona.id).join("|");

/**
 * The working order of the personas listed on a member's profile while they
 * are rearranging them, on the personas dashboard.
 *
 * Reordering is optimistic on purpose: a drag that had to wait for a round
 * trip per step would stutter under the finger. The server list stays the
 * source of truth and re-seeds this whenever it changes, so a refused write
 * simply snaps back on the next read. The re-seed happens DURING render (the
 * "adjust state when a prop changes" pattern) rather than in an effect, so the
 * new order paints in the same commit instead of one frame late.
 *
 * A drag fires one step per neighbour crossed, so committing per step would
 * send a burst of writes for one gesture. The commit is deferred to the moment
 * the drag ends (`draggingIndex` falling back to null); the Move earlier /
 * Move later buttons, which are one discrete move each, commit straight away.
 *
 * Mirrors `useResourceShelfOrder` in communities, over the grid drag hook
 * rather than the row one.
 */
export function usePersonaProfileOrder(
  personas: SubprofileView[],
  commitOrder: (personaIds: string[]) => void,
) {
  const [orderedPersonas, setOrderedPersonas] = useState(personas);
  // The server order this hook last took as its starting point. Compared by
  // value, not by array identity, so a parent re-render with an equivalent
  // list never throws away a drag in progress.
  const [seededOrderKey, setSeededOrderKey] = useState(() =>
    orderKeyOf(personas),
  );
  const serverOrderKey = orderKeyOf(personas);
  if (seededOrderKey !== serverOrderKey) {
    setSeededOrderKey(serverOrderKey);
    setOrderedPersonas(personas);
  }

  // A drag that ends where it started costs nothing. The comparison is
  // against the order the SERVER currently holds, deliberately, rather than
  // against the last order this hook sent.
  //
  // Remembering the last sent order looks equivalent and is not. A write is
  // optimistic, so a refused one rolls the cache back to the previous order
  // while the "last sent" value still names the arrangement that failed. The
  // member, seeing their cards snap back, tries the same move again — and
  // that retry matches the remembered value exactly, so it would be skipped
  // as a no-op. The card would slide into place and nothing would be saved,
  // with no error to explain it, for as long as they kept attempting the one
  // arrangement they wanted. Comparing against the server order instead makes
  // a retry after a failure look like exactly what it is: a change.
  const commit = (next: SubprofileView[]) => {
    if (orderKeyOf(next) === serverOrderKey) return;
    commitOrder(next.map((persona) => persona.id));
  };

  const { containerRef, draggingIndex, gripHandlers } = useGridDragReorder(
    (from, to) => setOrderedPersonas((current) => movedTo(current, from, to)),
  );

  // Commit once the pointer is released, not once per neighbour crossed.
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    const isDragging = draggingIndex !== null;
    if (wasDraggingRef.current && !isDragging) commit(orderedPersonas);
    wasDraggingRef.current = isDragging;
    // `commit` closes over the current props and is stable in behaviour; the
    // drag state plus the order it settled on are the real inputs here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingIndex, orderedPersonas]);

  /** The keyboard and assistive-tech path: one discrete move, committed now. */
  const moveBy = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= orderedPersonas.length) return;
    const next = movedTo(orderedPersonas, index, target);
    setOrderedPersonas(next);
    commit(next);
  };

  return {
    orderedPersonas,
    containerRef,
    draggingIndex,
    gripHandlers,
    moveBy,
  };
}
