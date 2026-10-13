import {
  isHighlightableAttribute,
  LISTING_ATTRIBUTE_CAP,
  LISTING_HIGHLIGHT_CAP,
  LOCAL_ATTRIBUTE_VOCABULARY,
  offeredAttributeGroups,
  type ListingAttributeVocabulary,
} from "./listingAttributes.data";
import {
  hasCoverCategory,
  LANGS_OTHER_MAX_LENGTH,
  normalizeCoverFreeBefore,
  normalizeCoverPolicy,
  normalizeEntryMode,
  normalizeInclusionPractices,
  normalizeLanguageCodes,
  normalizePaymentMethods,
  offeredInclusionPractices,
  SAFER_SPACE_POLICY_PRACTICE,
  type ListingCoverPolicy,
  type ListingEntryMode,
  type ListingInclusionPractice,
  type ListingLanguageCode,
  type ListingPaymentMethod,
} from "./listingFacts.data";
import { listingKindOf } from "./listingMobile.data";

/**
 * The attribute and fact fields a save sends, cleaned by the backend's own
 * rules (contract, server rules 3 to 7): the way in, cover and payments go
 * only where the kind and categories ask for them, highlights only from the
 * ticked attributes. Attributes and practices a category or kind change
 * left behind still go out here, because the server keeps the ones a saved
 * listing already stores; a create drops them first with
 * `withOnlyOfferedFacts`, since a new listing stores nothing yet. Loose on
 * purpose: a draft, an owner `ListingDTO` and a preview source all fit.
 */
export interface ListingFactsSource {
  cats: readonly string[];
  online?: boolean | null;
  mobile?: boolean | null;
  attributes?: readonly string[] | null;
  highlights?: readonly string[] | null;
  entryMode?: string | null;
  coverPolicy?: string | null;
  coverFreeBefore?: string | null;
  payments?: readonly string[] | null;
  issuesNifInvoices?: boolean | null;
  inclusionPractices?: readonly string[] | null;
  saferSpacePolicyUrl?: string | null;
  langs?: readonly string[] | null;
  langsOther?: string | null;
}

export interface ListingFactsPayload {
  attributes: string[];
  highlights: string[];
  entryMode: ListingEntryMode | null;
  coverPolicy: ListingCoverPolicy | null;
  coverFreeBefore: string | null;
  payments: ListingPaymentMethod[];
  issuesNifInvoices: boolean | null;
  inclusionPractices: ListingInclusionPractice[];
  saferSpacePolicyUrl: string | null;
  langs: ListingLanguageCode[];
  langsOther: string;
}

/** A text field trimmed, or "" when the slot holds no string. Reads
 *  `unknown` for the same reason as `uniqueStrings`. */
function trimmedText(raw: unknown): string {
  return typeof raw === "string" ? raw.trim() : "";
}

/** Strings once each, in the order given. Reads `unknown`, because a draft
 *  from local storage can hold anything in these slots. */
function uniqueStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw.filter((entry): entry is string => typeof entry === "string"),
    ),
  ];
}

/**
 * The source with only the attributes and practices its kind and categories
 * are offered, and only the highlights whose attribute stayed. For a CREATE
 * alone: the server has nothing stored for a new listing, so a slug outside
 * the offer is answered 400 (server rules 2 and 7). An update sends what
 * the listing carries, which the server keeps valid. Premises-only slugs
 * leave an out-and-about listing here too (`offeredAttributeGroups`).
 */
export function withOnlyOfferedFacts<Source extends ListingFactsSource>(
  source: Source,
  vocabulary: ListingAttributeVocabulary = LOCAL_ATTRIBUTE_VOCABULARY,
): Source {
  const kind = listingKindOf(source);
  const offeredAttributes = new Set(
    offeredAttributeGroups(vocabulary, kind, source.cats).flatMap(
      (entry) => entry.attributes,
    ),
  );
  const offeredPractices = new Set<string>(
    offeredInclusionPractices(kind, source.cats, vocabulary.inclusionPractices),
  );
  const attributes = uniqueStrings(source.attributes).filter((slug) =>
    offeredAttributes.has(slug),
  );
  return {
    ...source,
    attributes,
    highlights: uniqueStrings(source.highlights).filter((slug) =>
      attributes.includes(slug),
    ),
    inclusionPractices: uniqueStrings(source.inclusionPractices).filter(
      (practice) => offeredPractices.has(practice),
    ),
  };
}

export function listingFactsForPayload(
  source: ListingFactsSource,
): ListingFactsPayload {
  const isOnline = listingKindOf(source) === "online";
  const attributes = uniqueStrings(source.attributes).slice(
    0,
    LISTING_ATTRIBUTE_CAP,
  );
  const highlights = uniqueStrings(source.highlights)
    .filter(
      (slug) => attributes.includes(slug) && isHighlightableAttribute(slug),
    )
    .slice(0, LISTING_HIGHLIGHT_CAP);
  const coverPolicy =
    !isOnline && hasCoverCategory(source.cats)
      ? normalizeCoverPolicy(source.coverPolicy)
      : null;
  const coverFreeBefore =
    coverPolicy === "freeBefore"
      ? normalizeCoverFreeBefore(source.coverFreeBefore) || null
      : null;
  const inclusionPractices = normalizeInclusionPractices(
    source.inclusionPractices,
  );
  const policyUrl = trimmedText(source.saferSpacePolicyUrl);
  return {
    attributes,
    highlights,
    entryMode: isOnline ? null : normalizeEntryMode(source.entryMode),
    coverPolicy,
    coverFreeBefore,
    payments: isOnline ? [] : normalizePaymentMethods(source.payments),
    issuesNifInvoices:
      typeof source.issuesNifInvoices === "boolean"
        ? source.issuesNifInvoices
        : null,
    inclusionPractices,
    saferSpacePolicyUrl:
      inclusionPractices.includes(SAFER_SPACE_POLICY_PRACTICE) && policyUrl
        ? policyUrl
        : null,
    langs: normalizeLanguageCodes(source.langs),
    langsOther: trimmedText(source.langsOther).slice(0, LANGS_OTHER_MAX_LENGTH),
  };
}
