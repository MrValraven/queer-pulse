import { useEffect, useRef } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { serverNow } from "../realtime/quizshowClock";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { wheelSpinLandsAt } from "../quizshowWheel";
import { drawnWheelSlicesOf } from "../stage/quizshowWheelView";
import { wheelPegCount, wheelRotationAt } from "../stage/quizshowWheelMotion";
import { playQuizshowCue, type QuizshowCue } from "./quizshowCues";

/** A landing cue this much later than the stop is stale (a hidden tab woke up) and stays silent. */
const MAX_LANDING_CUE_LATE_MS = 250;

interface UseQuizshowWheelCuesOptions {
  isMuted: boolean;
  clockOffsetMs: number;
  cues: readonly QuizshowCue[];
}

/**
 * Wheel sound for the TV (contract 12.1 and 7.3). A spin first seen in the air
 * runs a frame loop that plays `wheelTick` once per peg that crosses the pointer
 * after the screen joined, and `wheelLand` once at the stop. A spin first seen
 * landed plays nothing, and the same spin re-sent (pause, resume) never replays.
 * Reduced motion drops the ticks and keeps the landing cue. Mute and the cue
 * list are read from a latest-ref on every frame.
 */
export function useQuizshowWheelCues(
  state: QuizshowClientState,
  options: UseQuizshowWheelCuesOptions,
): void {
  const { isMuted, clockOffsetMs, cues } = options;
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const wheel = state.session?.wheel ?? null;
  const spin = wheel?.spin ?? null;
  const startedAt = spin?.startedAt ?? null;
  const drawnCount = wheel === null ? 0 : drawnWheelSlicesOf(wheel).length;
  // A backstop: the effect re-runs only when `startedAt` or `drawnCount`
  // changes, so this only guards a `drawnCount` change on an already handled spin.
  const handledStartedAtRef = useRef<number | null>(null);
  const latestRef = useRef({
    spin,
    isMuted,
    clockOffsetMs,
    cues,
    isReducedMotion,
  });
  useEffect(() => {
    latestRef.current = { spin, isMuted, clockOffsetMs, cues, isReducedMotion };
  });

  useEffect(() => {
    const firstSpin = latestRef.current.spin;
    if (firstSpin === null || startedAt === null) return undefined;
    if (handledStartedAtRef.current === startedAt) return undefined;
    const landsAtMs = wheelSpinLandsAt(firstSpin);
    const firstNowMs = serverNow(Date.now(), latestRef.current.clockOffsetMs);
    if (firstNowMs >= landsAtMs) {
      handledStartedAtRef.current = startedAt;
      return undefined;
    }
    const hasPegs = drawnCount > 0;
    let previousPegCount = hasPegs
      ? wheelPegCount(
          wheelRotationAt(
            firstSpin,
            drawnCount,
            firstNowMs,
            latestRef.current.isReducedMotion,
          ),
          drawnCount,
        )
      : 0;
    let frameId = 0;
    const step = () => {
      const latest = latestRef.current;
      const latestSpin = latest.spin;
      if (latestSpin === null || latestSpin.startedAt !== startedAt) return;
      const nowMs = serverNow(Date.now(), latest.clockOffsetMs);
      if (nowMs >= landsAtMs) {
        handledStartedAtRef.current = startedAt;
        const isLandingFresh = nowMs - landsAtMs <= MAX_LANDING_CUE_LATE_MS;
        if (
          isLandingFresh &&
          !latest.isMuted &&
          latest.cues.includes("wheelLand")
        ) {
          playQuizshowCue("wheelLand");
        }
        return;
      }
      if (hasPegs) {
        const pegCount = wheelPegCount(
          wheelRotationAt(
            latestSpin,
            drawnCount,
            nowMs,
            latest.isReducedMotion,
          ),
          drawnCount,
        );
        const hasCrossedPeg = pegCount !== previousPegCount;
        previousPegCount = pegCount;
        if (
          hasCrossedPeg &&
          !latest.isMuted &&
          !latest.isReducedMotion &&
          latest.cues.includes("wheelTick")
        ) {
          playQuizshowCue("wheelTick");
        }
      }
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [startedAt, drawnCount]);
}
