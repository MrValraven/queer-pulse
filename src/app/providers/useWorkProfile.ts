import { createContext, useContext, useEffect, useMemo } from "react";
import { type WorkPreferencesDTO } from "../../features/economy/api/workPreferences.api";
import { useWorkPreferences } from "../../features/economy/api/useWorkPreferences";

/**
 * The overlay-only slice: the working copy and its mutators. Deliberately does
 * NOT carry `loading`, which belongs to the query the composition hook owns.
 */
export interface WorkProfileContextValue {
  /** Out-at-work spectrum value: 'out' | 'verified' | 'private'. */
  outAtWork: string;
  setOutAtWork: (v: string) => void;
  /** Selected trans-support option ids. */
  transSupport: string[];
  toggleTransSupport: (id: string) => void;
  /** Only surface community-verified-safe employers. */
  safeOnly: boolean;
  setSafeOnly: (v: boolean) => void;
  /** True while a save is in flight. */
  saving: boolean;
  /**
   * Persist the current values. Resolves `true` only when the server has them.
   *
   * On failure the working copy is rolled back to what the server still holds,
   * so the editor can never keep showing an outness setting that was never
   * written — callers must not show a success state on `false`.
   */
  save: () => Promise<boolean>;
  /**
   * Adopt the stored preferences. Idempotent per live session: only the FIRST
   * call lands. Hydration is now driven by whichever consumer's query resolves,
   * and consumers mount and unmount as the member navigates — without this
   * latch, opening the jobs board after editing the work profile would replay
   * hydration and silently discard the unsaved draft.
   */
  hydrate: (data: WorkPreferencesDTO) => void;
}

export const WorkProfileContext =
  createContext<WorkProfileContextValue | null>(null);

/** The public shape — unchanged from before this provider was scoped. */
export interface WorkProfileValue
  extends Omit<WorkProfileContextValue, "hydrate"> {
  /** True while the stored preferences are still being read (live mode only). */
  loading: boolean;
}

function useWorkProfileContext(): WorkProfileContextValue {
  const ctx = useContext(WorkProfileContext);
  if (!ctx) {
    throw new Error("useWorkProfile must be used within WorkProfileProvider");
  }
  return ctx;
}

/**
 * The member's work-profile preferences: the session working copy from the
 * provider, joined to the stored values from `useWorkPreferences`.
 *
 * Calling this SUBSCRIBES to GET /me/work-preferences — that subscription is
 * the entire mechanism by which the request now fires on the two pages that
 * read these preferences instead of on every route. A component that only
 * needed to *write* must therefore not call this hook; today there is no such
 * consumer (both read server-hydrated fields), so there is no actions-only
 * hook. If one appears, add `useWorkProfileActions()` returning the context
 * alone rather than routing it through here.
 */
export function useWorkProfile(): WorkProfileValue {
  const { hydrate, ...overlay } = useWorkProfileContext();
  const { data, isLoading } = useWorkPreferences();

  useEffect(() => {
    if (data) hydrate(data);
  }, [data, hydrate]);

  return useMemo(
    () => ({ ...overlay, loading: isLoading }),
    [overlay, isLoading],
  );
}
