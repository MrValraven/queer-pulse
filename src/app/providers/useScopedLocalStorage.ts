import { type Dispatch, type SetStateAction } from "react";
import { usePersistedState } from "../../shared/hooks/useLocalStorage";

/**
 * Like `useLocalStorage`, but the storage key is **namespaced by `scopeId`**
 * (see `useStorageScope`) so each signed-in member reads/writes their OWN
 * bucket and a shared device never leaks one member's cache to the next:
 *
 * - `scopeId === "demo"` keeps the ORIGINAL un-suffixed `baseKey`: a single
 *   mock persona, preserving existing demo data and the demo tests' contract.
 * - a live user id gets `${baseKey}.u.${scopeId}`.
 * - `scopeId === null` (signed out / session still resolving) means NO bucket:
 *   state falls back to `initial` and nothing is persisted, so the store shows
 *   empty rather than the previous member's data.
 *
 * Both hooks share one implementation, `usePersistedState`
 * (`src/shared/hooks/useLocalStorage.ts`); only the key derivation lives here.
 * That core owns the key-change contract: when `scopeId` changes (a different
 * member signs in, or a sign-out) the state is re-read from the new bucket
 * during render, and the previous bucket's value is never written into the new
 * one. Storage access goes through `safeStorage`, so a browser blocking site
 * data degrades to in-memory rather than throwing.
 */
function keyFor(baseKey: string, scopeId: string | null): string | null {
  if (scopeId === null) return null;
  if (scopeId === "demo") return baseKey;
  return `${baseKey}.u.${scopeId}`;
}

export function useScopedLocalStorage<T>(
  baseKey: string,
  scopeId: string | null,
  initial: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  return usePersistedState(keyFor(baseKey, scopeId), initial, validate);
}
