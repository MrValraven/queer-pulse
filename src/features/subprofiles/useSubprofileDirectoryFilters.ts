import { useMemo, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { skinFor, type SkinFamily } from "./subprofile-skins";
import type { SubprofileCardDTO } from "./api/subprofiles.api";

const AVAILABLE_TAGS_CAP = 20;
/** How many cards the "Show more" reveal shows per step (Personas redesign
 *  Phase 4, Decision §4 — client-side pagination, no backend page param). */
const PER_PAGE = 6;

/** Union of `card.tags` across `cards`, deduped and capped at
 *  `AVAILABLE_TAGS_CAP`, most-frequent tag first. Purely client-side. */
function computeAvailableTags(cards: SubprofileCardDTO[]): string[] {
  const occurrenceCountByTag = new Map<string, number>();
  for (const card of cards) {
    for (const tag of card.tags) {
      occurrenceCountByTag.set(tag, (occurrenceCountByTag.get(tag) ?? 0) + 1);
    }
  }
  return [...occurrenceCountByTag.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, AVAILABLE_TAGS_CAP)
    .map(([tag]) => tag);
}

/**
 * The directory page's whole client-side filter/pagination state machine —
 * skin family, tags, free-text search, open-to-collabs, and the "show more"
 * reveal — extracted out of `SubprofileDirectoryPage` so that component stays
 * under the 200-line cap. Personas redesign Phase 4 (Decision §2/§4): every
 * facet here filters the ALREADY-fetched `cards` set; nothing re-queries the
 * network.
 */
export function useSubprofileDirectoryFilters(cards: SubprofileCardDTO[]) {
  const { t } = useTranslation();
  const [family, setFamily] = useState<SkinFamily | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [openToCollabs, setOpenToCollabs] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  // Family narrows first (mirrors the old server-side kind narrowing), then
  // the tag vocabulary and "N crafts" count are derived from THAT set, so
  // picking a family shrinks the tag row the same way it used to.
  const familyFilteredCards = useMemo(
    () =>
      family === undefined
        ? cards
        : cards.filter((card) => skinFor(card.kind) === family),
    [cards, family],
  );
  const availableTags = useMemo(
    () => computeAvailableTags(familyFilteredCards),
    [familyFilteredCards],
  );
  const craftCount = useMemo(
    () => new Set(familyFilteredCards.map((card) => card.kind)).size,
    [familyFilteredCards],
  );
  const filtersNote = t("subprofiles:directory.filtersNote", {
    count: craftCount,
  });

  // Tags (OR within the set), "open to collabs", and free-text search (AND
  // across the three) — all client-side over the family-filtered set.
  const visibleCards = useMemo(() => {
    const term = query.trim().toLowerCase();
    return familyFilteredCards.filter((card) => {
      if (openToCollabs && card.availability !== "open_to_collabs") {
        return false;
      }
      if (
        activeTags.length > 0 &&
        !card.tags.some((tag) => activeTags.includes(tag))
      ) {
        return false;
      }
      if (
        term &&
        !card.displayName.toLowerCase().includes(term) &&
        !(card.tagline ?? "").toLowerCase().includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [familyFilteredCards, activeTags, openToCollabs, query]);

  // Any filter change re-starts the reveal at PER_PAGE, so "Show more" never
  // leaves a stale offset pointing past a now-smaller filtered set. Adjusted
  // during render (React's documented pattern for resetting state when an
  // input changes) rather than in an effect, which would cost an extra
  // committed render before the reset took effect.
  const filterSignature = JSON.stringify([
    family,
    activeTags,
    openToCollabs,
    query,
  ]);
  const [priorFilterSignature, setPriorFilterSignature] =
    useState(filterSignature);
  if (filterSignature !== priorFilterSignature) {
    setPriorFilterSignature(filterSignature);
    setVisibleCount(PER_PAGE);
  }

  const shownCards = visibleCards.slice(0, visibleCount);
  const hasMore = visibleCount < visibleCards.length;

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
    setFamily(undefined);
    setQuery("");
    setActiveTags([]);
    setOpenToCollabs(false);
  };

  return {
    family,
    setFamily,
    query,
    setQuery,
    activeTags,
    onToggleTag,
    openToCollabs,
    onToggleOpenToCollabs,
    availableTags,
    filtersNote,
    visibleCards,
    shownCards,
    hasMore,
    onShowMore,
    onClearFilters,
  };
}
