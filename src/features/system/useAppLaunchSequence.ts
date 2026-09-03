import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../app/providers/authContext";

/**
 * The boot sequence's one timeline. Phases run splash → leaving → done, and
 * `done` unmounts the overlay for the rest of the session.
 */
export type LaunchPhase = "splash" | "leaving" | "done";

/** How the hairline is behaving right now. */
export type LaunchProgress = "determinate" | "shimmer" | "complete";

/**
 * Minimum time the splash owns the screen. On a warm cache the app can be
 * ready in well under 200ms, and a full-screen take-over that appears and
 * leaves inside a few frames reads as a glitch rather than a launch. It also
 * has to outlast the entrance (AppLaunch.module.css): the ghost icon finishes
 * shrinking at ~680ms and the greeting is fully in at ~920ms, and the exit
 * cannot start before COMPLETE_MS + HANDOFF_DELAY_MS after this.
 */
const MIN_DWELL_MS = 800;

/**
 * How long the determinate fill is allowed to run before we stop pretending to
 * know how long this will take. Past this the hairline becomes a shimmer and
 * says so in words, which the design prefers to a bar crawling to 99%.
 */
const DETERMINATE_MS = 1700;

/** How long the fill takes to run out to 100% once ready actually fires. */
const COMPLETE_MS = 180;

/** Beat between the fill completing and the sheet starting to lift. */
const HANDOFF_DELAY_MS = 140;

/**
 * Offline gets a longer beat. There is a banner waiting on the other side
 * ("showing your saved feed") and cutting to it instantly reads as a failure
 * rather than a deliberate fallback.
 */
const OFFLINE_HANDOFF_DELAY_MS = 900;

/** Duration of the exit: dot flies to the nav, wordmark shrinks, sheet lifts. */
const HANDOFF_MS = 440;

/**
 * Hard ceiling. Readiness is two independent signals and either could in
 * principle never settle (a font that 404s behind a captive portal, a session
 * check that hangs). Nobody gets trapped on a splash screen: at this point we
 * hand off regardless and let the app's own loading states do their job.
 */
const CEILING_MS = 4000;

export interface LaunchSequence {
  phase: LaunchPhase;
  progress: LaunchProgress;
  /** True once we have passed the determinate window without being ready. */
  isOverdue: boolean;
}

/**
 * Is the app actually ready to be looked at?
 *
 * Two honest signals, both observable without instrumenting every route:
 *
 * - Fonts. The wordmark and the greeting are Fraunces. Handing off before the
 *   face has loaded means the feed's own headings reflow under the member a
 *   beat after they arrive.
 * - The session check. Everything the first screen shows depends on whether
 *   there is a member, so handing off mid-check means landing on the app's
 *   bare session spinner right after the splash implied we were done.
 *
 * Deliberately NOT waited on: the first route chunk. It is already covered —
 * the session check outlasts it on a cold network, and on a warm cache the
 * minimum dwell does.
 */
function useIsBootReady(): boolean {
  const { checking } = useAuth();
  const [areFontsReady, setAreFontsReady] = useState(
    () => typeof document === "undefined" || !document.fonts,
  );

  useEffect(() => {
    if (areFontsReady) return;
    let isCancelled = false;
    void document.fonts.ready.then(() => {
      if (!isCancelled) setAreFontsReady(true);
    });
    return () => {
      isCancelled = true;
    };
  }, [areFontsReady]);

  return areFontsReady && !checking;
}

export interface LaunchSequenceOptions {
  /**
   * Only changes the handoff beat and the copy — never whether we hand off,
   * because the app has its own offline surface and a splash is the wrong
   * place to strand somebody.
   */
  isOffline: boolean;
  /**
   * Holds readiness open for this long, for the desktop preview only (see
   * appLaunchPreview.ts). Zero in every real launch, where readiness is
   * whatever the fonts and the session check actually take.
   */
  holdMs?: number;
}

/** Drives the launch timeline. */
export function useAppLaunchSequence({
  isOffline,
  holdMs = 0,
}: LaunchSequenceOptions): LaunchSequence {
  const isBootReady = useIsBootReady();
  // The preview's artificial hold. Starts true only when one was asked for, so
  // a real launch never waits on a timer that is already false.
  const [isHeld, setIsHeld] = useState(holdMs > 0);
  useEffect(() => {
    if (holdMs <= 0) return;
    const holdTimer = window.setTimeout(() => setIsHeld(false), holdMs);
    return () => window.clearTimeout(holdTimer);
  }, [holdMs]);
  const isReady = isBootReady && !isHeld;
  const [phase, setPhase] = useState<LaunchPhase>("splash");
  const [isOverdue, setIsOverdue] = useState(false);
  const [isForced, setIsForced] = useState(false);
  const [isReleased, setIsReleased] = useState(false);
  // The clock this whole sequence is measured against. A ref, because every
  // timer below outlives the render that scheduled it, and it is stamped in the
  // effect rather than at `useRef(Date.now())`: reading the clock during render
  // is impure, and this effect is declared first, so the value is in place
  // before the release effect below can read it.
  const startedAt = useRef(0);

  // Give up on the determinate fill, and on the ceiling, at fixed points.
  useEffect(() => {
    startedAt.current = Date.now();
    const overdueTimer = window.setTimeout(
      () => setIsOverdue(true),
      DETERMINATE_MS,
    );
    // A preview hold is deliberate, so it outranks the safety net; otherwise
    // the ceiling would fire first and cut the slow path short.
    const ceilingMs = holdMs > 0 ? holdMs + CEILING_MS : CEILING_MS;
    const ceilingTimer = window.setTimeout(() => setIsForced(true), ceilingMs);
    return () => {
      window.clearTimeout(overdueTimer);
      window.clearTimeout(ceilingTimer);
    };
  }, [holdMs]);

  // Release as soon as we are ready, but never before the minimum dwell.
  useEffect(() => {
    if (isReleased || !(isReady || isForced)) return;
    const remaining = Math.max(
      0,
      MIN_DWELL_MS - (Date.now() - startedAt.current),
    );
    const releaseTimer = window.setTimeout(
      () => setIsReleased(true),
      remaining,
    );
    return () => window.clearTimeout(releaseTimer);
  }, [isReady, isForced, isReleased]);

  // Once released: run the fill out, then the exit, then leave the tree.
  useEffect(() => {
    if (!isReleased) return;
    const handoffAt =
      COMPLETE_MS + (isOffline ? OFFLINE_HANDOFF_DELAY_MS : HANDOFF_DELAY_MS);
    const leavingTimer = window.setTimeout(
      () => setPhase("leaving"),
      handoffAt,
    );
    const doneTimer = window.setTimeout(
      () => setPhase("done"),
      handoffAt + HANDOFF_MS,
    );
    return () => {
      window.clearTimeout(leavingTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isReleased, isOffline]);

  // Derived rather than stored, so there is exactly one source of truth for
  // what the hairline is doing and no effect that can disagree with it.
  const progress: LaunchProgress = isReleased
    ? "complete"
    : isOverdue
      ? "shimmer"
      : "determinate";

  return { phase, progress, isOverdue };
}

export const LAUNCH_TIMING = {
  MIN_DWELL_MS,
  DETERMINATE_MS,
  COMPLETE_MS,
  HANDOFF_MS,
  CEILING_MS,
} as const;
