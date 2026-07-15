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
import { useAuth } from "./authContext";
import {
  getDrafts,
  createDraft,
  deleteDraft,
  draftToDto,
  dtoToDraft,
} from "../../features/members/api/drafts.api";

interface DraftsContextValue {
  /** User-created drafts, newest first. Merged ahead of the static mock list. */
  drafts: Draft[];
  /** Add a draft (no-op if the id already exists). */
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
}

const DraftsContext = createContext<DraftsContextValue | null>(null);
const STORAGE_KEY = "qp.drafts.v1";

/**
 * App-wide store of drafts the user actually started elsewhere (e.g. saving an
 * invite as a draft) so they show up on the Drafts page. Persists to
 * localStorage. Stored drafts must use plain-string fields — the static mock
 * drafts use JSX, but anything persisted here has to be serialisable.
 *
 * Dual-mode (spec 09): in demo mode this is a pure local store, unchanged and
 * never touching the network. Live, the same localStorage store is an
 * optimistic/offline cache — a hydration effect seeds it from the server (only
 * the serialisable DraftDTO subset syncs; `meta`/`actions` default to empty),
 * and each mutator applies the local change first, then syncs to the API,
 * rolling the local state back on failure.
 */
export function DraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useLocalStorage<Draft[]>(
    STORAGE_KEY,
    [],
    (v): v is Draft[] => Array.isArray(v),
  );
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  // Live-only: hydrate the store from the server list once the member is signed
  // in. Parked in demo mode and while logged out (re-runs when login lands).
  useEffect(() => {
    if (demoMode || !loggedIn) return;
    let active = true;
    getDrafts()
      .then((res) => {
        if (active) setDrafts(res.items.map(dtoToDraft));
      })
      .catch(() => {
        /* unauthorized / offline — keep the cached local list */
      });
    return () => {
      active = false;
    };
  }, [demoMode, loggedIn, setDrafts]);

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

  const value = useMemo(
    () => ({ drafts, addDraft, removeDraft }),
    [drafts, addDraft, removeDraft],
  );

  return (
    <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>
  );
}

export function useDrafts() {
  const ctx = useContext(DraftsContext);
  if (!ctx) {
    throw new Error("useDrafts must be used within DraftsProvider");
  }
  return ctx;
}
