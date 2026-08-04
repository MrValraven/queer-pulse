import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Multi-select state for the Board/Timeline card checkboxes and the
 * `BulkBar` that acts on them. A context (not a bare hook instance per
 * caller) because the Board's cards and the page's `BulkBar` are siblings
 * that must share exactly one selection — two independent `useState<Set>`
 * instances would let a card claim "selected" while the bar it drives never
 * sees it. Note the file extension is `.tsx` (not the `.ts` the plan
 * sketch used) because a context provider returns JSX.
 */
interface RoadmapSelectionContextValue {
  selected: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
  selectMany: (ids: string[]) => void;
}

const RoadmapSelectionContext =
  createContext<RoadmapSelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const has = useCallback((id: string) => selected.has(id), [selected]);

  const selectMany = useCallback(
    (ids: string[]) => setSelected(new Set(ids)),
    [],
  );

  const value = useMemo<RoadmapSelectionContextValue>(
    () => ({ selected, toggle, clear, has, count: selected.size, selectMany }),
    [selected, toggle, clear, has, selectMany],
  );

  return (
    <RoadmapSelectionContext.Provider value={value}>
      {children}
    </RoadmapSelectionContext.Provider>
  );
}

export function useRoadmapSelection(): RoadmapSelectionContextValue {
  const context = useContext(RoadmapSelectionContext);
  if (!context) {
    throw new Error(
      "useRoadmapSelection must be used within a SelectionProvider",
    );
  }
  return context;
}
