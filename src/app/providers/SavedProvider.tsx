import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../../shared/hooks";

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
 * localStorage so the Collections page and every save toggle stay in sync. The
 * data itself is still mock — this only tracks which mock items the user kept.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<SavedItem[]>(
    STORAGE_KEY,
    [],
    isSavedItemArray,
  );

  const isSaved = useCallback(
    (id: string) => items.some((it) => it.id === id),
    [items],
  );

  const save = useCallback(
    (item: SavedItem) => {
      setItems((prev) =>
        prev.some((it) => it.id === item.id) ? prev : [item, ...prev],
      );
    },
    [setItems],
  );

  const unsave = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    },
    [setItems],
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
      return !wasSaved;
    },
    [items, setItems],
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
