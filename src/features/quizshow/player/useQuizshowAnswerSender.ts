import { useCallback, useState } from "react";
import type { QuizshowAnswerPayload } from "../../../shared/contracts/quizshow";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";

/** Codes after which the hook still holds the answer and resends it on reconnect. */
const KEPT_CODES: readonly string[] = [
  "transport_timeout",
  "quizshow_not_attached",
];

interface AnswerSender {
  lockedPayload: QuizshowAnswerPayload | null;
  errorKey: string | null;
  send: (payload: QuizshowAnswerPayload) => void;
}

/** Locks the player's answer the moment it is sent and holds it through the ack and any reconnect. */
export function useAnswerSender(
  controller: QuizshowSessionController,
  questionId: string,
): AnswerSender {
  const [sent, setSent] = useState<{
    questionId: string;
    payload: QuizshowAnswerPayload;
  } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { session, pendingAnswer } = controller.state;
  const storedPayload =
    isPlayerState(session) && session.myAnswer?.questionId === questionId
      ? session.myAnswer.payload
      : null;
  const pendingPayload =
    pendingAnswer?.questionId === questionId ? pendingAnswer.payload : null;
  const localPayload = sent?.questionId === questionId ? sent.payload : null;
  const lockedPayload = storedPayload ?? pendingPayload ?? localPayload;
  const { submitAnswer } = controller;

  const send = useCallback(
    (payload: QuizshowAnswerPayload) => {
      setSent({ questionId, payload });
      setErrorKey(null);
      void submitAnswer({ questionId, payload }).then((result) => {
        if (result.ok || KEPT_CODES.includes(result.code)) return;
        setSent(null);
        setErrorKey(
          quizshowErrorKeyOf(
            result.code === "transport_timeout" ? null : result.code,
          ),
        );
      });
    },
    [questionId, submitAnswer],
  );
  return { lockedPayload, errorKey, send };
}
