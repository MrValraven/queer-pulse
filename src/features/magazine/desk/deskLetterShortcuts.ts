import { useSyncExternalStore } from "react";

/**
 * Whether the desk's single-character shortcuts (j, k, o, x, c, w, p, y, n
 * and /) are on. WCAG 2.1.4 asks for a way to turn off shortcuts that use a
 * lone printable key: speech-input users dictate words that land as bursts
 * of letters, and a stray "n" there would pass the top pitch. The switch
 * lives in the shortcut sheet; `?` (which opens that sheet) and Escape stay
 * live either way, so the switch can always be reached again.
 *
 * A module-level store (the `skipLinkPref.ts` pattern): the sheet flips it
 * and the keyboard hook reads it, and `useSyncExternalStore` re-renders both
 * the moment it changes. Persisted per browser; storage failures (private
 * mode, blocked site data) fall back to the default in memory.
 */

const STORAGE_KEY = "qp:magazine:desk-letter-shortcuts";
const DEFAULT_IS_LETTER_SHORTCUTS_ENABLED = true;

let isLetterShortcutsEnabled: boolean = readStoredValue();
const listeners = new Set<() => void>();

function readStoredValue(): boolean {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (storedValue === "on") return true;
    if (storedValue === "off") return false;
  } catch {
    // Storage is unavailable: use the default for this session.
  }
  return DEFAULT_IS_LETTER_SHORTCUTS_ENABLED;
}

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

/** Turn the single-character desk shortcuts on or off, and remember it. */
export function setDeskLetterShortcutsEnabled(isEnabled: boolean): void {
  if (isEnabled === isLetterShortcutsEnabled) return;
  isLetterShortcutsEnabled = isEnabled;
  try {
    localStorage.setItem(STORAGE_KEY, isEnabled ? "on" : "off");
  } catch {
    // Storage is unavailable: the choice holds in memory until reload.
  }
  notifyListeners();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => isLetterShortcutsEnabled;
const getServerSnapshot = () => DEFAULT_IS_LETTER_SHORTCUTS_ENABLED;

/** True while the single-character desk shortcuts are on. */
export function useDeskLetterShortcutsEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Test-only reset, so one case's choice never leaks into the next. */
export function resetDeskLetterShortcutsForTests(
  isEnabled = DEFAULT_IS_LETTER_SHORTCUTS_ENABLED,
): void {
  isLetterShortcutsEnabled = isEnabled;
  notifyListeners();
}
