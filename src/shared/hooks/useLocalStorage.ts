import { useCallback, useEffect, useState } from "react";

/**
 * State persisted to localStorage under `key`, degrading silently to in-memory
 * when storage is unavailable (private mode) or the stored value is corrupt.
 * `initial` seeds first use.
 *
 * An optional `validate` guard runs on the parsed value; if it returns false the
 * stored value is discarded and `initial` is used instead. Use it when a malformed
 * persisted value (e.g. an object where an array is expected) must not reach state.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        if (!validate || validate(parsed)) return parsed as T;
      }
    } catch {
      // ignore — fall back to initial
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore — keep working in-memory
    }
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  }, []);

  return [value, update];
}
