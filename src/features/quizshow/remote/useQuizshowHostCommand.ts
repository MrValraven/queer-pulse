import { useCallback, useRef, useState } from "react";
import type { QuizshowErrorCode } from "../../../shared/contracts/quizshow";
import type { QuizshowHostFrameName } from "../engine/quizshowEngineTypes";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import type { QuizshowClientPayload } from "../realtime/quizshowFrames";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";

const GENERIC_ERROR_KEY = "quizshow:errors.generic";

/** A failed command's copy, and the phase it failed in: a later phase drops it. */
interface HostCommandError {
  key: string;
  phaseId: string | null;
}

/**
 * The copy for an ack, or null when nothing went wrong. `isNoop` is success
 * (a double tap or a second remote got there first), and a stale phase means
 * another remote already moved the game: the next `phase:change` shows it.
 */
function errorKeyOfResult(
  result:
    { ok: true } | { ok: false; code: QuizshowErrorCode | "transport_timeout" },
): string | null {
  if (result.ok) return null;
  if (result.code === "quizshow_stale_phase") return null;
  if (result.code === "transport_timeout") return GENERIC_ERROR_KEY;
  return quizshowErrorKeyOf(result.code);
}

/**
 * Sends a host command, one in flight per command name. Callers pass the
 * payload whole, moving commands with `phaseId` set to the `cursor.phaseId` of
 * the state they rendered when the host tapped. `run` resolves true when the command went through (a no-op and a stale phase
 * included), so a form can stay open after a refusal.
 */
export function useQuizshowHostCommand(controller: QuizshowSessionController): {
  run: <Name extends QuizshowHostFrameName>(
    name: Name,
    payload: QuizshowClientPayload<Name>,
  ) => Promise<boolean>;
  isPending: (name: QuizshowHostFrameName) => boolean;
  lastErrorKey: string | null;
} {
  const { send } = controller;
  const currentPhaseId = controller.state.session?.cursor.phaseId ?? null;
  const pendingNamesRef = useRef(new Set<QuizshowHostFrameName>());
  const [pendingNames, setPendingNames] = useState<
    ReadonlySet<QuizshowHostFrameName>
  >(() => new Set());
  const [commandError, setCommandError] = useState<HostCommandError | null>(
    null,
  );

  const run = useCallback(
    async <Name extends QuizshowHostFrameName>(
      name: Name,
      payload: QuizshowClientPayload<Name>,
    ): Promise<boolean> => {
      const pending = pendingNamesRef.current;
      if (pending.has(name)) return false;
      pending.add(name);
      setPendingNames(new Set(pending));
      let errorKey: string | null;
      try {
        const result = await send(name, payload);
        errorKey = errorKeyOfResult(result);
      } catch {
        errorKey = GENERIC_ERROR_KEY;
      } finally {
        pending.delete(name);
        setPendingNames(new Set(pending));
      }
      // The phase the tap was made in: once the game moves, the copy goes.
      setCommandError(
        errorKey === null ? null : { key: errorKey, phaseId: currentPhaseId },
      );
      return errorKey === null;
    },
    [send, currentPhaseId],
  );

  const isPending = useCallback(
    (name: QuizshowHostFrameName) => pendingNames.has(name),
    [pendingNames],
  );

  const lastErrorKey =
    commandError !== null && commandError.phaseId === currentPhaseId
      ? commandError.key
      : null;

  return { run, isPending, lastErrorKey };
}
