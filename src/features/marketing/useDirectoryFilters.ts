import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { MyLocationCoordinates } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOCAL_CATEGORY_LABEL_KEYS } from "./localCategories";
import {
  filterLocalPlaces,
  sortLocalPlaces,
  type LocalPlace,
  type LocalSort,
} from "./localPlaces";
import {
  ACCESSIBILITY_QUESTIONS,
  ACCESSIBILITY_QUESTION_SLUGS,
  type AccessibilitySlug,
} from "./listBusiness/listingAccessibility.data";
import {
  distancesFrom,
  sortByDistance,
  sortByNeighbourhoodDistance,
} from "./nearMePlaces";
import { VIBE_LABEL_KEYS } from "./map.data";
import type { ActiveFilter } from "../../shared/components/ui";

const SORT_VALUES: LocalSort[] = ["default", "name", "hood"];

function toSort(value: string | null): LocalSort {
  return SORT_VALUES.includes(value as LocalSort)
    ? (value as LocalSort)
    : "default";
}

const ACCESS_SLUG_SET: ReadonlySet<string> = new Set(
  ACCESSIBILITY_QUESTION_SLUGS,
);

/** The catalog key for each accessibility slug, so a removable filter chip
 *  reads in the same words the detail page uses for the same question. */
const ACCESS_LABEL_KEYS: Record<AccessibilitySlug, string> = Object.fromEntries(
  ACCESSIBILITY_QUESTIONS.map((question) => [question.slug, question.labelKey]),
) as Record<AccessibilitySlug, string>;

/**
 * Read `?access=` into the six canonical slugs.
 *
 * Anything unrecognised is dropped here rather than forwarded. The endpoint
 * answers 400 to a misspelt slug on purpose (a silently ignored accessibility
 * filter is the failure mode that hurts someone), so a hand-edited or stale
 * URL must never turn the whole grid into an error. Duplicates collapse, and
 * the order is the canonical question order rather than typing order, so two
 * equivalent URLs produce one cache key.
 */
function toAccess(raw: string | null): AccessibilitySlug[] {
  if (!raw) return [];
  const wanted = new Set(
    raw.split(",").filter((slug) => ACCESS_SLUG_SET.has(slug)),
  );
  return ACCESSIBILITY_QUESTION_SLUGS.filter((slug) => wanted.has(slug));
}

/**
 * The accessibility needs currently being filtered on, read straight from the
 * URL.
 *
 * Exported on its own so a card deep in the grid can lead with the need the
 * member actually asked for without four levels of prop drilling: the filter
 * lives in the URL, which is already shared state, so reading it where it is
 * needed is both cheaper and harder to get out of sync than threading it.
 */
export function useAccessFilter(): AccessibilitySlug[] {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("access");
  return useMemo(() => toAccess(raw), [raw]);
}

export interface DirectoryFilterParams {
  view: "list" | "map";
  category: string;
  query: string;
  sort: LocalSort;
  vibes: string[];
  safe: "verified" | null;
  /** Only places open right now, on their own clock. */
  openNow: boolean;
  /** Accessibility needs that must ALL be met, in canonical question order. */
  access: AccessibilitySlug[];
  selectView: (next: string) => void;
  setCategory: (next: string) => void;
  setQuery: (next: string) => void;
  setSort: (next: string) => void;
  toggleVibe: (vibe: string) => void;
  setSafe: (next: boolean) => void;
  setOpenNow: (next: boolean) => void;
  toggleAccess: (slug: AccessibilitySlug) => void;
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
  const openNow = searchParams.get("open") === "now";
  const access = useAccessFilter();

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
  const setOpenNow = useCallback(
    (next: boolean) => setParam("open", "now", !next),
    [setParam],
  );
  const toggleAccess = useCallback(
    (slug: AccessibilitySlug) => {
      const next = access.includes(slug)
        ? access.filter((entry) => entry !== slug)
        : ACCESSIBILITY_QUESTION_SLUGS.filter(
            (entry) => entry === slug || access.includes(entry),
          );
      setParam("access", next.join(","), next.length === 0);
    },
    [access, setParam],
  );
  const clearFilters = useCallback(
    () =>
      mutateParams((params) => {
        params.delete("cat");
        params.delete("q");
        params.delete("vibe");
        params.delete("safe");
        params.delete("open");
        params.delete("access");
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
    openNow,
    access,
    selectView,
    setCategory,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    setOpenNow,
    toggleAccess,
    clearFilters,
  };
}

/**
 * Derives the displayed list, chip counts, and active-filter pills from an
 * already-fetched `places` array plus the URL state from
 * `useDirectoryFilterParams`. `query`/`safe`/`access` are ALSO applied here
 * (even though the network fetch already filtered by them server-side) purely
 * as a cheap, harmless no-op safety net, and so the demo fixture answers the
 * same filters with no backend at all. `category`/`vibe`/`open` are the three
 * that genuinely only ever apply here client-side: the first two for the
 * reasons in that hook's doc comment, and `open` because the grid is CDN-cached
 * and a server-computed open state would go stale in the dangerous direction.
 */
export function useDirectoryFilterResults(
  places: LocalPlace[],
  params: DirectoryFilterParams,
  /**
   * The member's own position, when they have opted in to "near me". It comes
   * from `useMyLocation`, lives in React state only, and is used here for one
   * thing: ordering the already-loaded places and labelling each card with a
   * walking time. Passing `null` (the default, and what turning the control
   * off produces) restores the previous ordering exactly.
   */
  origin: MyLocationCoordinates | null = null,
) {
  const { t } = useTranslation();
  const {
    category,
    query,
    vibes,
    safe,
    openNow,
    access,
    sort,
    setCategory,
    toggleVibe,
    setSafe,
    setOpenNow,
    toggleAccess,
    setQuery,
  } = params;

  const matched = useMemo(
    () =>
      sortLocalPlaces(
        filterLocalPlaces(places, {
          category,
          query,
          vibes,
          safe,
          openNow,
          access,
        }),
        sort,
      ),
    [places, category, query, vibes, safe, openNow, access, sort],
  );

  // Distances are measured only over what is already on screen, and only once
  // the member has opted in. A place with no coordinates never appears in this
  // map, so it never gets a walking time and never sorts as if it were here.
  const distanceById = useMemo(
    () => (origin ? distancesFrom(origin, matched) : null),
    [origin, matched],
  );

  // The chosen sort and "use my location" BOTH stay in force, rather than one
  // quietly replacing the other. What that means depends on what the sort has
  // an opinion about:
  //
  // - "By neighbourhood" groups the list, and says nothing about the order of
  //   the groups or of what is inside them — so distance decides both, and the
  //   member gets the shape they asked for with the ordering they turned on.
  // - "A to Z" is a lookup order: every position is already taken, and there is
  //   nothing for distance to refine. It is kept exactly as chosen, and the
  //   position still feeds the walking time on every card.
  // - No sort chosen (the curated "Featured" order) is the one place with no
  //   member preference to protect, so distance takes the list. The picker
  //   names that state "Nearest first" while the location is on, so the control
  //   always says what the list is actually doing.
  //
  // Turning the location off hands every ordering straight back.
  const filtered = useMemo(() => {
    if (!distanceById) return matched;
    if (sort === "hood") {
      return sortByNeighbourhoodDistance(matched, distanceById);
    }
    if (sort === "name") return matched;
    return sortByDistance(matched, distanceById);
  }, [matched, distanceById, sort]);

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
      openNow,
      access,
    });
    const counts: Record<string, number> = { all: base.length };
    for (const place of base) {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
    }
    return counts;
  }, [places, query, vibes, safe, openNow, access]);

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
    if (openNow) {
      list.push({
        key: "open",
        label: t("marketing:local.filter.openNow"),
        onRemove: () => setOpenNow(false),
      });
    }
    access.forEach((slug) => {
      list.push({
        key: `access:${slug}`,
        label: t(ACCESS_LABEL_KEYS[slug]),
        onRemove: () => toggleAccess(slug),
      });
    });
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
    openNow,
    access,
    query,
    t,
    setCategory,
    toggleVibe,
    setSafe,
    setOpenNow,
    toggleAccess,
    setQuery,
  ]);

  return {
    filtered,
    categoryCounts,
    mappableCount,
    activeFilters,
    distanceById,
  };
}
