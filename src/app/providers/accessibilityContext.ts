import { createContext, useContext } from "react";

export interface AccessibilityContextValue {
  /** Whether the in-app "Reduce motion" preference is on. */
  reduceMotion: boolean;
  setReduceMotion: (next: boolean | ((prev: boolean) => boolean)) => void;
  toggleReduceMotion: () => void;
}

const noop = () => {};

// Non-null default so `useReduceMotion()` is safe outside the provider (isolated
// component tests, storybook-style renders) — it simply reports motion as full.
export const AccessibilityContext = createContext<AccessibilityContextValue>({
  reduceMotion: false,
  setReduceMotion: noop,
  toggleReduceMotion: noop,
});

export function useReduceMotion(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
