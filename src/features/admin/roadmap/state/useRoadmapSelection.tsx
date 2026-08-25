import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  RoadmapSelectionContext,
  type RoadmapSelectionContextValue,
} from "./roadmapSelectionContext";

/** Note the file extension is `.tsx` (not `.ts`) because this provider
 *  returns JSX. */
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
