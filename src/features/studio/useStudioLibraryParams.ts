import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  isStudioLibrarySort,
  type StudioLibrarySort,
} from "./studioLibrarySort.data";
import { STUDIO_LIBRARY_TABS, type StudioLibraryTab } from "./studioPaths";

const KNOWN_TABS: ReadonlySet<string> = new Set(STUDIO_LIBRARY_TABS);
const isLibraryTab = (value: string | null): value is StudioLibraryTab =>
  value !== null && KNOWN_TABS.has(value);

export interface StudioLibraryParams {
  /** The raw `?tab=`, so the old `tracks` link can redirect. */
  tabParam: string | null;
  tab: StudioLibraryTab;
  query: string;
  sort: StudioLibrarySort;
  setTab: (tab: StudioLibraryTab) => void;
  setQuery: (query: string) => void;
  setSort: (sort: StudioLibrarySort) => void;
}

/** Library's tab, filter text and sort, in `?tab=`, `?q=` and `?sort=`, so
 *  Back returns to the same view. Each change replaces the entry, and the
 *  defaults (Playlists, no filter, Recent) leave their param out. */
export function useStudioLibraryParams(): StudioLibraryParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const sortParam = searchParams.get("sort");
  const update = useCallback(
    (name: "tab" | "q" | "sort", value: string, defaultValue: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value === defaultValue) next.delete(name);
          else next.set(name, value);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  return {
    tabParam,
    tab: isLibraryTab(tabParam) ? tabParam : "playlists",
    query: searchParams.get("q") ?? "",
    sort: isStudioLibrarySort(sortParam) ? sortParam : "recent",
    setTab: (tab) => update("tab", tab, "playlists"),
    setQuery: (query) => update("q", query, ""),
    setSort: (sort) => update("sort", sort, "recent"),
  };
}
