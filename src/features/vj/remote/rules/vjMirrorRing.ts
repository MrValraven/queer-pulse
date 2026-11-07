/**
 * The ring around the mini mirror: how far the stage is to its next change.
 * A queued frame (contract 7.4 `applyAt`) wins; else, with shuffle on, the
 * ring fills over the shuffle interval since the live source went live.
 */
import {
  vjShuffleIntervalMs,
  type VjShuffle,
  type VjTempo,
} from "../../../../shared/contracts/vj";

export type VjMirrorRing =
  | { kind: "none" }
  | { kind: "applyAt"; progress: number; msLeft: number }
  | { kind: "shuffle"; progress: number; msLeft: number };

export interface VjMirrorRingInput {
  /** Synced server ms now. */
  serverNowMs: number;
  /** Server ms the queued frame applies at; null with nothing queued. */
  nextApplyAt: number | null;
  /** Server ms the queued frame arrived; null when unknown. */
  frameReceivedAt: number | null;
  shuffle: VjShuffle;
  tempo: VjTempo;
  /** Server ms the current live source went live; null when nothing is live. */
  liveSince: number | null;
}

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

/** Progress over a span; an empty span reads as complete. */
function progressOver(spanStart: number, spanEnd: number, now: number): number {
  const spanMs = spanEnd - spanStart;
  if (spanMs <= 0) return 1;
  return clampProgress((now - spanStart) / spanMs);
}

export function vjMirrorRingOf(input: VjMirrorRingInput): VjMirrorRing {
  const { serverNowMs, nextApplyAt, frameReceivedAt } = input;
  if (nextApplyAt !== null) {
    const spanStart = frameReceivedAt ?? serverNowMs;
    return {
      kind: "applyAt",
      progress: progressOver(spanStart, nextApplyAt, serverNowMs),
      msLeft: Math.max(0, nextApplyAt - serverNowMs),
    };
  }
  if (input.shuffle.isOn && input.liveSince !== null) {
    const intervalMs = vjShuffleIntervalMs(input.shuffle, input.tempo);
    const nextAdvanceAt = input.liveSince + intervalMs;
    return {
      kind: "shuffle",
      progress: progressOver(input.liveSince, nextAdvanceAt, serverNowMs),
      msLeft: Math.max(0, nextAdvanceAt - serverNowMs),
    };
  }
  return { kind: "none" };
}
