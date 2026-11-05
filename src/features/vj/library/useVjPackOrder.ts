import { useEffect, useRef, useState, type RefObject } from "react";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import { useInvalidateVjLibrary } from "../api/useInvalidateVjLibrary";
import { useReorderVjPacks } from "../api/useVjPackMutations";
import { vjReasonOf } from "../vjErrors";
import { moveVjItem } from "./vjReorder";

const orderKeyOf = (packIds: readonly string[]) => packIds.join("|");

/** The packs in the local id order. A pack the local order does not know yet
 *  (created in another tab mid-drag) goes last; a pack that left is dropped.
 *  Each pack is the fresh server object, so a rename shows at once. */
function orderPacks(
  packs: readonly VjPackDTO[],
  localPackIds: readonly string[] | null,
): VjPackDTO[] {
  if (localPackIds === null) return [...packs];
  const packById = new Map(packs.map((pack) => [pack.id, pack]));
  const placedIds = new Set(localPackIds);
  const placed = localPackIds
    .map((packId) => packById.get(packId))
    .filter((pack): pack is VjPackDTO => pack !== undefined);
  return [...placed, ...packs.filter((pack) => !placedIds.has(pack.id))];
}

/**
 * The pack rail's working order. A drag reorders locally, one swap per
 * midpoint crossed, and saves once when the pointer lets go; an up or down
 * button saves at once. The server order stays the source of truth: a new
 * server order replaces the local one, and a refused save goes back to it and
 * keeps the refusal in `error`. `status` names where the moved pack landed.
 *
 * `move` is the local swap the drag drives, `commit` saves the order shown,
 * `moveBy` is the button path (move one step and save).
 */
export function useVjPackOrder(packs: readonly VjPackDTO[]) {
  const { t } = useTranslation();
  const reorderPacks = useReorderVjPacks();
  const invalidateLibrary = useInvalidateVjLibrary();
  const serverOrderKey = orderKeyOf(packs.map((pack) => pack.id));
  const [localPackIds, setLocalPackIds] = useState<string[] | null>(null);
  const [seededOrderKey, setSeededOrderKey] = useState(serverOrderKey);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<string | null>(null);

  // A new server order (a save landing, another tab) replaces the local one,
  // during render so the rows paint in the same commit.
  if (seededOrderKey !== serverOrderKey) {
    setSeededOrderKey(serverOrderKey);
    setLocalPackIds(null);
  }

  const orderedPacks = orderPacks(packs, localPackIds);

  const saveOrder = (nextPacks: VjPackDTO[], movedPackId: string | null) => {
    const nextPackIds = nextPacks.map((pack) => pack.id);
    if (orderKeyOf(nextPackIds) === serverOrderKey) return;
    setError(null);
    reorderPacks.mutate(
      { packIds: nextPackIds },
      {
        onSuccess: (savedPacks) => {
          const savedIndex = savedPacks.findIndex(
            (pack) => pack.id === movedPackId,
          );
          const movedPack = savedPacks[savedIndex];
          if (movedPack === undefined) return;
          setStatus(
            t("vj:packs.movedStatus", {
              name: movedPack.name,
              position: savedIndex + 1,
            }),
          );
        },
        onError: (cause) => {
          setLocalPackIds(null);
          setStatus(null);
          setError(cause);
          // Someone else changed the packs: read them again so the rail shows
          // the order the refusal talks about.
          if (vjReasonOf(cause) === "VJ_PACK_REORDER_MISMATCH") {
            invalidateLibrary(null);
          }
        },
      },
    );
  };

  const move = (from: number, to: number) => {
    setLocalPackIds((currentIds) =>
      moveVjItem(
        orderPacks(packs, currentIds).map((pack) => pack.id),
        from,
        to,
      ),
    );
  };

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(move);

  const movedPackIdRef = useRef<string | null>(null);
  const commit = () => {
    saveOrder(orderedPacks, movedPackIdRef.current);
  };

  // Remember which pack is held, and save once the drag lets go.
  const orderedKey = orderKeyOf(orderedPacks.map((pack) => pack.id));
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    const isDragging = draggingIndex !== null;
    if (isDragging) {
      movedPackIdRef.current =
        orderedPacks[draggingIndex]?.id ?? movedPackIdRef.current;
    }
    if (wasDraggingRef.current && !isDragging) commit();
    wasDraggingRef.current = isDragging;
    // The drag state and the order it settled on are the real inputs; the
    // pack objects and `commit` follow them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingIndex, orderedKey]);

  const moveBy = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedPacks.length) return;
    const nextPacks = moveVjItem(orderedPacks, index, targetIndex);
    setLocalPackIds(nextPacks.map((pack) => pack.id));
    saveOrder(nextPacks, orderedPacks[index]?.id ?? null);
  };

  return {
    orderedPacks,
    move,
    commit,
    error,
    status,
    moveBy,
    draggingIndex,
    gripHandlers,
    // The drag controller reads only the list's children and their boxes, so
    // the hook's div ref serves the rail's ordered list as well.
    listRef: containerRef as unknown as RefObject<HTMLOListElement | null>,
  };
}
