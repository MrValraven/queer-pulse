import type { QuizshowCursor } from "../../../shared/contracts/quizshow";
import { QUIZSHOW_CLOCK_SAMPLES_KEPT } from "../quizshow.constants";

export interface QuizshowClockSample {
  clientSentAt: number;
  serverReceivedAt: number;
  serverSentAt: number;
  clientReceivedAt: number;
}

export function roundTripOf(sample: QuizshowClockSample): number {
  return (
    sample.clientReceivedAt -
    sample.clientSentAt -
    (sample.serverSentAt - sample.serverReceivedAt)
  );
}

export function clockOffsetOf(sample: QuizshowClockSample): number {
  return (
    (sample.serverReceivedAt -
      sample.clientSentAt +
      (sample.serverSentAt - sample.clientReceivedAt)) /
    2
  );
}

/** Keeps the QUIZSHOW_CLOCK_SAMPLES_KEPT lowest round trips and returns the
 *  median of their offsets (the mean of the middle two for an even count); 0 for none. */
export function estimateClockOffset(
  samples: readonly QuizshowClockSample[],
): number {
  if (samples.length === 0) return 0;
  const offsets = [...samples]
    .sort((first, second) => roundTripOf(first) - roundTripOf(second))
    .slice(0, QUIZSHOW_CLOCK_SAMPLES_KEPT)
    .map(clockOffsetOf)
    .sort((first, second) => first - second);
  const middleIndex = Math.floor(offsets.length / 2);
  const upperMiddle = offsets[middleIndex] ?? 0;
  if (offsets.length % 2 === 1) return upperMiddle;
  const lowerMiddle = offsets[middleIndex - 1] ?? upperMiddle;
  return (lowerMiddle + upperMiddle) / 2;
}

export function serverNow(clientNow: number, offsetMs: number): number {
  return clientNow + offsetMs;
}

/** Milliseconds left before `deadline` on the server's clock, floored at 0; null for no deadline. */
export function remainingMs(
  deadline: number | null,
  clientNow: number,
  offsetMs: number,
): number | null {
  if (deadline === null) return null;
  return Math.max(0, deadline - serverNow(clientNow, offsetMs));
}

/** The player's own deadline: `extraTimeDeadline` when they have extra time and it is set, else `deadline`. */
export function ownDeadlineOf(
  cursor: QuizshowCursor,
  hasExtraTime: boolean,
): number | null {
  if (hasExtraTime && cursor.extraTimeDeadline !== null)
    return cursor.extraTimeDeadline;
  return cursor.deadline;
}
