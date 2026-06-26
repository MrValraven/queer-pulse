import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface UseCountUpOptions {
  /** Whether the animation should run. Pass the section's reveal state. */
  active?: boolean
  durationMs?: number
}

/**
 * Animates a number from 0 to `target` once `active` becomes true. Returns the
 * current value. Under reduced motion it jumps straight to the target.
 */
export function useCountUp(target: number, { active = true, durationMs = 1100 }: UseCountUpOptions = {}) {
  const prefersReduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    // Reduced motion needs no animation — the value is derived in the return below.
    if (!active || startedRef.current || prefersReduced) return
    startedRef.current = true

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      // easeOutCubic for a natural settle
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, durationMs, prefersReduced])

  // Under reduced motion, jump straight to the target once active.
  return prefersReduced && active ? target : value
}
