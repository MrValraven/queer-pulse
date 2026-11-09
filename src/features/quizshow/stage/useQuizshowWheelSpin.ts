import { useLayoutEffect, type RefObject } from "react";
import type { QuizshowWheelSpin } from "../../../shared/contracts/quizshow";
import { serverNow } from "../realtime/quizshowClock";
import { wheelSpinEndAngle, wheelSpinLandsAt } from "../quizshowWheel";
import {
  QUIZSHOW_WHEEL_KICK_DEGREES,
  QUIZSHOW_WHEEL_KICK_MS,
  wheelPegCount,
  wheelRotationAt,
} from "./quizshowWheelMotion";

/** The pointer's swing back as a peg passes, from the approved mockup. */
const POINTER_KICK_KEYFRAMES: Keyframe[] = [
  { transform: "rotate(0deg)" },
  { transform: `rotate(${QUIZSHOW_WHEEL_KICK_DEGREES}deg)`, offset: 0.35 },
  { transform: "rotate(0deg)" },
];
const REST_IDENTITY = "rest";
const POINTER_KICK_TIMING: KeyframeAnimationOptions = {
  duration: QUIZSHOW_WHEEL_KICK_MS,
  easing: "ease-out",
};

/**
 * One string per spin, built from every field that decides its motion. Two
 * frames carrying the same spin give the same identity, so a re-sent
 * `phase:change` (pause, resume) never restarts the animation.
 */
export function wheelSpinIdentity(spin: QuizshowWheelSpin | null): string {
  if (spin === null) return REST_IDENTITY;
  const spinFields: QuizshowWheelSpin = {
    landedSliceIndex: spin.landedSliceIndex,
    startedAt: spin.startedAt,
    durationMs: spin.durationMs,
    turns: spin.turns,
    jitterSeed: spin.jitterSeed,
    startAngle: spin.startAngle,
  };
  return JSON.stringify(spinFields);
}

/** The spin back from its identity, so the effect depends on one string. */
function spinFromIdentity(spinIdentity: string): QuizshowWheelSpin | null {
  if (spinIdentity === REST_IDENTITY) return null;
  return JSON.parse(spinIdentity) as QuizshowWheelSpin;
}

function rotationTransform(degrees: number): string {
  return `rotate(${degrees}deg)`;
}

/** A short swing of the pointer, replacing the previous one so kicks never pile up. */
function kickPointer(
  pointer: SVGGElement | null,
  previousKick: Animation | null,
): Animation | null {
  if (pointer === null || typeof pointer.animate !== "function") return null;
  previousKick?.cancel();
  return pointer.animate(POINTER_KICK_KEYFRAMES, POINTER_KICK_TIMING);
}

/**
 * Turns the spinner layer with `transform: rotate()` from the server clock, so
 * every screen shows the same angle at the same moment. No React state changes
 * per frame: the loop writes the transform straight to the element.
 *
 * - No spin: the wheel rests at 0 degrees.
 * - A spin that has landed: the end angle, written once, with no motion.
 * - A spin in the air: joins at its current angle and runs one frame loop to
 *   the stop, kicking the pointer each time a peg passes after it joined
 *   (never under reduced motion).
 */
export function useQuizshowWheelSpin(input: {
  spinnerRef: RefObject<SVGSVGElement | null>;
  pointerRef: RefObject<SVGGElement | null>;
  spin: QuizshowWheelSpin | null;
  drawnCount: number;
  clockOffsetMs: number;
  isReducedMotion: boolean;
}): void {
  const { spinnerRef, pointerRef, spin, drawnCount, clockOffsetMs } = input;
  const { isReducedMotion } = input;
  // The effect keys on the spin's identity, so a new object for the same spin
  // (every frame the store copies) neither restarts nor rewinds the loop.
  const spinIdentity = wheelSpinIdentity(spin);

  // A layout effect, so a wheel that mounts or changes spin paints its first
  // frame at the right angle, never one frame at a stale one.
  useLayoutEffect(() => {
    const spinner = spinnerRef.current;
    if (spinner === null) return undefined;
    const currentSpin = spinFromIdentity(spinIdentity);
    if (currentSpin === null || drawnCount < 1) {
      spinner.style.transform = rotationTransform(0);
      return undefined;
    }
    const endAngle = wheelSpinEndAngle(currentSpin, drawnCount);
    const landsAt = wheelSpinLandsAt(currentSpin);
    const readServerNow = () => serverNow(Date.now(), clockOffsetMs);
    if (readServerNow() >= landsAt) {
      spinner.style.transform = rotationTransform(endAngle);
      return undefined;
    }

    let frameId: number | null = null;
    let kick: Animation | null = null;
    let lastPegCount: number | null = null;
    spinner.setAttribute("data-spinning", "true");

    const drawFrame = () => {
      const serverNowMs = readServerNow();
      if (serverNowMs >= landsAt) {
        spinner.style.transform = rotationTransform(endAngle);
        spinner.setAttribute("data-spinning", "false");
        frameId = null;
        return;
      }
      const rotation = wheelRotationAt(
        currentSpin,
        drawnCount,
        serverNowMs,
        isReducedMotion,
      );
      spinner.style.transform = rotationTransform(rotation);
      const pegCount = wheelPegCount(rotation, drawnCount);
      // The first frame only records where the wheel is: a screen that joins
      // mid-spin kicks for the pegs that pass after it joined.
      if (
        !isReducedMotion &&
        lastPegCount !== null &&
        pegCount !== lastPegCount
      ) {
        kick = kickPointer(pointerRef.current, kick);
      }
      lastPegCount = pegCount;
      frameId = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      kick?.cancel();
      spinner.setAttribute("data-spinning", "false");
    };
  }, [
    spinnerRef,
    pointerRef,
    spinIdentity,
    drawnCount,
    clockOffsetMs,
    isReducedMotion,
  ]);
}
