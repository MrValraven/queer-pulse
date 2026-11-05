import { useCallback, useMemo, useRef, useState } from "react";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useInvalidateVjLibrary } from "../api/useInvalidateVjLibrary";
import { useReorderVjPackClips } from "../api/useVjPackMutations";
import { vjReasonOf } from "../vjErrors";
import { moveVjItem } from "./vjReorder";

export interface VjClipOrder {
  /** The clips in the order the grid shows: a move in flight or a drag in
   *  progress, else the order the server holds. */
  orderedClips: VjClipDTO[];
  /** Moves one clip and saves the new order straight away (the buttons). */
  move: (from: number, to: number) => void;
  /** One drag step: reorders on screen only, saved by `commitDrag`. */
  dragStep: (from: number, to: number) => void;
  /** Saves the order a drag left on screen, if it changed. */
  commitDrag: () => void;
  /** The refusal of the last save, or null. */
  error: unknown;
  /** The words for the `role="status"` line after a save, or null. */
  status: string | null;
}

function idsOf(clips: readonly VjClipDTO[]): string[] {
  return clips.map((clip) => clip.id);
}

function isSameOrder(first: readonly string[], second: readonly string[]) {
  return (
    first.length === second.length &&
    first.every((clipId, clipIndex) => second[clipIndex] === clipId)
  );
}

/**
 * The order of one pack's clips while someone moves them. A button move saves
 * at once; a drag reorders on screen step by step and saves once, when the
 * finger lifts. The draft order is dropped whenever the server's list changes,
 * so a saved answer or a change from another tab always wins.
 */
export function useVjClipOrder(
  packId: string | null,
  clips: readonly VjClipDTO[],
): VjClipOrder {
  const { t } = useTranslation();
  const reorder = useReorderVjPackClips();
  const invalidateLibrary = useInvalidateVjLibrary();
  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [lastClips, setLastClips] = useState(clips);
  const [lastPackId, setLastPackId] = useState(packId);
  const draggedClipIdRef = useRef<string | null>(null);

  if (clips !== lastClips) {
    setLastClips(clips);
    setDraftIds(null);
  }
  if (packId !== lastPackId) {
    setLastPackId(packId);
    setError(null);
    setStatus(null);
  }

  const orderedClips = useMemo(() => {
    if (draftIds === null) return [...clips];
    const clipById = new Map(clips.map((clip) => [clip.id, clip]));
    const drafted = draftIds.flatMap((clipId) => {
      const clip = clipById.get(clipId);
      return clip === undefined ? [] : [clip];
    });
    const draftedIds = new Set(draftIds);
    return [...drafted, ...clips.filter((clip) => !draftedIds.has(clip.id))];
  }, [clips, draftIds]);

  const currentIds = draftIds ?? idsOf(clips);

  const save = useCallback(
    (nextIds: string[], movedClipId: string | null) => {
      if (packId === null) return;
      setError(null);
      reorder.mutate(
        { packId, clipIds: nextIds },
        {
          onSuccess: (answer) => {
            const position = answer.items.findIndex(
              (clip) => clip.id === movedClipId,
            );
            const movedClip = answer.items[position];
            if (movedClip !== undefined) {
              setStatus(
                t("vj:clip.movedStatus", {
                  title: movedClip.title,
                  position: position + 1,
                }),
              );
            }
          },
          onError: (cause) => {
            setDraftIds(null);
            setError(cause);
            // The pack changed under the drag: read it again so the grid
            // shows the order the server holds, as the reason line says.
            if (vjReasonOf(cause) === "VJ_PACK_CLIPS_REORDER_MISMATCH") {
              invalidateLibrary(null);
            }
          },
        },
      );
    },
    [packId, reorder, t, invalidateLibrary],
  );

  const move = (from: number, to: number) => {
    const nextIds = moveVjItem(currentIds, from, to);
    if (isSameOrder(nextIds, currentIds)) return;
    setDraftIds(nextIds);
    save(nextIds, currentIds[from] ?? null);
  };

  const dragStep = (from: number, to: number) => {
    if (draggedClipIdRef.current === null) {
      draggedClipIdRef.current = currentIds[from] ?? null;
    }
    setDraftIds(moveVjItem(currentIds, from, to));
  };

  const commitDrag = () => {
    const movedClipId = draggedClipIdRef.current;
    draggedClipIdRef.current = null;
    if (draftIds === null || isSameOrder(draftIds, idsOf(clips))) return;
    save(draftIds, movedClipId);
  };

  return { orderedClips, move, dragStep, commitDrag, error, status };
}
