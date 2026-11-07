/**
 * Saves the screen's last look (contract 8.5): after every applied stage
 * state, keyed on its stage epoch and revision, and after every pack refetch.
 * An offline reload restores from it and sends its state as `restoreState`.
 * While a new pack's clip list is still loading the saved record stays as it
 * was, so a reload in that moment still finds the last pack that played. The
 * strobe is saved off, so a reload never restarts it, and the live clip's own
 * entry is saved too, so a reload after a pack switch still finds it.
 *
 * The v2 record (contract 9.1) also keeps the extra clips (mix, this
 * screen's override, the active set list's scene sources), the active pack's
 * event card and the synced clock offset. The offset alone writes again only
 * when it first arrives or drifts by VJ_RECORD_CLOCK_DRIFT_MS, so clock
 * samples never turn into a storage write each.
 */
import { useEffect, useRef } from "react";
import type {
  VjClipDTO,
  VjEventCardDTO,
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
  /** Clips outside the active and previous packs the screen keeps; default none. */
  extraClips?: readonly VjClipDTO[];
  /** The active pack's event card; default null. */
  eventCard?: VjEventCardDTO | null;
  /** The stage clock's current offset (`stage.clockOffsetMs`); default null. */
  clockOffsetMs?: number | null;
}

interface VjWrittenRecord {
  versionKey: string;
  pack: VjPackDTO | null;
  clips: readonly VjClipDTO[];
  liveClip: VjClipDTO | null;
  extraClips: readonly VjClipDTO[];
  eventCard: VjEventCardDTO | null;
  clockOffsetMs: number | null;
}

/** An offset that moved this much since the last write is written again. */
export const VJ_RECORD_CLOCK_DRIFT_MS = 25;

const NO_CLIPS: readonly VjClipDTO[] = [];

function isOffsetSettled(
  writtenOffsetMs: number | null,
  nextOffsetMs: number | null,
): boolean {
  if (nextOffsetMs === null) return true;
  if (writtenOffsetMs === null) return false;
  return Math.abs(nextOffsetMs - writtenOffsetMs) < VJ_RECORD_CLOCK_DRIFT_MS;
}

function isAlreadyWritten(
  lastWritten: VjWrittenRecord | null,
  next: VjWrittenRecord,
): boolean {
  return (
    lastWritten !== null &&
    lastWritten.versionKey === next.versionKey &&
    lastWritten.pack === next.pack &&
    lastWritten.clips === next.clips &&
    lastWritten.liveClip === next.liveClip &&
    lastWritten.extraClips === next.extraClips &&
    lastWritten.eventCard === next.eventCard &&
    isOffsetSettled(lastWritten.clockOffsetMs, next.clockOffsetMs)
  );
}

export function useVjScreenRecordSync(input: VjScreenRecordSyncInput): void {
  const { state, pack, clips, liveClip } = input;
  const extraClips = input.extraClips ?? NO_CLIPS;
  const eventCard = input.eventCard ?? null;
  const clockOffsetMs = input.clockOffsetMs ?? null;
  const lastWrittenRef = useRef<VjWrittenRecord | null>(null);

  useEffect(() => {
    if (state === null) return;
    // The new pack's clips are still loading: keep the saved look for an offline reload.
    if (state.activePackId !== null && pack === null) return;
    const next: VjWrittenRecord = {
      versionKey: `${state.stageEpoch}:${state.revision}`,
      pack,
      clips,
      liveClip,
      extraClips,
      eventCard,
      clockOffsetMs,
    };
    if (isAlreadyWritten(lastWrittenRef.current, next)) return;
    lastWrittenRef.current = next;
    writeVjScreenRecord({
      version: 2,
      savedAt: Date.now(),
      state: withVjStrobeOff(state),
      pack,
      clips: [...clips],
      liveClip:
        liveClip !== null && liveClip.id === state.liveClipId ? liveClip : null,
      extraClips: [...extraClips],
      eventCard,
      clockOffsetMs,
    });
  }, [state, pack, clips, liveClip, extraClips, eventCard, clockOffsetMs]);
}
