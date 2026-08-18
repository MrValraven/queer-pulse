import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface UseCountUpOptions {
  /** Whether the animation should run. Pass the section's reveal state. */
  active?: boolean;
  durationMs?: number;
  /** Value the count starts from (default 0). */
  from?: number;
}

/**
 * Animates a number from `from` (default 0) to `target` once `active` becomes
 * true. Returns the current value. Under reduced motion it jumps straight to the
 * target.
 */
export function useCountUp(
  target: number,
  { active = true, durationMs = 1100, from = 0 }: UseCountUpOptions = {},
) {
  const prefersReduced = usePrefersReducedMotion();
  const [value, setValue] = useState(from);
  const valueRef = useRef(from);

  useEffect(() => {
    // Reduced motion needs no animation — the value is derived in the return below.
    if (!active || prefersReduced) return;
    // Already showing this target — nothing to animate. Checking the value
    // actually on screen (rather than a separate "last completed" flag) means
    // an animation interrupted mid-flight by a fast target change (e.g. a
    // filter toggled on and back off before the count settles) resumes from
    // wherever it was — a flag would wrongly see the reverted target as
    // already reached and leave the count frozen mid-transition.
    if (valueRef.current === target) return;
    const startValue = valueRef.current;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // easeOutCubic for a natural settle
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startValue + (target - startValue) * eased);
      valueRef.current = next;
      setValue(next);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs, from, prefersReduced]);

  // Under reduced motion, jump straight to the target once active.
  return prefersReduced && active ? target : value;
}
