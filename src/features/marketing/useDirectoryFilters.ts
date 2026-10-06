import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { MyLocationCoordinates } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOCAL_CATEGORIES, LOCAL_CATEGORY_LABEL_KEYS } from "./localCategories";
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
  OWNER_IDENTITY_SLUGS,
  normalizeOwnerIdentities,
  ownerIdentityLabelKey,
  type OwnerIdentitySlug,
} from "./listBusiness/listingOwnerIdentities.data";
import {
  distancesFrom,
  sortByDistance,
  sortByNeighbourhoodDistance,
} from "./nearMePlaces";
import { VIBES, VIBE_LABEL_KEYS } from "./map.data";
import type { ActiveFilter } from "../../shared/components/ui";
import {
  normalizeOwnedBy,
  OWNED_BY_TAG_KEYS,
  toggleOwnedBy,
  type ListingOwnedBy,
} from "./listBusiness/listingOwnedBy.data";

/**
 * How many of the LOADED places each one-tap chip would leave on screen if it
 * were turned on, with every other current filter kept. The drawer reads it to
 * disable a chip that would empty the list, and only once the whole set has
 * loaded (see `isLoadedSetComplete` in `useDirectoryPageState`).
 */
export interface LocalChipCounts {
  /** Matches with "Open now" turned on. */
  openNow: number;
  /** Matches with "Verified safe spaces" turned on. */
  safe: number;
  /** Matches with each access need added to the ones already ticked. */
  access: Record<AccessibilitySlug, number>;
  /** Matches with each vibe added to the ones already chosen. */
  vibes: Record<string, number>;
  /** Matches with only this tag chosen, other filters kept, so a tag no
   *  loaded place carries goes unpickable; same rule as place types. */
  ownerIdentities: Record<OwnerIdentitySlug, number>;
}

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

const CATEGORY_ID_SET: ReadonlySet<string> = new Set(LOCAL_CATEGORIES);

/**
 * Read `?cat=` into the chosen place types.
 *
 * Same rules as `toAccess`: an unknown id is dropped so a stale link falls
 * back to every type, duplicates collapse, and the ids follow the chip order
 * whatever order they were picked in, so `?cat=design,food` and
 * `?cat=food,design` are one state. A single id (the detail page's
 * `?cat=food` link) is simply a list of one.
 */
function toCategories(raw: string | null): string[] {
  if (!raw) return [];
  const wanted = new Set(
    raw.split(",").filter((categoryId) => CATEGORY_ID_SET.has(categoryId)),
  );
  return LOCAL_CATEGORIES.filter((categoryId) => wanted.has(categoryId));
}

/**
 * Read `?owned=` into the chosen ownership tags. Same rules as `toAccess`: an
 * unknown value is dropped rather than forwarded into a 400, duplicates
 * collapse, and the order is canonical so equivalent URLs share a cache key.
 */
function toOwned(raw: string | null): ListingOwnedBy[] {
  return raw ? normalizeOwnedBy(raw.split(",")) : [];
}

/** Read `?vibe=` into the chosen vibes, in the order they were picked. */
function toVibes(raw: string | null): string[] {
  return raw?.split(",").filter(Boolean) ?? [];
}

/**
 * Read `?owner=` into the chosen "who runs it" tags. Same rules as
 * `toCategories`: unknown tags drop so a stale link still loads, repeats
 * collapse, canonical order.
 */
export function toOwnerIdentities(raw: string | null): OwnerIdentitySlug[] {
  if (!raw) return [];
  return normalizeOwnerIdentities(raw.split(","));
}

/** Write a list filter into the params, dropping the key when the list is
 *  empty so the URL carries only the filters that are on. */
function setListParam(
  params: URLSearchParams,
  key: string,
  list: readonly string[],
) {
  if (list.length === 0) params.delete(key);
  else params.set(key, list.join(","));
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

/** The directory's three lenses. `list` is everything, `map` is every place
 *  with a door to pin, and `online` is every business that has none. */
export type DirectoryView = "list" | "map" | "online";

export interface DirectoryFilterParams {
  view: DirectoryView;
  /** Place types to show, in chip order. Empty means every type; otherwise a
   *  place matches when its type is any one of them. */
  categories: string[];
  query: string;
  sort: LocalSort;
  vibes: string[];
  safe: "verified" | null;
  /** Ownership tags (`?owned=`), ANY of which a place must carry, in
   *  canonical order. Empty means no restriction. */
  owned: ListingOwnedBy[];
  /** Only places open right now, on their own clock. */
  openNow: boolean;
  /** Accessibility needs that must ALL be met, in canonical question order. */
  access: AccessibilitySlug[];
  /** "Who runs it" tags currently filtered on, in canonical order. */
  ownerIdentities: OwnerIdentitySlug[];
  selectView: (next: string) => void;
  toggleCategory: (categoryId: string) => void;
  clearCategories: () => void;
  setQuery: (next: string) => void;
  setSort: (next: string) => void;
  toggleVibe: (vibe: string) => void;
  setSafe: (next: boolean) => void;
  toggleOwned: (value: ListingOwnedBy) => void;
  setOpenNow: (next: boolean) => void;
  toggleAccess: (slug: AccessibilitySlug) => void;
  toggleOwnerIdentity: (slug: OwnerIdentitySlug) => void;
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

  const rawView = searchParams.get("view");
  const view: DirectoryView =
    rawView === "map" || rawView === "online" ? rawView : "list";
  const rawCategories = searchParams.get("cat");
  const categories = useMemo(
    () => toCategories(rawCategories),
    [rawCategories],
  );
  const query = searchParams.get("q") ?? "";
  const sort = toSort(searchParams.get("sort"));
  const rawVibes = searchParams.get("vibe");
  const vibes = useMemo(() => toVibes(rawVibes), [rawVibes]);
  const safe = searchParams.get("safe") === "verified" ? "verified" : null;
  const rawOwned = searchParams.get("owned");
  const owned = useMemo(() => toOwned(rawOwned), [rawOwned]);
  const openNow = searchParams.get("open") === "now";
  const access = useAccessFilter();
  const rawOwnerIdentities = searchParams.get("owner");
  const ownerIdentities = useMemo(
    () => toOwnerIdentities(rawOwnerIdentities),
    [rawOwnerIdentities],
  );

  // The params the last edit wrote, until a render reflects them. React
  // Router's functional `setSearchParams` starts from the params of the last
  // render, so two taps with no render between them (Food, then Nightlife)
  // would both start from the same URL and the second would drop the first.
  // Each edit starts from this instead.
  const pendingParamsRef = useRef<URLSearchParams | null>(null);
  useEffect(() => {
    pendingParamsRef.current = null;
  }, [searchParams]);

  const mutateParams = useCallback(
    (mutate: (params: URLSearchParams) => void, push = false) => {
      const params = new URLSearchParams(
        pendingParamsRef.current ?? searchParams,
      );
      mutate(params);
      pendingParamsRef.current = params;
      setSearchParams(params, { replace: !push });
    },
    [searchParams, setSearchParams],
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
        if (next === "map" || next === "online") params.set("view", next);
        else params.delete("view");
      }, true),
    [mutateParams],
  );
  // The toggles read the list from the params being edited, which already
  // hold any edit made since the last render.
  const toggleCategory = useCallback(
    (categoryId: string) =>
      mutateParams((params) => {
        const current = toCategories(params.get("cat"));
        const next = current.includes(categoryId)
          ? current.filter((entry) => entry !== categoryId)
          : LOCAL_CATEGORIES.filter(
              (entry) => entry === categoryId || current.includes(entry),
            );
        setListParam(params, "cat", next);
      }),
    [mutateParams],
  );
  const clearCategories = useCallback(
    () => setParam("cat", "", true),
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
    (vibe: string) =>
      mutateParams((params) => {
        const current = toVibes(params.get("vibe"));
        const next = current.includes(vibe)
          ? current.filter((entry) => entry !== vibe)
          : [...current, vibe];
        setListParam(params, "vibe", next);
      }),
    [mutateParams],
  );
  const setSafe = useCallback(
    (next: boolean) => setParam("safe", "verified", !next),
    [setParam],
  );
  const toggleOwned = useCallback(
    (value: ListingOwnedBy) =>
      mutateParams((params) => {
        const current = toOwned(params.get("owned"));
        setListParam(params, "owned", toggleOwnedBy(current, value));
      }),
    [mutateParams],
  );
  const setOpenNow = useCallback(
    (next: boolean) => setParam("open", "now", !next),
    [setParam],
  );
  const toggleAccess = useCallback(
    (slug: AccessibilitySlug) =>
      mutateParams((params) => {
        const current = toAccess(params.get("access"));
        const next = current.includes(slug)
          ? current.filter((entry) => entry !== slug)
          : ACCESSIBILITY_QUESTION_SLUGS.filter(
              (entry) => entry === slug || current.includes(entry),
            );
        setListParam(params, "access", next);
      }),
    [mutateParams],
  );
  const toggleOwnerIdentity = useCallback(
    (slug: OwnerIdentitySlug) =>
      mutateParams((params) => {
        const current = toOwnerIdentities(params.get("owner"));
        const next = current.includes(slug)
          ? current.filter((entry) => entry !== slug)
          : normalizeOwnerIdentities([...current, slug]);
        setListParam(params, "owner", next);
      }),
    [mutateParams],
  );
  const clearFilters = useCallback(
    () =>
      mutateParams((params) => {
        params.delete("cat");
        params.delete("q");
        params.delete("vibe");
        params.delete("safe");
        params.delete("owned");
        params.delete("open");
        params.delete("access");
        params.delete("owner");
      }),
    [mutateParams],
  );

  return {
    view,
    categories,
    query,
    sort,
    vibes,
    safe,
    owned,
    openNow,
    access,
    ownerIdentities,
    selectView,
    toggleCategory,
    clearCategories,
    setQuery,
    setSort,
    toggleVibe,
    setSafe,
    toggleOwned,
    setOpenNow,
    toggleAccess,
    toggleOwnerIdentity,
    clearFilters,
  };
}

/**
 * Derives the displayed list, chip counts, and active-filter pills from an
 * already-fetched `places` array plus the URL state from
 * `useDirectoryFilterParams`. `query`/`safe`/`access`/`owned` are ALSO applied
 * here (even though the network fetch already filtered by them server-side)
 * purely as a cheap, harmless no-op safety net, and so the demo fixture
 * answers the same filters with no backend at all. `cat`/`vibe`/`open` are the three
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
    categories,
    query,
    vibes,
    safe,
    owned,
    openNow,
    access,
    ownerIdentities,
    sort,
    toggleCategory,
    toggleVibe,
    setSafe,
    toggleOwned,
    setOpenNow,
    toggleAccess,
    toggleOwnerIdentity,
    setQuery,
  } = params;

  const matched = useMemo(
    () =>
      sortLocalPlaces(
        filterLocalPlaces(places, {
          categories,
          query,
          vibes,
          safe,
          owned,
          openNow,
          access,
          ownerIdentities,
        }),
        sort,
      ),
<<<<<<< Updated upstream
    [places, categories, query, vibes, safe, owned, openNow, access, sort],
=======
    [
      places,
      categories,
      query,
      vibes,
      safe,
      openNow,
      access,
      ownerIdentities,
      sort,
    ],
>>>>>>> Stashed changes
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

  // Chip counts reflect every other filter and leave the chosen place types
  // out, so each chip shows how many of the LOADED places it would add right
  // now. That is an honest count against what has been fetched so far, which
  // can sit below the platform-wide grand total (see `useLocalPlaces`'s doc
  // comment on why category stays client-side over the loaded pages).
  const categoryCounts = useMemo(() => {
    const base = filterLocalPlaces(places, {
      categories: [],
      query,
      vibes,
      safe,
      owned,
      openNow,
      access,
      ownerIdentities,
    });
    const counts: Record<string, number> = { all: base.length };
    for (const place of base) {
      counts[place.category] = (counts[place.category] ?? 0) + 1;
    }
    return counts;
<<<<<<< Updated upstream
  }, [places, query, vibes, safe, owned, openNow, access]);
=======
  }, [places, query, vibes, safe, openNow, access, ownerIdentities]);

  // The same "what would this chip leave" question for the other chips: each
  // count runs the full filter over the loaded places with that one chip
  // turned on and everything else as it stands, chosen place types included.
  const chipCounts = useMemo<LocalChipCounts>(() => {
    const current = {
      categories,
      query,
      vibes,
      safe,
      openNow,
      access,
      ownerIdentities,
    };
    const countWith = (overrides: Partial<typeof current>) =>
      filterLocalPlaces(places, { ...current, ...overrides }).length;
    return {
      openNow: countWith({ openNow: true }),
      safe: countWith({ safe: "verified" }),
      access: Object.fromEntries(
        ACCESSIBILITY_QUESTION_SLUGS.map((slug) => [
          slug,
          countWith({ access: [...access, slug] }),
        ]),
      ) as Record<AccessibilitySlug, number>,
      vibes: Object.fromEntries(
        VIBES.map((vibe) => [vibe, countWith({ vibes: [...vibes, vibe] })]),
      ),
      // Each tag alone, like place types above: the count that tag would
      // leave if it were the only one chosen, every other group's filters
      // kept as they stand.
      ownerIdentities: Object.fromEntries(
        OWNER_IDENTITY_SLUGS.map((slug) => [
          slug,
          countWith({ ownerIdentities: [slug] }),
        ]),
      ) as Record<OwnerIdentitySlug, number>,
    };
  }, [
    places,
    categories,
    query,
    vibes,
    safe,
    openNow,
    access,
    ownerIdentities,
  ]);
>>>>>>> Stashed changes

  const mappableCount = useMemo(
    () => filtered.filter((place) => place.coords !== null).length,
    [filtered],
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    categories.forEach((categoryId) => {
      list.push({
        key: `cat:${categoryId}`,
        label: t(LOCAL_CATEGORY_LABEL_KEYS[categoryId] ?? categoryId),
        onRemove: () => toggleCategory(categoryId),
      });
    });
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
    owned.forEach((value) => {
      list.push({
        key: `owned:${value}`,
        label: t(OWNED_BY_TAG_KEYS[value]),
        onRemove: () => toggleOwned(value),
      });
    });
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
    ownerIdentities.forEach((slug) => {
      list.push({
        key: `owner:${slug}`,
        label: t(ownerIdentityLabelKey(slug)),
        onRemove: () => toggleOwnerIdentity(slug),
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
    categories,
    vibes,
    safe,
    owned,
    openNow,
    access,
    ownerIdentities,
    query,
    t,
    toggleCategory,
    toggleVibe,
    setSafe,
    toggleOwned,
    setOpenNow,
    toggleAccess,
    toggleOwnerIdentity,
    setQuery,
  ]);

  return {
    filtered,
    categoryCounts,
    chipCounts,
    mappableCount,
    activeFilters,
    distanceById,
  };
}
