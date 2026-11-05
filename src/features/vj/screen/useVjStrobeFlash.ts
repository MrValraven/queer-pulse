/**
 * The projector's strobe clock. Safety rules, all owned here:
 * - flash starts are at least VJ_STROBE_MIN_PERIOD_MS apart (vjStrobePeriodMs
 *   floors the period at 400 ms), measured on performance.now() so a timer
 *   that fires early or a wall clock that jumps can never bring two starts
 *   closer; with a frame of paint delay at most 3 flashes still show in any
 *   one-second window;
 * - the strobe switches itself off 10 s after this screen applied
 *   isStrobing: true, on its own clock, with or without a server;
 * - only an enabled screen flashes (the page enables the lead screen only, so
 *   two unsynced projectors in one room never add up their flashes). The 10 s
 *   clock runs either way, so a screen enabled halfway through a strobe only
 *   flashes for what is left of it, and its first flash waits one full period
 *   so it never lands right after the last flash of the screen it took over
 *   from.
 * A repeated "on" with the strobe already on keeps the original 10 s.
 */
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { VJ_LIMITS } from "../../../shared/contracts/vj";
import { VJ_STROBE_FLASH_MS, vjStrobePeriodMs } from "../live/vjStrobe";

interface VjStrobeRun {
  /** The isStrobing value this run was opened for. */
  isStrobing: boolean;
  /** +1 each time isStrobing turns true. */
  runNumber: number;
  hasTimedOut: boolean;
}

/** Opens a run when isStrobing turns true and closes it 10 s later, on this screen's clock. */
function useVjStrobeRun(isStrobing: boolean): boolean {
  const [strobeRun, setStrobeRun] = useState<VjStrobeRun>(() => ({
    isStrobing,
    runNumber: isStrobing ? 1 : 0,
    hasTimedOut: false,
  }));
  if (strobeRun.isStrobing !== isStrobing) {
    setStrobeRun({
      isStrobing,
      runNumber: isStrobing ? strobeRun.runNumber + 1 : strobeRun.runNumber,
      hasTimedOut: false,
    });
  }
  const runNumber = strobeRun.runNumber;

  useEffect(() => {
    if (!isStrobing) return undefined;
    const timeoutId = window.setTimeout(() => {
      setStrobeRun((previous) =>
        previous.runNumber === runNumber
          ? { ...previous, hasTimedOut: true }
          : previous,
      );
    }, VJ_LIMITS.strobeMaxDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [isStrobing, runNumber]);

  return isStrobing && strobeRun.isStrobing && !strobeRun.hasTimedOut;
}

/** Milliseconds until the next flash may start, from the last start on performance.now(). */
function waitBeforeNextFlashMs(
  lastFlashStartMs: number | null,
  periodMs: number,
): number {
  if (lastFlashStartMs === null) return 0;
  const remainingMs = lastFlashStartMs + periodMs - performance.now();
  return remainingMs > 0 ? Math.ceil(remainingMs) : 0;
}

/**
 * True while a white flash is up. isEnabled false (a follower screen) shows
 * no flash and runs no flash timer.
 */
export function useVjStrobeFlash(
  isStrobing: boolean,
  bpm: number,
  isEnabled = true,
): boolean {
  const isRunActive = useVjStrobeRun(isStrobing);
  const isActive = isRunActive && isEnabled;

  const [isFlashUp, setIsFlashUp] = useState(false);
  const lastFlashStartRef = useRef<number | null>(null);
  const wasEnabledRef = useRef(isEnabled);
  const readPeriodMs = useEffectEvent(() => vjStrobePeriodMs(bpm));

  // Declared before the flash clock so it runs first in the same commit.
  useEffect(() => {
    const wasEnabled = wasEnabledRef.current;
    wasEnabledRef.current = isEnabled;
    // Taking over a running strobe: wait a full period, as if a flash just started.
    if (isEnabled && !wasEnabled && isRunActive) {
      lastFlashStartRef.current = performance.now();
    }
  }, [isEnabled, isRunActive]);

  useEffect(() => {
    if (!isActive) return undefined;
    let nextFlashTimeoutId: number | undefined;
    let flashOffTimeoutId: number | undefined;
    const startFlash = (): void => {
      const waitMs = waitBeforeNextFlashMs(
        lastFlashStartRef.current,
        readPeriodMs(),
      );
      if (waitMs > 0) {
        nextFlashTimeoutId = window.setTimeout(startFlash, waitMs);
        return;
      }
      lastFlashStartRef.current = performance.now();
      setIsFlashUp(true);
      window.clearTimeout(flashOffTimeoutId);
      flashOffTimeoutId = window.setTimeout(
        () => setIsFlashUp(false),
        VJ_STROBE_FLASH_MS,
      );
      nextFlashTimeoutId = window.setTimeout(startFlash, readPeriodMs());
    };
    // A strobe switched off and on again keeps the spacing from its last flash.
    nextFlashTimeoutId = window.setTimeout(startFlash, 0);
    return () => {
      window.clearTimeout(nextFlashTimeoutId);
      window.clearTimeout(flashOffTimeoutId);
      setIsFlashUp(false);
    };
  }, [isActive]);

  return isActive && isFlashUp;
}
