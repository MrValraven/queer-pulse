/**
 * The remote's one reader of the stage controller's queue fields. The mirror
 * shows `stage.state`, the state applied through the contract 7.4 client
 * queue (what the screens show now), and marks `stage.upcoming`, the earliest
 * queued frame, as pending until its applyAt. `frameReceivedAt` is the synced
 * time that frame became the next one, so the ring can fill from it.
 */
import { useState } from "react";
import type { VjStageState } from "../../../../shared/contracts/vj";
import type { VjStageController, VjUpcomingFrame } from "../../live/useVjStage";
import type { VjRemoteClock } from "./useVjRemoteClock";

export interface VjMirrorFrames {
  /** The applied state: what the screens show now. */
  shownState: VjStageState | null;
  /** The earliest queued state, waiting for nextApplyAt. */
  pendingState: VjStageState | null;
  /** Server ms the pending state applies at; null with nothing queued. */
  nextApplyAt: number | null;
  /** Synced server ms the pending frame became the next one; null with nothing queued. */
  frameReceivedAt: number | null;
}

interface VjStampedFrame {
  frame: VjUpcomingFrame | null;
  receivedAt: number | null;
}

/** The queue rebuilds `upcoming` on every change; the same state and applyAt is the same frame. */
function isSameUpcomingFrame(
  first: VjUpcomingFrame | null,
  second: VjUpcomingFrame | null,
): boolean {
  if (first === null || second === null) return first === second;
  return first.state === second.state && first.applyAt === second.applyAt;
}

function stampFrame(
  frame: VjUpcomingFrame | null,
  clock: VjRemoteClock,
): VjStampedFrame {
  return { frame, receivedAt: frame === null ? null : clock.serverNow() };
}

export function useVjMirrorFrames(
  stage: VjStageController,
  clock: VjRemoteClock,
): VjMirrorFrames {
  const upcoming = stage.upcoming;
  const [stampedFrame, setStampedFrame] = useState<VjStampedFrame>(() =>
    stampFrame(upcoming, clock),
  );

  let currentStamp = stampedFrame;
  if (!isSameUpcomingFrame(stampedFrame.frame, upcoming)) {
    // Adjusting state while rendering: the stamp follows the frame in the same render.
    currentStamp = stampFrame(upcoming, clock);
    setStampedFrame(currentStamp);
  }

  return {
    shownState: stage.state,
    pendingState: upcoming?.state ?? null,
    nextApplyAt: upcoming?.applyAt ?? null,
    frameReceivedAt: currentStamp.receivedAt,
  };
}
