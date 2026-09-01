import { useMemo, useState } from "react";
import type { SubprofileCardDTO, SubprofileKind } from "./api/subprofiles.api";
import { groupProfessionsByFamily } from "./subprofileDirectory.data";
import {
  countByKind,
  countByTag,
  matchesKind,
  matchesOpenToCollabs,
  matchesQuery,
  matchesTags,
  topTags,
} from "./subprofileDirectoryFacets";

const AVAILABLE_TAGS_CAP = 20;
/** How many cards the "Show more" reveal shows per step (Personas redesign
 *  Phase 4, Decision §4 — client-side pagination, no backend page param). */
const PER_PAGE = 6;

/**
 * The directory page's whole client-side refine state — professions, tags,
 * free-text search, open-to-collabs, and the "show more" reveal — extracted
 * out of `SubprofileDirectoryPage` so that component stays under the 200-line
 * cap. Personas redesign Phase 4 (Decision §2/§4): every facet here filters the
 * ALREADY-fetched `cards` set; nothing re-queries the network.
 *
 * Professions replaced the old page-family facet (see
 * `groupProfessionsByFamily`). They are multi-select and OR within the facet,
 * matching the tag row beside them: "poets or illustrators" is a question
 * somebody browsing a directory actually has, and single-select could not
 * answer it.
 */
export function useSubprofileDirectoryFilters(cards: SubprofileCardDTO[]) {
  const [kinds, setKinds] = useState<SubprofileKind[]>([]);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [openToCollabs, setOpenToCollabs] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  const term = query.trim().toLowerCase();

  // The two chip vocabularies come from the whole fetched set, so neither row
  // reshuffles under the member as they narrow. What moves is the counts.
  const professionGroups = useMemo(
    () => groupProfessionsByFamily(new Set(cards.map((card) => card.kind))),
    [cards],
  );
  const availableTags = useMemo(
    () => topTags(cards, AVAILABLE_TAGS_CAP),
    [cards],
  );

  // Each facet is counted under the OTHER three, never under itself: counting
  // professions under the profession selection would read every unpicked chip
  // as 0 the moment one was picked, which is exactly backwards for an OR facet.
  const professionCounts = useMemo(
    () =>
      countByKind(
        cards.filter(
          (card) =>
            matchesTags(card, activeTags) &&
            matchesOpenToCollabs(card, openToCollabs) &&
            matchesQuery(card, term),
        ),
      ),
    [cards, activeTags, openToCollabs, term],
  );
  const tagCounts = useMemo(
    () =>
      countByTag(
        cards.filter(
          (card) =>
            matchesKind(card, kinds) &&
            matchesOpenToCollabs(card, openToCollabs) &&
            matchesQuery(card, term),
        ),
      ),
    [cards, kinds, openToCollabs, term],
  );

  // The availability pill is a facet too, so it carries the same live count as
  // the chip rows and dims at 0. Counted under the professions, tags and search
  // but NOT under itself: with the toggle already on, counting under it would
  // just restate the grid's own size rather than answer "how many are open to
  // collabs".
  const openToCollabsCount = useMemo(
    () =>
      cards.filter(
        (card) =>
          matchesKind(card, kinds) &&
          matchesTags(card, activeTags) &&
          matchesQuery(card, term) &&
          matchesOpenToCollabs(card, true),
      ).length,
    [cards, kinds, activeTags, term],
  );

  const visibleCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          matchesKind(card, kinds) &&
          matchesTags(card, activeTags) &&
          matchesOpenToCollabs(card, openToCollabs) &&
          matchesQuery(card, term),
      ),
    [cards, kinds, activeTags, openToCollabs, term],
  );

  // Any filter change re-starts the reveal at PER_PAGE, so "Show more" never
  // leaves a stale offset pointing past a now-smaller filtered set. Adjusted
  // during render (React's documented pattern for resetting state when an
  // input changes) rather than in an effect, which would cost an extra
  // committed render before the reset took effect.
  const filterSignature = JSON.stringify([
    kinds,
    activeTags,
    openToCollabs,
    term,
  ]);
  const [priorFilterSignature, setPriorFilterSignature] =
    useState(filterSignature);
  if (filterSignature !== priorFilterSignature) {
    setPriorFilterSignature(filterSignature);
    setVisibleCount(PER_PAGE);
  }

  const shownCards = visibleCards.slice(0, visibleCount);
  const hasMore = visibleCount < visibleCards.length;

  const onToggleKind = (kind: string) => {
    const next = kind as SubprofileKind;
    setKinds((current) =>
      current.includes(next)
        ? current.filter((activeKind) => activeKind !== next)
        : [...current, next],
    );
  };

  const onToggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((activeTag) => activeTag !== tag)
        : [...current, tag],
    );
  };

  const onToggleOpenToCollabs = () => setOpenToCollabs((current) => !current);

  const onShowMore = () => setVisibleCount((count) => count + PER_PAGE);

  const onClearFilters = () => {
    setKinds([]);
    setQuery("");
    setActiveTags([]);
    setOpenToCollabs(false);
  };

  return {
    kinds,
    onToggleKind,
    setKinds,
    query,
    setQuery,
    activeTags,
    onToggleTag,
    setActiveTags,
    openToCollabs,
    onToggleOpenToCollabs,
    setOpenToCollabs,
    openToCollabsCount,
    professionGroups,
    professionCounts,
    availableTags,
    tagCounts,
    /** True while anything is narrowing the grid, the search term included. */
    hasActiveRefinement:
      kinds.length > 0 || activeTags.length > 0 || openToCollabs || term !== "",
    visibleCards,
    shownCards,
    hasMore,
    onShowMore,
    onClearFilters,
  };
}

/** The whole refine state, passed to the toolbar as one prop the way
 *  `/communities` passes `discover`. */
export type SubprofileDirectoryFilters = ReturnType<
  typeof useSubprofileDirectoryFilters
>;
