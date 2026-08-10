import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useDemoMode } from "./DemoModeProvider";
import { useScopedLocalStorage } from "./useScopedLocalStorage";
import { useStorageScope } from "./useStorageScope";
import {
  NUDGE_KEYS,
  dismissNudge,
  fetchMyNudges,
  type NudgeKey,
} from "../../shared/api/nudges.api";
import { NudgesContext, type NudgesValue } from "./useNudges";

const STORAGE_KEY = "qp.nudges.v1";

/** After this many distinct dismissals the rest of the discovery moments stop
 *  firing (personas Phase 5, Decision §1) — `account_badge` is exempt (a
 *  persistent count, not a dismissible nudge; callers never gate it on this). */
const DISMISS_CAP = 2;

const isNudgeKeyList = (value: unknown): value is NudgeKey[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "string" &&
      (NUDGE_KEYS as readonly string[]).includes(item),
  );

/**
 * Persona-discovery dismissal store (personas Phase 5, Decision §1). Six
 * "discovery moments" introduce personas across the app; each fires at most
 * once and is dismissible for good, and once 2 distinct nudges are dismissed
 * the rest stop. The local mirror gives an instant, flicker-free decision; in
 * live mode we reconcile with the backend so the state follows the member
 * cross-device. Modeled directly on `ConsentProvider`.
 */
export function NudgesProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  // Per-member bucket — a shared device must never surface one member's
  // dismissals to the next (see `useStorageScope`/`useScopedLocalStorage`).
  const scopeId = useStorageScope();
  const [dismissedKeys, setDismissedKeys] = useScopedLocalStorage<NudgeKey[]>(
    STORAGE_KEY,
    scopeId,
    [],
    isNudgeKeyList,
  );

  // Live mode: reconcile with the caller's current dismissal state on mount,
  // so a dismissal made on another device is honored here too.
  const reconciled = useRef(false);
  useEffect(() => {
    if (reconciled.current) return;
    reconciled.current = true;
    let cancelled = false;
    void fetchMyNudges(demoMode).then((res) => {
      if (cancelled || !res) return;
      setDismissedKeys(res.dismissedKeys);
    });
    return () => {
      cancelled = true;
    };
  }, [demoMode, setDismissedKeys]);

  const isDismissed = useCallback(
    (key: NudgeKey) => dismissedKeys.includes(key),
    [dismissedKeys],
  );

  // Derived from the same rule the backend uses (COUNT ≥ 2) so the cap flips
  // instantly on the optimistic 2nd dismissal, not only after a round-trip.
  const isCapped = dismissedKeys.length >= DISMISS_CAP;

  const dismiss = useCallback(
    (key: NudgeKey) => {
      setDismissedKeys((prev) =>
        prev.includes(key) ? prev : [...prev, key],
      );
      // Idempotent on the backend; fire-and-forget, demo mode no-ops.
      void dismissNudge(key, demoMode);
    },
    [demoMode, setDismissedKeys],
  );

  const value = useMemo<NudgesValue>(
    () => ({ isDismissed, isCapped, dismiss }),
    [isDismissed, isCapped, dismiss],
  );

  return (
    <NudgesContext.Provider value={value}>{children}</NudgesContext.Provider>
  );
}
