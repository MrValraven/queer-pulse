import { createContext, useContext, type ReactNode } from "react";
import { LazyMotion, domMax } from "motion/react";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";

const ReducedMotionContext = createContext(false);

/**
 * App-wide motion foundation. LazyMotion + domMax loads the full DOM feature
 * bundle (still a runtime-cached vendor chunk, off the precached entry) —
 * upgraded from domAnimation (Task 9) because the Task-14 edge-swipe-back and
 * sheet drag-to-dismiss gestures need the `drag` feature, which domAnimation
 * (animations + gesture animations only) does not include; domMax is a
 * strict superset, so RouteTransition's existing enter/exit animations keep
 * working unchanged. Cost: a modestly larger vendor-motion chunk — still
 * lazy and off the entry chunk, so it doesn't move the LCP/precache budget.
 * `strict` forbids the heavy `motion.*` components — every animated surface
 * must import `m` from motion/react. Exposes a single reduced-motion flag so
 * gestures and transitions share one source of truth — the repo's own
 * `usePrefersReducedMotion`, which tracks BOTH the OS `prefers-reduced-motion`
 * setting and the in-app "Reduce motion" toggle and re-renders on change.
 * (motion's built-in `useReducedMotion` reads a module-cached value once at
 * first use, never updates, and ignores the in-app toggle.)
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return (
    <ReducedMotionContext.Provider value={reduced}>
      <LazyMotion features={domMax} strict>
        {children}
      </LazyMotion>
    </ReducedMotionContext.Provider>
  );
}

export function useMotionPrefs(): { reducedMotion: boolean } {
  return { reducedMotion: useContext(ReducedMotionContext) };
}
