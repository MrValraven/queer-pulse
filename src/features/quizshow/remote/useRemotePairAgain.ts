import { useEffect, useMemo } from "react";
import type { QuizshowHostState } from "../../../shared/contracts/quizshow";
import type { QuizshowSessionScope } from "../quizshowScope";

/**
 * A pairing belongs to one session (contract 6.5): a rematch, the real game
 * after a practice or a reopened lobby starts with no screen and no helpers.
 * This tab remembers, per event or game, the last session that had a paired
 * device, so the host's remote can say to pair again. `sessionStorage`, in
 * try/catch: a private window or blocked site data only drops the reminder.
 */
const PAIRED_BEFORE_KEY_PREFIX = "quizshow.remote.pairedBefore.";

function storageKeyOf(scope: QuizshowSessionScope): string {
  const scopeId = scope.kind === "event" ? scope.eventSlug : scope.gameId;
  return `${PAIRED_BEFORE_KEY_PREFIX}${scope.kind}:${scopeId}`;
}

export function readPairedBeforeSessionId(
  scope: QuizshowSessionScope,
): string | null {
  return readStoredSessionId(storageKeyOf(scope));
}

function readStoredSessionId(storageKey: string): string | null {
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeStoredSessionId(storageKey: string, sessionId: string): void {
  try {
    window.sessionStorage.setItem(storageKey, sessionId);
  } catch {
    // Storage refused: the reminder lasts until this page unloads.
  }
}

export interface QuizshowRemotePairAgain {
  /** The game ended with devices paired: the end actions say they pair again for the next game. */
  isEndedLineShown: boolean;
  /** A new lobby after a session that had devices paired, and none paired yet: say to pair the screen again. */
  isLobbyLineShown: boolean;
}

/**
 * The host remote's pair-again reminders. `scope` is null on a helper's
 * remote, which never pairs, so both stay off there.
 */
export function useRemotePairAgain(
  scope: QuizshowSessionScope | null,
  session: QuizshowHostState,
): QuizshowRemotePairAgain {
  const { sessionId, pairedDevices, cursor } = session;
  const hasPairedDevices = pairedDevices.length > 0;
  const storageKey = scope === null ? null : storageKeyOf(scope);

  useEffect(() => {
    if (storageKey !== null && hasPairedDevices) {
      writeStoredSessionId(storageKey, sessionId);
    }
  }, [storageKey, sessionId, hasPairedDevices]);

  // While devices are paired this session is the one to remember; else read what an earlier one left.
  const pairedBeforeSessionId = useMemo(() => {
    if (storageKey === null) return null;
    return hasPairedDevices ? sessionId : readStoredSessionId(storageKey);
  }, [storageKey, sessionId, hasPairedDevices]);

  if (storageKey === null) {
    return { isEndedLineShown: false, isLobbyLineShown: false };
  }
  return {
    isEndedLineShown:
      cursor.phase === "ended" && pairedBeforeSessionId === sessionId,
    isLobbyLineShown:
      cursor.phase === "lobby" &&
      pairedBeforeSessionId !== null &&
      pairedBeforeSessionId !== sessionId,
  };
}
