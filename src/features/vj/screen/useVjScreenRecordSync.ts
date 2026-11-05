/**
 * Saves the screen's last look (contract 8.5): after every applied stage
 * state, keyed on its stage epoch and revision, and after every pack refetch.
 * An offline reload restores from it and sends its state as `restoreState`.
 * While a new pack's clip list is still loading the saved record stays as it
 * was, so a reload in that moment still finds the last pack that played. The
 * strobe is saved off, so a reload never restarts it, and the live clip's own
 * entry is saved too, so a reload after a pack switch still finds it.
 */
import { useEffect, useRef } from "react";
import type {
  VjClipDTO,
  VjPackDTO,
  VjStageState,
} from "../../../shared/contracts/vj";
import { withVjStrobeOff, writeVjScreenRecord } from "./vjScreenRecord";

export interface VjScreenRecordSyncInput {
  state: VjStageState | null;
  pack: VjPackDTO | null;
  clips: readonly VjClipDTO[];
  /** The entry of `state.liveClipId`, from any list the screen knows, or null. */
  liveClip: VjClipDTO | null;
}

interface VjWrittenRecord {
  versionKey: string;
  pack: VjPackDTO | null;
  clips: readonly VjClipDTO[];
  liveClip: VjClipDTO | null;
}

export function useVjScreenRecordSync(input: VjScreenRecordSyncInput): void {
  const { state, pack, clips, liveClip } = input;
  const lastWrittenRef = useRef<VjWrittenRecord | null>(null);

  useEffect(() => {
    if (state === null) return;
    // The new pack's clips are still loading: keep the saved look for an offline reload.
    if (state.activePackId !== null && pack === null) return;
    const versionKey = `${state.stageEpoch}:${state.revision}`;
    const lastWritten = lastWrittenRef.current;
    if (
      lastWritten !== null &&
      lastWritten.versionKey === versionKey &&
      lastWritten.pack === pack &&
      lastWritten.clips === clips &&
      lastWritten.liveClip === liveClip
    ) {
      return;
    }
    lastWrittenRef.current = { versionKey, pack, clips, liveClip };
    writeVjScreenRecord({
      savedAt: Date.now(),
      state: withVjStrobeOff(state),
      pack,
      clips: [...clips],
      liveClip:
        liveClip !== null && liveClip.id === state.liveClipId ? liveClip : null,
    });
  }, [state, pack, clips, liveClip]);
}
