import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../../../../shared/hooks";
import type {
  AdminRoadmapItemDTO,
  RoadmapPriority,
} from "../../api/roadmapAdmin.types";

export type RoadmapSort = "manual" | "votes" | "priority" | "stale";

/** One of `SAVED_VIEW_PREDICATES`' keys, or `null` when no saved view is
 *  active. Kept as a plain `string | null` (not the predicate-key union) so
 *  a filters value that predates a since-removed saved view still parses. */
export interface RoadmapFilters {
  q: string;
  category: string;
  owner: string;
  sort: RoadmapSort;
  savedView: string | null;
  dense: boolean;
}

const DEFAULT_FILTERS: RoadmapFilters = {
  q: "",
  category: "",
  owner: "",
  sort: "manual",
  savedView: null,
  dense: false,
};

function isRoadmapFilters(value: unknown): value is RoadmapFilters {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RoadmapFilters>;
  return (
    typeof candidate.q === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.owner === "string" &&
    typeof candidate.sort === "string" &&
    (candidate.savedView === null || typeof candidate.savedView === "string") &&
    typeof candidate.dense === "boolean"
  );
}

const MS_PER_DAY = 86_400_000;

function daysSinceTouched(item: AdminRoadmapItemDTO): number {
  return (Date.now() - new Date(item.updatedAt).getTime()) / MS_PER_DAY;
}

function isBlocked(item: AdminRoadmapItemDTO): boolean {
  return Boolean(item.blockedBy);
}

/** Building, untouched more than 3 weeks, and not already explained by a
 *  block — a card quietly not moving rather than one with a known reason. */
function isStale(item: AdminRoadmapItemDTO): boolean {
  return (
    item.column === "building" &&
    daysSinceTouched(item) > 21 &&
    !isBlocked(item)
  );
}

/**
 * The 7 saved-view chips (`roadmap.savedViews.*`). Pure predicates so both
 * `SavedViewChips`' live counts and `matchItem`'s filtering share one
 * definition — mirrors the prototype's `qp-roadmap-admin.js` SAVED set.
 */
export const SAVED_VIEW_PREDICATES: Record<
  string,
  (item: AdminRoadmapItemDTO) => boolean
> = {
  late: (item) => item.slips.length > 0 || isStale(item) || isBlocked(item),
  unassigned: (item) =>
    !item.ownerId && (item.priority === "P0" || item.priority === "P1"),
  blocked: isBlocked,
  stale: isStale,
  guidesOnly: (item) => item.guide !== null,
  needsSafety: (item) => item.safetyStatus === 1,
  needsFunding: (item) => item.cost === "needs",
};

/**
 * Whether `item` survives the current filter set. Always excludes archived
 * items — the Archive view is the only place they surface, reached via its
 * own tab rather than a filter toggle. Shared by every view that reads the
 * Board/Timeline's filtered set so "what am I looking at" stays consistent
 * across tabs.
 */
export function matchItem(
  item: AdminRoadmapItemDTO,
  filters: RoadmapFilters,
): boolean {
  if (item.archived) return false;

  if (filters.savedView) {
    const predicate = SAVED_VIEW_PREDICATES[filters.savedView];
    if (predicate && !predicate(item)) return false;
  }

  if (filters.category && item.category !== filters.category) return false;

  if (filters.owner === "unassigned") {
    if (item.ownerId) return false;
  } else if (filters.owner && item.ownerId !== filters.owner) {
    return false;
  }

  const needle = filters.q.trim().toLowerCase();
  if (needle) {
    const haystack = [item.name, item.description, item.category, item.publicNote]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

const PRIORITY_RANK: Record<RoadmapPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

/** Returns a new sorted array — never mutates `items`. */
export function sortItems(
  items: AdminRoadmapItemDTO[],
  sort: RoadmapSort,
): AdminRoadmapItemDTO[] {
  const sorted = [...items];
  switch (sort) {
    case "votes":
      sorted.sort((a, b) => b.votes - a.votes || a.sortOrder - b.sortOrder);
      break;
    case "priority":
      sorted.sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          a.sortOrder - b.sortOrder,
      );
      break;
    case "stale":
      sorted.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
      break;
    case "manual":
    default:
      sorted.sort((a, b) => a.sortOrder - b.sortOrder);
      break;
  }
  return sorted;
}

/**
 * The Board/Timeline toolbar's filter state — search text, category, owner,
 * sort, the active saved view, and the compact-density toggle. Persisted to
 * `localStorage` (view preference, not server data) so switching tabs or
 * reloading doesn't reset a triage session in progress; falls back silently
 * to `DEFAULT_FILTERS` in private-browsing or on a corrupt/legacy value.
 *
 * A context (not a bare hook instance per caller) because the writers
 * (`RoadmapToolbar`, `SavedViewChips`) and the readers (`BoardView`,
 * `TimelineView`, `ArchiveView`) are siblings under `AdminRoadmapPageContent`
 * that must share exactly one filter state — two independent
 * `useLocalStorage` instances would let the toolbar's search box update
 * while the board it's supposed to filter never re-renders. Mirrors
 * `state/useRoadmapSelection.tsx`'s provider shape exactly.
 */
interface RoadmapFiltersContextValue {
  filters: RoadmapFilters;
  setFilter: <K extends keyof RoadmapFilters>(
    key: K,
    value: RoadmapFilters[K],
  ) => void;
  setSavedView: (view: string | null) => void;
}

const RoadmapFiltersContext = createContext<RoadmapFiltersContextValue | null>(
  null,
);

export function RoadmapFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useLocalStorage<RoadmapFilters>(
    "qp.roadmap.filters",
    DEFAULT_FILTERS,
    isRoadmapFilters,
  );

  const setFilter = useCallback(
    <K extends keyof RoadmapFilters>(key: K, value: RoadmapFilters[K]) => {
      setFilters((previous) => ({ ...previous, [key]: value }));
    },
    [setFilters],
  );

  // Clicking the already-active chip clears it — saved views are a toggle,
  // not a one-way radio group.
  const setSavedView = useCallback(
    (view: string | null) => {
      setFilters((previous) => ({
        ...previous,
        savedView: previous.savedView === view ? null : view,
      }));
    },
    [setFilters],
  );

  const value = useMemo<RoadmapFiltersContextValue>(
    () => ({ filters, setFilter, setSavedView }),
    [filters, setFilter, setSavedView],
  );

  return (
    <RoadmapFiltersContext.Provider value={value}>
      {children}
    </RoadmapFiltersContext.Provider>
  );
}

export function useRoadmapFilters(): RoadmapFiltersContextValue {
  const context = useContext(RoadmapFiltersContext);
  if (!context) {
    throw new Error(
      "useRoadmapFilters must be used within a RoadmapFiltersProvider",
    );
  }
  return context;
}
