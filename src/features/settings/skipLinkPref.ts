import { useSyncExternalStore } from "react";
import { DEFAULT_PREFS } from "./accessibilityPreferences.data";

/**
 * The "Skip to content link" accessibility preference.
 *
 * Why this isn't just `useState` on the settings page: the toggle lives in
 * `AccessibilityPrefSections`, but the thing it has to switch on — the skip
 * anchor — is rendered by `AppShell`/`PageShell`, on every other page too. A
 * page-local `useState` (which is all this pref had) can't reach either, which
 * is why the toggle moved a boolean and changed nothing on screen. So the pref
 * is a tiny module-level store: persisted to localStorage, and subscribed to via
 * `useSyncExternalStore` so every reader — the toggle and both shells — re-renders
 * the moment it flips.
 *
 * Deliberately NOT a React context: the shells sit outside the settings feature
 * and `src/app/providers/**` is owned elsewhere; an external store keeps this
 * self-contained and works identically in tests with no provider to mount.
 */

const STORAGE_KEY = "qp:a11y:skip-link";

let current: boolean = read();
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw != null) {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "boolean") return parsed;
    }
  } catch {
    // ignore — private mode / corrupt value falls through to the default
  }
  return DEFAULT_PREFS.skipLink;
}

function emit() {
  for (const listener of listeners) listener();
}

/** Set the preference, persist it, and wake every subscriber. */
export function setSkipLinkPref(next: boolean | ((prev: boolean) => boolean)) {
  const value = typeof next === "function" ? next(current) : next;
  if (value === current) return;
  current = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore — keep working in-memory
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => current;
/** SSR/prerender has no localStorage — report the default. */
const getServerSnapshot = () => DEFAULT_PREFS.skipLink;

/** Whether the member has asked for a "Skip to main content" link. */
export function useSkipLinkPref(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Test-only reset so suites don't leak the store between cases. */
export function resetSkipLinkPrefForTests(value = DEFAULT_PREFS.skipLink) {
  current = value;
  emit();
}
