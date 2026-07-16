import { useCallback, useLayoutEffect, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../../shared/hooks/useLocalStorage";
import { AccessibilityContext } from "./accessibilityContext";

const STORAGE_KEY = "qp:a11y:reduce-motion";

const isBool = (value: unknown): value is boolean => typeof value === "boolean";

/**
 * Holds accessibility preferences that apply platform-wide. Currently just the
 * "Reduce motion" toggle: persisted to localStorage and reflected onto <html>
 * as `data-reduce-motion`, which both the global CSS kill-switch (base.css) and
 * `usePrefersReducedMotion` (JS-driven motion) read. Falls back to in-memory
 * when storage is unavailable — see useLocalStorage.
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useLocalStorage(
    STORAGE_KEY,
    false,
    isBool,
  );

  // Layout effect so the attribute is set before paint — avoids a flash of
  // motion on load when the preference is already on.
  useLayoutEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion
      ? "true"
      : "false";
  }, [reduceMotion]);

  const toggleReduceMotion = useCallback(
    () => setReduceMotion((prev) => !prev),
    [setReduceMotion],
  );

  const value = useMemo(
    () => ({ reduceMotion, setReduceMotion, toggleReduceMotion }),
    [reduceMotion, setReduceMotion, toggleReduceMotion],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
