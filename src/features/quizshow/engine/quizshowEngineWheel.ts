/**
 * Pulse Live demo engine wheel transitions: opening a step, opening and
 * spinning a wheel, starting the landed pick, the end of a question and of a
 * round with the slice bonus, finishing a wheel early, and the wheel refusals.
 * Ports of the backend's quizshow-engine-phases.ts wheel bodies; the browser
 * also closes and skips a wheel with no slice left (contract A5) and refreshes
 * scores after a bonus (contract A14).
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowErrorCode,
  type QuizshowUpNext,
  type QuizshowWheelBonusView,
} from "../../../shared/contracts/quizshow";
import {
  createWheelState,
  drawnWheelSliceRoundIndexes,
  drawWheelSpin,
  isWheelExhausted,
  isWheelRoundKind,
  isWheelSpinLanded,
  nextQuizshowStep,
  unplannedWheelSliceRoundIndexes,
  wheelAngleModulo,
  wheelRoundIndexOfRange,
  wheelSliceRoundIndexes,
  wheelSpinEndAngle,
  withWheelSettingsDefaults,
  type QuizshowWheelState,
} from "../quizshowWheel";
import {
  advanceCursor,
  isLastQuestionOfRound,
  type QuizshowEngineContext,
} from "./quizshowEngineSetup";
import { applyWheelBonus } from "./quizshowEngineScoringStep";
import {
  openQuestion,
  openRoundIntro,
  showPodium,
  showScores,
  totalsByEntrant,
} from "./quizshowEngineTransitions";
import type {
  QuizshowEngineEffect,
  QuizshowEngineState,
} from "./quizshowEngineTypes";

const FULL_TURN_DEGREES = 360;

/** The open wheel; the `wheel` phase with none open breaks an engine invariant. */
function openedWheelOf(state: QuizshowEngineState): QuizshowWheelState {
  const wheel = state.wheelProgress.wheel;
  if (wheel === null) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} is in the wheel phase with no wheel open.`,
    );
  }
  return wheel;
}

/** What `host:next` opens next from the lobby or a leaderboard. */
function nextStepOf(state: QuizshowEngineState): QuizshowUpNext {
  return nextQuizshowStep(state.quiz.rounds, state.wheelProgress);
}

/** A planned wheel's row joins the closed rows, so its unplayed slices are skipped for good. */
function closeOpenWheel(state: QuizshowEngineState): void {
  const progress = state.wheelProgress;
  const wheelRoundIndex = progress.wheel?.wheelRoundIndex ?? null;
  if (
    wheelRoundIndex !== null &&
    !progress.closedWheelRoundIndexes.includes(wheelRoundIndex)
  ) {
    progress.closedWheelRoundIndexes.push(wheelRoundIndex);
  }
  progress.wheel = null;
}

/**
 * The frames a bonus owes (contract A14): the hosts' lobby scores, and each
 * awarded solo player's own score. Teams mode changes team scores only.
 */
function wheelBonusEffects(
  award: QuizshowWheelBonusView | null,
): QuizshowEngineEffect[] {
  if (award === null) return [];
  const awardedPlayerIds = award.winners
    .filter((winner) => winner.kind === "player")
    .map((winner) => winner.entrantId);
  const effects: QuizshowEngineEffect[] = [{ kind: "lobby_changed" }];
  if (awardedPlayerIds.length > 0) {
    effects.push({ kind: "me_changed", playerIds: awardedPlayerIds });
  }
  return effects;
}

/** Stamps the award with the phase that announces it; call after the transition moved the cursor. */
function attachWheelBonusAward(
  state: QuizshowEngineState,
  award: QuizshowWheelBonusView | null,
): void {
  if (award === null) return;
  state.wheelProgress.wheelBonusAward = {
    ...award,
    phaseId: state.cursor.phaseId,
  };
}

/**
 * The row a closing leaderboard names: the wheel row when the cursor already
 * sits on one, or after a pick-a-question wheel question; else the round
 * that ended, a pick-a-round slice included.
 */
function leaderboardRoundIndexOf(state: QuizshowEngineState): number | null {
  const { roundIndex } = state.cursor;
  if (roundIndex === null) return null;
  const rounds = state.quiz.rounds;
  const row = rounds[roundIndex];
  if (row !== undefined && isWheelRoundKind(row.kind)) return roundIndex;
  const wheelRoundIndex = wheelRoundIndexOfRange(rounds, roundIndex);
  const wheelRow =
    wheelRoundIndex === null ? undefined : rounds[wheelRoundIndex];
  if (
    wheelRoundIndex !== null &&
    wheelRow !== undefined &&
    withWheelSettingsDefaults(wheelRow.settings).wheelPick === "question"
  ) {
    return wheelRoundIndex;
  }
  return roundIndex;
}

/** What `host:next` opens from the lobby or a leaderboard: a round card, a wheel or the podium. */
export function openStep(
  state: QuizshowEngineState,
  step: QuizshowUpNext,
  now: number,
): QuizshowEngineEffect[] {
  switch (step.kind) {
    case "round": {
      const { playedRoundIndexes } = state.wheelProgress;
      if (!playedRoundIndexes.includes(step.roundIndex)) {
        playedRoundIndexes.push(step.roundIndex);
      }
      return openRoundIntro(state, step.roundIndex, now);
    }
    case "wheel":
      return openWheel(state, step.wheelRoundIndex, now);
    case "podium":
      return showPodium(state, now);
  }
}

/**
 * Opens a planned wheel, or returns to it after a slice with its played slice
 * off it. A wheel with no slice left to draw closes and the night carries on
 * with the next step (contract A5).
 */
export function openWheel(
  state: QuizshowEngineState,
  wheelRoundIndex: number,
  now: number,
): QuizshowEngineEffect[] {
  const rounds = state.quiz.rounds;
  const progress = state.wheelProgress;
  const openWheelState = progress.wheel;
  if (
    openWheelState !== null &&
    openWheelState.wheelRoundIndex === wheelRoundIndex
  ) {
    // The drawn set shrank, so the wheel starts again from rest.
    openWheelState.spin = null;
    openWheelState.restAngle = 0;
  } else {
    progress.wheel = createWheelState(
      rounds,
      wheelRoundIndex,
      wheelSliceRoundIndexes(rounds, wheelRoundIndex),
    );
    if (!progress.openedWheelRoundIndexes.includes(wheelRoundIndex)) {
      progress.openedWheelRoundIndexes.push(wheelRoundIndex);
    }
  }
  const openedWheel = openedWheelOf(state);
  if (drawnWheelSliceRoundIndexes(rounds, openedWheel, progress).length === 0) {
    closeOpenWheel(state);
    return openStep(state, nextStepOf(state), now);
  }
  advanceCursor(state, {
    phase: "wheel",
    roundIndex: wheelRoundIndex,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  return [{ kind: "phase_changed" }];
}

/**
 * One spin on the open wheel, decided here so every screen animates to the
 * same stop; each spin is a new `wheel` phase. A spin again draws among the
 * same slices from where the wheel rests.
 */
export function spinWheel(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] {
  const { state, random } = context;
  const wheel = openedWheelOf(state);
  const drawnCount = drawnWheelSliceRoundIndexes(
    state.quiz.rounds,
    wheel,
    state.wheelProgress,
  ).length;
  if (drawnCount === 0) {
    // Nothing left to draw: the wheel closes and the night carries on (contract A5).
    closeOpenWheel(state);
    return openStep(state, nextStepOf(state), now);
  }
  const spin = drawWheelSpin({
    drawnCount,
    startAngle: wheel.restAngle,
    now,
    random,
  });
  wheel.spin = spin;
  wheel.restAngle = wheelAngleModulo(
    wheelSpinEndAngle(spin, drawnCount),
    FULL_TURN_DEGREES,
  );
  advanceCursor(state, {
    phase: "wheel",
    roundIndex: wheel.wheelRoundIndex,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  return [{ kind: "phase_changed" }];
}

/**
 * "Spin for the next round" from a leaderboard: an unplanned wheel over the
 * next unplayed rounds outside every range, spun in the same command. Call
 * only after `wheelSpinRefusal` returned null.
 */
export function openUnplannedWheel(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] {
  const { state } = context;
  const rounds = state.quiz.rounds;
  state.wheelProgress.wheel = createWheelState(
    rounds,
    null,
    unplannedWheelSliceRoundIndexes(rounds, state.wheelProgress),
  );
  return spinWheel(context, now);
}

/**
 * `host:next` on a landed spin: starts the landed round, or opens the next
 * question of the landed category. Call only after `wheelNextRefusal`
 * returned null.
 */
export function startWheelPick(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  const wheel = openedWheelOf(state);
  const spin = wheel.spin;
  const landedRoundIndex =
    spin === null
      ? undefined
      : drawnWheelSliceRoundIndexes(
          state.quiz.rounds,
          wheel,
          state.wheelProgress,
        )[spin.landedSliceIndex];
  if (landedRoundIndex === undefined) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} landed outside the drawn slices.`,
    );
  }
  if (wheel.pick === "round") {
    if (wheel.wheelRoundIndex === null) {
      // An unplanned wheel picks once and is gone.
      state.wheelProgress.wheel = null;
    } else {
      wheel.pickedCount += 1;
      wheel.playingRoundIndex = landedRoundIndex;
      wheel.baselineByEntrant = totalsByEntrant(state);
      wheel.spin = null;
      wheel.restAngle = 0;
    }
    return openStep(
      state,
      { kind: "round", roundIndex: landedRoundIndex },
      now,
    );
  }
  const slicePosition = wheel.sliceRoundIndexes.indexOf(landedRoundIndex);
  const questionIndex = wheel.askedCounts[slicePosition] ?? 0;
  wheel.askedCounts[slicePosition] = questionIndex + 1;
  wheel.pickedCount += 1;
  wheel.playingRoundIndex = landedRoundIndex;
  wheel.spin = null;
  wheel.restAngle = 0;
  return openQuestion(state, landedRoundIndex, questionIndex, now);
}

/**
 * A round, or a pick-a-question wheel, ended: its leaderboard, or the podium
 * when nothing remains and no bonus waits to be announced.
 */
export function afterRoundEnds(
  state: QuizshowEngineState,
  award: QuizshowWheelBonusView | null,
  now: number,
): QuizshowEngineEffect[] {
  if (nextStepOf(state).kind === "podium" && award === null) {
    return showPodium(state, now);
  }
  return showScores(
    state,
    "leaderboard",
    "round",
    now,
    leaderboardRoundIndexOf(state),
  );
}

/**
 * After a question's last phase: back to the wheel after a pick-a-question
 * wheel question, the round's next question, or the end of the round (a
 * pick-a-round slice pays its bonus first).
 */
export function afterQuestion(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  const roundIndex = state.cursor.roundIndex ?? state.current?.roundIndex;
  const questionIndex =
    state.cursor.questionIndex ?? state.current?.questionIndex;
  if (roundIndex === undefined || questionIndex === undefined) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} moved on with no question in play.`,
    );
  }
  const rounds = state.quiz.rounds;
  const wheel = state.wheelProgress.wheel;

  // Rule 1: a pick-a-question wheel question returns to the wheel.
  if (wheel?.pick === "question" && wheel.playingRoundIndex === roundIndex) {
    const wheelRoundIndex = wheel.wheelRoundIndex;
    if (wheelRoundIndex === null) {
      throw new Error(
        `Pulse Live demo ${state.sessionId} plays a wheel question from an unplanned wheel.`,
      );
    }
    // The bonus reads the question in play, so it runs before anything moves.
    const award = applyWheelBonus(state, roundIndex);
    wheel.playingRoundIndex = null;
    const effects = wheelBonusEffects(award);
    if (isWheelExhausted(rounds, wheel, state.wheelProgress)) {
      closeOpenWheel(state);
      effects.push(...afterRoundEnds(state, award, now));
    } else {
      // The wheel shows no scores frame, so after a bonus the next
      // question's scores count from these totals, the bonus included.
      if (award !== null) state.scoresAtLastFrame = totalsByEntrant(state);
      effects.push(...openWheel(state, wheelRoundIndex, now));
    }
    attachWheelBonusAward(state, award);
    return effects;
  }

  // Rule 2: the round's next question.
  if (!isLastQuestionOfRound(state, roundIndex, questionIndex)) {
    return openQuestion(state, roundIndex, questionIndex + 1, now);
  }

  // Rule 3: the round's last question; a pick-a-round slice pays its bonus first.
  let award: QuizshowWheelBonusView | null = null;
  if (wheel?.pick === "round" && wheel.playingRoundIndex === roundIndex) {
    award = applyWheelBonus(state, roundIndex);
    wheel.playingRoundIndex = null;
    wheel.baselineByEntrant = null;
    if (isWheelExhausted(rounds, wheel, state.wheelProgress)) {
      closeOpenWheel(state);
    }
  }
  const effects = [
    ...wheelBonusEffects(award),
    ...afterRoundEnds(state, award, now),
  ];
  attachWheelBonusAward(state, award);
  return effects;
}

/**
 * Ends the open wheel early, even with a spin in the air: its unplayed slices
 * are skipped for good. A pick-a-question wheel that played a question ends
 * like a round; every other wheel moves straight to the next step. The
 * handler checks the phase id, the status and the `wheel` phase first.
 */
export function finishWheel(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  const wheel = openedWheelOf(state);
  const isQuestionWheelWithPick =
    wheel.pick === "question" && wheel.pickedCount >= 1;
  closeOpenWheel(state);
  // The cursor still sits on the wheel row, so its leaderboard names that row.
  return isQuestionWheelWithPick
    ? afterRoundEnds(state, null, now)
    : openStep(state, nextStepOf(state), now);
}

/**
 * Why `host:spin` cannot act now (contract 6.2 steps 3 to 5, after the stale
 * and status checks), or null: a wheel still turning, a wheel step coming
 * next on its own, too few rounds for an unplanned spin, or a phase without
 * a spin.
 */
export function wheelSpinRefusal(
  state: QuizshowEngineState,
  now: number,
): QuizshowErrorCode | null {
  const { phase } = state.cursor;
  if (phase === "wheel") {
    const spin = openedWheelOf(state).spin;
    const isStillTurning =
      spin !== null &&
      !isWheelSpinLanded(spin, now, QUIZSHOW_LIMITS.wheelLandingToleranceMs);
    return isStillTurning ? "quizshow_wheel_spinning" : null;
  }
  if (phase === "leaderboard") {
    const progress = state.wheelProgress;
    const nextStep = nextStepOf(state);
    if (nextStep.kind === "wheel" || progress.wheel !== null) {
      return "quizshow_wheel_already_next";
    }
    const candidateRoundIndexes = unplannedWheelSliceRoundIndexes(
      state.quiz.rounds,
      progress,
    );
    if (
      nextStep.kind === "podium" ||
      candidateRoundIndexes.length < QUIZSHOW_LIMITS.wheelSlicesMin
    ) {
      return "quizshow_wheel_spin_too_few_rounds";
    }
    return null;
  }
  return "quizshow_command_not_allowed";
}

/**
 * Why `host:next` in `wheel` cannot act now (contract 6.3), or null: no spin
 * yet, or a spin that has not landed within the tolerance. Null outside the
 * `wheel` phase, where no wheel rule applies.
 */
export function wheelNextRefusal(
  state: QuizshowEngineState,
  now: number,
): QuizshowErrorCode | null {
  if (state.cursor.phase !== "wheel") return null;
  const spin = openedWheelOf(state).spin;
  if (spin === null) return "quizshow_wheel_not_spun";
  if (!isWheelSpinLanded(spin, now, QUIZSHOW_LIMITS.wheelLandingToleranceMs)) {
    return "quizshow_wheel_spinning";
  }
  return null;
}
