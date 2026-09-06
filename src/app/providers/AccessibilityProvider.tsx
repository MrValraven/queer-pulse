import { useCallback, useLayoutEffect, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../../shared/hooks/useLocalStorage";
import {
  AccessibilityContext,
  TEXT_SCALE_DEFAULT,
  TEXT_SCALE_MAX,
  TEXT_SCALE_MIN,
} from "./accessibilityContext";
import "./accessibilityPreferences.css";

const STORAGE_KEY = "qp:a11y:reduce-motion";
const TEXT_SCALE_KEY = "qp:a11y:text-scale";
const WIDE_SPACING_KEY = "qp:a11y:wide-spacing";
const FOCUS_RINGS_KEY = "qp:a11y:focus-rings";

const isBool = (value: unknown): value is boolean => typeof value === "boolean";

/** A stored text scale is only honoured inside the supported range. */
const isTextScale = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= TEXT_SCALE_MIN &&
  value <= TEXT_SCALE_MAX;

/**
 * Holds accessibility preferences that apply platform-wide, each persisted to
 * localStorage and reflected onto <html> before paint.
 *
 *  - "Reduce motion" → `data-reduce-motion`, read by the global CSS
 *    kill-switch (base.css) and by `usePrefersReducedMotion` (JS-driven
 *    motion).
 *  - "Text size" → the root `font-size`. The whole type scale is in `rem`
 *    (`--text-8` … `--text-64`), so this one declaration resizes every piece
 *    of type on the platform. PRD-307.
 *  - "Open out spacing" and "Always show focus" → `data-a11y-wide-spacing`
 *    and `data-a11y-focus-rings`, read by `accessibilityPreferences.css`.
 *
 * All four are device-local by design: no backend column, nothing to sync,
 * and they keep working signed out. Falls back to in-memory when storage is
 * unavailable, see useLocalStorage.
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useLocalStorage(
    STORAGE_KEY,
    false,
    isBool,
  );
  const [textScale, setTextScale] = useLocalStorage(
    TEXT_SCALE_KEY,
    TEXT_SCALE_DEFAULT,
    isTextScale,
  );
  const [wideSpacing, setWideSpacing] = useLocalStorage(
    WIDE_SPACING_KEY,
    false,
    isBool,
  );
  const [alwaysShowFocus, setAlwaysShowFocus] = useLocalStorage(
    FOCUS_RINGS_KEY,
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

  // Same reason, and it matters more here: a late font-size change reflows the
  // whole page. Cleared rather than set to "100%" at the default, so a member
  // who never touched this keeps whatever root size their browser gives them
  // (which is itself an accessibility setting we must not override).
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (textScale === TEXT_SCALE_DEFAULT) {
      root.style.removeProperty("font-size");
    } else {
      root.style.fontSize = `${textScale}%`;
    }
  }, [textScale]);

  useLayoutEffect(() => {
    document.documentElement.dataset.a11yWideSpacing = wideSpacing
      ? "true"
      : "false";
  }, [wideSpacing]);

  useLayoutEffect(() => {
    document.documentElement.dataset.a11yFocusRings = alwaysShowFocus
      ? "true"
      : "false";
  }, [alwaysShowFocus]);

  const toggleReduceMotion = useCallback(
    () => setReduceMotion((prev) => !prev),
    [setReduceMotion],
  );

  const value = useMemo(
    () => ({
      reduceMotion,
      setReduceMotion,
      toggleReduceMotion,
      textScale,
      setTextScale,
      wideSpacing,
      setWideSpacing,
      alwaysShowFocus,
      setAlwaysShowFocus,
    }),
    [
      reduceMotion,
      setReduceMotion,
      toggleReduceMotion,
      textScale,
      setTextScale,
      wideSpacing,
      setWideSpacing,
      alwaysShowFocus,
      setAlwaysShowFocus,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}
