import { useEffect, useState } from "react";
import type { QuizshowWheelSpin } from "../../../shared/contracts/quizshow";
import { serverNow } from "../realtime/quizshowClock";
import { wheelSpinLandsAt } from "../quizshowWheel";

export interface QuizshowWheelClock {
  serverNowMs: number;
  isLanded: boolean;
}

/**
 * Re-renders a surface exactly at its landing: wheelSpinLandsAt(spin) + delayMs.
 * serverNowMs is a snapshot of the server clock taken on mount and again when a
 * landing timer fires. It is safe only for comparing against the landing time
 * and never the current time (during a spin in the air it can be minutes old).
 * isLanded: spin !== null && serverNowMs >= landsAt + delayMs.
 */
export function useQuizshowWheelClock(
  spin: QuizshowWheelSpin | null,
  clockOffsetMs: number,
  delayMs = 0,
): QuizshowWheelClock {
  const [serverNowMs, setServerNowMs] = useState(() =>
    serverNow(Date.now(), clockOffsetMs),
  );
  const landingAtMs = spin === null ? null : wheelSpinLandsAt(spin) + delayMs;

  useEffect(() => {
    if (landingAtMs === null) return undefined;
    // One timer: due at the landing, or at once when the landing has passed,
    // so the snapshot is refreshed from a callback and never inside the effect body.
    const waitMs = Math.max(
      0,
      landingAtMs - serverNow(Date.now(), clockOffsetMs),
    );
    const timeoutId = setTimeout(() => {
      const serverNowAtFire = serverNow(Date.now(), clockOffsetMs);
      // A timer can fire a hair early; never report a time before the landing.
      setServerNowMs(
        waitMs > 0 ? Math.max(serverNowAtFire, landingAtMs) : serverNowAtFire,
      );
    }, waitMs);
    return () => clearTimeout(timeoutId);
  }, [landingAtMs, clockOffsetMs]);

  return {
    serverNowMs,
    isLanded: landingAtMs !== null && serverNowMs >= landingAtMs,
  };
}
