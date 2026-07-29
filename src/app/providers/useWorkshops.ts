import { useMemo } from "react";
import {
  WORKSHOPS,
  type Workshop,
} from "../../features/economy/workshops.data";
import { useWorkshops as useWorkshopsQuery } from "../../features/economy/api/useWorkshops";
import { useDemoMode } from "./DemoModeProvider";
import { useWorkshopsActions, type WorkshopsActions } from "./workshopsContext";

// The session-overlay Context + its types (`WorkshopsContextValue`,
// `WorkshopsActions`, `WorkshopsContext`, `useWorkshopsActions`) live in
// `workshopsContext.ts`, not here — `WorkshopsProvider` (always mounted at the
// app root) only needs those, and this file's own top-level `WORKSHOPS` import
// (below, for the demo-mode total) must not ride along into the entry chunk
// just because the Provider needs the Context object. Re-exported here so
// existing `useWorkshopsActions` importers of this module keep working.
export { useWorkshopsActions, type WorkshopsActions };

/** The catalogue joined to the overlay — the shape readers have always had. */
export interface WorkshopsValue extends WorkshopsActions {
  /** The catalogue: locally-listed workshops first, then the loaded pages. */
  workshops: Workshop[];
  /** Server-reported total (demo: the fixture's length), overlay-adjusted. */
  total: number;
  /** True while the first page is in flight (live mode only). */
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  getWorkshop: (id: string) => Workshop | undefined;
}

/**
 * The catalogue — the loaded pages with this session's listings, edits and
 * deletions applied over them.
 *
 * Calling this SUBSCRIBES to GET /workshops. That subscription is what replaced
 * the `useMatch` route gate this hook's query used to carry: the request fires
 * because a component that renders the catalogue mounted, not because someone
 * remembered to add a route to a list. Anything that does not render the
 * catalogue must call `useWorkshopsActions()` instead — leaving a write-only
 * consumer here would silently reintroduce an app-wide fetch.
 *
 * Category filtering stays client-side over the loaded pages: `SkillsPage` owns
 * the active filter and needs the unfiltered count for its empty state, so this
 * holds one unfiltered query. The endpoint's `cat` param is supported in
 * `workshops.api.ts` for a future per-category board.
 */
export function useWorkshops(): WorkshopsValue {
  const actions = useWorkshopsActions();
  const {
    workshops: fetched,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWorkshopsQuery();
  const { added, edited, removed } = actions;
  const { demoMode } = useDemoMode();

  return useMemo<WorkshopsValue>(() => {
    // `fetched` already carries the seeded catalogue in demo mode (the query's
    // demo branch returns WORKSHOPS) — locally-listed ones go in front of it.
    const seen = new Set(added.map((w) => w.id));
    const gone = new Set(removed);
    const workshops = [...added, ...fetched.filter((w) => !seen.has(w.id))]
      .filter((w) => !gone.has(w.id))
      .map((w) => edited[w.id] ?? w);
    const base = demoMode
      ? WORKSHOPS.length + added.length
      : total + added.length;
    return {
      ...actions,
      workshops,
      // Deleted rows are already out of `workshops`; keep the count honest so
      // the catalogue header doesn't promise a listing that isn't there.
      total: Math.max(0, base - removed.length),
      isLoading,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      getWorkshop: (id) => workshops.find((w) => w.id === id),
    };
  }, [
    actions,
    added,
    edited,
    removed,
    fetched,
    demoMode,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  ]);
}
