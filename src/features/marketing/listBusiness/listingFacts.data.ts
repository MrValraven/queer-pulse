import type { TFunction } from "../../../shared/i18n/types";
import type { ListingKind } from "./listingMobile.data";

/**
 * How people get in, what entry costs, how they pay, the inclusion practices
 * a listing follows and the languages it speaks: the structured facts of the
 * listing attributes contract (2026-10-08). Every list mirrors the backend's
 * own, slug for slug. A leaf module: it imports types only, so the draft,
 * the payload, the fixtures and the directory can all import it.
 */

export const LISTING_ENTRY_MODES = [
  "walkIn",
  "bookingRecommended",
  "appointmentOnly",
  "membersOnly",
] as const;
export type ListingEntryMode = (typeof LISTING_ENTRY_MODES)[number];

export const LISTING_COVER_POLICIES = [
  "free",
  "freeBefore",
  "cover",
  "ticketed",
] as const;
export type ListingCoverPolicy = (typeof LISTING_COVER_POLICIES)[number];

/** The categories a cover answer is asked of (and kept for). */
export const COVER_POLICY_CATEGORY_SLUGS = ["nightlife", "culture"] as const;

export const LISTING_PAYMENT_METHODS = [
  "card",
  "mbway",
  "multibanco",
  "cash",
] as const;
export type ListingPaymentMethod = (typeof LISTING_PAYMENT_METHODS)[number];

export const LISTING_INCLUSION_PRACTICES = [
  "chosen-name",
  "safer-space-policy",
  "named-contact",
  "harm-reduction",
] as const;
export type ListingInclusionPractice =
  (typeof LISTING_INCLUSION_PRACTICES)[number];

/** The one practice that needs a link to the policy itself. */
export const SAFER_SPACE_POLICY_PRACTICE: ListingInclusionPractice =
  "safer-space-policy";

/** Who something is offered to: the kinds, and the categories (null for
 *  every category). Shared by the attribute groups and the practices. */
export interface ListingScope {
  kinds: readonly ListingKind[];
  categories: readonly string[] | null;
}

export interface InclusionPracticeScope extends ListingScope {
  slug: string;
}

const EVERY_KIND: readonly ListingKind[] = ["place", "mobile", "online"];
const PLACE_KINDS: readonly ListingKind[] = ["place", "mobile"];

/** Contract: chosen-name and safer-space-policy for every kind; named-contact
 *  for place and mobile; harm-reduction for place and mobile with nightlife. */
export const INCLUSION_PRACTICE_SCOPES: readonly InclusionPracticeScope[] = [
  { slug: "chosen-name", kinds: EVERY_KIND, categories: null },
  { slug: "safer-space-policy", kinds: EVERY_KIND, categories: null },
  { slug: "named-contact", kinds: PLACE_KINDS, categories: null },
  { slug: "harm-reduction", kinds: PLACE_KINDS, categories: ["nightlife"] },
];

export const LISTING_LANGUAGE_CODES = [
  "pt",
  "pt-BR",
  "en",
  "es",
  "fr",
  "it",
  "de",
  "uk",
  "ru",
  "zh",
  "hi",
  "ne",
  "bn",
  "ar",
  "kea",
  "lgp",
  "ils",
] as const;
export type ListingLanguageCode = (typeof LISTING_LANGUAGE_CODES)[number];

/** Shown as chips; the rest sit behind "More languages". */
export const COMMON_LISTING_LANGUAGE_CODES: readonly ListingLanguageCode[] = [
  "pt",
  "pt-BR",
  "en",
  "es",
  "fr",
];

export const LANGS_OTHER_MAX_LENGTH = 80;
export const SAFER_SPACE_POLICY_URL_MAX_LENGTH = 300;
/** The backend's `coverFreeBefore` rule: 00:00 to 23:59. */
export const COVER_FREE_BEFORE_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Whether a group or a practice is offered to a listing of this kind and
 *  categories: its kind is listed, and it takes every category or one of
 *  the listing's. */
export function isScopeOffered(
  scope: ListingScope,
  kind: ListingKind,
  cats: readonly string[],
): boolean {
  return (
    scope.kinds.includes(kind) &&
    (scope.categories === null ||
      scope.categories.some((category) => cats.includes(category)))
  );
}

/** Whether the cover question applies: a nightlife or culture category. */
export function hasCoverCategory(cats: readonly string[]): boolean {
  return COVER_POLICY_CATEGORY_SLUGS.some((category) =>
    cats.includes(category),
  );
}

/** Known values from any list, once each, in `order`. */
function canonicalSubset<Value extends string>(
  order: readonly Value[],
  raw: unknown,
): Value[] {
  if (!Array.isArray(raw)) return [];
  const wanted = new Set(
    raw.filter((value): value is string => typeof value === "string"),
  );
  return order.filter((value) => wanted.has(value));
}

function oneOf<Value extends string>(
  order: readonly Value[],
  raw: unknown,
): Value | null {
  return order.find((value) => value === raw) ?? null;
}

export function normalizeEntryMode(raw: unknown): ListingEntryMode | null {
  return oneOf(LISTING_ENTRY_MODES, raw);
}

export function normalizeCoverPolicy(raw: unknown): ListingCoverPolicy | null {
  return oneOf(LISTING_COVER_POLICIES, raw);
}

export function normalizePaymentMethods(raw: unknown): ListingPaymentMethod[] {
  return canonicalSubset(LISTING_PAYMENT_METHODS, raw);
}

export function normalizeInclusionPractices(
  raw: unknown,
): ListingInclusionPractice[] {
  return canonicalSubset(LISTING_INCLUSION_PRACTICES, raw);
}

/** Codes only, in the vocabulary's order. A language NAME (a draft from
 *  before the change) is dropped here; heal it first
 *  (`healLegacyListingAttributes`). */
export function normalizeLanguageCodes(raw: unknown): ListingLanguageCode[] {
  return canonicalSubset(LISTING_LANGUAGE_CODES, raw);
}

/** A valid `HH:MM`, or "" for anything else. */
export function normalizeCoverFreeBefore(raw: unknown): string {
  return typeof raw === "string" && COVER_FREE_BEFORE_PATTERN.test(raw)
    ? raw
    : "";
}

/** Add the value when missing, remove it when present; `order` decides the
 *  order of what is left. */
export function toggleInOrder<Value extends string>(
  current: readonly Value[],
  value: Value,
  order: readonly Value[],
): Value[] {
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
  return order.filter((entry) => next.includes(entry));
}

/** The practices a listing of this kind and categories is offered, in
 *  vocabulary order. `scopes` is the server's copy when it has loaded. */
export function offeredInclusionPractices(
  kind: ListingKind,
  cats: readonly string[],
  scopes: readonly InclusionPracticeScope[] = INCLUSION_PRACTICE_SCOPES,
): ListingInclusionPractice[] {
  return LISTING_INCLUSION_PRACTICES.filter((practice) => {
    const scope = scopes.find((candidate) => candidate.slug === practice);
    return scope !== undefined && isScopeOffered(scope, kind, cats);
  });
}

export const ENTRY_MODE_LABEL_KEYS: Record<ListingEntryMode, string> = {
  walkIn: "marketing:listingFacts.entry.walkIn",
  bookingRecommended: "marketing:listingFacts.entry.bookingRecommended",
  appointmentOnly: "marketing:listingFacts.entry.appointmentOnly",
  membersOnly: "marketing:listingFacts.entry.membersOnly",
};

/** An out-and-about business has no door to walk in at: "Just turn up". */
export function entryModeLabel(
  t: TFunction,
  mode: ListingEntryMode,
  kind: ListingKind,
): string {
  return mode === "walkIn" && kind === "mobile"
    ? t("marketing:listingFacts.entry.walkInMobile")
    : t(ENTRY_MODE_LABEL_KEYS[mode]);
}

export const COVER_POLICY_LABEL_KEYS: Record<ListingCoverPolicy, string> = {
  free: "marketing:listingFacts.cover.free",
  freeBefore: "marketing:listingFacts.cover.freeBefore",
  cover: "marketing:listingFacts.cover.cover",
  ticketed: "marketing:listingFacts.cover.ticketed",
};

/** The owner's choices, where "Free before" has no time yet. */
export const COVER_POLICY_CHOICE_LABEL_KEYS: Record<
  ListingCoverPolicy,
  string
> = {
  ...COVER_POLICY_LABEL_KEYS,
  freeBefore: "marketing:listingFacts.cover.freeBeforeChoice",
};

export function coverPolicyLabel(
  t: TFunction,
  policy: ListingCoverPolicy,
  freeBefore: string,
): string {
  return policy === "freeBefore"
    ? t(COVER_POLICY_LABEL_KEYS.freeBefore, { time: freeBefore })
    : t(COVER_POLICY_LABEL_KEYS[policy]);
}

export const PAYMENT_METHOD_LABEL_KEYS: Record<ListingPaymentMethod, string> = {
  card: "marketing:listingFacts.payment.card",
  mbway: "marketing:listingFacts.payment.mbway",
  multibanco: "marketing:listingFacts.payment.multibanco",
  cash: "marketing:listingFacts.payment.cash",
};

/** The ways to pay as one line ("Card · MB WAY"); cash alone reads
 *  "Cash only". */
export function paymentsSummary(
  t: TFunction,
  payments: readonly ListingPaymentMethod[],
): string {
  if (payments.length === 1 && payments[0] === "cash") {
    return t("marketing:listingFacts.payment.cashOnly");
  }
  return payments
    .map((method) => t(PAYMENT_METHOD_LABEL_KEYS[method]))
    .join(" · ");
}

export const INCLUSION_PRACTICE_LABEL_KEYS: Record<
  ListingInclusionPractice,
  string
> = {
  "chosen-name": "marketing:listingFacts.practice.chosenName",
  "safer-space-policy": "marketing:listingFacts.practice.saferSpacePolicy",
  "named-contact": "marketing:listingFacts.practice.namedContact",
  "harm-reduction": "marketing:listingFacts.practice.harmReduction",
};

export const INCLUSION_PRACTICE_HELP_KEYS: Record<
  ListingInclusionPractice,
  string
> = {
  "chosen-name": "marketing:listingFacts.practice.chosenNameHelp",
  "safer-space-policy": "marketing:listingFacts.practice.saferSpacePolicyHelp",
  "named-contact": "marketing:listingFacts.practice.namedContactHelp",
  "harm-reduction": "marketing:listingFacts.practice.harmReductionHelp",
};

export function inclusionPracticeLabel(t: TFunction, practice: string): string {
  const known = normalizeInclusionPractices([practice])[0];
  return known ? t(INCLUSION_PRACTICE_LABEL_KEYS[known]) : practice;
}

export const LANGUAGE_LABEL_KEYS: Record<ListingLanguageCode, string> = {
  pt: "marketing:listingFacts.language.pt",
  "pt-BR": "marketing:listingFacts.language.ptBR",
  en: "marketing:listingFacts.language.en",
  es: "marketing:listingFacts.language.es",
  fr: "marketing:listingFacts.language.fr",
  it: "marketing:listingFacts.language.it",
  de: "marketing:listingFacts.language.de",
  uk: "marketing:listingFacts.language.uk",
  ru: "marketing:listingFacts.language.ru",
  zh: "marketing:listingFacts.language.zh",
  hi: "marketing:listingFacts.language.hi",
  ne: "marketing:listingFacts.language.ne",
  bn: "marketing:listingFacts.language.bn",
  ar: "marketing:listingFacts.language.ar",
  kea: "marketing:listingFacts.language.kea",
  lgp: "marketing:listingFacts.language.lgp",
  ils: "marketing:listingFacts.language.ils",
};

/** A known code's own name; anything else as written. */
export function languageLabel(t: TFunction, code: string): string {
  const known = normalizeLanguageCodes([code])[0];
  return known ? t(LANGUAGE_LABEL_KEYS[known]) : code;
}

/** "Yes", "No", or "" when the owner has not said. */
export function nifInvoicesLabel(
  t: TFunction,
  value: boolean | null | undefined,
): string {
  if (value === true) return t("marketing:listingFacts.nif.yes");
  if (value === false) return t("marketing:listingFacts.nif.no");
  return "";
}
