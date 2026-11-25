import { useState } from "react";
import type {
  QuizshowCursor,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { slowRevealOf } from "../screen/quizshowScreenTileModel";
import type { QuizshowStagePictureProps } from "./QuizshowStagePicture";

type SlowRevealWindow = NonNullable<QuizshowStagePictureProps["slowReveal"]>;

/**
 * C6.23 on the TV and the phone: the picture's reveal window (`slowRevealOf`),
 * held while the session is paused. A pause clears the cursor's `deadline`,
 * so the bare window is then rebuilt from the phase start and drops any time
 * the host added. The window last seen running for this question stays in
 * force instead, which keeps it in step with `pausedRemainingMs` for
 * `frozenRevealProgressOf`, and play resumes on the same window.
 */
export function useHeldSlowReveal(
  question: QuizshowQuestionView,
  cursor: QuizshowCursor | null,
  talkMs: number,
): SlowRevealWindow | null {
  const [heldWindow, setHeldWindow] = useState<{
    questionId: string;
    window: SlowRevealWindow;
  } | null>(null);
  const liveWindow =
    cursor === null ? null : slowRevealOf(question, cursor, talkMs);
  const isPaused = cursor?.status === "paused";
  const held =
    heldWindow?.questionId === question.questionId ? heldWindow.window : null;
  const shouldHold =
    liveWindow !== null &&
    (held === null ||
      (!isPaused &&
        (held.startsAt !== liveWindow.startsAt ||
          held.endsAt !== liveWindow.endsAt ||
          held.isCleared !== liveWindow.isCleared)));
  if (shouldHold) {
    setHeldWindow({ questionId: question.questionId, window: liveWindow });
  }
  return isPaused ? (held ?? liveWindow) : liveWindow;
}
