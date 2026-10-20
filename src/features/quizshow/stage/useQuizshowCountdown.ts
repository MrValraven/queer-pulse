import { useState } from "react";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_TIMED_PHASES,
  type QuizshowCursor,
} from "../../../shared/contracts/quizshow";
import { useNow } from "../../gatherings/checkin/useNow";
import {
  ownDeadlineOf,
  remainingMs,
  serverNow,
} from "../realtime/quizshowClock";

export interface QuizshowCountdown {
  remainingMs: number | null;
  /** 1 at the start of the phase down to 0. While paused in a timed phase it
   *  holds where the bar stood. null when untimed or without a start time. */
  fraction: number | null;
  /** Past the standard deadline while players with extra time still have theirs. */
  isFinishingUp: boolean;
  /** The session is paused (`cursor.status === "paused"`), in any phase. */
  isPaused: boolean;
}

export interface QuizshowCountdownOptions {
  hasExtraTime: boolean;
  /** The phase's standard limit in ms. Read only when a pause arrives before
   *  this bar has seen the phase run (a reconnect during the pause). */
  standardLimitMs?: number | null;
}

/** What the last running render of a phase measured, so a pause can hold the bar in place. */
interface RunningMeasure {
  phaseId: string;
  ownDeadline: number;
  totalMs: number;
  /** Where the bar stood on the last paused render; cleared once the phase runs again. */
  heldFraction: number | null;
}

const COUNTDOWN_REFRESH_MS = 100;

const UNTIMED: QuizshowCountdown = {
  remainingMs: null,
  fraction: null,
  isFinishingUp: false,
  isPaused: false,
};

const PAUSED_UNTIMED: QuizshowCountdown = { ...UNTIMED, isPaused: true };

function clampFraction(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function isTimedPhase(cursor: QuizshowCursor): boolean {
  return (QUIZSHOW_TIMED_PHASES as readonly string[]).includes(cursor.phase);
}

/** Where the bar holds while paused: the frozen remainder over the limit this
 *  bar saw running; with no remainder (a restart pause) the last place it
 *  stood; the remainder over the standard limit (x1.5 with extra time) when the
 *  bar never saw the phase run; full when nothing is known. */
function frozenFractionOf(input: {
  frozenRemainder: number | null;
  isExtraRemainder: boolean;
  measure: RunningMeasure | null;
  standardLimitMs: number | null;
  serverNowMs: number;
}): number {
  const { frozenRemainder, isExtraRemainder, measure, standardLimitMs } = input;
  if (measure !== null) {
    if (frozenRemainder !== null) {
      return clampFraction(frozenRemainder / measure.totalMs);
    }
    if (measure.heldFraction !== null) return measure.heldFraction;
    const lastRemaining = Math.max(0, measure.ownDeadline - input.serverNowMs);
    return clampFraction(lastRemaining / measure.totalMs);
  }
  if (
    frozenRemainder !== null &&
    standardLimitMs !== null &&
    standardLimitMs > 0
  ) {
    const ownLimitMs = isExtraRemainder
      ? standardLimitMs * QUIZSHOW_LIMITS.extraTimeFactor
      : standardLimitMs;
    return clampFraction(frozenRemainder / ownLimitMs);
  }
  return 1;
}

/** Counts down to the player's own deadline on the server's clock. */
export function useQuizshowCountdown(
  cursor: QuizshowCursor | null,
  clockOffsetMs: number,
  options: QuizshowCountdownOptions,
): QuizshowCountdown {
  const clientNow = useNow(COUNTDOWN_REFRESH_MS).getTime();
  const [runningMeasure, setRunningMeasure] = useState<RunningMeasure | null>(
    null,
  );
  if (cursor === null) return UNTIMED;
  const { hasExtraTime, standardLimitMs = null } = options;

  if (cursor.status === "paused") {
    if (!isTimedPhase(cursor)) return PAUSED_UNTIMED;
    const isExtraRemainder =
      hasExtraTime && cursor.pausedExtraTimeRemainingMs !== null;
    const frozenRemainder = isExtraRemainder
      ? cursor.pausedExtraTimeRemainingMs
      : cursor.pausedRemainingMs;
    const measure =
      runningMeasure?.phaseId === cursor.phaseId ? runningMeasure : null;
    const frozenFraction = frozenFractionOf({
      frozenRemainder,
      isExtraRemainder,
      measure,
      standardLimitMs,
      serverNowMs: serverNow(clientNow, clockOffsetMs),
    });
    // Remember where the bar stopped, so a restart pause that follows keeps it there.
    if (measure !== null && measure.heldFraction !== frozenFraction) {
      setRunningMeasure({ ...measure, heldFraction: frozenFraction });
    }
    return {
      remainingMs: frozenRemainder,
      fraction: frozenFraction,
      isFinishingUp: false,
      isPaused: true,
    };
  }

  const ownDeadline = ownDeadlineOf(cursor, hasExtraTime);
  const remaining = remainingMs(ownDeadline, clientNow, clockOffsetMs);
  if (ownDeadline === null || remaining === null) return UNTIMED;

  const totalMs =
    cursor.phaseStartedAt === null ? 0 : ownDeadline - cursor.phaseStartedAt;
  const fraction = totalMs > 0 ? clampFraction(remaining / totalMs) : null;
  const hasMeasureChanged =
    runningMeasure === null ||
    runningMeasure.phaseId !== cursor.phaseId ||
    runningMeasure.ownDeadline !== ownDeadline ||
    runningMeasure.totalMs !== totalMs ||
    runningMeasure.heldFraction !== null;
  if (totalMs > 0 && hasMeasureChanged) {
    setRunningMeasure({
      phaseId: cursor.phaseId,
      ownDeadline,
      totalMs,
      heldFraction: null,
    });
  }
  const isFinishingUp =
    !hasExtraTime &&
    cursor.deadline !== null &&
    cursor.extraTimeDeadline !== null &&
    serverNow(clientNow, clockOffsetMs) >= cursor.deadline &&
    serverNow(clientNow, clockOffsetMs) < cursor.extraTimeDeadline;
  return { remainingMs: remaining, fraction, isFinishingUp, isPaused: false };
}
