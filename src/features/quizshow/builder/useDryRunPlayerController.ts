import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { QuizshowAnswerPayload } from "../../../shared/contracts/quizshow";
import type { QuizshowDemoEngine } from "../engine/useQuizshowDemoEngine";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  type QuizshowPendingAnswer,
} from "../realtime/quizshowClientStore";
import type {
  QuizshowClientFrameName,
  QuizshowClientPayload,
} from "../realtime/quizshowFrames";
import type {
  QuizshowSendResult,
  QuizshowSessionController,
} from "../realtime/useQuizshowSession";

/**
 * The dry run's phone (item 55): the try-out's demo engine behind the shape
 * the player stage reads. The state is the engine's player view of the "You"
 * row, kept up to date by its player frames; sends go straight into the
 * engine. Nothing leaves the browser, and the subscription ends on unmount or
 * when the engine is swapped for a fresh one.
 */
export function useDryRunPlayerController(
  demoEngine: QuizshowDemoEngine,
): QuizshowSessionController {
  const [state, dispatch] = useReducer(
    applyQuizshowFrame,
    "player",
    createQuizshowClientState,
  );

  useEffect(() => {
    // A fresh engine is a fresh session: nothing of the last one carries over.
    dispatch({ event: "local:reset" });
    dispatch({
      event: "session:state",
      payload: demoEngine.sessionStateFor("player"),
    });
    return demoEngine.subscribe(dispatch);
  }, [demoEngine]);

  const send = useCallback(
    <Name extends QuizshowClientFrameName>(
      name: Name,
      payload: QuizshowClientPayload<Name>,
    ): Promise<QuizshowSendResult<Name>> => demoEngine.send(name, payload),
    [demoEngine],
  );

  const currentPhaseId = state.session?.cursor.phaseId ?? null;
  const submitAnswer = useCallback(
    async (input: {
      questionId: string;
      payload: QuizshowAnswerPayload;
    }): Promise<QuizshowSendResult<"answer:submit">> => {
      if (currentPhaseId === null) {
        return {
          ok: false,
          code: "quizshow_not_attached",
          message: "No session yet",
        };
      }
      const pending: QuizshowPendingAnswer = {
        phaseId: currentPhaseId,
        questionId: input.questionId,
        payload: input.payload,
      };
      dispatch({ event: "local:pendingAnswer", payload: pending });
      const result = await send("answer:submit", pending);
      dispatch({ event: "local:pendingAnswerSettled", payload: pending });
      return result;
    },
    [currentPhaseId, send],
  );

  const restartDemo = useCallback(() => {
    demoEngine.restart();
  }, [demoEngine]);

  return useMemo(
    () => ({
      state,
      clockOffsetMs: 0,
      isDemo: true,
      send,
      submitAnswer,
      demoScreenState: null,
      restartDemo,
    }),
    [state, send, submitAnswer, restartDemo],
  );
}
