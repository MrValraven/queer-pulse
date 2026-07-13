import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../../shared/hooks";
import { useDemoMode } from "./DemoModeProvider";
import {
  getSaved,
  putSaved,
  deleteSaved,
  dtoToSavedItem,
  savedItemToBody,
} from "../../features/members/api/saved.api";

export type SavedKind = "article" | "film" | "job" | "post" | "event" | "group";

export interface SavedItem {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string;
  kind: SavedKind;
  title: string;
  /** Original design href or router path; pass through linkToPath() when rendering. */
  href?: string;
  /** Small supporting line (author, org, neighbourhood…). */
  meta?: string;
  /** One- to two-line blurb shown on the saved card. */
  description?: string;
  /** Short read/length pill, e.g. "6 min". Falls back to a "N min" parsed from meta. */
  readTime?: string;
}

interface SavedContextValue {
  items: SavedItem[];
  isSaved: (id: string) => boolean;
  /** Toggle an item; returns the new saved state (true = now saved). */
  toggleSave: (item: SavedItem) => boolean;
  save: (item: SavedItem) => void;
  unsave: (id: string) => void;
  byKind: (kind: SavedKind) => SavedItem[];
}

const SavedContext = createContext<SavedContextValue | null>(null);
const STORAGE_KEY = "qp.saved.v1";

const isSavedItemArray = (v: unknown): v is SavedItem[] => Array.isArray(v);

/**
 * App-wide store of "saved" things (articles, films, jobs, posts…). Persists to
 * localStorage so the Collections page and every save toggle stay in sync.
 *
 * Dual-mode (spec 09): in demo mode this is a pure local store, byte-for-byte as
 * before and never touching the network. Live, the same localStorage store acts
 * as an optimistic/offline cache — a hydration effect seeds it from the server,
 * and each mutator applies the local change first, then syncs to the API and
 * rolls the local state back on failure.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<SavedItem[]>(
    STORAGE_KEY,
    [],
    isSavedItemArray,
  );
  const { demoMode } = useDemoMode();

  // Live-only: hydrate the store from the server list on mount / mode change.
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    getSaved()
      .then((res) => {
        if (active) setItems(res.items.map(dtoToSavedItem));
      })
      .catch(() => {
        /* unauthorized / offline — keep the cached local list */
      });
    return () => {
      active = false;
    };
  }, [demoMode, setItems]);

  const isSaved = useCallback(
    (id: string) => items.some((it) => it.id === id),
    [items],
  );

  const save = useCallback(
    (item: SavedItem) => {
      let existed = false;
      setItems((prev) => {
        existed = prev.some((it) => it.id === item.id);
        return existed ? prev : [item, ...prev];
      });
      if (demoMode || existed) return;
      putSaved(item.id, savedItemToBody(item)).catch(() => {
        // Roll back the optimistic add on failure.
        setItems((prev) => prev.filter((it) => it.id !== item.id));
      });
    },
    [setItems, demoMode],
  );

  const unsave = useCallback(
    (id: string) => {
      let removed: SavedItem | undefined;
      setItems((prev) => {
        removed = prev.find((it) => it.id === id);
        return prev.filter((it) => it.id !== id);
      });
      if (demoMode || !removed) return;
      const restore = removed;
      deleteSaved(id).catch(() => {
        // Roll back the optimistic removal on failure (restore most-recent-first).
        setItems((prev) =>
          prev.some((it) => it.id === id) ? prev : [restore, ...prev],
        );
      });
    },
    [setItems, demoMode],
  );

  const toggleSave = useCallback(
    (item: SavedItem) => {
      // Decide from the current snapshot so the returned boolean is correct
      // synchronously — callers use it to pick "Saved"/"Removed" toast copy.
      // (A state updater function isn't run synchronously, so a flag mutated
      // inside one can't be returned reliably.)
      const wasSaved = items.some((it) => it.id === item.id);
      setItems((prev) =>
        wasSaved ? prev.filter((it) => it.id !== item.id) : [item, ...prev],
      );
      if (!demoMode) {
        const op = wasSaved
          ? deleteSaved(item.id)
          : putSaved(item.id, savedItemToBody(item));
        op.catch(() => {
          // Roll back to the pre-toggle state for this id.
          setItems((prev) => {
            if (wasSaved) {
              return prev.some((it) => it.id === item.id)
                ? prev
                : [item, ...prev];
            }
            return prev.filter((it) => it.id !== item.id);
          });
        });
      }
      return !wasSaved;
    },
    [items, setItems, demoMode],
  );

  const byKind = useCallback(
    (kind: SavedKind) => items.filter((it) => it.kind === kind),
    [items],
  );

  const value = useMemo(
    () => ({ items, isSaved, toggleSave, save, unsave, byKind }),
    [items, isSaved, toggleSave, save, unsave, byKind],
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used within SavedProvider");
  }
  return ctx;
}
