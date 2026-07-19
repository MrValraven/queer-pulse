import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { type Draft } from "../../features/members/drafts.data";
import { useLocalStorage } from "../../shared/hooks";
import { useDemoMode } from "./DemoModeProvider";
import { useMyDrafts } from "../../features/members/api/useMyDrafts";
import {
  createDraft,
  deleteDraft,
  draftToDto,
} from "../../features/members/api/drafts.api";

interface DraftsContextValue {
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
interface DraftsStore extends DraftsContextValue {
  setDrafts: (next: Draft[] | ((prev: Draft[]) => Draft[])) => void;
}

const DraftsContext = createContext<DraftsStore | null>(null);
const STORAGE_KEY = "qp.drafts.v1";

/**
 * App-wide store of drafts the user actually started elsewhere (e.g. saving an
 * invite as a draft) so they show up on the Drafts page. Persists to
 * localStorage. Stored drafts must use plain-string fields — the static mock
 * drafts use JSX, but anything persisted here has to be serialisable.
 *
 * Dual-mode (spec 09): in demo mode this is a pure local store, unchanged and
 * never touching the network. Live, the same localStorage store is an
 * optimistic/offline cache — each mutator applies the local change first, then
 * syncs to the API, rolling the local state back on failure.
 *
 * **The provider no longer fetches** (phase 4). It used to run a keyless
 * `useEffect` + `getDrafts()` on mount, on every route, whether or not anything
 * read `drafts` — one of the seven eager provider requests the scoping work
 * removes. The fetch now lives in `useMyDrafts()`, subscribed only by the
 * `useDrafts()` composition hook below, so it fires when a READER mounts.
 * Write-only consumers use `useDraftsActions()` and fire nothing.
 */
export function DraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useLocalStorage<Draft[]>(
    STORAGE_KEY,
    [],
    (v): v is Draft[] => Array.isArray(v),
  );
  const { demoMode } = useDemoMode();

  const addDraft = useCallback(
    (draft: Draft) => {
      let existed = false;
      setDrafts((prev) => {
        existed = prev.some((d) => d.id === draft.id);
        return existed ? prev : [draft, ...prev];
      });
      if (demoMode || existed) return;
      createDraft(draftToDto(draft)).catch(() => {
        // Roll back the optimistic add on failure.
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      });
    },
    [setDrafts, demoMode],
  );

  const removeDraft = useCallback(
    (id: string) => {
      let removed: Draft | undefined;
      setDrafts((prev) => {
        removed = prev.find((d) => d.id === id);
        return prev.filter((d) => d.id !== id);
      });
      if (demoMode || !removed) return;
      const restore = removed;
      deleteDraft(id).catch(() => {
        // Roll back the optimistic removal on failure (restore newest-first).
        setDrafts((prev) =>
          prev.some((d) => d.id === id) ? prev : [restore, ...prev],
        );
      });
    },
    [setDrafts, demoMode],
  );

  const value = useMemo<DraftsStore>(
    () => ({ drafts, addDraft, removeDraft, setDrafts }),
    [drafts, addDraft, removeDraft, setDrafts],
  );

  return (
    <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>
  );
}

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
 * For consumers that only WRITE drafts (`InviteEmailForm`). Calling `useDrafts()`
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
