import { createContext, useContext, useEffect } from "react";
import { type Draft } from "../../features/members/drafts.data";
import { useMyDrafts } from "../../features/members/api/useMyDrafts";

export interface DraftsContextValue {
  /** User-created drafts, newest first. Merged ahead of the static mock list. */
  drafts: Draft[];
  /** Add a draft (no-op if the id already exists). */
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
}

/**
 * The context actually carried. `setDrafts` is internal plumbing for the
 * hydration in `useDrafts()` and is deliberately absent from the public
 * `DraftsContextValue` both hooks are annotated to return — nothing outside
 * this file may replace the store wholesale.
 */
export interface DraftsStore extends DraftsContextValue {
  setDrafts: (next: Draft[] | ((prev: Draft[]) => Draft[])) => void;
}

export const DraftsContext = createContext<DraftsStore | null>(null);

function useDraftsStore(): DraftsStore {
  const ctx = useContext(DraftsContext);
  if (!ctx) {
    throw new Error("useDrafts must be used within DraftsProvider");
  }
  return ctx;
}

/**
 * The local store and its mutators, with **no query subscription**.
 *
 * For consumers that only WRITE drafts (never read the list). Calling `useDrafts()`
 * from a write-only consumer would subscribe it to `useMyDrafts()` and
 * re-introduce exactly the eager `/me/drafts` request this phase removes —
 * silently, because nothing would break; only the request-budget test would
 * catch it. If you add a consumer that never reads `drafts`, use this hook.
 */
export function useDraftsActions(): DraftsContextValue {
  return useDraftsStore();
}

/**
 * The full drafts view: the local store, hydrated from the server.
 *
 * Subscribing here is what fires `GET /me/drafts` — on first mount of a reader,
 * not on every route. Same return shape as before phase 4, so consumers are
 * unchanged.
 *
 * Hydration is a wholesale replacement of the local array, exactly as the
 * provider's old effect did. It is lossy (`meta`/`actions` come back empty; see
 * `useMyDrafts`) and that is pre-existing, intentional-for-now behaviour — do
 * not "improve" it inside a refactor whose whole value is being invisible.
 *
 * The effect is safe to run from multiple subscribers: react-query hands every
 * subscriber the same `data` array reference, so the dependency only changes
 * when a fetch actually resolves, and `staleTime: Infinity` means that happens
 * once per session.
 */
export function useDrafts(): DraftsContextValue {
  const store = useDraftsStore();
  const { setDrafts } = store;
  const { data: serverDrafts } = useMyDrafts();

  useEffect(() => {
    // `undefined` covers demo mode, logged out, in-flight and failed — all four
    // cases where the old effect left the cached local list alone.
    if (!serverDrafts) return;
    setDrafts(serverDrafts);
  }, [serverDrafts, setDrafts]);

  return store;
}
