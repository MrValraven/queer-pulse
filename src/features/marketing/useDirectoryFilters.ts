import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  filterLocalPlaces,
  sortLocalPlaces,
  LOCAL_CATEGORY_LABEL_KEYS,
  type LocalPlace,
  type LocalSort,
} from "./localPlaces";
import { VIBE_LABEL_KEYS } from "./map.data";
import type { ActiveFilter } from "./DirectoryResultsHeader";

const SORT_VALUES: LocalSort[] = ["default", "name", "hood"];

function toSort(value: string | null): LocalSort {
  return SORT_VALUES.includes(value as LocalSort)
    ? (value as LocalSort)
    : "default";
}

export interface DirectoryFilterParams {
  view: "list" | "map";
  category: string;
  query: string;
  sort: LocalSort;
  vibes: string[];
  safe: "verified" | null;
  selectView: (next: string) => void;
  setCategory: (next: string) => void;
  setQuery: (next: string) => void;
  setSort: (next: string) => void;
  toggleVibe: (vibe: string) => void;
  setSafe: (next: boolean) => void;
  clearFilters: () => void;
}

/**
 * The directory's view + filter + sort STATE, held in the URL so a filtered
 * directory is shareable and survives refresh / Back. Split out of the old
 * combined `useDirectoryFilters` (gap-audit HSG-5) so `query`/`safe` are
 * readable BEFORE `useLocalPlaces` runs — they're now sent server-side as
 * `q`/`safe`, which needs this URL state resolved first, not derived from an
 * already-fetched `places` array. `view` pushes a history entry; every other
 * edit replaces, to avoid spamming history per keystroke.
 */
export function useDirectoryFilterParams(): DirectoryFilterParams {
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view") === "map" ? "map" : "list";
  const category = searchParams.get("cat") ?? "all";
  const query = searchParams.get("q") ?? "";
  const sort = toSort(searchParams.get("sort"));
  const vibes = useMemo(
    () => searchParams.get("vibe")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const safe = searchParams.get("safe") === "verified" ? "verified" : null;

  const mutateParams = useCallback(
    (mutate: (params: URLSearchParams) => void, push = false) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          mutate(params);
          return params;
        },
        { replace: !push },
      );
    },
    [setSearchParams],
  );

  const setParam = useCallback(
    (key: string, value: string, isDefault: boolean) =>
      mutateParams((params) => {
        if (isDefault) params.delete(key);
        else params.set(key, value);
      }),
    [mutateParams],
  );

  const selectView = useCallback(
    (next: string) =>
      mutateParams((params) => {
        if (next === "map") params.set("view", "map");
        else params.delete("view");
      }, true),
    [mutateParams],
  );
  const setCategory = useCallback(
    (next: string) => setParam("cat", next, next === "all"),
    [setParam],
  );
  const setQuery = useCallback(
    (next: string) => setParam("q", next, next.trim() === ""),
    [setParam],
  );
  const setSort = useCallback(
    (next: string) => setParam("sort", next, next === "default"),
    [setParam],
  );
  const toggleVibe = useCallback(
    (vibe: string) => {
      const next = vibes.includes(vibe)
        ? vibes.filter((entry) => entry !== vibe)
        : [...vibes, vibe];
      setParam("vibe", next.join(","), next.length === 0);
    },
    [vibes, setParam],
  );
  const setSafe = useCallback(
    (next: boolean) => setParam("safe", "verified", !next),
    [setParam],
  );
  const clearFilters = useCallback(
    () =>
      mutateParams((params) => {
        params.delete("cat");
        params.delete("q");
        params.delete("vibe");
        params.delete("safe");
      }),
    [mutateParams],
  );

  return {
    view,
    category,
    query,
    sort,
    vibes,
    safe,
    selectView,
    setCategory,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    clearFilters,
  };
}

/**
 * Derives the displayed list, chip counts, and active-filter pills from an
 * already-fetched `places` array plus the URL state from
 * `useDirectoryFilterParams`. `query`/`safe` are ALSO applied here (even
 * though the network fetch already filtered by them server-side) purely as a
 * cheap, harmless no-op safety net; `category`/`vibe` are the two filters that
 * genuinely only ever apply here client-side (see that hook's doc comment).
 */
export function useDirectoryFilterResults(
  places: LocalPlace[],
  params: DirectoryFilterParams,
) {
  const { t } = useTranslation();
  const {
    category,
    query,
    vibes,
    safe,
    sort,
    setCategory,
    toggleVibe,
    setSafe,
    setQuery,
  } = params;

  const filtered = useMemo(
    () =>
      sortLocalPlaces(
        filterLocalPlaces(places, { category, query, vibes, safe }),
        sort,
      ),
    [places, category, query, vibes, safe, sort],
  );

  // Chip counts reflect the query + vibe + safe filters but NOT the category,
  // so each chip shows how many of the LOADED places it would surface right
  // now — an honest count against what's been fetched so far, not
  // necessarily the platform-wide grand total (see `useLocalPlaces`'s doc
  // comment on why category stays client-side over the loaded pages).
  const categoryCounts = useMemo(() => {
    const base = filterLocalPlaces(places, {
      category: "all",
      query,
      vibes,
      safe,
    });
    const counts: Record<string, number> = { all: base.length };
    for (const place of base) {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
    }
    return counts;
  }, [places, query, vibes, safe]);

  const mappableCount = useMemo(
    () => filtered.filter((place) => place.coords !== null).length,
    [filtered],
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (category !== "all") {
      list.push({
        key: `cat:${category}`,
        label: t(LOCAL_CATEGORY_LABEL_KEYS[category] ?? category),
        onRemove: () => setCategory("all"),
      });
    }
    vibes.forEach((vibe) => {
      list.push({
        key: `vibe:${vibe}`,
        label: t(VIBE_LABEL_KEYS[vibe] ?? vibe),
        onRemove: () => toggleVibe(vibe),
      });
    });
    if (safe === "verified") {
      list.push({
        key: "safe",
        label: t("marketing:local.filter.verifiedSafeSpaces"),
        onRemove: () => setSafe(false),
      });
    }
    if (query.trim()) {
      list.push({
        key: "query",
        label: `"${query.trim()}"`,
        onRemove: () => setQuery(""),
      });
    }
    return list;
  }, [
    category,
    vibes,
    safe,
    query,
    t,
    setCategory,
    toggleVibe,
    setSafe,
    setQuery,
  ]);

  return { filtered, categoryCounts, mappableCount, activeFilters };
}
