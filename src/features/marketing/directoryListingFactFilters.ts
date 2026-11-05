import {
  isFilterableAttribute,
  LISTING_ATTRIBUTE_SLUGS,
} from "./listBusiness/listingAttributes.data";
import {
  LISTING_ENTRY_MODES,
  LISTING_INCLUSION_PRACTICES,
  LISTING_LANGUAGE_CODES,
  LISTING_PAYMENT_METHODS,
  normalizeEntryMode,
  normalizeInclusionPractices,
  normalizeLanguageCodes,
  normalizePaymentMethods,
  toggleInOrder,
  type ListingEntryMode,
  type ListingInclusionPractice,
  type ListingLanguageCode,
  type ListingPaymentMethod,
} from "./listBusiness/listingFacts.data";

/**
 * The directory's attribute and fact filters: `?attr=` (AND), `?entry=`
 * (one), `?pay=` (AND), `?lang=` (OR), `?practice=` (AND), the same names
 * the API takes. Read from the URL defensively (an unknown or sensitive slug
 * would be a 400), sent server side in live mode, and matched client side in
 * demo mode, for the 18+ list and for the chip counts.
 */

export interface DirectoryListingFactFilters {
  attributes: string[];
  entryMode: ListingEntryMode | null;
  payments: ListingPaymentMethod[];
  languages: ListingLanguageCode[];
  practices: ListingInclusionPractice[];
}

export const NO_LISTING_FACT_FILTERS: DirectoryListingFactFilters = {
  attributes: [],
  entryMode: null,
  payments: [],
  languages: [],
  practices: [],
};

export const LISTING_FACT_PARAM_KEYS = {
  attributes: "attr",
  entryMode: "entry",
  payments: "pay",
  languages: "lang",
  practices: "practice",
} as const;

/** The 86 slugs `?attr=` may carry, in vocabulary order. */
export const FILTERABLE_ATTRIBUTE_SLUGS: readonly string[] =
  LISTING_ATTRIBUTE_SLUGS.filter((slug) => isFilterableAttribute(slug));

export type ListingFactFilterChange =
  | { kind: "attribute"; slug: string }
  | { kind: "entryMode"; mode: ListingEntryMode }
  | { kind: "payment"; method: ListingPaymentMethod }
  | { kind: "language"; code: ListingLanguageCode }
  | { kind: "practice"; practice: ListingInclusionPractice };

function listOf(raw: string | null): string[] {
  return raw
    ? raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
}

/** Filterable slugs only (the server answers 400 to any other), once each,
 *  lowercased like the server reads them, in vocabulary order. */
function toAttributeFilter(raw: string | null): string[] {
  const wanted = new Set(listOf(raw).map((value) => value.toLowerCase()));
  return FILTERABLE_ATTRIBUTE_SLUGS.filter((slug) => wanted.has(slug));
}

/** The filters as the URL holds them. The Online tab offers no way in and
 *  no ways to pay (an online listing has neither), so a stale link carrying
 *  them never narrows it. */
export function readListingFactFilters(
  params: URLSearchParams,
  isOnlineView: boolean,
): DirectoryListingFactFilters {
  return {
    attributes: toAttributeFilter(
      params.get(LISTING_FACT_PARAM_KEYS.attributes),
    ),
    entryMode: isOnlineView
      ? null
      : normalizeEntryMode(
          listOf(params.get(LISTING_FACT_PARAM_KEYS.entryMode))[0] ?? null,
        ),
    payments: isOnlineView
      ? []
      : normalizePaymentMethods(
          listOf(params.get(LISTING_FACT_PARAM_KEYS.payments)),
        ),
    languages: normalizeLanguageCodes(
      listOf(params.get(LISTING_FACT_PARAM_KEYS.languages)),
    ),
    practices: normalizeInclusionPractices(
      listOf(params.get(LISTING_FACT_PARAM_KEYS.practices)),
    ),
  };
}

/** One chip pressed: a value toggles in or out; a way in replaces the one
 *  chosen, or clears when pressed again. */
export function withListingFactChange(
  filters: DirectoryListingFactFilters,
  change: ListingFactFilterChange,
): DirectoryListingFactFilters {
  switch (change.kind) {
    case "attribute":
      return {
        ...filters,
        attributes: toggleInOrder(
          filters.attributes,
          change.slug,
          FILTERABLE_ATTRIBUTE_SLUGS,
        ),
      };
    case "entryMode":
      return {
        ...filters,
        entryMode: filters.entryMode === change.mode ? null : change.mode,
      };
    case "payment":
      return {
        ...filters,
        payments: toggleInOrder(
          filters.payments,
          change.method,
          LISTING_PAYMENT_METHODS,
        ),
      };
    case "language":
      return {
        ...filters,
        languages: toggleInOrder(
          filters.languages,
          change.code,
          LISTING_LANGUAGE_CODES,
        ),
      };
    case "practice":
      return {
        ...filters,
        practices: toggleInOrder(
          filters.practices,
          change.practice,
          LISTING_INCLUSION_PRACTICES,
        ),
      };
  }
}

function setList(
  params: URLSearchParams,
  key: string,
  values: readonly string[],
): void {
  if (values.length === 0) params.delete(key);
  else params.set(key, values.join(","));
}

/** Writes all five keys, deleting the empty ones, so the URL (and the API
 *  request, which uses the same writer) carries only what is on. */
export function writeListingFactFilters(
  params: URLSearchParams,
  filters: DirectoryListingFactFilters,
): void {
  setList(params, LISTING_FACT_PARAM_KEYS.attributes, filters.attributes);
  setList(
    params,
    LISTING_FACT_PARAM_KEYS.entryMode,
    filters.entryMode ? [filters.entryMode] : [],
  );
  setList(params, LISTING_FACT_PARAM_KEYS.payments, filters.payments);
  setList(params, LISTING_FACT_PARAM_KEYS.languages, filters.languages);
  setList(params, LISTING_FACT_PARAM_KEYS.practices, filters.practices);
}

export function clearListingFactParams(params: URLSearchParams): void {
  for (const key of Object.values(LISTING_FACT_PARAM_KEYS)) params.delete(key);
}

/** Entering the Online tab drops what it does not offer. */
export function dropOnlineHiddenFactParams(params: URLSearchParams): void {
  params.delete(LISTING_FACT_PARAM_KEYS.entryMode);
  params.delete(LISTING_FACT_PARAM_KEYS.payments);
}

export function countListingFactFilters(
  filters: DirectoryListingFactFilters,
): number {
  return (
    filters.attributes.length +
    (filters.entryMode ? 1 : 0) +
    filters.payments.length +
    filters.languages.length +
    filters.practices.length
  );
}

export function hasListingFactFilters(
  filters: DirectoryListingFactFilters,
): boolean {
  return countListingFactFilters(filters) > 0;
}

/** One stable string per filter set, for the page query key (every list is
 *  already in canonical order). */
export function listingFactFilterKey(
  filters: DirectoryListingFactFilters,
): string {
  return [
    filters.attributes.join(","),
    filters.entryMode ?? "",
    filters.payments.join(","),
    filters.languages.join(","),
    filters.practices.join(","),
  ].join("|");
}

/** The place fields the filters read (a card carries all of them). */
export interface ListingFactSource {
  attributes?: readonly string[] | null;
  entryMode?: string | null;
  payments?: readonly string[] | null;
  langs?: readonly string[] | null;
  inclusionPractices?: readonly string[] | null;
}

/** The server's semantics, for demo mode and the 18+ list: every attribute,
 *  the chosen way in, every way to pay, any language, every practice. A
 *  source with no facts (a demo venue) drops out once any filter is on. */
export function matchesListingFacts(
  source: ListingFactSource | null,
  filters: DirectoryListingFactFilters,
): boolean {
  if (!hasListingFactFilters(filters)) return true;
  if (!source) return false;
  const attributes = source.attributes ?? [];
  const payments = source.payments ?? [];
  const langs = source.langs ?? [];
  const practices = source.inclusionPractices ?? [];
  return (
    filters.attributes.every((slug) => attributes.includes(slug)) &&
    (filters.entryMode === null || source.entryMode === filters.entryMode) &&
    filters.payments.every((method) => payments.includes(method)) &&
    (filters.languages.length === 0 ||
      filters.languages.some((code) => langs.includes(code))) &&
    filters.practices.every((practice) => practices.includes(practice))
  );
}

/**
 * The rule every filter option on the directory follows: a chip whose count
 * is a known 0 goes unpickable, unless it is on, so it can be undone. An
 * unknown count (still loading, failed, or over a partial set) keeps the
 * chip pickable.
 */
export function isListingFactChipDisabled({
  filters,
  change,
  count,
}: {
  filters: DirectoryListingFactFilters;
  change: ListingFactFilterChange;
  /** Undefined when the count is not known. */
  count: number | undefined;
}): boolean {
  return count === 0 && !isListingFactChipOn(filters, change);
}

/** How many places each fact chip would show. A missing entry is a count
 *  that is not known, which draws no number (never a 0). */
export interface ListingFactCounts {
  entryModes: Partial<Record<ListingEntryMode, number>>;
  payments: Partial<Record<ListingPaymentMethod, number>>;
  languages: Partial<Record<ListingLanguageCode, number>>;
  practices: Partial<Record<ListingInclusionPractice, number>>;
  attributes: Partial<Record<string, number>>;
}

/** Every fact chip's count unknown. */
export const UNKNOWN_LISTING_FACT_COUNTS: ListingFactCounts = {
  entryModes: {},
  payments: {},
  languages: {},
  practices: {},
  attributes: {},
};

function countEach<Value extends string>(
  values: readonly Value[],
  countFor: (value: Value) => number,
): Record<Value, number> {
  return Object.fromEntries(
    values.map((value) => [value, countFor(value)]),
  ) as Record<Value, number>;
}

/** Whether the chip for this change is pressed right now. */
export function isListingFactChipOn(
  filters: DirectoryListingFactFilters,
  change: ListingFactFilterChange,
): boolean {
  switch (change.kind) {
    case "attribute":
      return filters.attributes.includes(change.slug);
    case "payment":
      return filters.payments.includes(change.method);
    case "practice":
      return filters.practices.includes(change.practice);
    case "entryMode":
      return filters.entryMode === change.mode;
    case "language":
      return filters.languages.includes(change.code);
  }
}

/**
 * How many loaded places each chip would show with it on, every other filter
 * kept. A chip that is off counts the press it stands for; a chip that is on
 * counts what is on screen now, since pressing it would undo it. The
 * languages are an OR, like the place types, so each one counts the places
 * speaking it, the same number whether it is on or off, and a way in counts
 * the places with that way in, in place of the chosen one. These are the
 * server's `facets` semantics, so demo and live count alike.
 */
export function countListingFactChips(
  countWith: (filters: DirectoryListingFactFilters) => number,
  filters: DirectoryListingFactFilters,
  attributeSlugs: readonly string[],
): ListingFactCounts {
  const currentCount = countWith(filters);
  const after = (change: ListingFactFilterChange) =>
    isListingFactChipOn(filters, change)
      ? currentCount
      : countWith(withListingFactChange(filters, change));
  return {
    entryModes: countEach(LISTING_ENTRY_MODES, (mode) =>
      after({ kind: "entryMode", mode }),
    ),
    payments: countEach(LISTING_PAYMENT_METHODS, (method) =>
      after({ kind: "payment", method }),
    ),
    languages: countEach(LISTING_LANGUAGE_CODES, (code) =>
      countWith({ ...filters, languages: [code] }),
    ),
    practices: countEach(LISTING_INCLUSION_PRACTICES, (practice) =>
      after({ kind: "practice", practice }),
    ),
    attributes: countEach(attributeSlugs, (slug) =>
      after({ kind: "attribute", slug }),
    ),
  };
}
