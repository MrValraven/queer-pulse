/**
 * The dock's effect pads, kept on this device (contract 9.2) under
 * `VJ_REMOTE_DOCK_PADS_STORAGE_KEY`. The stored value is read through
 * `parseVjDockPads`, so unknown ids drop out and a bad or empty value takes
 * the first 8 catalog effects.
 */
import { useCallback, useMemo } from "react";
import type { VjEffectId } from "../../../../shared/contracts/vj";
import { useLocalStorage } from "../../../../shared/hooks/useLocalStorage";
import { VJ_REMOTE_DOCK_PADS_STORAGE_KEY } from "../../vj.constants";
import {
  addVjDockPad,
  moveVjDockPad,
  parseVjDockPads,
  removeVjDockPad,
  VJ_DEFAULT_DOCK_PADS,
} from "../rules/vjDockPads";

export type VjDockPadAddResult = "added" | "full";

export interface VjDockPads {
  pads: VjEffectId[];
  /** "full" when the dock already holds VJ_DOCK_PADS_MAX pads; a docked pad keeps its place. */
  add: (effectId: VjEffectId) => VjDockPadAddResult;
  remove: (effectId: VjEffectId) => void;
  move: (effectId: VjEffectId, direction: -1 | 1) => void;
}

export function useVjDockPads(): VjDockPads {
  const [storedPads, setStoredPads] = useLocalStorage<unknown>(
    VJ_REMOTE_DOCK_PADS_STORAGE_KEY,
    [...VJ_DEFAULT_DOCK_PADS],
  );
  const pads = useMemo(() => parseVjDockPads(storedPads), [storedPads]);

  const add = useCallback(
    (effectId: VjEffectId): VjDockPadAddResult => {
      if (addVjDockPad(pads, effectId) === "full") return "full";
      setStoredPads((previous: unknown) => {
        const addedPads = addVjDockPad(parseVjDockPads(previous), effectId);
        return addedPads === "full" ? previous : addedPads;
      });
      return "added";
    },
    [pads, setStoredPads],
  );

  const remove = useCallback(
    (effectId: VjEffectId) => {
      setStoredPads((previous: unknown) =>
        removeVjDockPad(parseVjDockPads(previous), effectId),
      );
    },
    [setStoredPads],
  );

  const move = useCallback(
    (effectId: VjEffectId, direction: -1 | 1) => {
      setStoredPads((previous: unknown) =>
        moveVjDockPad(parseVjDockPads(previous), effectId, direction),
      );
    },
    [setStoredPads],
  );

  return useMemo(
    () => ({ pads, add, remove, move }),
    [pads, add, remove, move],
  );
}
