import { createContext, useContext } from "react";

/**
 * The app-wide reduced-motion flag, split out of `MotionProvider.tsx` so that
 * file exports only its component and Vite fast refresh keeps working
 * (react-refresh/only-export-components). `MotionProvider` owns the value and
 * publishes it here; every animated surface reads it through `useMotionPrefs`.
 *
 * The value tracks BOTH the OS `prefers-reduced-motion` setting and the in-app
 * "Reduce motion" toggle, via the repo's own `usePrefersReducedMotion`. Default
 * `false` so a component rendered outside the provider animates normally rather
 * than silently freezing.
 */
export const ReducedMotionContext = createContext(false);

export function useMotionPrefs(): { reducedMotion: boolean } {
  return { reducedMotion: useContext(ReducedMotionContext) };
}
