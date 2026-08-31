import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { safeStorage } from "../storage/safeStorage";

/**
 * Reads the value stored under `storageKey`, falling back to `initial` when
 * there is no key, nothing stored, the payload is corrupt, or `validate`
 * rejects it.
 */
function readStored<T>(
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
    // corrupt payload: fall back to initial
  }
  return initial;
}

/**
 * The shared core behind `useLocalStorage` and `useScopedLocalStorage`: state
 * persisted under `storageKey`, degrading silently to in-memory when storage is
 * unavailable (private mode, blocked site data) or the stored value is corrupt.
 *
 * `storageKey === null` means NO bucket: state falls back to `initial` and
 * nothing is persisted. `useScopedLocalStorage` uses that for a signed-out or
 * still-resolving session; the generic hook always has a key.
 *
 * **Key-change contract:** when `storageKey` changes, the state is re-read from
 * the NEW key during render (React's documented "adjust state while rendering"
 * pattern), so the previous key's value is never written into the new one and
 * no extra committed frame shows stale data. The last applied key is tracked in
 * state so the re-read fires once per change instead of every render.
 */
export function usePersistedState<T>(
  storageKey: string | null,
  initial: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readStored(storageKey, initial, validate),
  );

  const [appliedKey, setAppliedKey] = useState(storageKey);
  if (appliedKey !== storageKey) {
    setAppliedKey(storageKey);
    setValue(readStored(storageKey, initial, validate));
  }

  useEffect(() => {
    if (!storageKey) return;
    try {
      safeStorage.set(storageKey, JSON.stringify(value));
    } catch {
      // unserialisable value: keep working in-memory
    }
  }, [storageKey, value]);

  const update = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    setValue((previous) =>
      typeof next === "function"
        ? (next as (previous: T) => T)(previous)
        : next,
    );
  }, []);

  return [value, update];
}

/**
 * State persisted to localStorage under `key`, degrading silently to in-memory
 * when storage is unavailable (private mode) or the stored value is corrupt.
 * `initial` seeds first use.
 *
 * An optional `validate` guard runs on the parsed value; if it returns false the
 * stored value is discarded and `initial` is used instead. Use it when a malformed
 * persisted value (e.g. an object where an array is expected) must not reach state.
 *
 * **Key-change contract:** passing a different `key` loads that key's stored
 * value (or `initial` when it holds nothing) during the same render, and never
 * writes the previous key's value into the new key. A key built per member or
 * per community is therefore safe.
 *
 * For a key namespaced by the signed-in member, see `useScopedLocalStorage`
 * (`src/app/providers/useScopedLocalStorage.ts`), which wraps the same core.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
): [T, (next: T | ((prev: T) => T)) => void] {
  return usePersistedState(key, initial, validate);
}
