import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { logError } from "../observability/logger";

/**
 * Quick-Exit (safety escape) state + behaviour, in one place so the whole
 * feature has a single owner of the `document` keydown listener and the
 * decoy-redirect logic. See docs/production-readiness/16-quick-exit-safety.md.
 *
 * Persistence is client-only via localStorage (silent private-mode fallback):
 * signed-out visitors and demo mode never round-trip. A future settings toggle
 * can flip `setEnabled` / `setKeyTrigger` and the values survive reloads.
 * (When live-mode preference sync lands, branch the setters on demoMode and
 * PATCH /me/preferences here — the exit action itself stays client-only.)
 */

const STORAGE_KEY = "qp.safety.quickExit.v1";
/** Default decoy — a plausible, boring, safe-for-any-context site. */
const DEFAULT_DECOY_URL = "https://weather.com";
/** Two Shift taps must land inside this window (ms) to count as the chord. */
const DOUBLE_SHIFT_WINDOW_MS = 500;

export interface QuickExitPrefs {
  /** Show the floating button + arm the key trigger. Safety defaults ON. */
  enabled: boolean;
  /** Arm the double-Shift accelerator. The button works regardless. */
  keyTrigger: boolean;
  /** Where the current tab is sent on exit. */
  decoyUrl: string;
}

const DEFAULT_PREFS: QuickExitPrefs = {
  enabled: true,
  keyTrigger: true,
  decoyUrl: DEFAULT_DECOY_URL,
};

function isPrefs(value: unknown): value is QuickExitPrefs {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.enabled === "boolean" &&
    typeof v.keyTrigger === "boolean" &&
    typeof v.decoyUrl === "string"
  );
}

export interface QuickExitApi extends QuickExitPrefs {
  setEnabled: (b: boolean) => void;
  setKeyTrigger: (b: boolean) => void;
  /** Leave now: overwrite this tab with the decoy, best-effort history scrub. */
  triggerExit: () => void;
}

export function useQuickExit(): QuickExitApi {
  const [prefs, setPrefs] = useLocalStorage<QuickExitPrefs>(
    STORAGE_KEY,
    DEFAULT_PREFS,
    isPrefs,
  );

  const { enabled, keyTrigger, decoyUrl } = prefs;

  const setEnabled = useCallback(
    (b: boolean) => setPrefs((p) => ({ ...p, enabled: b })),
    [setPrefs],
  );
  const setKeyTrigger = useCallback(
    (b: boolean) => setPrefs((p) => ({ ...p, keyTrigger: b })),
    [setPrefs],
  );

  const triggerExit = useCallback(() => {
    // Every step is best-effort and independently guarded so nothing throws on
    // the way out — leaving fast matters more than any single step succeeding.

    // Neutralise the tab label immediately so it can't flash "QueerPulse".
    try {
      document.title = "Weather";
    } catch {
      /* no-op */
    }
    // Reopen the real app in a fresh, detached tab (best-effort; may be
    // popup-blocked — acceptable, the point is leaving, not preserving state).
    try {
      window.open(window.location.origin, "_blank", "noopener");
    } catch {
      /* popup blocked — ignore */
    }
    // Scrub the current SPA entry's URL. NOTE: browsers block replaceState to a
    // cross-origin URL (SecurityError), so this often no-ops for an external
    // decoy — location.replace() below still swaps the entry, keeping the
    // QueerPulse URL out of the immediate Back target. We cannot wipe *earlier*
    // history entries: no web API deletes arbitrary prior entries.
    try {
      window.history.replaceState(null, "", decoyUrl);
    } catch {
      /* cross-origin replaceState blocked — expected, ignore */
    }
    // Overwrite the current tab. replace() swaps (not pushes) the entry so this
    // navigation isn't a Back target.
    try {
      window.location.replace(decoyUrl);
    } catch (err) {
      logError(err, { context: "quickExit.replace" });
      try {
        window.location.href = decoyUrl;
      } catch {
        /* nothing more we can do */
      }
    }
  }, [decoyUrl]);

  // Double-Shift accelerator: two bare Shift keydowns within the window, with
  // no other key between them. Shift alone types nothing, so this is safe even
  // inside text inputs and never competes with the command palette or Modal's
  // Escape handler (spec deliberately avoids Esc).
  useEffect(() => {
    if (!enabled || !keyTrigger) return;
    let lastShift = 0;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Shift") {
        lastShift = 0; // any other key breaks the chord
        return;
      }
      if (e.repeat) return; // ignore auto-repeat from a held key
      if (e.ctrlKey || e.metaKey || e.altKey) return; // modifier combos aren't it
      const now = Date.now();
      if (lastShift && now - lastShift <= DOUBLE_SHIFT_WINDOW_MS) {
        lastShift = 0;
        triggerExit();
      } else {
        lastShift = now;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, keyTrigger, triggerExit]);

  return useMemo(
    () => ({
      enabled,
      keyTrigger,
      decoyUrl,
      setEnabled,
      setKeyTrigger,
      triggerExit,
    }),
    [enabled, keyTrigger, decoyUrl, setEnabled, setKeyTrigger, triggerExit],
  );
}
