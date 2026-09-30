import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TextAnchor, TextHandoffCues } from "./signInNetworkArt.handoff";

/** When the wordmark and caption on the art appear. They wait for the Q's
 *  last light to land on the wordmark, then write themselves in. Two
 *  failsafes make sure the text always appears: one from mount, for an
 *  engine that never gets going (no 2D context, a hidden tab, an error),
 *  and a shorter one once the Q has formed, for a light that stalls in
 *  flight (the art scrolled off screen, the tab hidden mid-entrance). */

/** `waiting` until the light lands, `writing` while the text animates in,
 *  `shown` for text revealed without the light (a failsafe fired, or
 *  reduced motion). */
export type TextPhase = "waiting" | "writing" | "shown";

/** The Q forms about four seconds in, after up to a second's wait for the
 *  brand serif; this leaves room for a slow first frame. */
const FAILSAFE_MILLISECONDS = 7000;
/** The light takes one second to land once the Q has formed. */
const LANDING_FAILSAFE_MILLISECONDS = 2500;

export function useTextReveal(isReducedMotion: boolean): {
  textPhase: TextPhase;
  cues: TextHandoffCues;
} {
  const [textPhase, setTextPhase] = useState<TextPhase>(() =>
    isReducedMotion ? "shown" : "waiting",
  );
  // Reduced motion turned on mid-way shows the text for good, so turning it
  // off again never hides it for a replay.
  if (isReducedMotion && textPhase !== "shown") setTextPhase("shown");
  const failsafeRef = useRef<number | undefined>(undefined);

  const armFailsafe = useCallback((milliseconds: number) => {
    window.clearTimeout(failsafeRef.current);
    failsafeRef.current = window.setTimeout(() => {
      setTextPhase((phase) => (phase === "waiting" ? "shown" : phase));
    }, milliseconds);
  }, []);

  useEffect(() => {
    armFailsafe(FAILSAFE_MILLISECONDS);
    return () => window.clearTimeout(failsafeRef.current);
  }, [armFailsafe]);

  const cues = useMemo<TextHandoffCues>(
    () => ({
      onFormed: () => armFailsafe(LANDING_FAILSAFE_MILLISECONDS),
      onLanded: () => {
        window.clearTimeout(failsafeRef.current);
        setTextPhase((phase) => (phase === "waiting" ? "writing" : phase));
      },
    }),
    [armFailsafe],
  );

  return { textPhase, cues };
}

/** The share of the wordmark's line box, from its top, where the light
 *  lands: on the baseline. `.writingLight` in the module centres its glow
 *  at the same height. */
const WORDMARK_BASELINE_RATIO = 0.8;

/** The start of the wordmark in the art's own coordinates, which are the
 *  canvas's. Offsets ignore transforms, so the text's small rise while it
 *  waits does not move the anchor. */
export function measureTextAnchor(
  wordmark: HTMLElement,
  root: HTMLElement,
): TextAnchor {
  let offsetX = 0;
  let offsetY = 0;
  let current: HTMLElement | null = wordmark;
  while (current && current !== root) {
    offsetX += current.offsetLeft;
    offsetY += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return {
    x: offsetX,
    y: offsetY + wordmark.offsetHeight * WORDMARK_BASELINE_RATIO,
  };
}
