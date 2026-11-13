/**
 * The ring around the mini mirror: how far the stage is to its next change.
 * A playing sequence fills over its step's clock first, so the timer's own
 * early frame (queued 300 ms before each step ends) leaves the ring whole.
 * Then a queued frame (contract 7.4 `applyAt`); then a paused sequence
 * shows the share its step had run (sequences contract 8.2); else, with
 * shuffle on, the ring fills over the shuffle interval since the live
 * source went live.
 */
import {
  vjShuffleIntervalMs,
  type VjSetlistPlayback,
  type VjShuffle,
  type VjTempo,
} from "../../../../shared/contracts/vj";

export type VjMirrorRing =
  | { kind: "none" }
  | { kind: "applyAt"; progress: number; msLeft: number }
  /** isPaused: the clock is stopped, so progress and msLeft hold still. */
  | { kind: "setlist"; progress: number; msLeft: number; isPaused: boolean }
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
  /** The active sequence's clock (the default playback when none is active). */
  setlistPlayback: VjSetlistPlayback;
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

/** The sequence's ring while its clock runs; null in any other status. */
function playingSetlistRingOf(
  playback: VjSetlistPlayback,
  serverNowMs: number,
): VjMirrorRing | null {
  const { stepStartedAt, stepEndsAt } = playback;
  if (
    playback.status !== "playing" ||
    stepStartedAt === null ||
    stepEndsAt === null
  ) {
    return null;
  }
  return {
    kind: "setlist",
    progress: progressOver(stepStartedAt, stepEndsAt, serverNowMs),
    msLeft: Math.max(0, stepEndsAt - serverNowMs),
    isPaused: false,
  };
}

/** The sequence's ring while its clock holds; null in any other status. */
function pausedSetlistRingOf(playback: VjSetlistPlayback): VjMirrorRing | null {
  const { stepDurationMs, pausedRemainingMs } = playback;
  if (
    playback.status === "paused" &&
    stepDurationMs !== null &&
    pausedRemainingMs !== null
  ) {
    return {
      kind: "setlist",
      progress:
        stepDurationMs <= 0
          ? 1
          : clampProgress(1 - pausedRemainingMs / stepDurationMs),
      msLeft: Math.max(0, pausedRemainingMs),
      isPaused: true,
    };
  }
  return null;
}

export function vjMirrorRingOf(input: VjMirrorRingInput): VjMirrorRing {
  const { serverNowMs, nextApplyAt, frameReceivedAt } = input;
  const playingRing = playingSetlistRingOf(input.setlistPlayback, serverNowMs);
  if (playingRing !== null) return playingRing;
  if (nextApplyAt !== null) {
    const spanStart = frameReceivedAt ?? serverNowMs;
    return {
      kind: "applyAt",
      progress: progressOver(spanStart, nextApplyAt, serverNowMs),
      msLeft: Math.max(0, nextApplyAt - serverNowMs),
    };
  }
  const pausedRing = pausedSetlistRingOf(input.setlistPlayback);
  if (pausedRing !== null) return pausedRing;
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

/** Whether the shell must tick the synced clock for the ring to move. */
export function isVjMirrorRingCounting(input: {
  nextApplyAt: number | null;
  shuffle: VjShuffle;
  setlistPlayback: VjSetlistPlayback;
}): boolean {
  return (
    input.nextApplyAt !== null ||
    input.setlistPlayback.status === "playing" ||
    input.shuffle.isOn
  );
}
