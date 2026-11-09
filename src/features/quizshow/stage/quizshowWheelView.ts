import type {
  QuizshowMe,
  QuizshowPlayMode,
  QuizshowWheelBonusView,
  QuizshowWheelSlice,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";

/** The slices still on the wheel, in running order. `spin.landedSliceIndex` indexes this list. */
export function drawnWheelSlicesOf(
  wheel: QuizshowWheelView,
): QuizshowWheelSlice[] {
  return wheel.slices.filter((slice) => !slice.isPlayed);
}

/** The slices already played, in running order. */
export function playedWheelSlicesOf(
  wheel: QuizshowWheelView,
): QuizshowWheelSlice[] {
  return wheel.slices.filter((slice) => slice.isPlayed);
}

/** drawn[spin.landedSliceIndex]; null without a spin or for an index out of range. */
export function landedWheelSliceOf(
  wheel: QuizshowWheelView,
): QuizshowWheelSlice | null {
  if (wheel.spin === null) return null;
  return drawnWheelSlicesOf(wheel)[wheel.spin.landedSliceIndex] ?? null;
}

/** The slice whose roundIndex is playingRoundIndex, or null. */
export function playingWheelSliceOf(
  wheel: QuizshowWheelView,
): QuizshowWheelSlice | null {
  if (wheel.playingRoundIndex === null) return null;
  return (
    wheel.slices.find(
      (slice) => slice.roundIndex === wheel.playingRoundIndex,
    ) ?? null
  );
}

/** Solo: a winner with kind "player" and entrantId me.playerId. Teams: kind "team" and entrantId me.teamId. */
export function isMyWheelBonus(
  bonus: QuizshowWheelBonusView | null,
  me: Pick<QuizshowMe, "playerId" | "teamId"> | null,
  playMode: QuizshowPlayMode,
): boolean {
  if (bonus === null || me === null) return false;
  if (playMode === "teams") {
    if (me.teamId === null) return false;
    return bonus.winners.some(
      (winner) => winner.kind === "team" && winner.entrantId === me.teamId,
    );
  }
  return bonus.winners.some(
    (winner) => winner.kind === "player" && winner.entrantId === me.playerId,
  );
}
