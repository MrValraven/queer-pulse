import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import type { useQuizshowHostCommand } from "./useQuizshowHostCommand";

/** How long Skip waits for an Undo before it goes out (contract 9.2 item 6). */
export const SKIP_HOLD_MS = 4000;

type RunHostCommand = ReturnType<typeof useQuizshowHostCommand>["run"];

/** What a Skip passes over: the question, or (from a quiz reveal) its scores step. */
export type QuizshowSkipTarget = "question" | "scores";

/** One Skip waiting to go out: the phase it was tapped in, what it skips and its timer. */
interface SkipHold {
  phaseId: string;
  target: QuizshowSkipTarget;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Skip with a moment to change your mind (item 6). A tap turns the Skip button
 * itself into "Undo skip" for 4 s, then sends `host:skip` with the phase id the
 * tap was made in. Undo, a phase change, the game leaving "running" (a pause,
 * the end) or leaving the remote cancels it with nothing sent; a second tap
 * while it waits is the Undo. `heldTarget` says what the pending skip passes
 * over (null when none waits), so the bar can announce it and swap the label.
 * The send goes through the remote's own `run`, so a refusal shows on the bar
 * like any other command.
 */
export function useSkipHold(
  controller: QuizshowSessionController,
  run: RunHostCommand,
): {
  startSkip: (phaseId: string, target: QuizshowSkipTarget) => void;
  cancelSkip: () => void;
  heldTarget: QuizshowSkipTarget | null;
} {
  const currentCursor = controller.state.session?.cursor ?? null;
  const currentPhaseId = currentCursor?.phaseId ?? null;
  const isRunning = currentCursor?.status === "running";
  const holdRef = useRef<SkipHold | null>(null);
  const [heldTarget, setHeldTarget] = useState<QuizshowSkipTarget | null>(null);

  const cancelSkip = useCallback(() => {
    const hold = holdRef.current;
    if (hold === null) return;
    holdRef.current = null;
    clearTimeout(hold.timeoutId);
    setHeldTarget(null);
  }, []);

  const startSkip = useCallback(
    (phaseId: string, target: QuizshowSkipTarget) => {
      if (holdRef.current !== null) return;
      const timeoutId = setTimeout(() => {
        holdRef.current = null;
        setHeldTarget(null);
        void run("host:skip", { phaseId });
      }, SKIP_HOLD_MS);
      holdRef.current = { phaseId, target, timeoutId };
      setHeldTarget(target);
    },
    [run],
  );

  // The game moved on or stopped under the hold (the timer, another remote, a
  // pause): skipping now would skip the wrong thing or be refused.
  useEffect(() => {
    const hold = holdRef.current;
    if (hold === null) return;
    if (hold.phaseId !== currentPhaseId || !isRunning) cancelSkip();
  }, [currentPhaseId, isRunning, cancelSkip]);

  // Leaving the remote drops the hold, so no timer outlives the bar.
  useEffect(() => {
    return () => {
      const hold = holdRef.current;
      if (hold === null) return;
      holdRef.current = null;
      clearTimeout(hold.timeoutId);
    };
  }, []);

  return { startSkip, cancelSkip, heldTarget };
}
