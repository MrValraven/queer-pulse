import {
  countListingFactChips,
  FILTERABLE_ATTRIBUTE_SLUGS,
  NO_LISTING_FACT_FILTERS,
  UNKNOWN_LISTING_FACT_COUNTS,
  type ListingFactCounts,
} from "./directoryListingFactFilters";
import { DIRECTORY_CATEGORY_IDS } from "./localCategories";
import {
  categoryForScope,
  filterLocalPlaces,
  type LocalFilters,
  type LocalPlace,
} from "./localPlaces";
import {
  ACCESSIBILITY_QUESTION_SLUGS,
  type AccessibilitySlug,
} from "./listBusiness/listingAccessibility.data";
import {
  LISTING_OWNED_BY,
  type ListingOwnedBy,
} from "./listBusiness/listingOwnedBy.data";
import type { DirectoryFacetCountsDTO } from "./api/directoryFacets.api";

/**
 * The directory's availability counts: how many places picking each filter
 * option would show, with that option's own group lifted where it is an OR or
 * one choice, and every other filter applied. Every value is either a final
 * number or missing, and a missing count is not known yet (loading, failed,
 * a partial set, an older server): it draws no number and never disables a
 * chip. A known 0 disables its chip unless the chip is on.
 */

/** Per category chip id, plus `all`. */
export type LocalCategoryCounts = Readonly<Partial<Record<string, number>>>;

/** The counts of every chip outside the category group. */
export interface LocalChipCounts {
  /** With "Open now" turned on. */
  openNow?: number;
  /** With "Out and about" turned on. */
  outAndAbout?: number;
  /** With "Verified safe spaces" turned on. */
  safe?: number;
  /** With each access need added to the ones already ticked. */
  access: Partial<Record<AccessibilitySlug, number>>;
  /** Carrying each ownership tag, in place of the chosen ones (an OR). */
  owned: Partial<Record<ListingOwnedBy, number>>;
  /** Each attribute and fact chip (see `countListingFactChips`). */
  listingFacts: ListingFactCounts;
}

export interface LocalFacetCounts {
  categoryCounts: LocalCategoryCounts;
  chipCounts: LocalChipCounts;
}

/** Nothing known: what a loading, failed or partial read draws. */
export const UNKNOWN_FACET_COUNTS: LocalFacetCounts = {
  categoryCounts: {},
  chipCounts: {
    access: {},
    owned: {},
    listingFacts: UNKNOWN_LISTING_FACT_COUNTS,
  },
};

function countEach<Value extends string>(
  values: readonly Value[],
  countFor: (value: Value) => number,
): Record<Value, number> {
  return Object.fromEntries(
    values.map((value) => [value, countFor(value)]),
  ) as Record<Value, number>;
}

/**
 * Every facet counted over a WHOLE set of places in the browser: the demo
 * fixture, and the members-only 18+ list, which arrives in one read. The same
 * semantics as the server's `facets`: categories on each place's category as
 * the tab reads it, lifted, with "all" their own total; owner tags and
 * languages lifted; a way in in place of the chosen one; every other chip
 * added to what is on. Only ever handed a complete set, since a count over a
 * partial one is never drawn.
 */
export function countLocalFacets(
  places: LocalPlace[],
  filters: LocalFilters,
): LocalFacetCounts {
  const current: LocalFilters = {
    ...filters,
    areListingFactsServerFiltered: false,
  };
  const countWith = (overrides: Partial<LocalFilters>) =>
    filterLocalPlaces(places, { ...current, ...overrides }).length;

  const placesUnderEveryCategory = filterLocalPlaces(places, {
    ...current,
    categories: [],
  });
  const categoryCounts: Record<string, number> = {
    ...countEach(DIRECTORY_CATEGORY_IDS, () => 0),
    all: placesUnderEveryCategory.length,
  };
  for (const place of placesUnderEveryCategory) {
    const categoryId = categoryForScope(place, filters.isOnlineScope === true);
    categoryCounts[categoryId] = (categoryCounts[categoryId] ?? 0) + 1;
  }

  const access = filters.access ?? [];
  return {
    categoryCounts,
    chipCounts: {
      openNow: countWith({ openNow: true }),
      outAndAbout: countWith({ isOutAndAboutOnly: true }),
      safe: countWith({ safe: "verified" }),
      access: countEach(ACCESSIBILITY_QUESTION_SLUGS, (slug) =>
        countWith({ access: [...access, slug] }),
      ),
      owned: countEach(LISTING_OWNED_BY, (value) =>
        countWith({ owned: [value] }),
      ),
      listingFacts: countListingFactChips(
        (facts) => countWith({ listingFacts: facts }),
        current.listingFacts ?? NO_LISTING_FACT_FILTERS,
        FILTERABLE_ATTRIBUTE_SLUGS,
      ),
    },
  };
}

/** The server's `facets` in the page's shape. "Open now" is the browser's to
 *  count, so it stays unknown here. */
export function facetCountsFromServer(
  facets: DirectoryFacetCountsDTO,
): LocalFacetCounts {
  return {
    categoryCounts: { ...facets.categories, all: facets.allCategories },
    chipCounts: {
      outAndAbout: facets.outAndAbout,
      safe: facets.safe,
      access: facets.access,
      owned: facets.owned,
      listingFacts: {
        entryModes: facets.entryModes,
        payments: facets.payments,
        languages: facets.languages,
        practices: facets.practices,
        attributes: facets.attributes,
      },
    },
  };
}

/** One count from two disjoint pools: known only when both are. */
function addCount(
  first: number | undefined,
  second: number | undefined,
): number | undefined {
  return first === undefined || second === undefined
    ? undefined
    : first + second;
}

/** Each key of `first`, summed with the same key of `second`. */
function addRecords<Key extends string>(
  first: Partial<Record<Key, number>>,
  second: Partial<Record<Key, number>>,
): Partial<Record<Key, number>> {
  return Object.fromEntries(
    (Object.keys(first) as Key[]).map((key) => [
      key,
      addCount(first[key], second[key]),
    ]),
  ) as Partial<Record<Key, number>>;
}

/**
 * The counts of two DISJOINT pools added together: the public grid and the
 * members-only 18+ list, which the public read never returns. Disjoint, so
 * a sum is the honest total, "All" included. A count either side does not
 * know stays unknown.
 */
export function addFacetCounts(
  first: LocalFacetCounts,
  second: LocalFacetCounts,
): LocalFacetCounts {
  const firstChips = first.chipCounts;
  const secondChips = second.chipCounts;
  const firstFacts = firstChips.listingFacts;
  const secondFacts = secondChips.listingFacts;
  return {
    categoryCounts: addRecords(first.categoryCounts, second.categoryCounts),
    chipCounts: {
      openNow: addCount(firstChips.openNow, secondChips.openNow),
      outAndAbout: addCount(firstChips.outAndAbout, secondChips.outAndAbout),
      safe: addCount(firstChips.safe, secondChips.safe),
      access: addRecords(firstChips.access, secondChips.access),
      owned: addRecords(firstChips.owned, secondChips.owned),
      listingFacts: {
        entryModes: addRecords(firstFacts.entryModes, secondFacts.entryModes),
        payments: addRecords(firstFacts.payments, secondFacts.payments),
        languages: addRecords(firstFacts.languages, secondFacts.languages),
        practices: addRecords(firstFacts.practices, secondFacts.practices),
        attributes: addRecords(firstFacts.attributes, secondFacts.attributes),
      },
    },
  };
}

function zeroOrUnknown(count: number | undefined): number | undefined {
  return count === 0 ? 0 : undefined;
}

function zerosOf<Key extends string>(
  record: Partial<Record<Key, number>>,
): Partial<Record<Key, number>> {
  return Object.fromEntries(
    (Object.keys(record) as Key[]).map((key) => [
      key,
      zeroOrUnknown(record[key]),
    ]),
  ) as Partial<Record<Key, number>>;
}

/**
 * The server's counts while "Open now" is on. The server cannot apply it
 * (the browser works it out on each place's own clock), so every one of its
 * counts is an upper bound: a 0 is still a final 0, and any other number may
 * be too high, so it is not known.
 */
export function keepKnownZeros(counts: LocalFacetCounts): LocalFacetCounts {
  const chips = counts.chipCounts;
  const facts = chips.listingFacts;
  return {
    categoryCounts: zerosOf(counts.categoryCounts),
    chipCounts: {
      openNow: zeroOrUnknown(chips.openNow),
      outAndAbout: zeroOrUnknown(chips.outAndAbout),
      safe: zeroOrUnknown(chips.safe),
      access: zerosOf(chips.access),
      owned: zerosOf(chips.owned),
      listingFacts: {
        entryModes: zerosOf(facts.entryModes),
        payments: zerosOf(facts.payments),
        languages: zerosOf(facts.languages),
        practices: zerosOf(facts.practices),
        attributes: zerosOf(facts.attributes),
      },
    },
  };
}
