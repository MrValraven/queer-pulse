/**
 * Pulse Live demo engine: the server's phase machine and scoring in the
 * browser, so a demo game, a dry run and a live game render the same frames.
 * `reduceQuizshowEngine` is pure from outside: it works on a clone of the
 * state, mutates that clone with the backend's rules, and returns it with the
 * frames in emission order and the ack (null on a tick). A tick also runs
 * auto-advance once its time has passed. Every refusal is
 * checked before anything changes, except the two notes a refusal leaves:
 * `lastHostCommandAt` (kept for parity only; the demo has no idle clock) and
 * the Lie Detector too-close count.
 */
import { quizshowRandomFrom } from "./quizshowRandom";
import {
  autoAdvance,
  runHostCommand,
  runPlayerCommand,
} from "./quizshowEngineCommands";
import { refreshQuiz } from "./quizshowEngineRoster";
import {
  createQuizshowEngineState,
  type QuizshowEngineContext,
} from "./quizshowEngineSetup";
import { tickEngine } from "./quizshowEngineTransitions";
import { engineFramesFor } from "./quizshowEngineViews";
import type {
  QuizshowCommandResult,
  QuizshowEngineAction,
  QuizshowEngineEffect,
  QuizshowEngineOptions,
  QuizshowEngineState,
  QuizshowEngineStep,
} from "./quizshowEngineTypes";

export function createQuizshowEngine(
  options: QuizshowEngineOptions,
): QuizshowEngineState {
  return createQuizshowEngineState(options);
}

function runAction(
  context: QuizshowEngineContext,
  action: QuizshowEngineAction,
): QuizshowCommandResult | { ack: null; effects: QuizshowEngineEffect[] } {
  switch (action.type) {
    case "tick": {
      // The phase clock first; then a phase that moves on by itself whose auto-advance time has passed (contract 6.16).
      const clockEffects = tickEngine(context, action.now);
      return {
        ack: null,
        effects: [...clockEffects, ...autoAdvance(context, action.now)],
      };
    }
    case "player":
      return runPlayerCommand(
        context,
        action.memberKey,
        action.name,
        action.payload,
        action.now,
      );
    case "host":
      return runHostCommand(context, action.name, action.payload, action.now);
    case "refreshQuiz":
      // The demo's lobby refresh (contract 6.10): the stored quiz changed after the lobby opened.
      return refreshQuiz(
        context,
        action.quiz,
        action.sourceUpdatedAt,
        action.now,
      );
  }
}

export function reduceQuizshowEngine(
  state: QuizshowEngineState,
  action: QuizshowEngineAction,
): QuizshowEngineStep {
  const nextState = structuredClone(state);
  const random = quizshowRandomFrom(nextState.randomState);
  const outcome = runAction({ state: nextState, random }, action);
  // A refusal sends nothing; its state keeps `lastHostCommandAt` and the too-close count.
  nextState.randomState = random.state();
  return {
    state: nextState,
    frames: engineFramesFor(nextState, outcome.effects),
    ack: outcome.ack,
  };
}
