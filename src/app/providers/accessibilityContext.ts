import { createContext, useContext } from "react";

/**
 * Text size as a PERCENTAGE of the browser's own default, applied to the root
 * font size. The whole type scale (`--text-8` … `--text-64`) is in `rem`, so
 * moving the root moves every piece of type on the platform.
 *
 * The range stops at 130 rather than the 160 the old inert slider advertised.
 * Roughly 1,500 boxes across the app still declare a fixed `height` in `px`
 * (form controls at 44, the marketing nav at `--nav-height: 62px`, the app bar
 * at `--app-bar-h: 48px`), and those do not grow with the type. 130% is the
 * point past which the text in them starts to crowd its box. Raising the cap
 * is a chrome job, not a preference job: those heights need to be `em`.
 */
export const TEXT_SCALE_MIN = 90;
export const TEXT_SCALE_MAX = 130;
export const TEXT_SCALE_STEP = 10;
export const TEXT_SCALE_DEFAULT = 100;

export interface AccessibilityContextValue {
  /** Whether the in-app "Reduce motion" preference is on. */
  reduceMotion: boolean;
  setReduceMotion: (next: boolean | ((prev: boolean) => boolean)) => void;
  toggleReduceMotion: () => void;
  /** Root font size as a percentage, `TEXT_SCALE_MIN`…`TEXT_SCALE_MAX`. */
  textScale: number;
  setTextScale: (next: number) => void;
  /**
   * Whether to open out the spacing of running text (WCAG 1.4.12): line
   * height, letter spacing, word spacing and the gap between paragraphs.
   */
  wideSpacing: boolean;
  setWideSpacing: (next: boolean | ((prev: boolean) => boolean)) => void;
  /**
   * Whether the focus ring shows on EVERY focus rather than only the ones the
   * browser judges to be keyboard-driven (`:focus-visible`).
   */
  alwaysShowFocus: boolean;
  setAlwaysShowFocus: (next: boolean | ((prev: boolean) => boolean)) => void;
}

const noop = () => {};

// Non-null default so `useReduceMotion()` is safe outside the provider (isolated
// component tests, storybook-style renders) — it simply reports motion as full.
export const AccessibilityContext = createContext<AccessibilityContextValue>({
  reduceMotion: false,
  setReduceMotion: noop,
  toggleReduceMotion: noop,
  textScale: TEXT_SCALE_DEFAULT,
  setTextScale: noop,
  wideSpacing: false,
  setWideSpacing: noop,
  alwaysShowFocus: false,
  setAlwaysShowFocus: noop,
});

export function useReduceMotion(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}

/**
 * The same context, named for what the settings pane actually reads: every
 * accessibility preference, of which reduce-motion is one. `useReduceMotion`
 * stays as-is for the many motion-only callers.
 */
export function useAccessibilityPrefs(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
