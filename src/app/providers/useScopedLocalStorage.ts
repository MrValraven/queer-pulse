import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { safeStorage } from "../../shared/storage/safeStorage";

/**
 * Like `useLocalStorage`, but the storage key is **namespaced by `scopeId`**
 * (see `useStorageScope`) so each signed-in member reads/writes their OWN
 * bucket and a shared device never leaks one member's cache to the next:
 *
 * - `scopeId === "demo"` keeps the ORIGINAL un-suffixed `baseKey` — a single
 *   mock persona, preserving existing demo data and the demo tests' contract.
 * - a live user id gets `${baseKey}.u.${scopeId}`.
 * - `scopeId === null` (signed out / session still resolving) means NO bucket:
 *   state falls back to `initial` and nothing is persisted, so the store shows
 *   empty rather than the previous member's data.
 *
 * When `scopeId` changes (a different member signs in, or a sign-out) the state
 * is re-read from the new bucket during render — the documented React pattern
 * for resetting state on a changed input without an extra committed frame.
 *
 * Storage access goes through `safeStorage`, so a browser blocking site data
 * degrades to in-memory rather than throwing.
 */
function keyFor(baseKey: string, scopeId: string | null): string | null {
  if (scopeId === null) return null;
  if (scopeId === "demo") return baseKey;
  return `${baseKey}.u.${scopeId}`;
}

function readBucket<T>(
  storageKey: string | null,
  initial: T,
  validate?: (value: unknown) => value is T,
): T {
  if (!storageKey) return initial;
  try {
    const raw = safeStorage.get(storageKey);
    if (raw != null) {
      const parsed: unknown = JSON.parse(raw);
      if (!validate || validate(parsed)) return parsed as T;
    }
  } catch {
    // corrupt payload — fall back to initial
  }
  return initial;
}

export function useScopedLocalStorage<T>(
  baseKey: string,
  scopeId: string | null,
  initial: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = keyFor(baseKey, scopeId);
  const [value, setValue] = useState<T>(() =>
    readBucket(storageKey, initial, validate),
  );

  // Re-read from the new bucket the instant the scope changes (member switch or
  // sign-out). The previous key is tracked in state — React's documented
  // "adjust state while rendering" pattern — so this fires once per change, not
  // every render; the setState below would otherwise loop.
  const [appliedKey, setAppliedKey] = useState(storageKey);
  if (appliedKey !== storageKey) {
    setAppliedKey(storageKey);
    setValue(readBucket(storageKey, initial, validate));
  }

  useEffect(() => {
    // No bucket while signed out / still checking — keep state in-memory only so
    // nothing is written to a shared key that the next member would read.
    if (!storageKey) return;
    safeStorage.set(storageKey, JSON.stringify(value));
  }, [storageKey, value]);

  const update = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    setValue((prev) =>
      typeof next === "function" ? (next as (previous: T) => T)(prev) : next,
    );
  }, []);

  return [value, update];
}
