/**
 * The desk's active focus chips, kept in the URL as `?focus=your-turn,late`
 * so a filtered desk survives a reload and can be shared as a link. Unknown
 * ids are dropped on read, and the list is always written in
 * `DESK_FOCUS_DEFINITIONS` order so the same selection gives the same URL.
 * Every other search param is preserved, and updates replace the history
 * entry so chip toggles never pile up behind the Back button.
 */

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DESK_FOCUS_DEFINITIONS,
  isDeskFocusId,
  type DeskFocusId,
} from "./deskFocus";

const FOCUS_PARAM = "focus";

export interface UseDeskFocusResult {
  activeFocusIds: DeskFocusId[];
  toggleFocus: (id: DeskFocusId) => void;
  /** Turns `id` on and every other chip off, in one URL write. */
  showOnlyFocus: (id: DeskFocusId) => void;
  clearFocus: () => void;
}

/** Parse the raw param into known ids, in registry order, without repeats. */
export function readFocusParam(rawFocus: string | null): DeskFocusId[] {
  if (!rawFocus) return [];
  const requestedIds = new Set(
    rawFocus
      .split(",")
      .map((value) => value.trim())
      .filter(isDeskFocusId),
  );
  return DESK_FOCUS_DEFINITIONS.map((definition) => definition.id).filter(
    (id) => requestedIds.has(id),
  );
}

export function useDeskFocus(): UseDeskFocusResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawFocus = searchParams.get(FOCUS_PARAM);
  const activeFocusIds = useMemo(() => readFocusParam(rawFocus), [rawFocus]);

  // Each update starts from the params react-router hands the updater, so the
  // other params ride along untouched and the focus list is re-validated.
  function updateFocus(
    computeNextIds: (currentIds: DeskFocusId[]) => DeskFocusId[],
  ): void {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        const currentIds = readFocusParam(currentParams.get(FOCUS_PARAM));
        const orderedIds = readFocusParam(computeNextIds(currentIds).join(","));
        if (orderedIds.length > 0) {
          nextParams.set(FOCUS_PARAM, orderedIds.join(","));
        } else {
          nextParams.delete(FOCUS_PARAM);
        }
        return nextParams;
      },
      { replace: true },
    );
  }

  function toggleFocus(id: DeskFocusId): void {
    updateFocus((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  }

  function showOnlyFocus(id: DeskFocusId): void {
    updateFocus(() => [id]);
  }

  function clearFocus(): void {
    updateFocus(() => []);
  }

  return { activeFocusIds, toggleFocus, showOnlyFocus, clearFocus };
}
