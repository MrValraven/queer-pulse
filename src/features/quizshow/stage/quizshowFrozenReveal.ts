import type { QuizshowCursor } from "../../../shared/contracts/quizshow";

/** The slow reveal's window as `slowRevealOf` builds it (C6.23). */
interface SlowRevealWindow {
  startsAt: number;
  endsAt: number;
  isCleared: boolean;
}

/**
 * How far the slow picture reveal had got when the session was paused, from
 * 0 (fully blurred) to 1 (clear); null while the session runs. The server
 * clears `deadline` on a pause, so the reveal's own clock keeps moving unless
 * the picture holds this value. The time left on the phase's deadline at the
 * pause is `pausedRemainingMs`: in `open` that is the time left to the end of
 * the reveal window, in `read` the answer limit still follows it.
 */
export function frozenRevealProgressOf(
  slowReveal: SlowRevealWindow | null,
  cursor: Pick<QuizshowCursor, "status" | "phase" | "pausedRemainingMs"> | null,
  answerLimitMs: number,
): number | null {
  if (cursor === null || cursor.status !== "paused" || slowReveal === null) {
    return null;
  }
  if (slowReveal.isCleared || cursor.pausedRemainingMs === null) {
    return null;
  }
  const durationMs = slowReveal.endsAt - slowReveal.startsAt;
  if (durationMs <= 0) {
    return null;
  }
  let remainingMs: number;
  if (cursor.phase === "open") {
    remainingMs = cursor.pausedRemainingMs;
  } else if (cursor.phase === "read") {
    remainingMs = cursor.pausedRemainingMs + answerLimitMs;
  } else {
    return null;
  }
  return Math.min(1, Math.max(0, 1 - remainingMs / durationMs));
}
