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
  // The target we last animated to. Lets us re-run when the target changes
  // after the first settle (e.g. a total that arrives/updates asynchronously),
  // instead of freezing on the initial value.
  const animatedToRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion needs no animation — the value is derived in the return below.
    if (!active || prefersReduced) return;
    // Already settled on this exact target — nothing to animate.
    if (animatedToRef.current === target) return;
    // First run animates from `from`; a later target change animates from
    // wherever the count currently sits so it ticks to the new value.
    const startValue = animatedToRef.current === null ? from : valueRef.current;

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
      } else {
        // Mark "settled on this target" only once the animation actually
        // completes — not up front. Otherwise StrictMode's mount→cleanup→mount
        // cycle cancels the first frame, and the re-run sees `animatedToRef`
        // already equal to `target` and bails, freezing the count at `from`.
        animatedToRef.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs, from, prefersReduced]);

  // Under reduced motion, jump straight to the target once active.
  return prefersReduced && active ? target : value;
}
