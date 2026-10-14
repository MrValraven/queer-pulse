import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/** How far past the last clock tick the drawn playhead may run. */
const MAX_LEAD_SECONDS = 1;
/** A tick this close to the drawn playhead eases in; a wider gap snaps. */
const JITTER_SECONDS = 0.35;
/** Time constant of that ease, in seconds. */
const CONVERGE_SECONDS = 0.15;

interface SmoothClock {
  anchorSeconds: number;
  anchorWallTime: number;
  offsetSeconds: number;
  displayedSeconds: number;
}

/** Draws a played fraction (0 to 1) onto the element, straight to the DOM. */
export type StudioProgressPainter<TElement extends Element> = (
  element: TElement,
  fraction: number,
) => void;

interface SmoothInputs<TElement extends Element> {
  duration: number;
  playbackRate: number;
  paint: StudioProgressPainter<TElement>;
}

function writeProgress<TElement extends Element>(
  element: TElement | null,
  seconds: number,
  inputs: SmoothInputs<TElement>,
) {
  if (!element) return;
  const fraction =
    inputs.duration > 0
      ? Math.min(1, Math.max(0, seconds / inputs.duration))
      : 0;
  inputs.paint(element, fraction);
}

/** Moves a progress drawing every frame between the audio clock's coarse
 *  ticks: the waveform's played clip, the mini player's line. `paint` writes
 *  the fraction to the element the returned ref points at; a new `paint`
 *  (say, from a resize) redraws at once. Paused, it shows the exact clock.
 *  Small tick jitter eases in, seeks snap. */
export function useStudioSmoothProgress<TElement extends Element>({
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  paint,
}: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  paint: StudioProgressPainter<TElement>;
}): RefObject<TElement | null> {
  const elementRef = useRef<TElement | null>(null);
  const inputsRef = useRef<SmoothInputs<TElement>>({
    duration,
    playbackRate,
    paint,
  });
  const clockRef = useRef<SmoothClock>({
    anchorSeconds: currentTime,
    anchorWallTime: 0,
    offsetSeconds: 0,
    displayedSeconds: currentTime,
  });

  // A new painter (a resize) or length redraws from the shown position
  // before paint.
  useLayoutEffect(() => {
    inputsRef.current = { duration, playbackRate, paint };
    writeProgress(
      elementRef.current,
      clockRef.current.displayedSeconds,
      inputsRef.current,
    );
  }, [duration, playbackRate, paint]);

  // Each tick re-anchors before paint, so the React-rendered value never
  // flashes behind the drawn playhead.
  useLayoutEffect(() => {
    const clock = clockRef.current;
    clock.anchorSeconds = currentTime;
    clock.anchorWallTime = performance.now();
    const gapSeconds = currentTime - clock.displayedSeconds;
    const isSmallJitter = isPlaying && Math.abs(gapSeconds) < JITTER_SECONDS;
    clock.offsetSeconds = isSmallJitter ? -gapSeconds : 0;
    if (!isSmallJitter) clock.displayedSeconds = currentTime;
    writeProgress(
      elementRef.current,
      clock.displayedSeconds,
      inputsRef.current,
    );
  }, [currentTime, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    let frameId = 0;
    const drawFrame = (frameTime: number) => {
      const clock = clockRef.current;
      const inputs = inputsRef.current;
      const elapsedSeconds = Math.max(
        0,
        (frameTime - clock.anchorWallTime) / 1000,
      );
      const leadSeconds = Math.min(
        elapsedSeconds * inputs.playbackRate,
        MAX_LEAD_SECONDS,
      );
      const easedOffsetSeconds =
        clock.offsetSeconds * Math.exp(-elapsedSeconds / CONVERGE_SECONDS);
      const predictedSeconds =
        clock.anchorSeconds + leadSeconds + easedOffsetSeconds;
      // While playing the drawn playhead only moves forward.
      const nextSeconds = Math.max(clock.displayedSeconds, predictedSeconds);
      clock.displayedSeconds =
        inputs.duration > 0
          ? Math.min(inputs.duration, nextSeconds)
          : nextSeconds;
      writeProgress(elementRef.current, clock.displayedSeconds, inputs);
      frameId = requestAnimationFrame(drawFrame);
    };
    frameId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  return elementRef;
}
